import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, NoteSection, QuizItem, Flashcard } from "@/types/notra";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";
import { getVideoTranscript } from '@/lib/videoTranscripts';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = "gpt-4o-mini";

// Generate structured content (same as file/audio processing)
async function generateStructuredContent(text: string, videoUrl: string): Promise<{
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

  const prompt = `You are an AI learning assistant. Analyze the following video transcript/content and generate structured study materials.

Video URL: ${videoUrl}
Content:
${truncatedText}

Please return a JSON object with the following structure:
{
  "title": "A concise title for this video",
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

Generate 4-6 note sections, 3-5 quiz questions, and 4-6 flashcards. Focus on key moments and important takeaways from the video.`;

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
      title: parsed.title || "Video Content",
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
      summaryForChat: parsed.summaryForChat || "Video content covering key concepts and important moments.",
    };
  } catch (error: any) {
    console.error('LLM generation error:', error);
    throw new Error('Failed to generate structured content');
  }
}

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

    // Generate structured content
    const structuredContent = await generateStructuredContent(transcript, url);

    // Create new session
    const newSession = await createSession({
      type: "video",
      title: structuredContent.title || videoTitle || `Video: ${url.substring(0, 50)}`,
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
    return NextResponse.json(
      { error: error.message || 'Failed to process video' },
      { status: 500 }
    );
  }
}

