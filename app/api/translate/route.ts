import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  depthModeInstructions,
  readDepthModeFromBody,
  translatorDepthSuffix,
} from "@/lib/depthMode";

const SYSTEM = `You decode emotional subtext with high precision.

You do not take sides.

Rules:
- Avoid generic statements; tie every insight to actual wording, punctuation, or tone in the message
- Be specific to wording — quote or paraphrase the words that carry the charge
- Identify emotional intent behind tone (withdrawal, pressure, reassurance-seeking, etc.)
- Keep each JSON field purposeful and scannable; the Depth tone section below sets whether lines stay surgically tight or allow a more interpretive rhythm (especially in "meant").
- Never sound robotic.

Structure:

1. What they said (clean)
Factual, neutral restatement of what was communicated — no interpretation yet.

2. What they likely meant (emotion + reason)
Name the likely emotional subtext and why this wording suggests it. Be precise, not vague.

3. The trap (specific wrong response + consequence)
Name ONE reactive reply someone might send, and the specific consequence (how it escalates or misses the need). Do NOT include a "better reply" here — only the wrong move + cost.

4. What to do (exact next move)
ONE complete sentence the user could say next — copy-paste ready. Calm, direct, human.

Tone: calm, surgically clear, slightly sharp — never cruel, never blaming either person.

You MUST respond with ONLY valid JSON, no other text, no markdown fences. Use this exact shape:
{"said":"...","meant":"...","trap":"...","do":"..."}

Rules for the JSON values:
- "said": Clean surface read (1–3 sentences).
- "meant": Emotion + reasoning anchored to the text (2–5 sentences).
- "trap": Wrong reply pattern + consequence only (2–4 sentences).
- "do": Single sentence only — no quotes around it as dialogue tags unless part of the message.`;

function parseJsonResponse(raw: string): { said: string; meant: string; trap: string; do: string } {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  }
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const said = typeof parsed.said === "string" ? parsed.said.trim() : "";
  const meant = typeof parsed.meant === "string" ? parsed.meant.trim() : "";
  const trap = typeof parsed.trap === "string" ? parsed.trap.trim() : "";
  let action = typeof parsed.do === "string" ? parsed.do.trim() : "";
  if (!action && typeof parsed.whatToDo === "string") {
    action = parsed.whatToDo.trim();
  }
  if (!action && typeof parsed.better === "string") {
    action = parsed.better.trim();
  }
  if (!action && typeof parsed.betterResponse === "string") {
    action = parsed.betterResponse.trim();
  }
  if (!said || !meant || !trap || !action) {
    throw new Error("Invalid JSON shape");
  }
  return { said, meant, trap, do: action };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const depthMode = readDepthModeFromBody(body as Record<string, unknown>);
    const context = (body as Record<string, unknown>)?.context;
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("translate: Missing OPENAI_API_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const userBlock = `Their message (verbatim from the user):
---
${message}
---

Output ONLY the JSON object with keys said, meant, trap, do.`;

    const memory = (() => {
      if (!context || typeof context !== "object") return null;
      const mem = (context as Record<string, unknown>)?.memory;
      return mem && typeof mem === "object" ? (mem as Record<string, unknown>) : null;
    })();

    const memorySlices = (() => {
      const conflicts = Array.isArray(memory?.conflicts) ? (memory?.conflicts as unknown[]) : [];
      const reflections = Array.isArray(memory?.reflections) ? (memory?.reflections as unknown[]) : [];
      const patterns =
        memory?.patterns && typeof memory.patterns === "object"
          ? (memory.patterns as Record<string, unknown>)
          : {};

      const pastConflicts = conflicts.slice(-3);
      const recentReflections = reflections.slice(-3);

      return {
        pastConflicts,
        patterns,
        recentReflections,
      };
    })();

    const contextJson = (() => {
      if (!context || typeof context !== "object") return "";
      try {
        const s = JSON.stringify(context);
        return s.length > 8000 ? `${s.slice(0, 8000)}…` : s;
      } catch {
        return "";
      }
    })();

    const translatorMemoryBlock = (() => {
      // Keep this small and “usable” instead of dumping the entire memory.
      if (!memory) return "";
      try {
        const s = JSON.stringify(memorySlices);
        return s.length > 5000 ? `${s.slice(0, 5000)}…` : s;
      } catch {
        return "";
      }
    })();

    const input = `${SYSTEM}

${translatorMemoryBlock ? `You are Luma, an emotional intelligence system.\n\nUse past relationship data to interpret messages.\n\nPAST CONFLICT PATTERNS:\n${JSON.stringify(memorySlices.pastConflicts)}\n\nEMOTIONAL PATTERNS:\n${JSON.stringify(memorySlices.patterns)}\n\nRECENT STATE:\n${JSON.stringify(memorySlices.recentReflections)}\n\nIMPORTANT:\n- Do NOT assume facts.\n- Frame insights as possibilities, not certainty.\n- Do NOT take sides.\n- Be sharp but grounded.\n\n` : ""}${depthModeInstructions(depthMode)}${translatorDepthSuffix(depthMode)}

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
    console.error("translate API error:", error);
    return NextResponse.json(
      { error: "Could not decode message" },
      { status: 500 }
    );
  }
}
