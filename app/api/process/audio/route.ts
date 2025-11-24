import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, AudioSource } from "@/types/notra";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";
import { generateLearningAsset } from "@/lib/learning-asset-generator";

// Use Node.js runtime for file system operations
export const runtime = "nodejs";

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
    // Whisper API requires a File-like object
    // Create a File object from the buffer
    const fileForApi = new File([buffer], audioFile.name, { 
      type: audioFile.type || 'audio/webm' 
    });
    
    // Use FormData for Whisper API (it expects a file)
    const formData = new FormData();
    formData.append('file', fileForApi);
    formData.append('model', 'whisper-1');
    formData.append('prompt', 'This is an educational lecture or audio content. Please transcribe accurately.');
    
    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: fileForApi as any,
      model: "whisper-1",
      language: undefined, // Auto-detect
      prompt: "This is an educational lecture or audio content. Please transcribe accurately.",
    });

    const transcriptText = typeof transcription === 'string' 
      ? transcription 
      : (transcription as any).text || '';

    if (!transcriptText || transcriptText.trim().length === 0) {
      throw new Error('Transcription result is empty. The audio file might be corrupted, format not supported, or content too short.');
    }

    // Cleanup
    await unlink(tempPath).catch(() => {});

    return transcriptText;
  } catch (error: any) {
    // Cleanup on error
    await unlink(tempPath).catch(() => {});
    console.error('Audio transcription error:', error);
    
    // Provide more specific error messages
    if (error.message && error.message.includes('empty')) {
      throw new Error('EMPTY_TRANSCRIPTION: Transcription result is empty. The audio file might be corrupted, format not supported, or content too short. Please check the audio file.');
    }
    if (error.message && error.message.includes('format')) {
      throw new Error('UNSUPPORTED_AUDIO_FORMAT: Audio format not supported. Please use MP3, WAV, M4A, or WebM format.');
    }
    throw new Error(`Failed to transcribe audio: ${error.message || 'Unknown error'}`);
  }
}

// Note: generateStructuredContent has been moved to lib/learning-asset-generator.ts
// This file now uses the unified generator function

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

    // Generate structured content using unified generator (ONE LLM call)
    // Estimate duration if possible (this is a placeholder - actual duration would come from audio metadata)
    const estimatedDuration = file.size > 0 ? Math.round(file.size / 16000) : undefined; // Rough estimate
    
    const structuredContent = await generateLearningAsset(transcript, {
      type: "audio",
      metadata: {
        fileName: file.name,
        duration: estimatedDuration,
        format: file.type,
      }
    });

    // Prepare source information
    const source: AudioSource = {
      fileName: file.name,
      duration: estimatedDuration,
      format: file.type,
    };

    // Create new session with source information
    const newSession = await createSession({
      type: "audio",
      title: structuredContent.title || "Audio Lecture",
      contentHash,
      notes: structuredContent.notes,
      quizzes: structuredContent.quizzes,
      flashcards: structuredContent.flashcards,
      summaryForChat: structuredContent.summaryForChat,
      source,
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
    const errorMessage = error.message || 'Failed to process audio';
    
    // Extract error code from message if present
    let errorCode = 'AUDIO_PROCESSING_ERROR';
    if (errorMessage.includes('EMPTY_TRANSCRIPTION')) {
      errorCode = 'EMPTY_TRANSCRIPTION';
    } else if (errorMessage.includes('UNSUPPORTED_AUDIO_FORMAT')) {
      errorCode = 'UNSUPPORTED_AUDIO_FORMAT';
    } else if (errorMessage.includes('transcribe') || errorMessage.includes('Transcribe')) {
      errorCode = 'TRANSCRIPTION_ERROR';
    }
    
    return NextResponse.json(
      { 
        error: errorCode,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

