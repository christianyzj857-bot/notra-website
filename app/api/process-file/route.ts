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
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (error: any) {
        console.error("PDF parsing error:", error);
        return NextResponse.json({
          error: "PDF_PARSE_ERROR",
          message: `PDF解析失败: ${error.message}`
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
        message: `不支持的文件类型: ${file.type || "未知"}。目前支持: PDF, TXT, MD, JSON 文件。`
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

