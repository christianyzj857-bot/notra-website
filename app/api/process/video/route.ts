import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, NoteSection, QuizItem, Flashcard } from "@/types/notra";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = "gpt-4o-mini";

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

    // Get video transcript (placeholder for now)
    const transcript = await getVideoTranscript(url);
    
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
      title: structuredContent.title || `Video: ${url.substring(0, 50)}`,
      contentHash,
      notes: structuredContent.notes,
      quizzes: structuredContent.quizzes,
      flashcards: structuredContent.flashcards,
      summaryForChat: structuredContent.summaryForChat,
    });

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

