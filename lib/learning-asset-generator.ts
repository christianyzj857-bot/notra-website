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

  // Smart text processing: use more context for better quality
  // For Turbo quality, we need more context (up to 12000 characters)
  const MAX_CONTEXT_LENGTH = 12000;
  
  // Build context-aware prompt based on type
  let contentDescription = "";
  let typeSpecificInstructions = "";

  switch (options.type) {
    case "file":
      contentDescription = options.metadata?.fileName 
        ? `document file: ${options.metadata.fileName}`
        : "document";
      typeSpecificInstructions = "Focus on extracting key concepts, definitions, and structured information from the document. Provide comprehensive analysis and detailed explanations.";
      break;
    
    case "audio":
      contentDescription = options.metadata?.duration
        ? `audio lecture/recording (approximately ${Math.round(options.metadata.duration / 60)} minutes)`
        : "audio lecture/recording";
      typeSpecificInstructions = "Focus on capturing the main points, explanations, and key takeaways from the lecture. Organize content logically and provide detailed notes.";
      break;
    
    case "video":
      contentDescription = options.metadata?.videoUrl
        ? `video content from ${options.metadata.platform || 'video platform'}: ${options.metadata.videoUrl}`
        : "video content";
      typeSpecificInstructions = "Focus on summarizing key moments, concepts discussed, and important information presented in the video. Create comprehensive study materials.";
      break;
  }

  // Smart text preprocessing: handle short/long text
  let processedText = text;
  let preprocessingNote = "";
  
  if (text.length < 500) {
    preprocessingNote = "\n\nNote: Content is relatively short. Please generate comprehensive, detailed learning materials based on what is available. Expand on concepts, provide examples, and create thorough explanations even if the source material is brief.";
    processedText = text;
  } else if (text.length > MAX_CONTEXT_LENGTH) {
    // For very long content, use first part (most important content usually at the beginning)
    processedText = text.substring(0, 10000);
    preprocessingNote = `\n\nNote: Content has been truncated for processing. Only the first ${MAX_CONTEXT_LENGTH} characters were analyzed. Please generate comprehensive materials based on this portion.`;
  } else {
    // Use full text for better quality
    processedText = text;
  }

  const prompt = `You are an expert AI learning assistant specialized in creating Turbo-level, high-quality educational content. Your goal is to transform raw content into comprehensive, well-structured, and academically rigorous study materials.

${typeSpecificInstructions}

IMPORTANT: Analyze the content deeply and generate materials that are:
- **Comprehensive**: Cover all major concepts and topics
- **Detailed**: Provide thorough explanations, not just summaries
- **Structured**: Use clear hierarchy and organization
- **Academic**: Maintain high academic standards
- **Practical**: Include real-world examples and applications

Content to analyze:
${processedText}${preprocessingNote}

CRITICAL REQUIREMENTS - Generate Turbo-quality content:

1. **NOTES (Generate 6-10 comprehensive sections)**:
   - Each note must have a clear, descriptive heading (use ## for main sections, ### for subsections in Markdown)
   - **Rich, detailed content**: Write full paragraphs explaining concepts thoroughly, not just bullet points
   - **Formulas**: Include formulas in LaTeX format when relevant (e.g., $E = mc^2$ or $$\\int_0^1 x dx$$)
   - **Examples**: Add detailed examples with step-by-step solutions where applicable
   - **Tables**: Create summary tables using Markdown table format when comparing concepts
   - **Depth**: Include concept explanations, real-world applications, and common mistakes students make
   - **Structure**: Use proper formatting: headings, paragraphs, numbered lists, bullet lists, tables
   - **Quality**: Each section should be substantial (at least 3-5 sentences of explanation)

2. **QUIZZES (Generate 6-10 high-quality questions)**:
   - Multiple choice questions (4 options: A, B, C, D)
   - **Test deep understanding**: Questions should require comprehension, analysis, and application, not just memorization
   - **Detailed explanations**: Provide thorough explanations for why the correct answer is right AND why other options are wrong
   - **Difficulty variety**: Include a mix of easy, medium, and hard questions
   - **Coverage**: Questions should cover different aspects, concepts, and applications from the content
   - **Quality**: Each question should be well-crafted and educational

3. **FLASHCARDS (Generate 12-15 comprehensive cards)**:
   - **Front**: Concise but clear question or term
   - **Back**: Detailed, academic definition or explanation (2-3 sentences minimum)
   - **Tag**: Category or topic for organization
   - **Coverage**: Cover key concepts, definitions, formulas, important facts, and applications
   - **Quality**: Each card should be informative and educational

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

QUALITY STANDARDS (CRITICAL):
- **Accuracy**: All content must be factually correct and educationally sound
- **Comprehensiveness**: Cover all major topics and concepts from the content
- **Depth**: Provide detailed explanations, not superficial summaries
- **Structure**: Use proper Markdown formatting (headings, bold, lists, tables)
- **Formulas**: Include LaTeX formulas where applicable ($inline$ or $$block$$)
- **Examples**: Include practical examples and real-world applications
- **Engagement**: Make content engaging, clear, and easy to understand
- **Academic rigor**: Maintain high academic standards throughout

Remember: Quality over quantity. Generate fewer but more comprehensive sections if needed to maintain high quality.`;

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
      temperature: 0.5, // Lower temperature for more consistent, focused output
      max_tokens: 6000, // Increased significantly for comprehensive content
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

