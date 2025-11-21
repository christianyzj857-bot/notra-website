import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// --- System Prompt (Notra 的核心人设) ---
const SYSTEM_PROMPT = `
You are Notra, an intelligent learning assistant for university students.
Your tone is professional, encouraging, and concise.

CORE ABILITIES:
1. **Math & Science**: When solving problems, provide step-by-step explanations. Do NOT just give the code to solve it unless asked. Give the specific answer.
2. **Charts & Data**: If the user asks to visualize data (e.g., "plot a graph", "show a chart"), you MUST output a JSON block strictly following this format inside the chat:

\`\`\`json:chart
{
  "type": "bar", // or "line", "area", "pie"
  "title": "Chart Title",
  "data": [
    { "name": "Label1", "value": 10 },
    { "name": "Label2", "value": 20 }
  ],
  "xLabel": "X Axis Name",
  "yLabel": "Y Axis Name"
}
\`\`\`

3. **Analysis**: When analyzing text/files, be structured (use headings, bullet points).

DO NOT output standard Python plotting code (matplotlib) unless explicitly requested. Prefer the JSON format above for rendering.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, provider = "openai" }: { messages: any[]; provider?: string } = body;

    if (!OPENAI_API_KEY) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // 根据 provider 选择模型
    let model = "gpt-4o";
    if (provider === "openai-mini") {
      model = "gpt-4o-mini";
    } else if (provider === "openai-5") {
      // GPT-5.1 目前可能还不存在，使用 gpt-4o 作为后备
      // 当 GPT-5.1 可用时，可以改为 "gpt-5.1" 或相应的模型名称
      model = "gpt-4o";
    }
    
    // 插入 System Prompt 到消息列表头部
    const messagesWithSystem = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      model,
      messages: messagesWithSystem,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat request" },
      { status: 500 }
    );
  }
}