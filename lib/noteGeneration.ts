import OpenAI from "openai";
import { NoteSection, QuizItem, Flashcard } from "@/types/notra";
import type { UserPlan } from "@/config/usageLimits";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Model configuration based on user plan
const MODEL_CONFIG = {
  free: {
    model: "gpt-4o-mini",
    maxTokens: 3000,
    temperature: 0.7,
  },
  pro: {
    model: "gpt-4o",
    maxTokens: 5000,
    temperature: 0.7,
  },
} as const;

/**
 * Generate optimized prompt for note generation
 * Based on Turbo AI quality standards
 */
function generatePrompt(text: string, userPlan: UserPlan): string {
  const isProPlan = userPlan === "pro";

  const basePrompt = `You are an expert academic note generator. Transform the following document into structured, comprehensive notes that match professional note-taking standards.

Document Content:
${text}

CRITICAL REQUIREMENTS:

1. **Brief Overview** (1-2 sentences)
   - Summarize the document's main purpose and scope
   - Provide immediate context for the reader

2. **Key Points** (4-8 bullet points)
   - Extract the most critical information
   - Use clear, concise language
   - Highlight deadlines, requirements, and important actions
   - Mark important dates with **BOLD** formatting

3. **Structured Sections**
   - Create logical sections based on document content
   - Use appropriate headings (e.g., "Programme Details", "Requirements", "Important Dates", "Contact Information")
   - Each section should have clear, detailed content
   - Use markdown formatting for emphasis

4. **Tables for Structured Data**
   - Use tableSummary array for key-value pairs
   - Example: [{"label": "Contact", "value": "email@example.com"}]
   - Include contact information, dates, fees in table format
   - Use tables for any structured information

5. **Highlighting Important Information**
   - **Bold** for important terms, deadlines, and key requirements
   - Use clear formatting to draw attention to critical details
   - Ensure dates and deadlines are prominently displayed

6. **Quiz Generation** (${isProPlan ? '8-12' : '5-8'} questions)
   - Questions should test understanding of key concepts
   - Mix difficulty levels: easy, medium, hard
   - Include 4 options (A, B, C, D) for each question
   - Provide clear, educational explanations
   - Focus on practical application and comprehension

7. **Flashcard Generation** (${isProPlan ? '12-20' : '8-15'} cards)
   - Front: Key term, concept, or question
   - Back: Clear definition or answer (concise but complete)
   - Tag: Category for organization (e.g., "Definitions", "Dates", "Requirements")
   - Cover important terms, dates, and concepts

${isProPlan ? `
8. **Pro Plan Enhancements**
   - Provide deeper analysis and context
   - Include cross-references between sections
   - Add practical examples and applications
   - Suggest additional resources or considerations
` : ''}

OUTPUT FORMAT: Return ONLY valid JSON (no markdown code blocks, no explanations):
{
  "title": "Clear, descriptive document title",
  "summaryForChat": "2-3 sentence summary capturing essence and key points",
  "notes": [
    {
      "id": "note-1",
      "heading": "Section Heading",
      "content": "Detailed paragraph explaining the section. Use **bold** for important terms.",
      "bullets": ["Key point 1 with specific details", "Key point 2", "..."],
      "example": "Practical example or application (optional)",
      "tableSummary": [{"label": "Key", "value": "Value"}]
    }
  ],
  "quizzes": [
    {
      "id": "quiz-1",
      "question": "Clear, specific question",
      "options": [
        {"label": "A", "text": "First option"},
        {"label": "B", "text": "Second option"},
        {"label": "C", "text": "Third option"},
        {"label": "D", "text": "Fourth option"}
      ],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why this answer is correct",
      "difficulty": "easy|medium|hard"
    }
  ],
  "flashcards": [
    {
      "id": "card-1",
      "front": "Term or question",
      "back": "Definition or answer",
      "tag": "Category"
    }
  ]
}

QUALITY STANDARDS:
- Be comprehensive yet concise
- Prioritize accuracy and clarity
- Structure information logically
- Use professional academic language
- Ensure all critical information is captured
- Make notes scannable with good formatting`;

  return basePrompt;
}

