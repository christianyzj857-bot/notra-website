import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";
import { generateStructuredContent, generateWithRetry } from "@/lib/noteGeneration";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
          message: "You have reached your monthly limit for audio transcriptions on the free plan.",
          plan,
          scope: "audio",
          limit: limits.maxAudioSessionsPerMonth,
        },
        { status: 429 }
      );
    }

    // Transcribe audio
    const transcript = await transcribeAudio(file);

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Failed to transcribe audio or audio is empty' },
        { status: 400 }
      );
    }

    // Generate content hash
    const contentHash = generateContentHash(transcript);

    // Check for existing session
    const existingSession = await findSessionByHash(contentHash);
    if (existingSession) {
      console.log('Found existing session, returning cached result');
      return NextResponse.json({
        sessionId: existingSession.id,
        type: existingSession.type,
        title: existingSession.title,
        createdAt: existingSession.createdAt,
        cached: true,
      });
    }

    // Generate structured content with retry mechanism
    const structuredContent = await generateWithRetry(
      () => generateStructuredContent(transcript, plan, "audio"),
      3,
      1000
    );

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

    // Provide specific error messages
    let errorMessage = 'Failed to process audio';
    let statusCode = 500;

    if (error.message?.includes('transcribe')) {
      errorMessage = 'Failed to transcribe audio. Please ensure the audio is clear and in a supported format.';
      statusCode = 400;
    } else if (error.message?.includes('Rate limit')) {
      errorMessage = error.message;
      statusCode = 429;
    } else if (error.message?.includes('empty')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

