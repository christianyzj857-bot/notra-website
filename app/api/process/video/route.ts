import { NextResponse } from "next/server";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { VideoSource } from "@/types/notra";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";
import { getVideoTranscript } from '@/lib/videoTranscripts';
import { detectVideoPlatform, extractVideoId, type VideoPlatform } from '@/lib/videoPlatforms';
import { generateLearningAsset } from "@/lib/learning-asset-generator";
import { estimateTokens } from "@/lib/text-processor";

// Use Node.js runtime for database operations
export const runtime = "nodejs";

// Allowed video providers (from environment variable)
const ALLOWED_VIDEO_PROVIDERS = (process.env.ALLOWED_VIDEO_PROVIDERS || 'YouTube,Bilibili,Douyin')
  .split(',')
  .map(p => p.trim().toLowerCase());

// Note: generateStructuredContent has been moved to lib/learning-asset-generator.ts
// This file now uses the unified generator function

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        error: 'NO_URL_PROVIDED',
        message: 'No video URL provided. Please provide a YouTube or Bilibili video URL.'
      }, { status: 400 });
    }

    // Clean and normalize URL
    url = url.trim();
    
    // Add https:// if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Validate URL format
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);
    } catch (error: any) {
      console.error('URL validation error:', error, 'URL:', url);
      return NextResponse.json({ 
        error: 'INVALID_URL_FORMAT',
        message: `Invalid URL format. Please provide a valid YouTube or Bilibili video URL. Examples:
- YouTube: https://www.youtube.com/watch?v=VIDEO_ID
- Bilibili: https://www.bilibili.com/video/BVxxxxx`
      }, { status: 400 });
    }
    
    // Log URL for debugging
    console.log('[Video API] Processing video URL:', url, 'Hostname:', validatedUrl.hostname);

    // Detect platform and validate
    const platform = detectVideoPlatform(url);
    const videoId = extractVideoId(url, platform);
    
    if (platform === 'unknown') {
      return NextResponse.json(
        {
          error: 'UNSUPPORTED_PLATFORM',
          message: `Unsupported video platform. Currently supported: ${ALLOWED_VIDEO_PROVIDERS.join(', ')}`,
          hint: 'Please provide a YouTube, Bilibili, or Douyin video URL.',
        },
        { status: 400 }
      );
    }
    
    // Check if platform is allowed
    const platformName = platform === 'youtube' ? 'youtube' : 
                         platform === 'bilibili' ? 'bilibili' : 
                         platform === 'douyin' ? 'douyin' : 'unknown';
    
    if (!ALLOWED_VIDEO_PROVIDERS.includes(platformName)) {
      return NextResponse.json(
        {
          error: 'PLATFORM_NOT_ALLOWED',
          message: `Video platform "${platformName}" is not currently enabled.`,
          hint: `Currently allowed platforms: ${ALLOWED_VIDEO_PROVIDERS.join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    if (!videoId) {
      return NextResponse.json(
        {
          error: 'INVALID_VIDEO_ID',
          message: `Unable to extract video ID from URL: ${url}`,
          hint: `Please ensure the URL is in a valid format:
- YouTube: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
- Bilibili: https://www.bilibili.com/video/BVxxxxx
- Douyin: https://www.douyin.com/video/VIDEO_ID`,
        },
        { status: 400 }
      );
    }

    // Check usage limits
    const plan = getCurrentUserPlan();
    const limits = USAGE_LIMITS[plan];
    const monthKey = getMonthKey();
    const used = await getUsage("video", monthKey);

    if (used >= limits.maxVideoSessionsPerMonth) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: `You have reached your monthly limit for video processing (${limits.maxVideoSessionsPerMonth} videos/month on ${plan} plan). Upgrade to Pro for unlimited video processing.`,
          plan,
          scope: "video",
          limit: limits.maxVideoSessionsPerMonth,
        },
        { status: 429 }
      );
    }

    // Get video transcript from platform API (with fallback to Whisper for YouTube)
    let videoData;
    try {
      console.log(`[Video API] Fetching transcript for ${platform}:${videoId}`);
      videoData = await getVideoTranscript(url);
      console.log(`[Video API] Transcript received, length: ${videoData.transcript.length}, estimated tokens: ${estimateTokens(videoData.transcript)}`);
    } catch (error: any) {
      console.error('[Video API] Video transcript error:', error);
      
      // Provide specific error messages
      let errorCode = 'TRANSCRIPT_ERROR';
      let hint = 'Please ensure the video has captions/subtitles enabled.';
      
      if (error.message && error.message.includes('Whisper')) {
        errorCode = 'TRANSCRIPTION_FALLBACK_FAILED';
        hint = 'Official subtitles unavailable and automatic transcription failed. Please ensure the video has captions/subtitles enabled, or try a different video.';
      } else if (error.message && error.message.includes('Bilibili')) {
        errorCode = 'BILIBILI_API_ERROR';
        hint = 'Bilibili API error. Please check if the video has subtitles or try a different video.';
      } else if (platform === 'douyin') {
        errorCode = 'DOUYIN_NOT_SUPPORTED';
        hint = 'Douyin video transcription is not yet fully supported. Please try a YouTube or Bilibili video.';
      }
      
      return NextResponse.json(
        { 
          error: errorCode,
          message: error.message || 'Failed to get video transcript.',
          hint,
        },
        { status: 500 }
      );
    }
    
    const transcript = videoData.transcript;
    const videoTitle = videoData.title;
    const videoDescription = videoData.description;
    
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
    console.log('[Video API] Starting learning asset generation, transcript length:', transcript.length);
    let structuredContent;
    try {
      structuredContent = await generateLearningAsset(transcript, {
        type: "video",
        metadata: {
          videoUrl: url,
          platform: platformName,
          videoId,
          title: videoTitle,
        }
      });
      console.log('[Video API] Learning asset generated successfully:', {
        title: structuredContent.title,
        notesCount: structuredContent.notes.length,
        quizzesCount: structuredContent.quizzes.length,
        flashcardsCount: structuredContent.flashcards.length,
      });
    } catch (genError: any) {
      console.error('[Video API] Learning asset generation failed:', genError);
      throw new Error(`Failed to generate learning assets: ${genError.message || 'Unknown error'}`);
    }

    // Prepare source information
    const source: VideoSource = {
      videoUrl: url,
      platform: platformName as 'youtube' | 'bilibili' | 'douyin' | 'other',
      videoId,
      title: videoTitle || undefined,
    };

    // Create new session with source information
    const newSession = await createSession({
      type: "video",
      title: structuredContent.title || videoTitle || `Video: ${url.substring(0, 50)}`,
      contentHash,
      notes: structuredContent.notes,
      quizzes: structuredContent.quizzes,
      flashcards: structuredContent.flashcards,
      summaryForChat: structuredContent.summaryForChat,
      source,
    });

    // Increment usage count after successful processing
    await incrementUsage("video", monthKey, 1);

    return NextResponse.json({
      sessionId: newSession.id,
      type: newSession.type,
      title: newSession.title,
      createdAt: newSession.createdAt,
    });
  } catch (error: any) {
    console.error('[Video API] Processing error:', error);
    const errorMessage = error.message || 'Failed to process video';
    
    // Provide specific error codes with hints
    let errorCode = 'VIDEO_PROCESSING_ERROR';
    let hint = 'Please try again or contact support if the problem persists.';
    
    if (errorMessage.includes('transcript') || errorMessage.includes('Transcript')) {
      errorCode = 'TRANSCRIPT_ERROR';
      hint = 'Failed to get video transcript. Please ensure the video has captions/subtitles enabled.';
    } else if (errorMessage.includes('platform') || errorMessage.includes('Platform')) {
      errorCode = 'UNSUPPORTED_PLATFORM';
      hint = 'Unsupported video platform. Currently supported: YouTube, Bilibili, Douyin.';
    } else if (errorMessage.includes('video ID') || errorMessage.includes('videoId')) {
      errorCode = 'INVALID_VIDEO_ID';
      hint = 'Unable to extract video ID from URL. Please check the URL format.';
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

