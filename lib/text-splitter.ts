/**
 * Text splitting utilities using sentence-splitter
 * For RAG: split text into sentences/paragraphs for better retrieval
 */

import { split as splitSentences } from 'sentence-splitter';

/**
 * Split text into sentences for better RAG retrieval
 */
export function splitIntoSentences(text: string): string[] {
  try {
    const nodes = splitSentences(text);
    return nodes
      .filter(node => node.type === 'Sentence')
      .map(node => (node as any).raw || '')
      .filter(s => s.trim().length > 0);
  } catch (error) {
    console.error('[TextSplitter] Error splitting sentences:', error);
    // Fallback: split by periods
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }
}

/**
 * Split text into paragraphs for chunking
 */
export function splitIntoParagraphs(text: string, maxLength: number = 500): string[] {
  const paragraphs: string[] = [];
  const sentences = splitIntoSentences(text);
  
  let currentParagraph = '';
  for (const sentence of sentences) {
    if (currentParagraph.length + sentence.length > maxLength && currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = sentence;
    } else {
      currentParagraph += (currentParagraph ? ' ' : '') + sentence;
    }
  }
  
  if (currentParagraph.trim().length > 0) {
    paragraphs.push(currentParagraph.trim());
  }
  
  return paragraphs;
}

