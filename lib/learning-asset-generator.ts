/**
 * Unified Learning Asset Generator
 * 
 * This module provides a single function to generate complete learning assets
 * (notes, quizzes, flashcards, summary) from any text input.
 * 
 * Used by: File upload, Audio transcription, Video processing
 * Cost optimization: Only ONE LLM call per input, generates all assets at once
 */

import OpenAI from "openai";
import { NoteSection, QuizItem, Flashcard } from "@/types/notra";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = "gpt-4o-mini";

export interface GenerateLearningAssetOptions {
  type: "file" | "audio" | "video";
  metadata?: {
    fileName?: string;
    videoUrl?: string;
    platform?: string;
    duration?: number;
    format?: string; // For audio: file.type (MIME type)
    mimeType?: string; // For file: file.type
    fileSize?: number;
    pageCount?: number;
    videoId?: string;
    title?: string;
  };
}

export interface LearningAssetResult {
  title: string;
  notes: NoteSection[];
  quizzes: QuizItem[];
  flashcards: Flashcard[];
  summaryForChat: string;
}

/**
 * Generate complete learning assets from text content
 * 
 * This function makes ONE LLM call to generate all assets at once:
 * - Structured notes
 * - Quiz questions
 * - Flashcards
 * - Summary for chat
 * 
 * @param text - The input text (transcript, document content, etc.)
 * @param options - Type and metadata for context
 * @returns Complete learning asset structure
 */
