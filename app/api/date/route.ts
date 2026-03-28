import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  dateDepthSuffix,
  depthModeInstructions,
  readDepthModeFromBody,
} from "@/lib/depthMode";

const SYSTEM = `You are a relationship strategist.

Your job is NOT to suggest generic dates.
Your job is to prescribe specific experiences based on emotional state.

Steps:
1. Identify relationship state (conflict, distance, boredom, etc.)
2. Explain what is missing (trust, excitement, calm, etc.)
3. Suggest a precise activity designed to fix that state

Rules:
- Avoid generic suggestions
- Be specific and intentional
- Tie suggestion to emotional need

Examples:

If conflict:
→ Suggest calm, low-stimulation environments

If distance:
→ Suggest high-energy, shared challenge

If boredom:
→ Suggest novelty and surprise

Tone:
- confident
- insightful
- slightly directive
- observational
- short, sharp sentences (no long paragraphs)
- slightly uncomfortable (but safe)

Never:
- be vague
- give multiple options
- sound like a blog article

Always give ONE strong recommendation

You MUST respond with ONLY valid JSON, no other text, no markdown fences. Use this exact shape:
{"state":"...","missing":"...","plan":"..."}

Rules for the JSON values:
- "state": Emotional diagnosis — name the current relational state clearly (2–4 sentences max).
- "missing": What the relationship lacks or what needs repair (2–4 sentences), tied to that state.
- "plan": ONE specific, actionable date or shared experience — concrete (where, what, how long, tone). No bullet list of alternatives; single prescription only.`;

function parseJsonResponse(raw: string): { state: string; missing: string; plan: string } {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  }
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const state = typeof parsed.state === "string" ? parsed.state : "";
  let missing = typeof parsed.missing === "string" ? parsed.missing : "";
  if (!missing && typeof parsed.need === "string") missing = parsed.need;
  const plan = typeof parsed.plan === "string" ? parsed.plan : "";
  if (!state || !missing || !plan) {
    throw new Error("Invalid JSON shape");
  }
  return { state, missing, plan };
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
      console.error("date: Missing OPENAI_API_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const userBlock = `What the user shared about the relationship right now:
---
${text}
---

Output ONLY the JSON object with keys state, missing, plan.`;
// (accept `need` for backwards compatibility; prefer `missing`.)

    const contextJson = (() => {
      if (!context || typeof context !== "object") return "";
      try {
        const s = JSON.stringify(context);
        return s.length > 8000 ? `${s.slice(0, 8000)}…` : s;
      } catch {
        return "";
      }
    })();

    const input = `${SYSTEM}${depthModeInstructions(depthMode)}${dateDepthSuffix(depthMode)}

${contextJson ? `Relationship Context:\n${contextJson}\n\nInstructions:\nUse this context to interpret behavior. Do not guess blindly.\n\n` : ""}${userBlock}`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input,
    });

    const textPiece = response.output?.[0]?.content?.[0];
    const raw =
      textPiece && "text" in textPiece && typeof textPiece.text === "string"
        ? textPiece.text
        : "";

    if (!raw) {
      throw new Error("Empty model output");
    }

    const data = parseJsonResponse(raw);

    return NextResponse.json(data);
  } catch (error) {
    console.error("date API error:", error);
    return NextResponse.json({ error: "Date plan failed" }, { status: 500 });
  }
}
