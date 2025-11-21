import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

// 强制使用 Node.js Runtime (处理 FormData 需要)
export const runtime = "nodejs"; 

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 将 File 转为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // OpenAI SDK 需要实际的文件路径或特定的 File 对象
    // 在 Vercel 环境中，我们可以写入临时目录 /tmp
    const tempFilePath = path.join("/tmp", file.name);
    await writeFile(tempFilePath, buffer);

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // 调用 Whisper 模型，添加更好的配置以提高转录质量
    // 支持音频和视频文件（Whisper可以处理视频中的音频轨道）
    console.log("Calling Whisper API, file size:", buffer.length, "bytes, file name:", file.name);
    
    // 检查文件大小（Whisper限制25MB）
    if (buffer.length > 25 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "FILE_TOO_LARGE",
        message: "文件太大（超过25MB）。请压缩文件或使用更短的音频/视频。"
      }, { status: 400 });
    }
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      // 不强制指定语言，让Whisper自动检测（支持多语言）
      prompt: "This is a lecture, educational content, or video audio. Please transcribe accurately with proper punctuation and capitalization.", // 提示词帮助提高质量
      temperature: 0, // 降低随机性，提高一致性
      // 不指定 response_format，默认返回对象格式
    });

    console.log("Whisper API response type:", typeof transcription);
    console.log("Whisper API response keys:", Object.keys(transcription || {}));

    // 清理临时文件
    try {
      fs.unlinkSync(tempFilePath);
    } catch (unlinkError) {
      console.warn("Failed to delete temp file:", unlinkError);
    }

    // transcription 返回的是对象，包含 text 属性
    let transcriptionText = "";
    if (typeof transcription === 'string') {
      transcriptionText = transcription;
    } else if (transcription && typeof transcription === 'object') {
      transcriptionText = (transcription as any).text || "";
    }
    
    console.log("Extracted transcription text length:", transcriptionText.length);
    
    if (!transcriptionText || transcriptionText.trim().length === 0) {
      console.error("Transcription is empty. Full response:", JSON.stringify(transcription, null, 2));
      return NextResponse.json({ 
        error: "EMPTY_TRANSCRIPTION",
        message: "转录结果为空。可能是音频文件损坏、格式不支持、或内容太短。请检查音频文件。"
      }, { status: 400 });
    }
    
    return NextResponse.json({ text: transcriptionText });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: error.message || "Error processing audio" }, { status: 500 });
  }
}