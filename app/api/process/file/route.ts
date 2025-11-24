import { NextResponse } from "next/server";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, FileSource } from "@/types/notra";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";
import { generateLearningAsset } from "@/lib/learning-asset-generator";

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
  } else if (fileName.endsWith('.docx')) {
    try {
      const mammothModule = await import("mammoth");
      const mammoth = (mammothModule as any).default || mammothModule;
      // Convert Buffer to ArrayBuffer correctly
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (!result || !result.value) {
        throw new Error('No text extracted from Word document');
      }
      return result.value;
    } catch (error: any) {
      console.error('Word parsing error:', error);
      throw new Error(`Failed to parse Word document: ${error.message || 'Unknown error'}`);
    }
  } else if (fileName.endsWith('.doc')) {
    // .doc files (old format) are not supported by mammoth
    throw new Error('Old Word format (.doc) is not supported. Please convert to .docx or PDF format.');
  } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    return buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type');
  }
}

// Note: generateStructuredContent has been moved to lib/learning-asset-generator.ts
// This file now uses the unified generator function

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

    // Generate structured content using unified generator (ONE LLM call)
    const structuredContent = await generateLearningAsset(text, {
      type: "file",
      metadata: {
        fileName: file.name,
      }
    });

    // Prepare source information
    const source: FileSource = {
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    };

    // Create new session with source information
    const newSession = await createSession({
      type: "file",
      title: structuredContent.title || file.name,
      contentHash,
      notes: structuredContent.notes,
      quizzes: structuredContent.quizzes,
      flashcards: structuredContent.flashcards,
      summaryForChat: structuredContent.summaryForChat,
      source,
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
    const errorMessage = error.message || 'Failed to process file';
    
    // Provide specific error codes for different error types
    let errorCode = 'PROCESSING_ERROR';
    if (errorMessage.includes('parse') || errorMessage.includes('Parse')) {
      if (errorMessage.includes('Word') || errorMessage.includes('word')) {
        errorCode = 'WORD_PARSE_ERROR';
      } else if (errorMessage.includes('PDF') || errorMessage.includes('pdf')) {
        errorCode = 'PDF_PARSE_ERROR';
      } else {
        errorCode = 'PARSE_ERROR';
      }
    } else if (errorMessage.includes('Unsupported') || errorMessage.includes('unsupported')) {
      errorCode = 'UNSUPPORTED_FILE_TYPE';
    }
    
    return NextResponse.json(
      { 
        error: errorCode,
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

