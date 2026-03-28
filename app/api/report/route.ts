import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  depthModeInstructions,
  readDepthModeFromBody,
  reportDepthSuffix,
} from "@/lib/depthMode";

const SYSTEM = `You are analyzing a relationship like a weather system.

You describe emotional patterns as weather conditions.

Rules:
- Use metaphor (storm, fog, calm, heat, clear skies, pressure, fronts)
- Be emotionally accurate and specific to the inputs
- Avoid generic summaries

Structure:

1. Weather:
Short headline label WITH one vivid emoji at the end (e.g. "Emotional Fog 🌫️", "Storm Building 🌩️", "Clear Window ☀️", "High Friction 🔥", "Quiet Cold Front ❄️").
Plus ONE sentence that sounds like a weather report for the heart — concrete, not cheesy.

2. Cause:
Why this emotional weather is happening (2–4 sentences). Still use light metaphor where natural.

3. Shift:
What changed recently — direction of movement in the pattern (2–4 sentences).

4. Next Step:
One clear, doable move for the couple this week — directive but not preachy (2–4 sentences).

Also set "theme" to exactly one of: storm, fog, clear, heat, calm — whichever best matches the dominant metaphor.

You MUST respond with ONLY valid JSON, no other text, no markdown fences. Use this exact shape:
{"label":"Storm Building 🌩️","weather":"One sentence.","cause":"...","shift":"...","next":"...","theme":"storm"}

Rules for JSON keys:
- "label": 2–5 words + one emoji, title case feel, emotionally precise.
- "weather": Single sentence forecast (no second emoji).
- "cause", "shift", "next": prose as above.
- "theme": lowercase, one of storm | fog | clear | heat | calm`;

const VALID_THEMES = new Set(["storm", "fog", "clear", "heat", "calm"]);

function parseJsonResponse(raw: string): {
  label: string;
  weather: string;
  cause: string;
  shift: string;
  next: string;
  theme: string;
} {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  }
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const label = typeof parsed.label === "string" ? parsed.label.trim() : "";
  const weather = typeof parsed.weather === "string" ? parsed.weather.trim() : "";
  const cause = typeof parsed.cause === "string" ? parsed.cause.trim() : "";
  const shift = typeof parsed.shift === "string" ? parsed.shift.trim() : "";
  const next = typeof parsed.next === "string" ? parsed.next.trim() : "";
  let theme = typeof parsed.theme === "string" ? parsed.theme.trim().toLowerCase() : "calm";
  if (!VALID_THEMES.has(theme)) {
    theme = "calm";
  }
  if (!label || !weather || !cause || !shift || !next) {
    throw new Error("Invalid JSON shape");
  }
  return { label, weather, cause, shift, next, theme };
}

const MOCK_DEFAULTS = {
  chats:
    "Several late-night exchanges where one partner went quiet after the other raised plans for the weekend. One message read as short; the other read it as dismissal.",
  translatorUsage:
    "Two decoding sessions on messages about 'fine' and 'whatever' — both carried more irritation than the literal words suggested.",
  mood: "Tired but trying; more guarded than last week; small moments of warmth after arguments.",
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const depthMode = readDepthModeFromBody(body as Record<string, unknown>);
    const context = (body as Record<string, unknown>)?.context;

    const chats =
      typeof body.chats === "string" && body.chats.trim()
        ? body.chats.trim()
        : MOCK_DEFAULTS.chats;
    const translatorUsage =
      typeof body.translatorUsage === "string" && body.translatorUsage.trim()
        ? body.translatorUsage.trim()
        : MOCK_DEFAULTS.translatorUsage;
    const mood =
      typeof body.mood === "string" && body.mood.trim()
        ? body.mood.trim()
        : MOCK_DEFAULTS.mood;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("report: Missing OPENAI_API_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const userBlock = `Weekly inputs (simulated for now — your only radar data for "this week"):

Chats / messages summary:
---
${chats}
---

Translator usage (what they tried to decode):
---
${translatorUsage}
---

Overall mood this week:
---
${mood}
---

Read the emotional atmosphere like weather. Output ONLY the JSON with keys label, weather, cause, shift, next, theme.`;

    const contextJson = (() => {
      if (!context || typeof context !== "object") return "";
      try {
        const s = JSON.stringify(context);
        return s.length > 8000 ? `${s.slice(0, 8000)}…` : s;
      } catch {
        return "";
      }
    })();

    const input = `${SYSTEM}${depthModeInstructions(depthMode)}${reportDepthSuffix(depthMode)}

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
    console.error("report API error:", error);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
