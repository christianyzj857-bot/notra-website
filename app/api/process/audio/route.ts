import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, NoteSection, QuizItem, Flashcard } from "@/types/notra";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";

// Force Node.js runtime for file handling
export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB Whisper limit

// Transcribe audio using Whisper API
async function transcribeAudio(audioFile: File): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  // Get file buffer and check size
  const bytes = await audioFile.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Check file size (Whisper limit is 25MB)
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('FILE_TOO_LARGE: Audio file exceeds 25MB limit. Please compress or shorten the audio.');
  }

  // Save file temporarily
  const tempPath = join(tmpdir(), `audio-${Date.now()}.${audioFile.name.split('.').pop()}`);
  await writeFile(tempPath, buffer);

  try {
    // Use fs.createReadStream for better compatibility with OpenAI SDK
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-1",
      prompt: "This is an educational lecture or audio content. Please transcribe accurately with proper punctuation and capitalization.",
      temperature: 0, // Lower randomness for consistency
    });

    const transcriptText = typeof transcription === 'string'
      ? transcription
      : transcription.text;

    // Cleanup temp file
    await unlink(tempPath).catch(() => {});

    if (!transcriptText || transcriptText.trim().length === 0) {
      throw new Error('EMPTY_TRANSCRIPTION: Transcription result is empty. The audio may be corrupted, too short, or in an unsupported format.');
    }

    return transcriptText;
  } catch (error) {
    // Cleanup temp file on error
    await unlink(tempPath).catch(() => {});
    throw error;
  }
}

// Generate structured content from transcript (same as file processing)
async function generateStructuredContent(text: string): Promise<{
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

  const truncatedText = text.substring(0, 8000);

  const prompt = `You are an AI learning assistant. Analyze the following transcribed lecture/audio content and generate structured study materials.

Transcribed Content:
${truncatedText}

Please return a JSON object with the following structure:
{
  "title": "A concise title for this lecture/audio",
  "notes": [
    {
      "id": "note-1",
      "heading": "Section heading",
      "content": "Main content paragraph",
      "bullets": ["Key point 1", "Key point 2"],
      "example": "Optional example",
      "tableSummary": [{"label": "Term", "value": "Definition"}]
    }
  ],
  "quizzes": [
    {
      "id": "quiz-1",
      "question": "Question text",
      "options": [{"label": "A", "text": "Option A"}, {"label": "B", "text": "Option B"}, {"label": "C", "text": "Option C"}, {"label": "D", "text": "Option D"}],
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
      "tag": "Category"
    }
  ],
  "summaryForChat": "A concise 2-3 sentence summary of the key concepts for chat context"
}

Generate 4-6 note sections, 3-5 quiz questions, and 4-6 flashcards.`;

  try {
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: "You are a helpful educational assistant that generates structured learning materials in JSON format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);

    return {
      title: parsed.title || "Audio Lecture",
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
      summaryForChat: parsed.summaryForChat || "Educational audio content covering key concepts and topics.",
    };
  } catch (error: any) {
    console.error('LLM generation error:', error);
    throw new Error('Failed to generate structured content');
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check usage limits
    const plan = getCurrentUserPlan();
    const limits = USAGE_LIMITS[plan];
    const monthKey = getMonthKey();
    const used = await getUsage("audio", monthKey);

    if (used >= limits.maxAudioSessionsPerMonth) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: "You have reached your monthly limit for audio transcriptions.",
          plan,
          scope: "audio",
          limit: limits.maxAudioSessionsPerMonth,
        },
        { status: 429 }
      );
    }

    // Transcribe audio
    console.log(`Processing audio file: ${file.name}, size: ${file.size} bytes`);
    const transcript = await transcribeAudio(file);
    console.log(`Transcription completed, length: ${transcript.length} characters`);

    // Generate content hash for deduplication
    const contentHash = generateContentHash(transcript);

    // Check for existing session with same content
    const existingSession = await findSessionByHash(contentHash);
    if (existingSession) {
      console.log(`Found existing session with same content: ${existingSession.id}`);
      return NextResponse.json({
        sessionId: existingSession.id,
        type: existingSession.type,
        title: existingSession.title,
        createdAt: existingSession.createdAt,
      });
    }

    // Generate structured content using LLM
    console.log('Generating structured content...');
    const structuredContent = await generateStructuredContent(transcript);

    // Create new session
    const newSession = await createSession({
      type: "audio",
      title: structuredContent.title || "Audio Lecture",
      contentHash,
      notes: structuredContent.notes,
      quizzes: structuredContent.quizzes,
      flashcards: structuredContent.flashcards,
      summaryForChat: structuredContent.summaryForChat,
    });

    console.log(`Created new session: ${newSession.id}`);

    // Increment usage count after successful processing
    await incrementUsage("audio", monthKey, 1);

    return NextResponse.json({
      sessionId: newSession.id,
      type: newSession.type,
      title: newSession.title,
      createdAt: newSession.createdAt,
    });
  } catch (error: any) {
    console.error('Audio processing error:', error);

    // Handle specific error types
    if (error.message?.includes('FILE_TOO_LARGE')) {
      return NextResponse.json(
        { error: 'FILE_TOO_LARGE', message: 'Audio file exceeds 25MB limit. Please compress or shorten the audio.' },
        { status: 400 }
      );
    }

    if (error.message?.includes('EMPTY_TRANSCRIPTION')) {
      return NextResponse.json(
        { error: 'EMPTY_TRANSCRIPTION', message: 'Transcription result is empty. The audio may be corrupted, too short, or in an unsupported format.' },
        { status: 400 }
      );
    }

    if (error.message?.includes('OpenAI API key not configured')) {
      return NextResponse.json(
        { error: 'CONFIGURATION_ERROR', message: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'PROCESSING_ERROR', message: error.message || 'Failed to process audio' },
      { status: 500 }
    );
  }
}