export async function generateLearningAsset(
  text: string,
  options: GenerateLearningAssetOptions
): Promise<LearningAssetResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  // Truncate text to save tokens (keep first 8000 characters)
  const truncatedText = text.substring(0, 8000);
  const truncationNote = text.length > 8000 
    ? "\n\nNote: Content has been truncated for processing. Only the first 8000 characters were analyzed."
    : "";

  // Build context-aware prompt based on type
  let contentDescription = "";
  let typeSpecificInstructions = "";

  switch (options.type) {
    case "file":
      contentDescription = options.metadata?.fileName 
        ? `document file: ${options.metadata.fileName}`
        : "document";
      typeSpecificInstructions = "Focus on extracting key concepts, definitions, and structured information from the document.";
      break;
    
    case "audio":
      contentDescription = options.metadata?.duration
        ? `audio lecture/recording (approximately ${Math.round(options.metadata.duration / 60)} minutes)`
        : "audio lecture/recording";
      typeSpecificInstructions = "Focus on capturing the main points, explanations, and key takeaways from the lecture.";
      break;
    
    case "video":
      contentDescription = options.metadata?.videoUrl
        ? `video content from ${options.metadata.platform || 'video platform'}: ${options.metadata.videoUrl}`
        : "video content";
      typeSpecificInstructions = "Focus on summarizing key moments, concepts discussed, and important information presented in the video.";
      break;
  }

  // Smart text preprocessing: handle short/long text
  let processedText = truncatedText;
  let preprocessingNote = "";
  
  if (text.length < 500) {
    preprocessingNote = "\n\nNote: Content is relatively short. Please generate comprehensive learning materials based on what is available, and feel free to expand on concepts if needed.";
  } else if (text.length > 8000) {
    preprocessingNote = truncationNote;
    // For very long content, create a summary first
    processedText = truncatedText.substring(0, 6000) + "\n\n[Content continues but truncated for processing]";
  }

  const prompt = `You are an AI learning assistant specialized in creating Turbo-level educational content. Analyze the following ${contentDescription} and generate comprehensive, highly structured study materials.

${typeSpecificInstructions}

Content:
${processedText}${preprocessingNote}

CRITICAL REQUIREMENTS - Generate Turbo-quality content:

1. **NOTES (Generate 5-10 sections)**:
   - Each note must have a clear heading (use ## for main sections, ### for subsections in Markdown)
   - Rich content with explanations, not just bullet points
   - Include formulas in LaTeX format (e.g., $E = mc^2$ or $$\\int_0^1 x dx$$)
   - Add examples with step-by-step solutions where applicable
   - Create summary tables using Markdown table format when comparing concepts
   - Include concept explanations, applications, and common mistakes
   - Use structured formatting: headings, paragraphs, lists, tables

2. **QUIZZES (Generate 5-10 questions)**:
   - Multiple choice questions (4 options: A, B, C, D)
   - Questions should test understanding, not just recall
   - Include clear explanations for correct answers
   - Vary difficulty levels (easy, medium, hard)
   - Questions should cover different aspects of the content

3. **FLASHCARDS (Generate 10-15 cards)**:
   - Front: Concise question or term
   - Back: Clear, academic definition or explanation
   - Tag: Category or topic for organization
   - Cover key concepts, definitions, formulas, and important facts

4. **SUMMARY_FOR_CHAT**:
   - 2-3 sentences summarizing key concepts
   - Must be informative enough for AI context
   - Focus on main topics and important takeaways

Please return a JSON object with the following EXACT structure:
{
  "title": "A concise, descriptive title for this ${options.type} content",
  "notes": [
    {
      "id": "note-1",
      "heading": "Main Section Title",
      "content": "Detailed explanation paragraph. Use **bold** for emphasis. Include formulas like $formula$ or $$block formula$$. Add examples with step-by-step solutions.",
      "bullets": ["Key point 1", "Key point 2", "Key point 3"],
      "example": "Example: [Step-by-step example with explanation]",
      "tableSummary": [
        {"label": "Concept 1", "value": "Definition 1"},
        {"label": "Concept 2", "value": "Definition 2"}
      ],
      "conceptExplanation": "Enhanced explanation of the core concept",
      "formulaDerivation": "Step-by-step formula derivation in LaTeX: $E = mc^2$",
      "applications": ["Application 1", "Application 2"],
      "commonMistakes": ["Common mistake 1", "Common mistake 2"],
      "summaryTable": [
        {"concept": "Concept A", "formula": "$f(x) = x^2$", "notes": "Notes about concept A"},
        {"concept": "Concept B", "formula": "$g(x) = \\sin(x)$", "notes": "Notes about concept B"}
      ]
    }
  ],
  "quizzes": [
    {
      "id": "quiz-1",
      "question": "Clear, concise question text",
      "options": [
        {"label": "A", "text": "Option A text"},
        {"label": "B", "text": "Option B text"},
        {"label": "C", "text": "Option C text"},
        {"label": "D", "text": "Option D text"}
      ],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why this answer is correct and why others are wrong",
      "difficulty": "medium"
    }
  ],
  "flashcards": [
    {
      "id": "card-1",
      "front": "Concise question or term",
      "back": "Clear, academic definition or explanation",
      "tag": "Category or topic"
    }
  ],
  "summaryForChat": "2-3 sentence summary of key concepts for AI chat context"
}

QUALITY STANDARDS:
- All content must be educational, accurate, and well-structured
- Notes should be comprehensive with proper formatting
- Quizzes should test deep understanding
- Flashcards should be concise but informative
- Use Markdown formatting throughout (headings, bold, lists, tables)
- Include LaTeX formulas where applicable
- Make content engaging and easy to understand`;

  try {
    console.log('[LearningAssetGenerator] Calling OpenAI API, model:', DEFAULT_MODEL, 'text length:', text.length);
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are a helpful educational assistant that generates structured learning materials in JSON format. Always return valid JSON." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000, // Increased for more comprehensive content
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    console.log('[LearningAssetGenerator] OpenAI response received, length:', responseText.length);
    
    let parsed;
    try {
      parsed = JSON.parse(responseText);
      console.log('[LearningAssetGenerator] JSON parsed successfully');
    } catch (parseError: any) {
      console.error('[LearningAssetGenerator] JSON parse error:', parseError, 'Response text:', responseText.substring(0, 500));
      throw new Error(`Failed to parse OpenAI response as JSON: ${parseError.message}`);
    }

    // Validate and structure the response with enhanced fields
    const notes = (parsed.notes || []).map((note: any, idx: number) => ({
      id: note.id || `note-${idx + 1}`,
      heading: note.heading || "",
      content: note.content || "",
      bullets: note.bullets || [],
      example: note.example,
      tableSummary: note.tableSummary || [],
      // Enhanced fields
      conceptExplanation: note.conceptExplanation,
      formulaDerivation: note.formulaDerivation,
      applications: note.applications || [],
      commonMistakes: note.commonMistakes || [],
      summaryTable: note.summaryTable || [],
    })) as NoteSection[];

    // Ensure minimum counts (Turbo quality)
    const minNotes = 5;
    const minQuizzes = 5;
    const minFlashcards = 10;

    // If we got fewer than minimum, log a warning but proceed
    if (notes.length < minNotes) {
      console.warn(`[LearningAssetGenerator] Generated only ${notes.length} notes, expected at least ${minNotes}`);
    }

    return {
      title: parsed.title || `Untitled ${options.type}`,
      notes: notes,
      quizzes: (parsed.quizzes || []).map((quiz: any, idx: number) => ({
        id: quiz.id || `quiz-${idx + 1}`,
        question: quiz.question || "",
        options: (quiz.options || []).map((opt: any, optIdx: number) => ({
          label: opt.label || String.fromCharCode(65 + optIdx),
          text: opt.text || "",
        })),
        correctIndex: quiz.correctIndex ?? 0,
        explanation: quiz.explanation || "",
        difficulty: quiz.difficulty || "medium",
      })) as QuizItem[],
      flashcards: (parsed.flashcards || []).map((card: any, idx: number) => ({
        id: card.id || `card-${idx + 1}`,
        front: card.front || "",
        back: card.back || "",
        tag: card.tag,
      })) as Flashcard[],
      summaryForChat: parsed.summaryForChat || `Educational ${options.type} content covering key concepts and topics.`,
    };
  } catch (error: any) {
    console.error('Learning asset generation error:', error);
    throw new Error(`Failed to generate learning assets: ${error.message || 'Unknown error'}`);
  }
}

