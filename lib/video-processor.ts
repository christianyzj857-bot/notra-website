/**
 * Video processing utilities
 * Handles video audio extraction, transcoding, and transcription fallback
 */

import ytdl from 'ytdl-core';
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

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Extract audio from YouTube video using ytdl-core
 * Returns path to extracted audio file
 */
export async function extractYouTubeAudio(videoUrl: string): Promise<string> {
  if (!ytdl.validateURL(videoUrl)) {
    throw new Error('Invalid YouTube URL');
  }

  const videoInfo = await ytdl.getInfo(videoUrl);
  const audioPath = join(tmpdir(), `youtube-audio-${Date.now()}.mp3`);

  return new Promise((resolve, reject) => {
    const audioStream = ytdl(videoUrl, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    const writeStream = require('fs').createWriteStream(audioPath);
    
    audioStream.pipe(writeStream);
    
    audioStream.on('error', (err: Error) => {
      reject(new Error(`Failed to extract audio: ${err.message}`));
    });
    
    writeStream.on('finish', () => {
      resolve(audioPath);
    });
    
    writeStream.on('error', (err: Error) => {
      reject(new Error(`Failed to save audio: ${err.message}`));
    });
  });
}

/**
 * Transcribe audio file using Whisper API
 */
export async function transcribeAudioFile(audioPath: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const buffer = await readFile(audioPath);
  const fileName = audioPath.split('/').pop() || 'audio.mp3';
  const file = new File([buffer], fileName, { type: 'audio/mpeg' });

  const transcription = await openai.audio.transcriptions.create({
    file: file as any,
    model: 'whisper-1',
    language: undefined, // Auto-detect
    prompt: 'This is an educational video lecture or presentation. Please transcribe accurately with proper punctuation, capitalization, and sentence structure.',
    temperature: 0,
  });

  const transcriptText = typeof transcription === 'string'
    ? transcription
    : (transcription as any).text || '';

  return transcriptText.trim();
}

/**
 * Fallback: Extract audio from YouTube video and transcribe with Whisper
 * This is used when official subtitles are not available
 */
export async function transcribeYouTubeVideoFallback(videoUrl: string): Promise<string> {
  let audioPath: string | null = null;
  
  try {
    console.log('[VideoProcessor] Extracting audio from YouTube video...');
    audioPath = await extractYouTubeAudio(videoUrl);
    
    console.log('[VideoProcessor] Transcribing audio with Whisper...');
    const transcript = await transcribeAudioFile(audioPath);
    
    // Cleanup
    if (audioPath) {
      await unlink(audioPath).catch(() => {});
    }
    
    return transcript;
  } catch (error: any) {
    // Cleanup on error
    if (audioPath) {
      await unlink(audioPath).catch(() => {});
    }
    throw new Error(`Failed to transcribe video audio: ${error.message || 'Unknown error'}`);
  }
}

