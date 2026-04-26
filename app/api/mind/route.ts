import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  depthModeInstructions,
  mindDepthSuffix,
  readDepthModeFromBody,
} from "@/lib/depthMode";
import { firstResponsesOutputText } from "@/lib/openaiFirstOutputText";
import { createClient } from "@/lib/supabase/server";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";

const SYSTEM = `You generate emotional theories, not truths.

Rules:
- Never sound certain
- Always suggest possibilities
- Always provide a safe question to verify
- No long paragraphs. Use short, sharp sentences. Slight emotional tension, but safe.
- Never robotic. Never generic advice.

Structure:

1. Behavior
Clear restatement of what the user described (surface only).

2. Possible Interpretations
2–3 distinct emotional possibilities. Each should start on its own line or be clearly separated with line breaks. Never present one reading as the only truth. How much hedging language (might, could, seems like) to use follows the Mind tool rules in the Depth tone section—Steel uses less; Satin may use more.

3. What They Might Need
Grounded ideas for how the user could respond emotionally — no blame, no accusing the partner.

4. Ask To Confirm
ONE specific, gentle question the user can ask their partner to check their theory without attacking. Must be invitational, not interrogative. No sarcasm.

You MUST respond with ONLY valid JSON, no other text, no markdown fences. Use this exact shape:
{"behavior":"...","interpretations":"...","need":"...","confirm":"..."}

Rules for the JSON values:
- "behavior": Surface behavior restatement.
- "interpretations": String containing 2–3 options (use \\n between options if needed).
- "need": Emotional response suggestions.
- "confirm": A single question string the user can ask verbatim.`;

function parseJsonResponse(raw: string): {
  behavior: string;
  interpretations: string;
  need: string;
  confirm: string;
} {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  }
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const behavior = typeof parsed.behavior === "string" ? parsed.behavior.trim() : "";
  let interpretations = typeof parsed.interpretations === "string" ? parsed.interpretations.trim() : "";
  if (!interpretations && typeof parsed.inner === "string") {
    interpretations = parsed.inner.trim();
  }
  const need = typeof parsed.need === "string" ? parsed.need.trim() : "";
  const confirm = typeof parsed.confirm === "string" ? parsed.confirm.trim() : "";
  if (!behavior || !interpretations || !need || !confirm) {
    throw new Error("Invalid JSON shape");
  }
  return { behavior, interpretations, need, confirm };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const depthMode = readDepthModeFromBody(body as Record<string, unknown>);
    const context = (body as Record<string, unknown>)?.context;
    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : typeof body.message === "string"
          ? body.message.trim()
          : "";

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("mind: Missing OPENAI_API_KEY");
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

    const userBlock = `What the user observed (their words):
---
${text}
---

Output ONLY the JSON object with keys behavior, interpretations, need, confirm.`;

    const contextJson = accountContext.contextJson;

    const input = `${SYSTEM}${depthModeInstructions(depthMode)}${mindDepthSuffix(depthMode)}

${contextJson ? `Relationship Context:\n${contextJson}\n\nInstructions:\nUse this context to interpret behavior. Do not guess blindly.\nMind-reading safety: never state assumptions as facts; frame as possibilities and suggest verification questions.\n\n` : ""}${userBlock}`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input,
    });

    const raw = firstResponsesOutputText(response);

    if (!raw) {
      throw new Error("Empty model output");
    }

    const data = parseJsonResponse(raw);

    await recordFeatureUsage({
      supabase,
      user,
      feature: "mind",
      input: {
        depthMode,
        textPreview: text.slice(0, 180),
      },
      output: {
        behavior: data.behavior.slice(0, 180),
        need: data.need.slice(0, 180),
        confirm: data.confirm.slice(0, 180),
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("mind API error:", error);
    return NextResponse.json({ error: "Mind insight failed" }, { status: 500 });
  }
}
