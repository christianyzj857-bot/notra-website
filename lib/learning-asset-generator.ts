/**
 * Unified Learning Asset Generator (Turbo-level)
 * 
 * This module provides a single function to generate complete learning assets
 * (notes, quizzes, flashcards, summary) from any text input.
 * 
 * Used by: File upload, Audio transcription, Video processing
 * Cost optimization: Only ONE LLM call per input, generates all assets at once
 * 
 * Features:
 * - Two-stage processing for very long texts (summary → generate)
 * - JSON mode with jsonrepair + zod validation
 * - Retry mechanism with stricter prompts
 */

import OpenAI from "openai";
import { NoteSection, QuizItem, Flashcard } from "@/types/notra";
import { jsonrepair } from "jsonrepair";
import { LearningAssetResultSchema, type ValidatedLearningAssetResult } from "./learning-asset-schema";
import { cleanText, createRoughSummary, estimateTokens } from "./text-processor";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = "gpt-4o-mini";
const TEMPERATURE = 0.5; // 0.4-0.6 range for consistent output
const MAX_CONTEXT_LENGTH = 12000; // Characters
const VERY_LONG_TEXT_THRESHOLD = 20000; // Characters - use two-stage processing

export interface GenerateLearningAssetOptions {
  type: "file" | "audio" | "video";
  metadata?: {
    fileName?: string;
    videoUrl?: string;
    platform?: string;
    duration?: number;
    format?: string;
    mimeType?: string;
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
 * Create a rough summary for two-stage processing (cost optimization)
 */
async function createSummaryForLongText(
  text: string,
  openai: OpenAI
): Promise<string> {
  const summaryPrompt = `You are summarizing educational content. Create a comprehensive summary that captures:
- All major topics and concepts
- Key definitions and formulas
- Important examples and applications
- Main conclusions and takeaways

Content:
${text.substring(0, VERY_LONG_TEXT_THRESHOLD)}

Provide a detailed summary (2000-3000 words) that preserves all essential information for generating study materials.`;

  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: "You are an expert at summarizing educational content while preserving all key information." },
      { role: "user", content: summaryPrompt }
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  return completion.choices[0]?.message?.content || text.substring(0, MAX_CONTEXT_LENGTH);
}

/**
 * Generate learning assets with retry mechanism
 */
async function generateWithRetry(
  openai: OpenAI,
  prompt: string,
  isRetry: boolean = false
): Promise<ValidatedLearningAssetResult> {
  const systemMessage = isRetry
    ? "You are a helpful educational assistant that generates structured learning materials in JSON format. CRITICAL: You must return valid, complete JSON. Ensure all required fields are present and properly formatted. Double-check your JSON syntax before responding."
    : "You are a helpful educational assistant that generates structured learning materials in JSON format. Always return valid JSON.";

  console.log(`[LearningAssetGenerator] Calling OpenAI API (${isRetry ? 'RETRY' : 'INITIAL'}), model: ${DEFAULT_MODEL}, estimated tokens: ${estimateTokens(prompt)}`);

  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    temperature: TEMPERATURE,
    max_tokens: 6000,
  });

  const responseText = completion.choices[0]?.message?.content || '{}';
  console.log(`[LearningAssetGenerator] OpenAI response received, length: ${responseText.length}`);

  // Step 1: jsonrepair
  let repairedJson: string;
  try {
    repairedJson = jsonrepair(responseText);
    console.log('[LearningAssetGenerator] JSON repaired successfully');
  } catch (repairError: any) {
    console.error('[LearningAssetGenerator] JSON repair failed:', repairError);
    if (!isRetry) {
      // Retry with stricter prompt
      console.log('[LearningAssetGenerator] Retrying with stricter prompt...');
      return generateWithRetry(openai, prompt, true);
    }
    throw new Error(`Failed to repair JSON: ${repairError.message}`);
  }

  // Step 2: Parse JSON
  let parsed: any;
  try {
    parsed = JSON.parse(repairedJson);
    console.log('[LearningAssetGenerator] JSON parsed successfully');
  } catch (parseError: any) {
    console.error('[LearningAssetGenerator] JSON parse error:', parseError);
    if (!isRetry) {
      console.log('[LearningAssetGenerator] Retrying with stricter prompt...');
      return generateWithRetry(openai, prompt, true);
    }
    throw new Error(`Failed to parse JSON: ${parseError.message}`);
  }

  // Step 3: Zod validation
  const validationResult = LearningAssetResultSchema.safeParse(parsed);
  if (!validationResult.success) {
    console.error('[LearningAssetGenerator] Zod validation failed:', validationResult.error);
    if (!isRetry) {
      console.log('[LearningAssetGenerator] Retrying with stricter prompt...');
      return generateWithRetry(openai, prompt, true);
    }
    throw new Error(`Validation failed: ${validationResult.error.message}`);
  }

  console.log('[LearningAssetGenerator] Validation successful');
  return validationResult.data;
}

