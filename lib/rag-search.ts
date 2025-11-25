/**
 * Lightweight RAG search using minisearch
 * For Chat with Note mode: retrieves relevant sections from notes
 */

import MiniSearch from 'minisearch';
import { NoteSection } from '@/types/notra';
import { splitIntoSentences } from './text-splitter';

interface SearchableSection {
  id: string;
  heading: string;
  content: string;
  fullText: string; // Combined text for search
  section: NoteSection; // Original section
}

/**
 * Build searchable index from note sections
 */
function buildSearchIndex(notes: NoteSection[]): MiniSearch<SearchableSection> {
  const searchableSections: SearchableSection[] = notes.map((section, idx) => {
    // Combine all text fields for better search
    // Split content into sentences for better matching
    const contentSentences = splitIntoSentences(section.content || '');
    const fullText = [
      section.heading,
      ...contentSentences,
      section.conceptExplanation,
      section.formulaDerivation,
      section.example,
      ...(section.bullets || []),
      ...(section.applications || []),
      ...(section.commonMistakes || []),
    ]
      .filter(Boolean)
      .join(' ');

    return {
      id: section.id || `section-${idx}`,
      heading: section.heading,
      content: section.content,
      fullText,
      section,
    };
  });

  const searchIndex = new MiniSearch<SearchableSection>({
    fields: ['heading', 'content', 'fullText'],
    storeFields: ['id', 'heading', 'content', 'section'],
    searchOptions: {
      boost: { heading: 2, content: 1 }, // Headings are more important
      fuzzy: 0.2, // Allow some typos
      prefix: true, // Match prefixes
    },
  });

  searchIndex.addAll(searchableSections);
  return searchIndex;
}

/**
 * Retrieve relevant sections using minisearch (lightweight RAG)
 * Returns top N most relevant sections based on BM25 scoring
 */
export function retrieveRelevantSections(
  notes: NoteSection[],
  query: string,
  maxSections: number = 5
): NoteSection[] {
  if (!query || !notes || notes.length === 0) {
    return notes.slice(0, maxSections); // Fallback: return first N sections
  }

  try {
    const searchIndex = buildSearchIndex(notes);
    const results = searchIndex.search(query, {
      boost: { heading: 2 }, // Boost heading matches
    });

    // Limit results to maxSections
    const limitedResults = results.slice(0, maxSections);

    if (limitedResults.length > 0) {
      return limitedResults.map(result => result.section);
    }

    // Fallback: if no results, return first sections
    return notes.slice(0, maxSections);
  } catch (error) {
    console.error('[RAG] Search error:', error);
    // Fallback: return first sections
    return notes.slice(0, maxSections);
  }
}

/**
 * Format sections for prompt injection (RAG context)
 */
export function formatSectionsForPrompt(
  sections: NoteSection[],
  maxLength: number = 2000
): string {
  let formatted = '';
  let currentLength = 0;

  for (const section of sections) {
    if (currentLength >= maxLength) break;

    const sectionText = `## ${section.heading}\n${section.content.substring(0, 400)}${section.content.length > 400 ? '...' : ''}\n`;

    if (currentLength + sectionText.length > maxLength) {
      // Truncate this section
      const remaining = maxLength - currentLength;
      formatted += sectionText.substring(0, remaining);
      break;
    }

    formatted += sectionText;
    currentLength += sectionText.length;

    // Add bullets if available and space allows
    if (section.bullets && section.bullets.length > 0 && currentLength < maxLength * 0.8) {
      const bulletsText = `Key points: ${section.bullets.slice(0, 3).join(', ')}\n`;
      if (currentLength + bulletsText.length <= maxLength) {
        formatted += bulletsText;
        currentLength += bulletsText.length;
      }
    }

    formatted += '\n';
  }

  return formatted.trim();
}

