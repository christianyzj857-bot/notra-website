import { detectVideoPlatform, extractVideoId } from '../videoPlatforms';
import { getYouTubeTranscript, getYouTubeMetadata } from './youtube';
import { getBilibiliTranscript, getBilibiliMetadata } from './bilibili';
import OpenAI from 'openai';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

// Cache directory for video transcripts
const CACHE_DIR = path.join(process.cwd(), '.notra-data', 'video-cache');
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedTranscript {
  transcript: string;
  title: string;
  description: string;
  cachedAt: number;
  platform: string;
  videoId: string;
}

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Generate cache key from URL
function getCacheKey(url: string, platform: string, videoId: string): string {
  const hash = createHash('sha256').update(`${platform}:${videoId}`).digest('hex');
  return path.join(CACHE_DIR, `${hash}.json`);
}

// Load cached transcript
async function loadCachedTranscript(cacheKey: string): Promise<CachedTranscript | null> {
  try {
    const data = await readFile(cacheKey, 'utf-8');
    const cached: CachedTranscript = JSON.parse(data);
    
    // Check if cache is still valid
    const age = Date.now() - cached.cachedAt;
    if (age > CACHE_TTL) {
      // Cache expired, delete it
      await writeFile(cacheKey, '').catch(() => {});
      return null;
    }
    
    return cached;
  } catch (error) {
    return null;
  }
}

// Save transcript to cache
async function saveCachedTranscript(
  cacheKey: string,
  data: { transcript: string; title: string; description: string },
  platform: string,
  videoId: string
): Promise<void> {
  try {
    await ensureCacheDir();
    const cached: CachedTranscript = {
      ...data,
      cachedAt: Date.now(),
      platform,
      videoId,
    };
    await writeFile(cacheKey, JSON.stringify(cached, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to cache transcript:', error);
    // Don't throw - caching is optional
  }
}

/**
 * 获取视频转录文本
 * 支持 YouTube 和 Bilibili
 */
export async function getVideoTranscript(url: string): Promise<{
  transcript: string;
  title: string;
  description: string;
}> {
  console.log('getVideoTranscript called with URL:', url);
  
  const platform = detectVideoPlatform(url);
  console.log('Detected platform:', platform);
  
  if (platform === 'unknown') {
    throw new Error(`Unsupported video platform. URL: ${url}. Currently supported: YouTube (youtube.com, youtu.be), Bilibili (bilibili.com)`);
  }
  
  const videoId = extractVideoId(url, platform);
  console.log('Extracted video ID:', videoId, 'from platform:', platform);
  
  if (!videoId) {
    throw new Error(`Unable to extract video ID from URL: ${url}. Please ensure the URL is in a valid format:
- YouTube: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
- Bilibili: https://www.bilibili.com/video/BVxxxxx or https://www.bilibili.com/video/avxxxxx`);
  }
  
  // Check cache first
  const cacheKey = getCacheKey(url, platform, videoId);
  const cached = await loadCachedTranscript(cacheKey);
  if (cached) {
    console.log(`[VideoCache] Using cached transcript for ${platform}:${videoId}`);
    return {
      transcript: cached.transcript,
      title: cached.title,
      description: cached.description,
    };
  }

  try {
    let transcript: string;
    let title: string;
    let description: string;
    
    switch (platform) {
      case 'youtube':
        transcript = await getYouTubeTranscript(videoId);
        const youtubeMeta = await getYouTubeMetadata(videoId);
        title = youtubeMeta.title;
        description = youtubeMeta.description;
        break;
        
      case 'bilibili':
        transcript = await getBilibiliTranscript(videoId);
        const bilibiliMeta = await getBilibiliMetadata(videoId);
        title = bilibiliMeta.title;
        description = bilibiliMeta.description;
        break;
        
      default:
        throw new Error(`Platform ${platform} not yet implemented`);
    }
    
    // 如果转录为空，尝试使用描述
    if (!transcript || transcript.trim().length === 0) {
      if (description && description.trim().length > 0) {
        transcript = description;
      } else {
        throw new Error('No transcript or description available for this video');
      }
    }
    
    const result = {
      transcript: transcript.trim(),
      title: title || `Video ${videoId}`,
      description: description || '',
    };
    
    // Cache the result
    await saveCachedTranscript(cacheKey, result, platform, videoId);
    
    return result;
  } catch (error: any) {
    console.error(`Video transcript error (${platform}):`, error);
    
    // 降级方案：如果平台 API 失败，可以尝试使用 Whisper API
    // 但这需要下载视频，成本较高，暂时不实现
    throw new Error(
      `Failed to get transcript from ${platform}: ${error.message || 'Unknown error'}. ` +
      `Please ensure the video has captions/subtitles enabled.`
    );
  }
}

/**
 * 使用 Whisper API 进行语音转文字（降级方案）
 * 成本: $0.006/分钟
 */
export async function transcribeWithWhisper(audioUrl: string): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured for Whisper transcription');
  }
  
  const openai = new OpenAI({ apiKey: openaiApiKey });
  
  try {
    // 注意：这需要先下载视频并提取音频
    // 实现较复杂，暂时不实现
    throw new Error('Whisper transcription not yet implemented. Please use videos with captions.');
  } catch (error: any) {
    throw new Error(`Whisper transcription failed: ${error.message}`);
  }
}

