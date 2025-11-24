import { NextResponse } from "next/server";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";
import { generateStructuredContent, generateWithRetry } from "@/lib/noteGeneration";

// For now, we'll use a dummy transcript approach
// In production, you would integrate with YouTube API, Bilibili API, etc.
async function getVideoTranscript(url: string): Promise<string> {
  // TODO: Implement actual video transcript extraction
  // For now, return a placeholder that simulates video content
  // This should be replaced with actual video platform APIs
  
  // Simulate video content based on URL
  const dummyTranscript = `This is a placeholder transcript for the video at ${url}. 

In a real implementation, this would:
1. Extract video metadata (title, description)
2. Fetch available transcripts/captions from the platform
3. Use speech-to-text if transcripts are not available
4. Return the full transcript text

For now, this serves as a demonstration of the video processing flow. The actual implementation would require:
- YouTube Data API v3 for YouTube videos
- Bilibili API for Bilibili videos  
- TikTok API for TikTok videos
- Or web scraping with proper permissions

Key concepts covered in this video:
- Introduction to the topic
- Main concepts and explanations
- Examples and applications
- Summary and conclusions

This transcript would be used to generate structured notes, quizzes, and flashcards.`;

  return dummyTranscript;
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'No video URL provided' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
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
          message: "You have reached your monthly limit for video processing on the free plan.",
          plan,
          scope: "video",
          limit: limits.maxVideoSessionsPerMonth,
        },
        { status: 429 }
      );
    }

    // Get video transcript (placeholder for now)
    const transcript = await getVideoTranscript(url);

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Failed to extract video transcript or video is empty' },
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
      () => generateStructuredContent(transcript, plan, "video"),
      3,
      1000
    );

    // Create new session
    const newSession = await createSession({
      type: "video",
      title: structuredContent.title || `Video: ${url.substring(0, 50)}`,
      contentHash,
      notes: structuredContent.notes,
      quizzes: structuredContent.quizzes,
      flashcards: structuredContent.flashcards,
      summaryForChat: structuredContent.summaryForChat,
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

    // Provide specific error messages
    let errorMessage = 'Failed to process video';
    let statusCode = 500;

    if (error.message?.includes('Invalid URL')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message?.includes('Rate limit')) {
      errorMessage = error.message;
      statusCode = 429;
    } else if (error.message?.includes('empty')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message?.includes('transcript')) {
      errorMessage = 'Failed to extract video transcript. Please ensure the URL is valid and the video is accessible.';
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

