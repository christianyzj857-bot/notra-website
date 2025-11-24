/**
 * File extraction utilities
 * Handles PDF, DOCX, TXT, MD file parsing and cleaning
 */

import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
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
 */
export async function extractTextContent(buffer: Buffer, isMarkdown: boolean = false): Promise<string> {
  const text = buffer.toString('utf-8');
  
  if (isMarkdown) {
    // Process markdown with remark
    try {
      const processed = await remark()
        .use(remarkGfm)
        .process(text);
      return String(processed);
    } catch (error) {
      // Fallback to remove-markdown
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

