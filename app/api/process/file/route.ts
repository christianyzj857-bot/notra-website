import { NextResponse } from "next/server";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";
import { generateStructuredContent, generateWithRetry } from "@/lib/noteGeneration";

// Extract text from different file types
async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    try {
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = (pdfParseModule as any).default || pdfParseModule;
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error('Failed to parse PDF file');
    }
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
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
  } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    return buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type');
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

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'File is empty or contains no readable text' },
        { status: 400 }
      );
    }

    // Generate content hash for deduplication
    const contentHash = generateContentHash(text);

    // Check if we already have this content
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

    // Generate structured content using LLM with retry mechanism
    const structuredContent = await generateWithRetry(
      () => generateStructuredContent(text, plan, "file"),
      3,
      1000
    );

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

    // Provide specific error messages
    let errorMessage = 'Failed to process file';
    let statusCode = 500;

    if (error.message?.includes('Unsupported file type')) {
      errorMessage = 'Unsupported file type. Please upload PDF, Word, or text files.';
      statusCode = 400;
    } else if (error.message?.includes('parse')) {
      errorMessage = 'Failed to read file content. The file may be corrupted or password-protected.';
      statusCode = 400;
    } else if (error.message?.includes('Rate limit')) {
      errorMessage = error.message;
      statusCode = 429;
    } else if (error.message?.includes('empty')) {
      errorMessage = error.message;
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