/**
 * Generate complete learning assets from text content
 * 
 * This function makes ONE LLM call to generate all assets at once:
 * - Structured notes (concept → derivation → example → summary → table)
 * - Quiz questions (4-choice with explanations)
 * - Flashcards (10-15 cards)
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

  // Clean text first
  const cleanedText = cleanText(text);
  const originalLength = cleanedText.length;
  console.log(`[LearningAssetGenerator] Input text length: ${originalLength} characters, estimated tokens: ${estimateTokens(cleanedText)}`);

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

  // Two-stage processing for very long texts
  let processedText = cleanedText;
  let preprocessingNote = "";
  
  if (cleanedText.length < 500) {
    preprocessingNote = "\n\nNote: Content is relatively short. Please generate comprehensive, detailed learning materials based on what is available. Expand on concepts, provide examples, and create thorough explanations even if the source material is brief.";
    processedText = cleanedText;
  } else if (cleanedText.length > VERY_LONG_TEXT_THRESHOLD) {
    // Two-stage: First create summary, then generate from summary
    console.log('[LearningAssetGenerator] Text is very long, using two-stage processing (summary → generate)');
    const summary = await createSummaryForLongText(cleanedText, openai);
    processedText = summary;
    preprocessingNote = "\n\nNote: This content was summarized from a longer source. Please generate comprehensive materials based on this summary.";
  } else if (cleanedText.length > MAX_CONTEXT_LENGTH) {
    // Truncate but keep more context
    processedText = cleanedText.substring(0, MAX_CONTEXT_LENGTH);
    preprocessingNote = `\n\nNote: Content has been truncated for processing. Only the first ${MAX_CONTEXT_LENGTH} characters were analyzed. Please generate comprehensive materials based on this portion.`;
  } else {
    processedText = cleanedText;
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

1. **NOTES (Generate 6-10 comprehensive sections with structure: Concept → Derivation → Example → Summary → Table)**:
   - Each note must follow this structure:
     * **Concept**: Clear heading and concept explanation
     * **Derivation**: Step-by-step formula derivation in LaTeX (if applicable)
     * **Example**: Detailed example with step-by-step solution
     * **Summary**: Key takeaways and summary
     * **Table**: Markdown table comparing concepts/formulas
   - Use Markdown formatting: headings (##, ###), **bold**, lists, tables
   - Include LaTeX formulas: $inline$ or $$block$$
   - Each section should be substantial (at least 3-5 sentences of explanation)

2. **QUIZZES (Generate 6-10 high-quality questions)**:
   - Multiple choice questions (4 options: A, B, C, D)
   - Test deep understanding (comprehension, analysis, application)
   - Provide thorough explanations for correct answer AND why others are wrong
   - Include mix of easy, medium, and hard questions
   - Cover different aspects, concepts, and applications

3. **FLASHCARDS (Generate 12-15 comprehensive cards)**:
   - Front: Concise but clear question or term
   - Back: Detailed, academic definition or explanation (2-3 sentences minimum)
   - Tag: Category or topic for organization
   - Cover key concepts, definitions, formulas, important facts, and applications

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
      "content": "Detailed explanation paragraph. Use **bold** for emphasis. Include formulas like $formula$ or $$block formula$$.",
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
      "back": "Clear, academic definition or explanation (2-3 sentences)",
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
    // Generate with retry mechanism
    const validatedResult = await generateWithRetry(openai, prompt);

    // Map validated result to return type (aligned with types/notra.ts)
    return {
      title: validatedResult.title,
      notes: validatedResult.notes.map((note) => ({
        id: note.id,
        heading: note.heading,
        content: note.content,
        bullets: note.bullets || [],
        example: note.example,
        tableSummary: note.tableSummary || [],
        conceptExplanation: note.conceptExplanation,
        formulaDerivation: note.formulaDerivation,
        applications: note.applications || [],
        commonMistakes: note.commonMistakes || [],
        summaryTable: note.summaryTable || [],
      })) as NoteSection[],
      quizzes: validatedResult.quizzes.map((quiz) => ({
        id: quiz.id,
        question: quiz.question,
        options: quiz.options.map((opt) => ({
          label: opt.label,
          text: opt.text,
        })),
        correctIndex: quiz.correctIndex,
        explanation: quiz.explanation,
        difficulty: quiz.difficulty || "medium",
      })) as QuizItem[],
      flashcards: validatedResult.flashcards.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        tag: card.tag,
      })) as Flashcard[],
      summaryForChat: validatedResult.summaryForChat,
    };
  } catch (error: any) {
    console.error('[LearningAssetGenerator] Generation error:', error);
    throw new Error(`Failed to generate learning assets: ${error.message || 'Unknown error'}`);
  }
}
