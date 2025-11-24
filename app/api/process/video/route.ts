import { NextResponse } from "next/server";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, VideoSource } from "@/types/notra";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";
import { getVideoTranscript } from '@/lib/videoTranscripts';
import { detectVideoPlatform, extractVideoId } from '@/lib/videoPlatforms';
import { generateLearningAsset } from "@/lib/learning-asset-generator";

// Use Node.js runtime for database operations
export const runtime = "nodejs";

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
    console.log('Processing video URL:', url, 'Hostname:', validatedUrl.hostname);

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

    // Get video transcript from platform API
    let videoData;
    try {
      videoData = await getVideoTranscript(url);
    } catch (error: any) {
      console.error('Video transcript error:', error);
      return NextResponse.json(
        { 
          error: 'TRANSCRIPT_ERROR',
          message: error.message || 'Failed to get video transcript. Please ensure the video has captions/subtitles enabled.'
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

    // Detect platform and extract video ID
    const platform = detectVideoPlatform(url);
    const videoId = extractVideoId(url, platform);
    
    // Generate structured content using unified generator (ONE LLM call)
    const structuredContent = await generateLearningAsset(transcript, {
      type: "video",
      metadata: {
        videoUrl: url,
        platform: platform === 'youtube' ? 'youtube' : 
                  platform === 'bilibili' ? 'bilibili' : 
                  platform === 'douyin' ? 'douyin' : 'other',
      }
    });

    // Prepare source information
    const source: VideoSource = {
      videoUrl: url,
      platform: platform === 'youtube' ? 'youtube' : 
                platform === 'bilibili' ? 'bilibili' : 
                platform === 'douyin' ? 'douyin' : 'other',
      videoId: videoId || undefined,
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
    console.error('Video processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process video' },
      { status: 500 }
    );
  }
}

