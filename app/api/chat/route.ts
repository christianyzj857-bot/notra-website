import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSessionById } from "@/lib/db";
import { pickRelevantSections, trimMessages } from "@/lib/chat-utils";
import { ChatRequestBody, ChatMode } from "@/types/notra";

export const runtime = "edge";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Model mapping
const MODEL_MAP = {
  "gpt-4o-mini": "gpt-4o-mini",
  "gpt-4o": "gpt-4o",
  "gpt-5.1": "gpt-4o", // Placeholder - update when GPT-5.1 is available
} as const;

// --- General Chat System Prompt ---
const GENERAL_SYSTEM_PROMPT = `
You are Notra, an intelligent learning assistant for students.
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
    const body: ChatRequestBody = await req.json();
    const { messages, model = "gpt-4o-mini", mode = "general", sessionId, userPlan = "free" } = body;

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    // Validate mode and sessionId
    if (mode === "note" && !sessionId) {
      return NextResponse.json(
        { error: "sessionId is required when mode is 'note'" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Model selection and cost control
    let selectedModel = MODEL_MAP[model] || "gpt-4o-mini";
    
    // Free users: force downgrade to 4o-mini
    if (userPlan === "free" && (model === "gpt-4o" || model === "gpt-5.1")) {
      selectedModel = "gpt-4o-mini";
    }

    // Prepare messages based on mode
    let systemMessage = GENERAL_SYSTEM_PROMPT;
    let conversationMessages = messages;

    if (mode === "note" && sessionId) {
      // Get session data (note: getSessionById uses Node.js APIs, so this won't work in Edge runtime)
      // For Edge runtime, we'd need to use a different approach (e.g., fetch from an API endpoint)
      // For now, we'll handle this gracefully
      try {
        const sessionResponse = await fetch(`${req.headers.get('origin') || 'http://localhost:3000'}/api/session/${sessionId}`);
        if (!sessionResponse.ok) {
          return NextResponse.json(
            { error: "Session not found" },
            { status: 404 }
          );
        }
        const session = await sessionResponse.json();

      // Get latest user question for relevance filtering
      const latestUserMessage = messages
        .filter(m => m.role === "user")
        .pop()?.content || "";

      // Pick relevant note sections to reduce token usage
      const relevantSections = pickRelevantSections(session.notes, latestUserMessage, 3);

        // Build context-aware system prompt
        let contextText = `Summary: ${session.summaryForChat}\n\n`;
        
        if (session.notes && session.notes.length > 0) {
          const relevantSections = pickRelevantSections(session.notes, latestUserMessage, 3);
          if (relevantSections.length > 0) {
            contextText += "Relevant sections:\n";
            relevantSections.forEach((section: any) => {
              contextText += `- ${section.heading}: ${section.content.substring(0, 200)}\n`;
            });
          } else {
            // Fallback to summary only if no relevant sections
            contextText += "Key concepts from the study material.\n";
          }
        }

        systemMessage = `You are Notra, an AI learning assistant.
The user is asking questions about THIS STUDY MATERIAL:

${contextText}

Answer concisely, focusing only on this material, unless the user explicitly asks general questions.
If the question is not related to the study material, politely redirect to the material or answer briefly.`;
      } catch (err) {
        // If session fetch fails, fall back to general mode
        console.error('Failed to fetch session:', err);
      }
    }

    // Trim messages to save tokens (keep recent 3 rounds)
    const trimmedMessages = trimMessages(conversationMessages, 3);

    // Build final messages array with proper types
    const messagesWithSystem: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemMessage },
      ...trimmedMessages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      })),
    ];

    // Set max_tokens for cost control
    const maxTokens = userPlan === "free" ? 512 : 768;

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: messagesWithSystem,
      stream: true,
      max_tokens: maxTokens,
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