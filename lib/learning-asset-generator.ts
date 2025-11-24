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

  const prompt = `You are an AI learning assistant. Analyze the following ${contentDescription} and generate comprehensive structured study materials.

${typeSpecificInstructions}

Content:
${truncatedText}${truncationNote}

Please return a JSON object with the following structure:
{
  "title": "A concise, descriptive title for this ${options.type} content",
  "notes": [
    {
      "id": "note-1",
      "heading": "Section heading",
      "content": "Main content paragraph explaining the concept",
      "bullets": ["Key point 1", "Key point 2"],
      "example": "Optional example or illustration",
      "tableSummary": [{"label": "Term", "value": "Definition"}]
    }
  ],
  "quizzes": [
    {
      "id": "quiz-1",
      "question": "Question text",
      "options": [
        {"label": "A", "text": "Option A"},
        {"label": "B", "text": "Option B"},
        {"label": "C", "text": "Option C"},
        {"label": "D", "text": "Option D"}
      ],
      "correctIndex": 0,
      "explanation": "Why this answer is correct",
      "difficulty": "easy"
    }
  ],
  "flashcards": [
    {
      "id": "card-1",
      "front": "Question or term",
      "back": "Answer or definition",
      "tag": "Category or topic"
    }
  ],
  "summaryForChat": "A concise 2-3 sentence summary of the key concepts for chat context. This will be used to help the AI assistant understand the content when answering questions."
}

Requirements:
- Generate 4-6 note sections covering the main topics
- Generate 3-5 quiz questions with clear explanations
- Generate 4-6 flashcards with important terms/concepts
- Make sure all content is educational, accurate, and well-structured
- The summaryForChat should be concise but informative enough for context`;

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
      max_tokens: 3000,
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

    // Validate and structure the response
    return {
      title: parsed.title || `Untitled ${options.type}`,
      notes: (parsed.notes || []).map((note: any, idx: number) => ({
        id: note.id || `note-${idx + 1}`,
        heading: note.heading || "",
        content: note.content || "",
        bullets: note.bullets || [],
        example: note.example,
        tableSummary: note.tableSummary || [],
      })) as NoteSection[],
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

