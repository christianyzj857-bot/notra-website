import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSession, generateContentHash, findSessionByHash } from "@/lib/db";
import { NotraSession } from "@/types/notra";

// 使用 Node.js Runtime 处理视频
export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper function to extract video ID from YouTube URL
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Helper function to extract Bilibili video ID
function extractBilibiliVideoId(url: string): string | null {
  const patterns = [
    /bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/,
    /bilibili\.com\/video\/(av\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoUrl, userPlan = "free", model: selectedModel = "gpt-4o-mini" } = body;

    if (!videoUrl || typeof videoUrl !== "string") {
      return NextResponse.json({
        error: "MISSING_VIDEO_URL",
        message: "Video URL is required"
      }, { status: 400 });
    }

    // Check for API key
    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        error: "MISSING_API_KEY",
        message: "OpenAI API key is not configured"
      }, { status: 500 });
    }

    // Validate URL format
    let videoId: string | null = null;
    let platform: "youtube" | "bilibili" | "other" = "other";

    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      videoId = extractYouTubeVideoId(videoUrl);
      platform = "youtube";
    } else if (videoUrl.includes("bilibili.com")) {
      videoId = extractBilibiliVideoId(videoUrl);
      platform = "bilibili";
    }

    if (!videoId && (platform === "youtube" || platform === "bilibili")) {
      return NextResponse.json({
        error: "INVALID_VIDEO_URL",
        message: "Could not extract video ID from URL. Please check the URL format."
      }, { status: 400 });
    }

    // For this MVP, we'll return instructions for manual transcript input
    // In production, this would integrate with YouTube API, Bilibili API, or video download + Whisper

    // NOTE: For production, you would implement one of these approaches:
    // 1. YouTube Data API + Transcript API
    // 2. External transcript service (e.g., AssemblyAI, Rev.ai)
    // 3. Download video + extract audio + Whisper transcription

    // For now, we'll create a placeholder session that prompts the user
    // In a real implementation, you'd fetch the actual transcript here

    // Temporary placeholder - In production, replace with actual transcript extraction
    const placeholderTranscript = `
[This is a placeholder for video transcript extraction]

For production implementation, integrate one of these solutions:

1. YouTube Videos:
   - Use YouTube Data API v3 to get video metadata
   - Use youtube-transcript-api or similar library to fetch captions
   - Parse and format the transcript

2. Bilibili Videos:
   - Use Bilibili API to get video info
   - Extract subtitle files if available
   - Parse and format the transcript

3. General Videos:
   - Download video using yt-dlp or similar
   - Extract audio using ffmpeg
   - Transcribe using OpenAI Whisper

Video URL: ${videoUrl}
Video ID: ${videoId || "unknown"}
Platform: ${platform}

TODO: Implement actual transcript extraction before deploying to production.
For testing purposes, you can manually provide a transcript or use sample data.
`;

    // For MVP, we'll return an error asking users to use audio upload instead
    return NextResponse.json({
      error: "VIDEO_PROCESSING_NOT_AVAILABLE",
      message: "Video processing is currently under development. Please use the audio upload feature instead, or download the video's audio and upload it as an MP3/WAV file. We're working on direct video URL support!",
      details: {
        platform,
        videoId,
        suggestion: "Download the video's audio track and use the Audio Upload feature for now."
      }
    }, { status: 501 }); // 501 Not Implemented

    // ========== PRODUCTION CODE (uncomment when transcript extraction is implemented) ==========
    /*
    // Fetch transcript (implement based on platform)
    let transcript = "";

    if (platform === "youtube") {
      // TODO: Implement YouTube transcript fetching
      // Example using youtube-transcript-api:
      // const { YoutubeTranscript } = await import('youtube-transcript');
      // const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      // transcript = transcriptData.map(t => t.text).join(' ');
    } else if (platform === "bilibili") {
      // TODO: Implement Bilibili transcript fetching
    } else {
      // TODO: Implement generic video download + transcription
    }

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({
        error: "TRANSCRIPT_NOT_AVAILABLE",
        message: "Could not extract transcript from video. The video may not have captions available."
      }, { status: 400 });
    }

    // Check if content already processed (deduplication)
    const contentHash = generateContentHash(transcript);
    const existingSession = await findSessionByHash(contentHash);

    if (existingSession) {
      return NextResponse.json({
        sessionId: existingSession.id,
        type: existingSession.type,
        title: existingSession.title,
        createdAt: existingSession.createdAt,
        cached: true
      });
    }

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Map model selection
    const MODEL_MAP: Record<string, string> = {
      "gpt-4o-mini": "gpt-4o-mini",
      "gpt-4o": "gpt-4o",
      "gpt-5.1": "gpt-4o", // Placeholder until GPT-5.1 is available
    };

    const modelToUse = MODEL_MAP[selectedModel] || "gpt-4o-mini";

    // Model-specific prompt enhancements
    let modelSpecificInstructions = "";
    if (selectedModel === "gpt-4o-mini") {
      modelSpecificInstructions = "\n\nIMPORTANT: Keep responses concise and focused on essential information. Aim for 500-800 words total. Generate 5 quiz questions and 8 flashcards.";
    } else if (selectedModel === "gpt-4o") {
      modelSpecificInstructions = "\n\nIMPORTANT: Provide detailed explanations and comprehensive coverage. Aim for 1000-1500 words total. Include rich bullet points with explanations. Generate 7 quiz questions and 12 flashcards.";
    } else if (selectedModel === "gpt-5.1") {
      modelSpecificInstructions = "\n\nIMPORTANT: Provide in-depth analysis, cross-references, and additional insights. Aim for 1500-2500 words total. Include comprehensive detail in all sections. Generate 10 quiz questions and 15 flashcards. Add cross-references between sections where relevant.";
    }

    const noteGenerationPrompt = `You are an expert academic note generator. Transform the following video transcript into structured, comprehensive notes that match the quality of premium note-taking apps like Turbo AI.

Video Transcript:
${transcript}

Video URL: ${videoUrl}

Requirements:
1. Create a "Video Summary" section (2-3 sentences summarizing the main topics covered)
2. Create a "Key Moments" section (5-8 bullet points with timestamps if available)
3. Create a "Main Topics" section organizing the content by topic
4. Create a "Key Takeaways" section with actionable insights
5. Highlight important terms, concepts, dates, and key information using **bold** markdown
6. Create logical sections based on the video content
7. For each section, provide clear headings and well-organized content
8. Generate quiz questions that test understanding of key concepts from the video
9. Generate flashcards for important terms and concepts mentioned${modelSpecificInstructions}

Visual Formatting Guidelines:
- Use **bold** for important concepts, key terms, and critical information
- Include timestamps where mentioned (e.g., "At 5:30, the speaker explains...")
- For structured data, use tableSummary or summaryTable format
- Each section should have a clear heading
- Use bullet points for lists
- Keep content well-organized and easy to scan

Output Format: JSON matching this exact structure:
{
  "title": "Video Title (extract from content or use descriptive title)",
  "summaryForChat": "Brief 2-3 sentence summary for chat context",
  "notes": [
    {
      "id": "section-1",
      "heading": "Video Summary",
      "content": "2-3 sentence overview of the video content",
      "bullets": []
    },
    {
      "id": "section-2",
      "heading": "Key Moments",
      "content": "",
      "bullets": ["**0:00-2:30**: Introduction and overview", "**2:30-15:00**: Main content", "**15:00-20:00**: Examples"]
    },
    {
      "id": "section-3",
      "heading": "Main Topics",
      "content": "Organized content by topic",
      "bullets": ["**Topic 1**: Description", "**Topic 2**: Description"]
    },
    {
      "id": "section-4",
      "heading": "Key Takeaways",
      "content": "",
      "bullets": ["Important insight 1", "Important insight 2"]
    }
  ],
  "quizzes": [
    {
      "id": "quiz-1",
      "question": "Question text testing understanding",
      "options": [
        {"label": "A", "text": "Option A"},
        {"label": "B", "text": "Option B"},
        {"label": "C", "text": "Option C"},
        {"label": "D", "text": "Option D"}
      ],
      "correctIndex": 0,
      "explanation": "Clear explanation of why this answer is correct",
      "difficulty": "easy"
    }
  ],
  "flashcards": [
    {
      "id": "flashcard-1",
      "front": "Term or concept",
      "back": "Definition or explanation",
      "tag": "Category"
    }
  ]
}

CRITICAL: Return ONLY valid JSON. Do not include any markdown code blocks, explanations, or text outside the JSON structure.`;

    // Generate structured notes using OpenAI
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        {
          role: "system",
          content: "You are an expert academic note generator that creates structured, comprehensive notes from video transcripts. You always respond with valid JSON only."
        },
        {
          role: "user",
          content: noteGenerationPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: selectedModel === "gpt-4o-mini" ? 2000 : selectedModel === "gpt-4o" ? 3000 : 4000,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "";

    // Clean up response - remove markdown code blocks if present
    let jsonText = responseText;
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*\n/, "").replace(/\n```\s*$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*\n/, "").replace(/\n```\s*$/, "");
    }

    const generatedContent = JSON.parse(jsonText);

    // Create session in database
    const session = await createSession({
      type: "video",
      title: generatedContent.title || `Video: ${videoUrl.substring(0, 50)}...`,
      contentHash,
      notes: generatedContent.notes || [],
      quizzes: generatedContent.quizzes || [],
      flashcards: generatedContent.flashcards || [],
      summaryForChat: generatedContent.summaryForChat || generatedContent.title || `Video transcript from ${videoUrl}`,
    });

    return NextResponse.json({
      sessionId: session.id,
      type: session.type,
      title: session.title,
      createdAt: session.createdAt,
      cached: false
    });
    */

  } catch (error: any) {
    console.error("Video processing error:", error);
    return NextResponse.json(
      { error: error.message || "Error processing video URL" },
      { status: 500 }
    );
  }
}