/**
 * Generate structured content using OpenAI
 * Optimized for quality and based on user plan
 */
export async function generateStructuredContent(
  text: string,
  userPlan: UserPlan = "free",
  contentType: "file" | "audio" | "video" = "file"
): Promise<{
  title: string;
  notes: NoteSection[];
  quizzes: QuizItem[];
  flashcards: Flashcard[];
  summaryForChat: string;
}> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const config = MODEL_CONFIG[userPlan];

  // Adjust text length based on plan
  const maxTextLength = userPlan === "pro" ? 12000 : 8000;
  const truncatedText = text.substring(0, maxTextLength);

  const prompt = generatePrompt(truncatedText, userPlan);

  try {
    console.log(`Generating notes with ${config.model} for ${userPlan} plan (${contentType})`);

    const completion = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: "system",
          content: "You are an expert educational assistant that generates high-quality, structured learning materials in JSON format. Focus on clarity, accuracy, and educational value."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);

    // Validate and structure the response
    return {
      title: parsed.title || getDefaultTitle(contentType),
      notes: validateNotes(parsed.notes || []),
      quizzes: validateQuizzes(parsed.quizzes || []),
      flashcards: validateFlashcards(parsed.flashcards || []),
      summaryForChat: parsed.summaryForChat || "Educational content covering key concepts and topics.",
    };
  } catch (error: any) {
    console.error('LLM generation error:', error);

    // Enhanced error handling
    if (error.message?.includes('rate_limit')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.message?.includes('context_length')) {
      throw new Error('Document is too long. Please try with a shorter document.');
    } else {
      throw new Error('Failed to generate structured content. Please try again.');
    }
  }
}

/**
 * Validate and structure notes
 */
function validateNotes(notes: any[]): NoteSection[] {
  return notes.map((note: any, idx: number) => ({
    id: note.id || `note-${idx + 1}`,
    heading: note.heading || "",
    content: note.content || "",
    bullets: Array.isArray(note.bullets) ? note.bullets : [],
    example: note.example,
    tableSummary: Array.isArray(note.tableSummary) ? note.tableSummary : [],
    summaryTable: note.summaryTable, // Support for complex tables
  }));
}

/**
 * Validate and structure quizzes
 */
function validateQuizzes(quizzes: any[]): QuizItem[] {
  return quizzes.map((quiz: any, idx: number) => ({
    id: quiz.id || `quiz-${idx + 1}`,
    question: quiz.question || "",
    options: (quiz.options || []).map((opt: any, optIdx: number) => ({
      label: opt.label || String.fromCharCode(65 + optIdx),
      text: opt.text || "",
    })),
    correctIndex: quiz.correctIndex ?? 0,
    explanation: quiz.explanation || "",
    difficulty: quiz.difficulty || "medium",
  }));
}

/**
 * Validate and structure flashcards
 */
function validateFlashcards(flashcards: any[]): Flashcard[] {
  return flashcards.map((card: any, idx: number) => ({
    id: card.id || `card-${idx + 1}`,
    front: card.front || "",
    back: card.back || "",
    tag: card.tag || "General",
  }));
}

/**
 * Get default title based on content type
 */
function getDefaultTitle(contentType: "file" | "audio" | "video"): string {
  switch (contentType) {
    case "audio":
      return "Audio Lecture Notes";
    case "video":
      return "Video Content Notes";
    default:
      return "Document Notes";
  }
}

/**
 * Retry wrapper with exponential backoff
 */
export async function generateWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on certain errors
      if (error.message?.includes('rate_limit') ||
          error.message?.includes('authentication')) {
        throw error;
      }

      // Exponential backoff
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
