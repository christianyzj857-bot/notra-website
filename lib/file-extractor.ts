/**
 * File extraction utilities
 * Handles PDF, DOCX, TXT, MD file parsing and cleaning
 * 
 * Note: remark() removed to avoid "DOMMatrix is not defined" error in Node.js
 * Using remove-markdown instead for server-side safety
 */

// Import DOMMatrix polyfill first (before any libraries that might use it)
import './dom-polyfill';
import removeMarkdown from 'remove-markdown';

/**
 * Extract text from PDF buffer
 */
export async function extractPDFText(buffer: Buffer): Promise<string> {
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (pdfParseModule as any).default || pdfParseModule;
  const data = await pdfParse(buffer);
  return data.text || '';
}

/**
 * Extract text from DOCX buffer
 */
export async function extractDOCXText(buffer: Buffer): Promise<string> {
  const mammothModule = await import("mammoth");
  const mammoth = (mammothModule as any).default || mammothModule;
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
  const result = await mammoth.extractRawText({ arrayBuffer });
  if (!result || !result.value) {
    throw new Error('No text extracted from Word document');
  }
  return result.value;
}

/**
 * Extract and clean text from plain text or markdown
 * Note: remark() may cause DOMMatrix errors in Node.js, so we use remove-markdown instead
 */
export async function extractTextContent(buffer: Buffer, isMarkdown: boolean = false): Promise<string> {
  const text = buffer.toString('utf-8');
  
  if (isMarkdown) {
    // ⚠️ remark() can cause "DOMMatrix is not defined" in Node.js server environment
    // Use remove-markdown which is safer for server-side processing
    try {
      // For markdown files, we just return the text as-is (preserve markdown syntax)
      // Or use remove-markdown if we want plain text
      // For now, return as-is to preserve structure
      return text;
    } catch (error) {
      // Fallback: use remove-markdown to strip markdown syntax
      return removeMarkdown(text);
    }
  }
  
  return text;
}

/**
 * Clean extracted text (remove excessive whitespace, normalize)
 */
export function cleanExtractedText(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Normalize line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

