/**
 * Text processing utilities for learning asset generation
 * Handles text cleaning, summarization, and chunking
 */

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import removeMarkdown from 'remove-markdown';

/**
 * Clean and normalize text content
 */
export function cleanText(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Remove markdown if present (but preserve structure)
  try {
    const processed = remark()
      .use(remarkGfm)
      .processSync(cleaned);
    cleaned = String(processed);
  } catch (error) {
    // If remark fails, use remove-markdown as fallback
    cleaned = removeMarkdown(cleaned);
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

