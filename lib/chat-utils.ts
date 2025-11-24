// Utility functions for chat processing
import { NoteSection } from '@/types/notra';

/**
 * Enhanced RAG-like function to pick relevant note sections based on user question
 * This is a lightweight implementation - can be replaced with vector search in production
 * 
 * Improvements:
 * - Better keyword matching (handles synonyms and related terms)
 * - Considers section structure (headings, content, examples)
 * - Prioritizes sections with formulas/examples when relevant
 */
export function pickRelevantSections(
  notes: NoteSection[],
  question: string,
  limit: number = 3
): NoteSection[] {
  if (!question || !notes || notes.length === 0) {
    return [];
  }

  // Enhanced keyword extraction - filter out common words
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'what', 'how', 'why', 'when', 'where', 'who']);
  const questionWords = question.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
    .map(w => w.replace(/[^\w]/g, '')); // Remove punctuation
  
  // Build full text for each section (including all fields)
  const scoredSections = notes.map(section => {
    const sectionText = [
      section.heading,
      section.content,
      section.conceptExplanation,
      section.formulaDerivation,
      section.example,
      ...(section.bullets || []),
      ...(section.applications || []),
      ...(section.commonMistakes || []),
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Count keyword matches
    let score = 0;
    questionWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
      const matches = sectionText.match(regex);
      if (matches) {
        score += matches.length;
      }
    });

    // Bonus for heading matches (most important)
    if (section.heading.toLowerCase().includes(question.toLowerCase())) {
      score += 5;
    }
    
    // Bonus for exact phrase matches
    const questionLower = question.toLowerCase();
    if (sectionText.includes(questionLower)) {
      score += 3;
    }
    
    // Bonus for sections with formulas (if question mentions formula/math)
    if ((question.toLowerCase().includes('formula') || question.toLowerCase().includes('equation') || question.toLowerCase().includes('calculate')) && section.formulaDerivation) {
      score += 2;
    }
    
    // Bonus for sections with examples (if question asks for example)
    if ((question.toLowerCase().includes('example') || question.toLowerCase().includes('instance')) && section.example) {
      score += 2;
    }

    return { section, score };
  });

  // Sort by score and return top N
  const relevant = scoredSections
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter(item => item.score > 0)
    .map(item => item.section);
  
  // If no relevant sections found, return first few sections as fallback
  if (relevant.length === 0 && notes.length > 0) {
    return notes.slice(0, Math.min(limit, notes.length));
  }
  
  return relevant;
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

