import { NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { createSession, findSessionByHash, generateContentHash } from "@/lib/db";
import { NotraSession, NoteSection, QuizItem, Flashcard } from "@/types/notra";
import { getCurrentUserPlan } from "@/lib/userPlan";

// 使用 Node.js Runtime 处理文件
export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Generate structured notes from extracted text using OpenAI
async function generateStructuredContent(
  text: string,
  model: "gpt-4o-mini" | "gpt-4o" = "gpt-4o-mini"
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

  // Truncate text to avoid token limits (keep first 8000 chars)
  const truncatedText = text.substring(0, 8000);

  const prompt = `You are an expert academic note generator. Transform the following document into structured, comprehensive notes.

Document Content:
${truncatedText}

Requirements:
1. Create a "Brief Overview" section (1-2 sentences summarizing the document)
2. Create a "Key Points" section (4-6 critical bullet points)
3. Extract and organize all structured information into appropriate sections
4. Use tables for contact information, fees, deadlines, etc.
5. Highlight important terms, dates, deadlines in your response
6. Create sections based on document content (e.g., Programme Details, Admission Conditions, Fees, Support Services, Contact Information)
7. Generate 5-10 quiz questions based on the content
8. Generate 10-15 flashcards for key concepts

Output Format: Return ONLY valid JSON matching this structure:
{
  "title": "Document Title",
  "summaryForChat": "Brief summary for chat context",
  "notes": [
    {
      "id": "section-1",
      "heading": "Brief Overview",
      "content": "Overview text",
      "bullets": ["Point 1", "Point 2"]
    },
    {
      "id": "section-2",
      "heading": "Key Points",
      "content": "",
      "bullets": ["Key point 1", "Key point 2"]
    },
    {
      "id": "section-3",
      "heading": "Programme Details",
      "content": "Details text",
      "tableSummary": [
        {"label": "Programme", "value": "BSc Statistics"},
        {"label": "UCAS Code", "value": "G300"}
      ]
    }
  ],
  "quizzes": [
    {
      "id": "quiz-1",
      "question": "Question text",
      "options": [
        {"label": "A", "text": "Option A"},
        {"label": "B", "text": "Option B"},
        {"label": "C", "text": "Option C"},
        {"label": "D", "text": "Option D"}
      ],
      "correctIndex": 0,
      "explanation": "Explanation text"
    }
  ],
  "flashcards": [
    {
      "id": "flashcard-1",
      "front": "Front text",
      "back": "Back text",
      "tag": "Category"
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: "You are an expert educational assistant that generates structured learning materials in JSON format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);

    return {
      title: parsed.title || "Untitled Document",
      notes: (parsed.notes || []).map((note: any, idx: number) => ({
        id: note.id || `section-${idx + 1}`,
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
        id: card.id || `flashcard-${idx + 1}`,
        front: card.front || "",
        back: card.back || "",
        tag: card.tag,
      })) as Flashcard[],
      summaryForChat: parsed.summaryForChat || "Document containing educational content and key concepts.",
    };
  } catch (error: any) {
    console.error('OpenAI generation error:', error);
    throw new Error(`Failed to generate structured content: ${error.message}`);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 将 File 转为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 写入临时文件
    const tempFilePath = path.join("/tmp", file.name);
    await writeFile(tempFilePath, buffer);

    let extractedText = "";

    // 根据文件类型处理
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // PDF 处理 - 需要安装 pdf-parse 库
      try {
        // 动态导入 pdf-parse
        const pdfParseModule = await import("pdf-parse");
        // pdf-parse 的导入方式
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;
        console.log("Parsing PDF, buffer size:", buffer.length);
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || "";
        
        if (!extractedText || extractedText.trim().length === 0) {
          return NextResponse.json({
            error: "PDF_EMPTY_CONTENT",
            message: "PDF解析成功，但没有提取到文本内容。PDF可能只包含图片或扫描件。"
          }, { status: 400 });
        }
      } catch (error: any) {
        console.error("PDF parsing error:", error);
        return NextResponse.json({
          error: "PDF_PARSE_ERROR",
          message: `PDF解析失败: ${error.message || "未知错误"}。请确保PDF文件未损坏且包含文本内容。`
        }, { status: 500 });
      }
    } else if (file.type === "application/msword" || 
               file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
               file.name.endsWith(".doc") || 
               file.name.endsWith(".docx")) {
      // Word 文档处理 - 使用 mammoth 库
      try {
        const mammothModule = await import("mammoth");
        console.log("Parsing Word document, buffer size:", buffer.length);
        
        // mammoth需要ArrayBuffer，从Buffer转换为ArrayBuffer
        const arrayBuffer = buffer.buffer.slice(
          buffer.byteOffset, 
          buffer.byteOffset + buffer.byteLength
        );
        
        // mammoth是CommonJS模块，直接使用extractRawText
        // mammoth没有default导出，直接使用模块本身
        const mammoth = (mammothModule as any).default || mammothModule;
        if (!mammoth || typeof mammoth.extractRawText !== 'function') {
          throw new Error("mammoth.extractRawText is not available");
        }
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value || "";
        
        console.log("Word extraction result, text length:", extractedText.length);
        
        // 如果有警告，记录但不阻止处理
        if (result.messages && result.messages.length > 0) {
          console.warn("Word document warnings:", result.messages);
        }
        
        if (!extractedText || extractedText.trim().length === 0) {
          return NextResponse.json({
            error: "WORD_EMPTY_CONTENT",
            message: "Word文档解析成功，但没有提取到文本内容。文档可能只包含图片或格式化的内容。"
          }, { status: 400 });
        }
      } catch (error: any) {
        console.error("Word parsing error:", error);
        console.error("Error stack:", error.stack);
        // 提供更详细的错误信息
        const errorMsg = error.message || "未知错误";
        return NextResponse.json({
          error: "WORD_PARSE_ERROR",
          message: `Word文档解析失败: ${errorMsg}。请尝试将文档转换为PDF或TXT格式后上传。`
        }, { status: 500 });
      }
    } else if (file.type.startsWith("text/") || 
               file.name.endsWith(".txt") || 
               file.name.endsWith(".md") ||
               file.name.endsWith(".json")) {
      // 文本文件直接读取
      try {
        extractedText = buffer.toString("utf-8");
      } catch (error: any) {
        return NextResponse.json({
          error: "TEXT_READ_ERROR",
          message: `文本读取失败: ${error.message}`
        }, { status: 500 });
      }
    } else {
      // 清理临时文件
      try {
        await import("fs").then(fs => fs.promises.unlink(tempFilePath));
      } catch {}
      
      return NextResponse.json({
        error: "UNSUPPORTED_FILE_TYPE",
        message: `不支持的文件类型: ${file.type || "未知"}。目前支持: PDF, Word (.doc, .docx), TXT, MD, JSON 文件。`
      }, { status: 400 });
    }

    // 清理临时文件
    try {
      await import("fs").then(fs => fs.promises.unlink(tempFilePath));
    } catch (unlinkError) {
      console.warn("Failed to delete temp file:", unlinkError);
    }

    // 限制文本长度，避免超出token限制
    const maxLength = 100000; // 约10万字符
    if (extractedText.length > maxLength) {
      extractedText = extractedText.substring(0, maxLength) + "\n\n[内容已截断，仅显示前100000字符]";
    }

    // Get user plan to select appropriate model
    const userPlan = getCurrentUserPlan();
    const selectedModel = userPlan === "pro" ? "gpt-4o" : "gpt-4o-mini";

    // Generate content hash for deduplication
    const contentHash = generateContentHash(extractedText);

    // Check if session already exists with same content
    const existingSession = await findSessionByHash(contentHash);
    if (existingSession) {
      return NextResponse.json({
        sessionId: existingSession.id,
        type: existingSession.type,
        title: existingSession.title,
        createdAt: existingSession.createdAt,
      });
    }

    // Generate structured content using OpenAI
    const structuredContent = await generateStructuredContent(extractedText, selectedModel);

    // Create new session in database
    const newSession = await createSession({
      type: "file",
      title: structuredContent.title || file.name,
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
    console.error("File processing error:", error);
    return NextResponse.json(
      { error: error.message || "Error processing file" },
      { status: 500 }
    );
  }
}

