import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { createSession, generateContentHash, findSessionByHash } from "@/lib/db";
import { NotraSession } from "@/types/notra";
import { createReadStream } from "fs";

// 使用 Node.js Runtime 处理音频
export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No audio file uploaded" }, { status: 400 });
    }

    // Check for API key
    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        error: "MISSING_API_KEY",
        message: "OpenAI API key is not configured"
      }, { status: 500 });
    }

    // Validate file type
    const validAudioTypes = [
      "audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a",
      "audio/webm", "audio/ogg", "audio/flac", "audio/aac"
    ];

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const validExtensions = ["mp3", "wav", "m4a", "webm", "ogg", "flac", "aac"];

    if (!validAudioTypes.includes(file.type) && !validExtensions.includes(fileExtension || "")) {
      return NextResponse.json({
        error: "INVALID_AUDIO_TYPE",
        message: `Invalid audio file type. Supported formats: MP3, WAV, M4A, WebM, OGG, FLAC, AAC`
      }, { status: 400 });
    }

    // Convert File to Buffer and save to temp file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempFilePath = path.join("/tmp", `audio-${Date.now()}-${file.name}`);
    await writeFile(tempFilePath, buffer);

    // Get user plan and model from request
    const userPlan = formData.get("userPlan") as string || "free";
    const selectedModel = formData.get("model") as string || "gpt-4o-mini";

    // Initialize OpenAI
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    try {
      // Transcribe audio using Whisper
      console.log("Transcribing audio file:", file.name);
      const transcription = await openai.audio.transcriptions.create({
        file: createReadStream(tempFilePath) as any,
        model: "whisper-1",
        language: "en", // Can be made dynamic based on user preference
        response_format: "text",
      });

      const transcribedText = transcription.toString();

      if (!transcribedText || transcribedText.trim().length === 0) {
        return NextResponse.json({
          error: "TRANSCRIPTION_EMPTY",
          message: "Audio transcription resulted in empty content. Please ensure the audio file contains speech."
        }, { status: 400 });
      }

      console.log("Transcription successful, length:", transcribedText.length);

      // Check if content already processed (deduplication)
      const contentHash = generateContentHash(transcribedText);
      const existingSession = await findSessionByHash(contentHash);

      if (existingSession) {
        // Clean up temp file
        try {
          await import("fs").then(fs => fs.promises.unlink(tempFilePath));
        } catch {}

        return NextResponse.json({
          sessionId: existingSession.id,
          type: existingSession.type,
          title: existingSession.title,
          createdAt: existingSession.createdAt,
          cached: true
        });
      }

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

      const noteGenerationPrompt = `You are an expert academic note generator. Transform the following audio transcription into structured, comprehensive notes that match the quality of premium note-taking apps like Turbo AI.

Audio Transcription:
${transcribedText}

Requirements:
1. Create a "Lecture Summary" section (2-3 sentences summarizing the main topics covered)
2. Create a "Key Points" section (5-8 critical bullet points highlighting the most important information)
3. Create a "Main Topics" section organizing the content by topic
4. Create an "Action Items" section if any tasks or recommendations are mentioned
5. Highlight important terms, concepts, dates, and key information using **bold** markdown
6. Create logical sections based on the transcription content
7. For each section, provide clear headings and well-organized content
8. Generate quiz questions that test understanding of key concepts from the lecture
9. Generate flashcards for important terms and concepts mentioned${modelSpecificInstructions}

Visual Formatting Guidelines:
- Use **bold** for important concepts, key terms, and critical information
- For structured data, use tableSummary or summaryTable format
- Each section should have a clear heading
- Use bullet points for lists
- Keep content well-organized and easy to scan
- Add timestamps if mentioned in the transcription (e.g., "At 15:30, the speaker discussed...")

Output Format: JSON matching this exact structure:
{
  "title": "Lecture Title (extract from content or use 'Audio Lecture: [main topic]')",
  "summaryForChat": "Brief 2-3 sentence summary for chat context",
  "notes": [
    {
      "id": "section-1",
      "heading": "Lecture Summary",
      "content": "2-3 sentence overview of the lecture content",
      "bullets": []
    },
    {
      "id": "section-2",
      "heading": "Key Points",
      "content": "",
      "bullets": ["**Important point 1**", "**Important point 2**", "**Important point 3**"]
    },
    {
      "id": "section-3",
      "heading": "Main Topics",
      "content": "Organized content by topic",
      "bullets": ["**Topic 1**: Description", "**Topic 2**: Description"]
    },
    {
      "id": "section-4",
      "heading": "Action Items",
      "content": "",
      "bullets": ["Review slides 3-7", "Complete practice problems", "Prepare for next session"]
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
            content: "You are an expert academic note generator that creates structured, comprehensive notes from audio transcriptions. You always respond with valid JSON only."
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
        type: "audio",
        title: generatedContent.title || `Audio: ${file.name}`,
        contentHash,
        notes: generatedContent.notes || [],
        quizzes: generatedContent.quizzes || [],
        flashcards: generatedContent.flashcards || [],
        summaryForChat: generatedContent.summaryForChat || generatedContent.title || `Audio transcription from ${file.name}`,
      });

      // Clean up temp file
      try {
        await import("fs").then(fs => fs.promises.unlink(tempFilePath));
      } catch (unlinkError) {
        console.warn("Failed to delete temp audio file:", unlinkError);
      }

      return NextResponse.json({
        sessionId: session.id,
        type: session.type,
        title: session.title,
        createdAt: session.createdAt,
        cached: false
      });

    } catch (processingError: any) {
      // Clean up temp file on error
      try {
        await import("fs").then(fs => fs.promises.unlink(tempFilePath));
      } catch {}

      console.error("Audio processing error:", processingError);
      return NextResponse.json({
        error: "AUDIO_PROCESSING_ERROR",
        message: `Failed to process audio: ${processingError.message || "Unknown error"}. Please try again.`
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Audio upload error:", error);
    return NextResponse.json(
      { error: error.message || "Error processing audio file" },
      { status: 500 }
    );
  }
}
