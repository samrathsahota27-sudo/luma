import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  chatDepthSuffix,
  depthModeInstructions,
  readDepthModeFromBody,
} from "@/lib/depthMode";
import { createClient } from "@/lib/supabase/server";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";

const SYSTEM = `You are a neutral emotional support system for relationships.

Your role:
- Help user process emotions
- Reduce escalation
- Offer clarity, not judgment

Rules:
- Never take sides
- Never blame partner
- Never say 'you are right' or 'they are wrong'
- Reframe conflict into emotional understanding
- Keep responses calm, human, slightly insightful

Tone (baseline):
- grounded, emotionally aware, not robotic
- Length and warmth vs. directness follow the Depth tone sections below

If user is angry:
→ slow them down

If user is confused:
→ clarify emotions

If user is sad:
→ validate without exaggeration`;

const MAX_MESSAGES = 60;

function sanitizeMessages(
  raw: unknown
): ChatCompletionMessageParam[] | { error: string } {
  if (!Array.isArray(raw)) {
    return { error: "messages must be an array" };
  }

  const out: ChatCompletionMessageParam[] = [];

  for (const item of raw.slice(-MAX_MESSAGES)) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const role = rec.role;
    const content = rec.content;

    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;

    const trimmed = content.trim();
    if (!trimmed) continue;

    out.push({ role, content: trimmed });
  }

  if (out.length === 0) {
    return { error: "no valid messages" };
  }

  const last = out[out.length - 1];
  if (last.role !== "user") {
    return { error: "last message must be from user" };
  }

  return out;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const depthMode = readDepthModeFromBody(body as Record<string, unknown>);
    const context = (body as Record<string, unknown>)?.context;
    const sanitized = sanitizeMessages(body.messages);

    if ("error" in sanitized) {
      return NextResponse.json({ error: sanitized.error }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("chat: Missing OPENAI_API_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const accountContext = await buildUnifiedAccountContext({
      supabase,
      user,
      clientContext: (context && typeof context === "object" ? context : null) as any,
    });

    const contextJson = accountContext.contextJson;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          SYSTEM +
          depthModeInstructions(depthMode) +
          chatDepthSuffix(depthMode) +
          (contextJson
            ? `\n\nRelationship Context:\n${contextJson}\n\nInstructions:\nUse this context to interpret. If context is missing/unknown, say so rather than guessing.`
            : ""),
      },
      ...sanitized,
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      max_tokens: depthMode === "steel" ? 720 : 900,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!reply) {
      throw new Error("Empty completion");
    }

    await recordFeatureUsage({
      supabase,
      user,
      feature: "chat",
      input: {
        depthMode,
        messageCount: sanitized.length,
      },
      output: {
        replyPreview: reply.slice(0, 220),
      },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("chat API error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
