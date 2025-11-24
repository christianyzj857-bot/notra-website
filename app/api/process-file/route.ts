import { NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { createSession, generateContentHash, findSessionByHash } from "@/lib/db";
import { NotraSession } from "@/types/notra";

// 使用 Node.js Runtime 处理文件
export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

    // Check for API key
    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        error: "MISSING_API_KEY",
        message: "OpenAI API key is not configured"
      }, { status: 500 });
    }

    // Check if content already processed (deduplication)
    const contentHash = generateContentHash(extractedText);
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

    // Get user plan and model from request
    const userPlan = formData.get("userPlan") as string || "free";
    const selectedModel = formData.get("model") as string || "gpt-4o-mini";

    // Map model selection
    const MODEL_MAP: Record<string, string> = {
      "gpt-4o-mini": "gpt-4o-mini",
      "gpt-4o": "gpt-4o",
      "gpt-5.1": "gpt-4o", // Placeholder until GPT-5.1 is available
    };

    const modelToUse = MODEL_MAP[selectedModel] || "gpt-4o-mini";

    // Generate structured notes using OpenAI
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Model-specific prompt enhancements
    let modelSpecificInstructions = "";
    if (selectedModel === "gpt-4o-mini") {
      modelSpecificInstructions = "\n\nIMPORTANT: Keep responses concise and focused on essential information. Aim for 500-800 words total. Generate 5 quiz questions and 8 flashcards.";
    } else if (selectedModel === "gpt-4o") {
      modelSpecificInstructions = "\n\nIMPORTANT: Provide detailed explanations and comprehensive coverage. Aim for 1000-1500 words total. Include rich bullet points with explanations. Generate 7 quiz questions and 12 flashcards.";
    } else if (selectedModel === "gpt-5.1") {
      modelSpecificInstructions = "\n\nIMPORTANT: Provide in-depth analysis, cross-references, and additional insights. Aim for 1500-2500 words total. Include comprehensive detail in all sections. Generate 10 quiz questions and 15 flashcards. Add cross-references between sections where relevant.";
    }

    const noteGenerationPrompt = `You are an expert academic note generator. Transform the following document into structured, comprehensive notes that match the quality of premium note-taking apps like Turbo AI.

Document Content:
${extractedText}

Requirements:
1. Create a "Brief Overview" section (1-2 sentences summarizing the document)
2. Create a "Key Points" section (4-6 critical bullet points highlighting the most important information)
3. Extract and organize all structured information into appropriate sections based on document content
4. Use tables for structured data (contact information, fees, deadlines, programme details, etc.)
5. Highlight important terms, dates, deadlines, and key information using **bold** markdown
6. Create logical sections based on document content (e.g., Programme Details, Admission Conditions, Fees, Support Services, Contact Information, etc.)
7. For each section, provide clear headings and well-organized content
8. Generate quiz questions that test understanding of key concepts
9. Generate flashcards for important terms and concepts${modelSpecificInstructions}

Visual Formatting Guidelines:
- Use **bold** for important dates, deadlines, requirements, and key terms
- For structured data, use tableSummary or summaryTable format
- Each section should have a clear heading
- Use bullet points for lists
- Keep content well-organized and easy to scan

Output Format: JSON matching this exact structure:
{
  "title": "Document Title (extract from content)",
  "summaryForChat": "Brief 1-2 sentence summary for chat context",
  "notes": [
    {
      "id": "section-1",
      "heading": "Brief Overview",
      "content": "1-2 sentence overview of the document content",
      "bullets": []
    },
    {
      "id": "section-2",
      "heading": "Key Points",
      "content": "",
      "bullets": ["**Important point 1**", "**Important point 2**", "**Important point 3**", "**Important point 4**"]
    },
    {
      "id": "section-3",
      "heading": "Programme Details",
      "content": "Detailed description",
      "tableSummary": [
        {"label": "Programme", "value": "BSc Statistics"},
        {"label": "UCAS Code", "value": "G300"},
        {"label": "Start Date", "value": "**23 September 2024**"}
      ]
    },
    {
      "id": "section-4",
      "heading": "Contact Information",
      "content": "",
      "summaryTable": [
        {
          "concept": "Role",
          "formula": "Name",
          "notes": "Department, Phone, Email, Address"
        }
      ]
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
      "front": "Question or term",
      "back": "Answer or definition",
      "tag": "Category"
    }
  ]
}

CRITICAL: Return ONLY valid JSON. Do not include any markdown code blocks, explanations, or text outside the JSON structure.`;

    try {
      const completion = await openai.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: "system",
            content: "You are an expert academic note generator that creates structured, comprehensive notes from documents. You always respond with valid JSON only."
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
        type: "file",
        title: generatedContent.title || file.name,
        contentHash,
        notes: generatedContent.notes || [],
        quizzes: generatedContent.quizzes || [],
        flashcards: generatedContent.flashcards || [],
        summaryForChat: generatedContent.summaryForChat || generatedContent.title || file.name,
      });

      return NextResponse.json({
        sessionId: session.id,
        type: session.type,
        title: session.title,
        createdAt: session.createdAt,
        cached: false
      });

    } catch (openaiError: any) {
      console.error("OpenAI note generation error:", openaiError);
      return NextResponse.json({
        error: "NOTE_GENERATION_ERROR",
        message: `Failed to generate notes: ${openaiError.message || "Unknown error"}. Please try again.`
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("File processing error:", error);
    return NextResponse.json(
      { error: error.message || "Error processing file" },
      { status: 500 }
    );
  }
}

