import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, NoteSection, QuizItem, Flashcard } from "@/types/notra";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * Extract video metadata and generate a placeholder transcript
 *
 * In production, this should:
 * 1. Extract video metadata (title, description)
 * 2. Fetch available transcripts/captions from the platform (YouTube, Bilibili, etc.)
 * 3. Use speech-to-text (Whisper) if transcripts are not available
 * 4. Return the full transcript text
 *
 * For now, we return a placeholder to allow development to continue.
 */
async function getVideoTranscript(url: string): Promise<{ transcript: string; videoTitle?: string }> {
  // Extract video ID if it's a YouTube URL
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);

  let videoTitle: string | undefined;
  if (match) {
    const videoId = match[1];
    videoTitle = `YouTube Video ${videoId}`;
  }

  // TODO: In Phase 3.2, integrate real video transcript fetching:
  // - YouTube: Use YouTube Data API v3 or youtube-transcript library
  // - Bilibili: Use Bilibili API if available
  // - Other platforms: Download video and use Whisper API

  // For now, return a realistic placeholder transcript
  const placeholderTranscript = `This is a placeholder transcript for the video at ${url}.

Introduction:
Welcome to this educational video. Today we'll be covering important concepts that will help you understand the topic better.

Main Content:
The core principles we'll discuss include fundamental theories, practical applications, and real-world examples. Each concept builds upon the previous one, creating a comprehensive understanding of the subject matter.

Key Concepts:
First, let's explore the foundational elements. These basic building blocks are essential for grasping more advanced topics. Understanding these fundamentals will provide a solid base for further learning.

Examples and Applications:
Now let's look at some practical examples. These real-world scenarios demonstrate how the concepts we've discussed can be applied in everyday situations. This helps bridge the gap between theory and practice.

Advanced Topics:
As we dive deeper, we encounter more complex ideas. These advanced concepts require careful consideration and often build upon multiple foundational principles simultaneously.

Summary and Conclusions:
To summarize, we've covered the fundamental concepts, explored practical applications, and examined advanced topics. This comprehensive overview provides a solid foundation for continued learning and practical application.

Thank you for watching this educational content. Remember to review the key points and practice applying these concepts in your own work.`;

  return {
    transcript: placeholderTranscript,
    videoTitle,
  };
}

/**
 * Generate structured learning content from video transcript
 * Uses OpenAI to create notes, quizzes, and flashcards
 */
async function generateStructuredContent(
  transcript: string,
  url: string,
  videoTitle?: string
): Promise<{
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

  // Truncate text to save tokens (keep first 8000 characters)
  const truncatedText = transcript.substring(0, 8000);

  const prompt = `You are an AI learning assistant. Analyze the following video transcript and generate structured study materials.

Video URL: ${url}
${videoTitle ? `Video Title: ${videoTitle}` : ''}

Transcript:
${truncatedText}

Please return a JSON object with the following structure:
{
  "title": "A concise title for this video content",
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

Generate 4-6 note sections, 3-5 quiz questions, and 4-6 flashcards. Make sure all content is educational and accurate.`;

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

    // Validate and structure the response
    return {
      title: parsed.title || videoTitle || "Video Lecture",
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
      summaryForChat: parsed.summaryForChat || "Educational video content covering key concepts and topics.",
    };
  } catch (error: any) {
    console.error('LLM generation error:', error);
    throw new Error('Failed to generate structured content');
  }
}

/**
 * POST /api/process/video
 *
 * Processes a video URL and generates structured learning materials
 *
 * Request body:
 * {
 *   "url": "https://youtube.com/watch?v=..."
 * }
 *
 * Response:
 * {
 *   "sessionId": "session-xxx",
 *   "type": "video",
 *   "title": "Video Title",
 *   "createdAt": "2024-01-01T00:00:00.000Z"
 * }
 */
export async function POST(req: Request) {
  try {
    // 1. Parse and validate request
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'No video URL provided' },
        { status: 400 }
      );
    }

    // 2. Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 3. Check usage limits
    const plan = getCurrentUserPlan();
    const limits = USAGE_LIMITS[plan];
    const monthKey = getMonthKey();
    const used = await getUsage("video", monthKey);

    if (used >= limits.maxVideoSessionsPerMonth) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: "You have reached your monthly limit for video processing.",
          plan,
          scope: "video",
          limit: limits.maxVideoSessionsPerMonth,
        },
        { status: 429 }
      );
    }

    // 4. Get video transcript (placeholder for now)
    const { transcript, videoTitle } = await getVideoTranscript(url);

    // 5. Generate content hash for deduplication
    const contentHash = generateContentHash(transcript);

    // Check if we already have this content
    const existingSession = await findSessionByHash(contentHash);
    if (existingSession) {
      return NextResponse.json({
        sessionId: existingSession.id,
        type: existingSession.type,
        title: existingSession.title,
        createdAt: existingSession.createdAt,
      });
    }

    // 6. Generate structured learning content using LLM
    const structuredContent = await generateStructuredContent(transcript, url, videoTitle);

    // 7. Create new session
    const newSession = await createSession({
      type: "video",
      title: structuredContent.title || videoTitle || `Video: ${url.substring(0, 50)}`,
      contentHash,
      notes: structuredContent.notes,
      quizzes: structuredContent.quizzes,
      flashcards: structuredContent.flashcards,
      summaryForChat: structuredContent.summaryForChat,
    });

    // 8. Increment usage count after successful processing
    await incrementUsage("video", monthKey, 1);

    // 9. Return success response
    return NextResponse.json({
      sessionId: newSession.id,
      type: newSession.type,
      title: newSession.title,
      createdAt: newSession.createdAt,
    });
  } catch (error: any) {
    console.error('Video processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Error processing video' },
      { status: 500 }
    );
  }
}

