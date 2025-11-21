import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

export const runtime = "nodejs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 将 File 转为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    try {
      if (fileType === "application/pdf" || file.name.endsWith(".pdf")) {
        // PDF文件处理：由于PDF解析需要专门的库且可能有兼容性问题
        // 我们提供清晰的提示，引导用户使用替代方案
        return NextResponse.json({ 
          error: "PDF_SUPPORT_INFO",
          message: "PDF文件需要特殊处理。请选择以下方式之一：\n\n1. **复制文本**：打开PDF，复制内容后直接粘贴到聊天框\n2. **转换为文本**：使用在线工具（如ilovepdf.com）将PDF转为TXT后上传\n3. **描述内容**：告诉我PDF的主要内容，我可以帮你整理成笔记\n\n目前系统支持直接处理：TXT、MD文本文件。"
        }, { status: 200 }); // 返回200，让前端可以显示友好提示
      } else if (fileType.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
        // 处理文本文件 - 直接读取
        extractedText = buffer.toString("utf-8");
        
        return NextResponse.json({ 
          text: extractedText,
          fileName: file.name,
          fileType: fileType
        });
      } else {
        return NextResponse.json({ 
          error: `不支持的文件类型: ${fileType}。目前支持: PDF, TXT, MD文件。\n\n对于PDF文件，建议：\n1. 复制PDF中的文本内容直接粘贴\n2. 使用在线PDF转文本工具\n3. 将PDF转换为TXT文件后上传` 
        }, { status: 400 });
      }

    } catch (parseError: any) {
      return NextResponse.json({ 
        error: `文件处理失败: ${parseError.message || "未知错误"}` 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("File processing error:", error);
    return NextResponse.json({ 
      error: error.message || "Error processing file" 
    }, { status: 500 });
  }
}

