import { NextResponse } from "next/server";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, FileSource } from "@/types/notra";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { getUsage, incrementUsage, getMonthKey } from "@/lib/usage";
import { generateLearningAsset } from "@/lib/learning-asset-generator";
import { extractPDFText, extractDOCXText, extractTextContent, cleanExtractedText } from "@/lib/file-extractor";
import { estimateTokens } from "@/lib/text-processor";

// Use Node.js runtime for file system operations
export const runtime = "nodejs";

// File type whitelist
const ALLOWED_FILE_TYPES = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  txt: ['text/plain'],
  md: ['text/markdown', 'text/x-markdown'],
};

const MAX_FILE_MB = parseInt(process.env.MAX_FILE_MB || '25', 10);

/**
 * Extract text from different file types with proper cleaning
 */
async function extractTextFromFile(file: File): Promise<{ text: string; pageCount?: number; wordCount: number }> {
  const startTime = Date.now();
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.toLowerCase();
  const mimeType = file.type;

  let extractedText = '';
  let pageCount: number | undefined;

  try {
    if (fileName.endsWith('.pdf') || mimeType === ALLOWED_FILE_TYPES.pdf[0]) {
      extractedText = await extractPDFText(buffer);
      // Estimate page count (rough: 1 page ≈ 2000 characters)
      pageCount = Math.ceil(extractedText.length / 2000);
    } else if (fileName.endsWith('.docx') || mimeType === ALLOWED_FILE_TYPES.docx[0]) {
      extractedText = await extractDOCXText(buffer);
    } else if (fileName.endsWith('.doc')) {
      throw new Error('Old Word format (.doc) is not supported. Please convert to .docx or PDF format.');
    } else if (fileName.endsWith('.txt') || mimeType === ALLOWED_FILE_TYPES.txt[0]) {
      extractedText = await extractTextContent(buffer, false);
    } else if (fileName.endsWith('.md') || mimeType === ALLOWED_FILE_TYPES.md[0] || mimeType === ALLOWED_FILE_TYPES.md[1]) {
      extractedText = await extractTextContent(buffer, true);
    } else {
      throw new Error(`Unsupported file type: ${mimeType || 'unknown'}. Supported types: PDF, DOCX, TXT, MD`);
    }

    // Clean extracted text
    const cleanedText = cleanExtractedText(extractedText);
    const wordCount = cleanedText.split(/\s+/).length;
    const parseTime = Date.now() - startTime;

    console.log(`[File API] Text extraction completed in ${parseTime}ms, length: ${cleanedText.length}, words: ${wordCount}, estimated tokens: ${estimateTokens(cleanedText)}`);

    if (!cleanedText || cleanedText.trim().length === 0) {
      throw new Error('No text content extracted from file. The file might be empty or contain only images.');
    }

    return { text: cleanedText, pageCount, wordCount };
  } catch (error: any) {
    console.error('[File API] Extraction error:', error);
    throw error;
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

    // Check file size limits
    const plan = getCurrentUserPlan();
    const limits = USAGE_LIMITS[plan];
    const maxFileSize = MAX_FILE_MB * 1024 * 1024;
    
    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          error: 'FILE_TOO_LARGE',
          message: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the limit (${MAX_FILE_MB}MB). Please compress or split the file.`,
          maxSize: maxFileSize,
          actualSize: file.size,
          hint: `Maximum file size is ${MAX_FILE_MB}MB. For larger files, consider splitting into smaller parts.`,
        },
        { status: 400 }
      );
    }

    // Check file type whitelist
    const fileName = file.name.toLowerCase();
    const mimeType = file.type;
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.md'];
    const allowedMimeTypes = [
      ...ALLOWED_FILE_TYPES.pdf,
      ...ALLOWED_FILE_TYPES.docx,
      ...ALLOWED_FILE_TYPES.txt,
      ...ALLOWED_FILE_TYPES.md,
    ];
    
    const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    const isValidMimeType = !mimeType || allowedMimeTypes.includes(mimeType);
    
    if (!isValidExtension && !isValidMimeType) {
      return NextResponse.json(
        {
          error: 'UNSUPPORTED_FILE_TYPE',
          message: `File type "${mimeType || 'unknown'}" is not supported. Please upload PDF, DOCX, TXT, or Markdown files.`,
          allowedTypes: allowedExtensions,
          hint: 'Supported formats: PDF (.pdf), Word (.docx), Text (.txt), Markdown (.md)',
        },
        { status: 400 }
      );
    }

    // Check usage limits (plan already retrieved above)
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
    const extractionResult = await extractTextFromFile(file);
    const { text, pageCount, wordCount } = extractionResult;
    
    // Check page/word limits
    if (pageCount && pageCount > limits.maxPagesPerFile) {
      return NextResponse.json(
        {
          error: 'FILE_TOO_LONG',
          message: `File has ${pageCount} pages, which exceeds the limit of ${limits.maxPagesPerFile} pages for ${plan} plan.`,
          pageCount,
          maxPages: limits.maxPagesPerFile,
          hint: `Upgrade to Pro for up to ${USAGE_LIMITS.pro.maxPagesPerFile} pages per file.`,
        },
        { status: 400 }
      );
    }
    
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
    console.log('[File API] Starting learning asset generation, text length:', text.length);
    let structuredContent;
    try {
      structuredContent = await generateLearningAsset(text, {
        type: "file",
        metadata: {
          fileName: file.name,
        }
      });
      console.log('[File API] Learning asset generated successfully:', {
        title: structuredContent.title,
        notesCount: structuredContent.notes.length,
        quizzesCount: structuredContent.quizzes.length,
        flashcardsCount: structuredContent.flashcards.length,
      });
    } catch (genError: any) {
      console.error('[File API] Learning asset generation failed:', genError);
      throw new Error(`Failed to generate learning assets: ${genError.message || 'Unknown error'}`);
    }

    // Prepare source information with metadata
    const source: FileSource = {
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      pageCount,
    };

    // Estimate tokens for metadata
    const estimatedTokens = estimateTokens(text);

    // Create new session with source information
    console.log('[File API] Creating session with data:', {
      title: structuredContent.title || file.name,
      notesCount: structuredContent.notes.length,
      quizzesCount: structuredContent.quizzes.length,
      flashcardsCount: structuredContent.flashcards.length,
      wordCount,
      estimatedTokens,
    });
    let newSession;
    try {
      newSession = await createSession({
        type: "file",
        title: structuredContent.title || file.name,
        contentHash,
        notes: structuredContent.notes,
        quizzes: structuredContent.quizzes,
        flashcards: structuredContent.flashcards,
        summaryForChat: structuredContent.summaryForChat,
        source,
      });
      console.log('[File API] Session created successfully:', newSession.id);
    } catch (dbError: any) {
      console.error('[File API] Session creation failed:', dbError);
      throw new Error(`Failed to save session: ${dbError.message || 'Unknown error'}`);
    }

    // Increment usage count after successful processing
    await incrementUsage("file", monthKey, 1);

    return NextResponse.json({
      sessionId: newSession.id,
      type: newSession.type,
      title: newSession.title,
      createdAt: newSession.createdAt,
    });
  } catch (error: any) {
    console.error('[File API] Processing error:', error);
    const errorMessage = error.message || 'Failed to process file';
    
    // Provide specific error codes with hints
    let errorCode = 'PROCESSING_ERROR';
    let hint = 'Please try again or contact support if the problem persists.';
    
    if (errorMessage.includes('parse') || errorMessage.includes('Parse')) {
      if (errorMessage.includes('Word') || errorMessage.includes('word')) {
        errorCode = 'WORD_PARSE_ERROR';
        hint = 'The Word document may be corrupted or in an unsupported format. Try converting to PDF or DOCX format.';
      } else if (errorMessage.includes('PDF') || errorMessage.includes('pdf')) {
        errorCode = 'PDF_PARSE_ERROR';
        hint = 'The PDF may be corrupted, password-protected, or contain only images. Try a different PDF file.';
      } else {
        errorCode = 'PARSE_ERROR';
        hint = 'Unable to extract text from the file. Please ensure the file is not corrupted.';
      }
    } else if (errorMessage.includes('Unsupported') || errorMessage.includes('unsupported')) {
      errorCode = 'UNSUPPORTED_FILE_TYPE';
      hint = 'Supported formats: PDF (.pdf), Word (.docx), Text (.txt), Markdown (.md)';
    } else if (errorMessage.includes('empty') || errorMessage.includes('No text')) {
      errorCode = 'EMPTY_FILE';
      hint = 'The file appears to be empty or contains no extractable text. Please check the file content.';
    }
    
    return NextResponse.json(
      { 
        error: errorCode,
        message: errorMessage,
        hint,
      },
      { status: 500 }
    );
  }
}

