/**
 * Audio processing utilities
 * Handles audio chunking, transcoding, and transcription
 */

import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import OpenAI from 'openai';

// Set ffmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const TRANSCRIBE_CHUNK_SEC = parseInt(process.env.TRANSCRIBE_CHUNK_SEC || '90', 10);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Get audio duration in seconds using ffmpeg
 */
export async function getAudioDuration(audioPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        reject(new Error(`Failed to get audio duration: ${err.message}`));
        return;
      }
      const duration = metadata.format?.duration || 0;
      resolve(Math.ceil(duration));
    });
  });
}

/**
 * Chunk audio file into smaller segments for parallel transcription
 */
export async function chunkAudio(
  audioPath: string,
  chunkDurationSeconds: number = TRANSCRIBE_CHUNK_SEC
): Promise<string[]> {
  const duration = await getAudioDuration(audioPath);
  
  if (duration <= chunkDurationSeconds) {
    // No need to chunk
    return [audioPath];
  }

  const chunks: string[] = [];
  const numChunks = Math.ceil(duration / chunkDurationSeconds);

  for (let i = 0; i < numChunks; i++) {
    const startTime = i * chunkDurationSeconds;
    const chunkPath = join(tmpdir(), `audio-chunk-${Date.now()}-${i}.mp3`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(audioPath)
        .setStartTime(startTime)
        .setDuration(chunkDurationSeconds)
        .output(chunkPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    chunks.push(chunkPath);
  }

  return chunks;
}

/**
 * Transcribe audio chunk using Whisper API
 */
export async function transcribeChunk(chunkPath: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const buffer = await readFile(chunkPath);
  const fileName = chunkPath.split('/').pop() || 'chunk.mp3';
  const file = new File([buffer], fileName, { type: 'audio/mpeg' });

  const transcription = await openai.audio.transcriptions.create({
    file: file as any,
    model: 'whisper-1',
    language: undefined, // Auto-detect
    prompt: 'This is an educational lecture, presentation, or academic audio content. Please transcribe accurately with proper punctuation, capitalization, and sentence structure.',
    temperature: 0,
  });

  const transcriptText = typeof transcription === 'string'
    ? transcription
    : (transcription as any).text || '';

  return transcriptText.trim();
}

/**
 * Transcribe audio file with chunking support for long files
 */
export async function transcribeAudioWithChunking(
  audioPath: string,
  onProgress?: (stage: 'chunking' | 'transcribing', progress: number) => void
): Promise<string> {
  const duration = await getAudioDuration(audioPath);
  const needsChunking = duration > TRANSCRIBE_CHUNK_SEC;

  if (!needsChunking) {
    // Simple transcription
    onProgress?.('transcribing', 0.5);
    const transcript = await transcribeChunk(audioPath);
    onProgress?.('transcribing', 1.0);
    return transcript;
  }

  // Chunk and transcribe in parallel
  onProgress?.('chunking', 0);
  const chunks = await chunkAudio(audioPath);
  onProgress?.('chunking', 1.0);

  onProgress?.('transcribing', 0);
  const transcriptPromises = chunks.map((chunk, index) => {
    return transcribeChunk(chunk).then((text) => {
      onProgress?.('transcribing', (index + 1) / chunks.length);
      return text;
    });
  });

  const transcripts = await Promise.all(transcriptPromises);

  // Cleanup chunk files
  await Promise.all(chunks.map(chunk => unlink(chunk).catch(() => {})));

  // Combine transcripts with proper spacing
  return transcripts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Clean transcript text
 */
export function cleanTranscript(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Fix common transcription issues
  cleaned = cleaned.replace(/\b(um|uh|er|ah)\b/gi, ''); // Remove filler words
  cleaned = cleaned.replace(/\s+/g, ' '); // Normalize spaces again
  
  // Ensure proper sentence endings
  cleaned = cleaned.replace(/([.!?])\s*([A-Z])/g, '$1 $2');
  
  return cleaned.trim();
}

/**
 * Check audio bitrate and validate format
 */
export async function validateAudioFormat(audioPath: string): Promise<{
  isValid: boolean;
  bitrate?: number;
  format?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        resolve({ isValid: false, error: err.message });
        return;
      }

      const bitrate = metadata.format?.bit_rate ? metadata.format.bit_rate / 1000 : undefined; // kbps
      const format = metadata.format?.format_name;

      // Basic validation: check if it's a valid audio format
      const isValid = !!format && (format.includes('mp3') || format.includes('wav') || format.includes('m4a') || format.includes('webm'));

      resolve({ isValid, bitrate, format });
    });
  });
}

