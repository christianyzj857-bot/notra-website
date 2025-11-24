import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, NoteSection, QuizItem, Flashcard } from "@/types/notra";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Model selection - use 4o-mini for cost efficiency
const DEFAULT_MODEL = "gpt-4o-mini";

// Extract text from different file types
async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.toLowerCase();

  // PDF
  if (fileName.endsWith('.pdf')) {
    try {
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = (pdfParseModule as any).default || pdfParseModule;
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error('Failed to parse PDF file');
    }
  }

  // Word
  else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    try {
      const mammothModule = await import("mammoth");
      const mammoth = (mammothModule as any).default || mammothModule;
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      throw new Error('Failed to parse Word document');
    }
  }

  // Excel
  else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      let text = '';

      // Iterate through all worksheets
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_csv(worksheet);
        text += `Sheet: ${sheetName}\n${sheetData}\n\n`;
      });

      return text;
    } catch (error) {
      throw new Error('Failed to parse Excel file. Please ensure the file is not corrupted.');
    }
  }

  // CSV
  else if (fileName.endsWith('.csv')) {
    return buffer.toString('utf-8');
  }

  // PowerPoint (not yet supported, return friendly message)
  else if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
    throw new Error('PowerPoint files are not yet supported. Please convert to PDF or export as text first.');
  }

  // Text files
  else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json')) {
    return buffer.toString('utf-8');
  }

  // Code files
  else if (['.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.html', '.css', '.xml', '.yaml', '.yml', '.sh', '.bat', '.ps1'].some(ext => fileName.endsWith(ext))) {
    return buffer.toString('utf-8');
  }

  // Unsupported formats (ChatGPT also doesn't support these)
  else if (['.zip', '.rar', '.7z', '.tar', '.gz', '.exe', '.dll', '.bin', '.iso', '.dmg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp3', '.wav', '.m4a', '.flac', '.mp4', '.avi', '.mov', '.mkv'].some(ext => fileName.endsWith(ext))) {
    const fileType = fileName.split('.').pop()?.toUpperCase();
    if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].some(ext => fileName.endsWith(ext))) {
      throw new Error(`Image files (${fileType}) are not supported. Please convert to PDF or use OCR tools first.`);
    } else if (['.mp3', '.wav', '.m4a', '.flac'].some(ext => fileName.endsWith(ext))) {
      throw new Error(`Audio files (${fileType}) should be uploaded using the Audio Upload feature, not file upload.`);
    } else if (['.mp4', '.avi', '.mov', '.mkv'].some(ext => fileName.endsWith(ext))) {
      throw new Error(`Video files (${fileType}) should be processed using the Video Link feature, not file upload.`);
    } else {
      throw new Error(`File type ${fileType} is not supported. Supported types: PDF, Word, Excel, CSV, Text, Code files.`);
    }
  }

  else {
    throw new Error(`Unsupported file type: ${file.name}. Supported types: PDF, Word, Excel (.xlsx, .xls), CSV, Text (.txt, .md), Code files (.js, .ts, .py, etc.).`);
  }
}

// Call LLM to generate structured content
async function generateStructuredContent(text: string): Promise<{
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
  const truncatedText = text.substring(0, 8000);

  const prompt = `You are an AI learning assistant. Analyze the following educational content and generate structured study materials.

Content:
${truncatedText}

Please return a JSON object with the following structure:
{
  "title": "A concise title for this content",
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
      title: parsed.title || "Untitled Document",
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
      summaryForChat: parsed.summaryForChat || "Educational content covering key concepts and topics.",
    };
  } catch (error: any) {
    console.error('LLM generation error:', error);
    throw new Error('Failed to generate structured content');
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check usage limits
    const plan = getCurrentUserPlan();
    const limits = USAGE_LIMITS[plan];
    const monthKey = getMonthKey();
    const used = await getUsage("file", monthKey);

    if (used >= limits.maxFileSessionsPerMonth) {
      return NextResponse.json(
        {
          error: "limit_reached",
          message: "You have reached your monthly limit for file uploads on the free plan.",
          plan,
          scope: "file",
          limit: limits.maxFileSessionsPerMonth,
        },
        { status: 429 }
      );
    }

    // Extract text from file
    const text = await extractTextFromFile(file);
    
    // Generate content hash for deduplication
    const contentHash = generateContentHash(text);

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

    // Generate structured content using LLM
    const structuredContent = await generateStructuredContent(text);

    // Create new session
    const newSession = await createSession({
      type: "file",
      title: structuredContent.title || file.name,
      contentHash,
      notes: structuredContent.notes,
      quizzes: structuredContent.quizzes,
      flashcards: structuredContent.flashcards,
      summaryForChat: structuredContent.summaryForChat,
    });

    // Increment usage count after successful processing
    await incrementUsage("file", monthKey, 1);

    return NextResponse.json({
      sessionId: newSession.id,
      type: newSession.type,
      title: newSession.title,
      createdAt: newSession.createdAt,
    });
  } catch (error: any) {
    console.error('File processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process file' },
      { status: 500 }
    );
  }
}

