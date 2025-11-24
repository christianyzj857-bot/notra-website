// Utility functions for chat processing
import { NoteSection } from '@/types/notra';
import { retrieveRelevantSections } from './rag-search';

/**
 * Pick relevant note sections using minisearch (lightweight RAG)
 * This is an enhanced version that uses BM25 scoring for better relevance
 * 
 * @deprecated Use retrieveRelevantSections from rag-search.ts instead
 * Kept for backward compatibility
 */
export function pickRelevantSections(
  notes: NoteSection[],
  question: string,
  limit: number = 3
): NoteSection[] {
  // Use minisearch-based retrieval
  return retrieveRelevantSections(notes, question, limit);
}

/**
 * Trim messages to recent N conversations to save tokens
 */
export function trimMessages(
  messages: { role: string; content: string }[],
  maxRounds: number = 3
): { role: string; content: string }[] {
  // Keep system message if present
  const systemMessages = messages.filter(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  // Get last N user-assistant pairs
  const recentMessages = conversationMessages.slice(-maxRounds * 2);

  return [...systemMessages, ...recentMessages];
}

