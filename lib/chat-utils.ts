// Utility functions for chat processing
import { NoteSection } from '@/types/notra';

/**
 * Simple heuristic function to pick relevant note sections based on user question
 * This is a lightweight implementation - can be replaced with vector search in production
 */
export function pickRelevantSections(
  notes: NoteSection[],
  question: string,
  limit: number = 3
): NoteSection[] {
  if (!question || !notes || notes.length === 0) {
    return [];
  }

  // Simple keyword matching - count how many words from question appear in each section
  const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const scoredSections = notes.map(section => {
    const sectionText = `${section.heading} ${section.content} ${section.bullets?.join(' ') || ''}`.toLowerCase();
    
    // Count matches
    let score = 0;
    questionWords.forEach(word => {
      if (sectionText.includes(word)) {
        score += 1;
      }
    });

    // Bonus for heading matches
    if (section.heading.toLowerCase().includes(question.toLowerCase())) {
      score += 2;
    }

    return { section, score };
  });

  // Sort by score and return top N
  return scoredSections
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter(item => item.score > 0)
    .map(item => item.section);
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

