import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, NoteSection, QuizItem, Flashcard } from "@/types/notra";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = "gpt-4o-mini";

// Transcribe audio using Whisper API
async function transcribeAudio(audioFile: File): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  // Save file temporarily
  const bytes = await audioFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const tempPath = join(tmpdir(), `audio-${Date.now()}.${audioFile.name.split('.').pop()}`);
  await writeFile(tempPath, buffer);

  try {
    // Create a File object for Whisper API
    const fileForApi = new File([buffer], audioFile.name, { type: audioFile.type || 'audio/webm' });
    
    const transcription = await openai.audio.transcriptions.create({
      file: fileForApi as any,
      model: "whisper-1",
      language: undefined, // Auto-detect
      prompt: "This is an educational lecture or audio content. Please transcribe accurately.",
    });

    const transcriptText = typeof transcription === 'string' 
      ? transcription 
      : transcription.text;

    // Cleanup
    await unlink(tempPath).catch(() => {});

    return transcriptText;
  } catch (error) {
    // Cleanup on error
    await unlink(tempPath).catch(() => {});
    throw new Error('Failed to transcribe audio');
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

    // Transcribe audio
    const transcript = await transcribeAudio(file);
    
    // Generate content hash
    const contentHash = generateContentHash(transcript);

    // Check for existing session
    const existingSession = await findSessionByHash(contentHash);
    if (existingSession) {
      return NextResponse.json({
        sessionId: existingSession.id,
        type: existingSession.type,
        title: existingSession.title,
        createdAt: existingSession.createdAt,
      });
    }

    // Generate structured content
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

    return NextResponse.json({
      sessionId: newSession.id,
      type: newSession.type,
      title: newSession.title,
      createdAt: newSession.createdAt,
    });
  } catch (error: any) {
    console.error('Audio processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process audio' },
      { status: 500 }
    );
  }
}

