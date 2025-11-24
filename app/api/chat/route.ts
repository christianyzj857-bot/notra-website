import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSessionById } from "@/lib/db";
import { pickRelevantSections, trimMessages } from "@/lib/chat-utils";
import { ChatRequestBody, ChatMode } from "@/types/notra";
import { getCurrentUserPlan } from "@/lib/userPlan";
import { USAGE_LIMITS } from "@/config/usageLimits";
import { PRO_ONLY_MODELS, isProOnlyModel, type ModelKey } from "@/config/models";
import { getUsage, incrementUsage, getDayKey } from "@/lib/usage";

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
    const { messages, model = "gpt-4o-mini", mode = "general", sessionId, userPlan } = body;

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    // Validate mode and sessionId/assetId
    // Support both sessionId (existing) and assetId (new naming) for compatibility
    const assetId = sessionId || (body as any).assetId;
    
    if (mode === "note" && !assetId) {
      return NextResponse.json(
        { 
          error: "MISSING_ASSET_ID",
          message: "sessionId or assetId is required when mode is 'note'. Please provide a valid learning asset ID."
        },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Get user plan (use provided userPlan or default to "free" in Edge runtime)
    // Note: getCurrentUserPlan() uses window object which doesn't exist in Edge runtime
    // So we default to "free" if userPlan is not provided
    const currentUserPlan = userPlan || "free";
    
    // Model selection and permission check
    const requestedModel = (model || "gpt-4o-mini") as ModelKey;
    let selectedModel: ModelKey = (MODEL_MAP[requestedModel] || "gpt-4o-mini") as ModelKey;
    
    // Model permission check: Free users can only use gpt-4o-mini
    // Pro-only models (gpt-4o, gpt-5.1) require Pro plan
    if (currentUserPlan === "free" && isProOnlyModel(selectedModel)) {
      return NextResponse.json(
        {
          error: "UPGRADE_REQUIRED",
          message: "Upgrade to Pro to unlock this model. Free plan only supports GPT-4o-mini.",
          requestedModel: requestedModel,
          availableModel: "gpt-4o-mini"
        },
        { status: 403 }
      );
    }

    // Prepare messages based on mode
    let systemMessage = GENERAL_SYSTEM_PROMPT;
    let conversationMessages = messages;

    if (mode === "note" && assetId) {
      // Get session/asset data (note: getSessionById uses Node.js APIs, so this won't work in Edge runtime)
      // For Edge runtime, we fetch from an API endpoint
      try {
        const sessionResponse = await fetch(`${req.headers.get('origin') || 'http://localhost:3000'}/api/session/${assetId}`);
        if (!sessionResponse.ok) {
          if (sessionResponse.status === 404) {
            return NextResponse.json(
              { 
                error: "ASSET_NOT_FOUND",
                message: "The requested learning asset was not found. Please check the asset ID."
              },
              { status: 404 }
            );
          }
          return NextResponse.json(
            { 
              error: "ASSET_FETCH_ERROR",
              message: "Failed to fetch learning asset data."
            },
            { status: 500 }
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
        
        if (relevantSections.length > 0) {
          contextText += "Relevant sections:\n";
          relevantSections.forEach((section: any) => {
            contextText += `- ${section.heading}: ${section.content.substring(0, 200)}\n`;
          });
        } else {
          // Fallback to summary only if no relevant sections
          contextText += "Key concepts from the study material.\n";
        }

        systemMessage = `You are Notra, an AI learning assistant.
The user is asking questions about THIS STUDY MATERIAL:

${contextText}

Answer concisely, focusing only on this material, unless the user explicitly asks general questions.
If the question is not related to the study material, politely redirect to the material or answer briefly.`;
      } catch (err) {
        // If session fetch fails, fall back to general mode
        console.error('Failed to fetch session:', err);
        return NextResponse.json(
          { 
            error: "ASSET_FETCH_ERROR",
            message: "Failed to fetch learning asset data. Please try again."
          },
          { status: 500 }
        );
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

    // Set max_tokens for cost control (based on plan)
    const maxTokens = currentUserPlan === "free" ? 512 : 1024;

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
        
        // Increment usage count after successful completion
        await incrementUsage("chat", getDayKey(), 1);
        
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