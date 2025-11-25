/**
 * Text processing utilities for learning asset generation
 * Handles text cleaning, summarization, and chunking
 * 
 * Note: remark() removed to avoid "DOMMatrix is not defined" error in Node.js
 * Using remove-markdown instead for server-side safety
 */

import removeMarkdown from 'remove-markdown';

/**
 * Clean and normalize text content
 * Note: remark() may cause DOMMatrix errors in Node.js, so we use remove-markdown instead
 */
export function cleanText(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Remove markdown if present (but preserve structure)
  // ⚠️ remark() can cause "DOMMatrix is not defined" in Node.js server environment
  // So we use remove-markdown which is safer for server-side processing
  try {
    // Use remove-markdown directly (server-safe)
    cleaned = removeMarkdown(cleaned);
  } catch (error) {
    // If remove-markdown fails, just use the text as-is
    console.warn('[TextProcessor] Markdown removal failed, using text as-is:', error);
  }
  
  // Normalize line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

/**
 * Create a rough summary of long text for two-stage processing
 * This reduces token cost by summarizing first, then generating from summary
 */
export async function createRoughSummary(
  text: string,
  maxLength: number = 6000
): Promise<string> {
  // For very long text, take first part + last part (usually most important)
  if (text.length <= maxLength) {
    return text;
  }
  
  const firstPart = text.substring(0, maxLength * 0.6);
  const lastPart = text.substring(text.length - maxLength * 0.4);
  
  return `${firstPart}\n\n[... content truncated ...]\n\n${lastPart}`;
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

