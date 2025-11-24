/**
 * Rate limiting using @upstash/ratelimit
 * Provides QPS and quota-based rate limiting by IP + User ID
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client (if UPSTASH_REDIS_REST_URL is set)
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (redisUrl && redisToken) {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    
    // Create rate limiter with sliding window
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
      analytics: true,
      prefix: '@notra/ratelimit',
    });
  }
} catch (error) {
  console.warn('[RateLimiter] Failed to initialize Upstash Redis. Rate limiting will be disabled.', error);
}

/**
 * Check rate limit for a given identifier (IP + User ID)
 * Returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // If Upstash is not configured, allow all requests (development mode)
  if (!ratelimit || !redis) {
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + windowSeconds * 1000,
    };
  }

  try {
    // Create a temporary limiter with custom limit
    // @upstash/ratelimit uses seconds for window duration
    const customLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      analytics: true,
      prefix: '@notra/ratelimit',
    });

    const result = await customLimiter.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('[RateLimiter] Error checking rate limit:', error);
    // On error, allow the request (fail open)
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Date.now() + windowSeconds * 1000,
    };
  }
}

/**
 * Get rate limit identifier from request (IP + User ID)
 */
export function getRateLimitIdentifier(req: Request, userId?: string): string {
  // Get IP address from headers
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  // Combine IP + User ID for unique identification
  return userId ? `${ip}:${userId}` : ip;
}

