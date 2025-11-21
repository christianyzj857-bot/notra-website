import { NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";

// 使用 Node.js Runtime 处理文件
export const runtime = "nodejs";

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

    return NextResponse.json({ 
      text: extractedText,
      fileName: file.name,
      fileSize: file.size,
      truncated: extractedText.length >= maxLength
    });

  } catch (error: any) {
    console.error("File processing error:", error);
    return NextResponse.json(
      { error: error.message || "Error processing file" },
      { status: 500 }
    );
  }
}

