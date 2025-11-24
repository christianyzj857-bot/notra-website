import { NextResponse } from "next/server";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { AudioSource } from "@/types/notra";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";
import { generateLearningAsset } from "@/lib/learning-asset-generator";
import { transcribeAudioWithChunking, cleanTranscript, validateAudioFormat, getAudioDuration } from "@/lib/audio-processor";
import { estimateTokens } from "@/lib/text-processor";

// Use Node.js runtime for file system operations
export const runtime = "nodejs";

const MAX_AUDIO_MB = parseInt(process.env.MAX_FILE_MB || '25', 10);
const TRANSCRIBE_CHUNK_SEC = parseInt(process.env.TRANSCRIBE_CHUNK_SEC || '90', 10);

// Note: generateStructuredContent has been moved to lib/learning-asset-generator.ts
// This file now uses the unified generator function

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Check file size limits
    const maxFileSize = MAX_AUDIO_MB * 1024 * 1024;
    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          error: 'FILE_TOO_LARGE',
          message: `Audio file size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the limit (${MAX_AUDIO_MB}MB). Please compress or split the audio.`,
          maxSize: maxFileSize,
          actualSize: file.size,
          hint: `Maximum audio file size is ${MAX_AUDIO_MB}MB. For longer recordings, consider splitting into smaller segments.`,
        },
        { status: 400 }
      );
    }

    // Check audio format
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/x-m4a', 'audio/mp4'];
    const allowedExtensions = ['.mp3', '.wav', '.webm', '.m4a', '.mp4'];
    const fileName = file.name.toLowerCase();
    const isValidFormat = allowedMimeTypes.includes(file.type) || 
                          allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidFormat && file.type) {
      return NextResponse.json(
        {
          error: 'UNSUPPORTED_AUDIO_FORMAT',
          message: `Audio format not supported. Please use MP3, WAV, WebM, or M4A format.`,
          allowedFormats: allowedExtensions,
        },
        { status: 400 }
      );
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

    // Save file temporarily for processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tmpdir(), `audio-${Date.now()}.${file.name.split('.').pop() || 'mp3'}`);
    await writeFile(tempPath, buffer);

    let transcript: string;
    let estimatedDuration: number | undefined;
    let format: string | undefined;

    try {
      // Validate audio format and get metadata
      const validation = await validateAudioFormat(tempPath);
      if (!validation.isValid) {
        throw new Error(`Invalid audio format: ${validation.error || 'Unknown format'}`);
      }
      format = validation.format;

      // Get actual duration
      estimatedDuration = await getAudioDuration(tempPath);

      // Check duration limits
      const plan = getCurrentUserPlan();
      const limits = USAGE_LIMITS[plan];
      const maxDurationSeconds = limits.maxAudioMinutesPerSession * 60;
      
      if (estimatedDuration > maxDurationSeconds) {
        return NextResponse.json(
          {
            error: 'AUDIO_TOO_LONG',
            message: `Audio duration (${Math.round(estimatedDuration / 60)} minutes) exceeds the limit of ${limits.maxAudioMinutesPerSession} minutes for ${plan} plan.`,
            duration: estimatedDuration,
            maxDuration: maxDurationSeconds,
            hint: `Upgrade to Pro for up to ${USAGE_LIMITS.pro.maxAudioMinutesPerSession} minutes per session.`,
          },
          { status: 400 }
        );
      }

      // Transcribe with chunking support (for long audio)
      console.log(`[Audio API] Starting transcription, duration: ${estimatedDuration}s, chunk threshold: ${TRANSCRIBE_CHUNK_SEC}s`);
      transcript = await transcribeAudioWithChunking(tempPath, (stage, progress) => {
        console.log(`[Audio API] Progress: ${stage} ${(progress * 100).toFixed(0)}%`);
      });

      // Clean transcript
      transcript = cleanTranscript(transcript);

      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcription result is empty. The audio file might be corrupted, format not supported, or content too short.');
      }

      console.log(`[Audio API] Transcription completed, length: ${transcript.length}, estimated tokens: ${estimateTokens(transcript)}`);
    } catch (error: any) {
      await unlink(tempPath).catch(() => {});
      throw error;
    } finally {
      // Cleanup temp file
      await unlink(tempPath).catch(() => {});
    }
    
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
    console.log('[Audio API] Starting learning asset generation, transcript length:', transcript.length);
    let structuredContent;
    try {
      structuredContent = await generateLearningAsset(transcript, {
        type: "audio",
        metadata: {
          fileName: file.name,
          duration: estimatedDuration,
          format: format || file.type,
        }
      });
      console.log('[Audio API] Learning asset generated successfully:', {
        title: structuredContent.title,
        notesCount: structuredContent.notes.length,
        quizzesCount: structuredContent.quizzes.length,
        flashcardsCount: structuredContent.flashcards.length,
      });
    } catch (genError: any) {
      console.error('[Audio API] Learning asset generation failed:', genError);
      throw new Error(`Failed to generate learning assets: ${genError.message || 'Unknown error'}`);
    }

    // Prepare source information
    const source: AudioSource = {
      fileName: file.name,
      duration: estimatedDuration,
      format: format || file.type,
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
    console.error('[Audio API] Processing error:', error);
    const errorMessage = error.message || 'Failed to process audio';
    
    // Extract error code from message if present
    let errorCode = 'AUDIO_PROCESSING_ERROR';
    let hint = 'Please try again or contact support if the problem persists.';
    
    if (errorMessage.includes('EMPTY_TRANSCRIPTION') || errorMessage.includes('empty')) {
      errorCode = 'EMPTY_TRANSCRIPTION';
      hint = 'The audio file might be corrupted, format not supported, or content too short. Please check the audio file.';
    } else if (errorMessage.includes('UNSUPPORTED_AUDIO_FORMAT') || errorMessage.includes('Invalid audio format')) {
      errorCode = 'UNSUPPORTED_AUDIO_FORMAT';
      hint = 'Supported formats: MP3, WAV, WebM, M4A. Please convert your audio file to one of these formats.';
    } else if (errorMessage.includes('transcribe') || errorMessage.includes('Transcribe')) {
      errorCode = 'TRANSCRIPTION_ERROR';
      hint = 'Failed to transcribe audio. Please ensure the audio file is not corrupted and contains clear speech.';
    } else if (errorMessage.includes('AUDIO_TOO_LONG') || errorMessage.includes('duration')) {
      errorCode = 'AUDIO_TOO_LONG';
      hint = 'Audio duration exceeds the limit for your plan. Please split the audio into shorter segments or upgrade to Pro.';
    }
    
    return NextResponse.json(
      { 
        error: errorCode,
        message: errorMessage,
        hint,
      },
      { status: 500 }
    );
  }
}

