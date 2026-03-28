import OpenAI from "openai";
import { NextResponse } from "next/server";
import { extractOpenAIResponsesText } from "@/lib/aiReflectionOutput";

/**
 * One-line “since last time” insight for couple results (habit / drift awareness).
 */
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const prior = body.prior;
    const current = body.current;
    if (!prior || !current || typeof prior !== "object" || typeof current !== "object") {
      return NextResponse.json({ error: "prior and current snapshots are required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 500 });
    }

    const priorText = [
      prior.emotionalTag && `Mood label: ${prior.emotionalTag}`,
      prior.brutalTruth && `Core tension: ${prior.brutalTruth}`,
      prior.mapReadBetween && `Space between: ${prior.mapReadBetween}`,
      prior.calendarState && `Tone: ${prior.calendarState}`,
      prior.resultExcerpt && `Reflection (excerpt): ${String(prior.resultExcerpt).slice(0, 450)}`,
    ]
      .filter(Boolean)
      .join("\n");

    const currentText = [
      current.emotionalTag && `Mood label: ${current.emotionalTag}`,
      current.brutalTruth && `Core tension: ${current.brutalTruth}`,
      current.mapReadBetween && `Space between: ${current.mapReadBetween}`,
      current.calendarState && `Tone: ${current.calendarState}`,
      current.resultExcerpt && `Reflection (excerpt): ${String(current.resultExcerpt).slice(0, 450)}`,
    ]
      .filter(Boolean)
      .join("\n");

    if (!priorText.trim() || !currentText.trim()) {
      return NextResponse.json({ error: "Not enough text to compare" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `Two partners took the same couple reflection twice (different days). Compare LAST TIME vs NOW.

LAST TIME:
${priorText}

NOW:
${currentText}

Write EXACTLY ONE short sentence (max 16 words). Speak to the couple as "you" (plural). No quotation marks. No clinical jargon.

Tone: calm, specific, observational—name a shift or a repeat, not praise or therapy.

Strong examples (do not copy verbatim; match the idea):
- This pattern is repeating.
- You're more reactive together than before.
- There's more distance now.
- A little more warmth is showing between you.
- The same tension is back, but it lands softer.

If the change is subtle, say so in one plain sentence. Output only that sentence.`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    let insight = extractOpenAIResponsesText(response);
    if (!insight) {
      const blocks = response?.output?.[0]?.content;
      const legacy = Array.isArray(blocks)
        ? blocks.find((c) => c?.type === "text" && typeof c?.text === "string")
        : null;
      insight = legacy?.text ? String(legacy.text).trim() : "";
    }
    insight = insight.replace(/^["'\s]+|["'\s]+$/g, "").replace(/\s+/g, " ").trim();
    if (insight.length > 140) {
      insight = `${insight.slice(0, 137).trim()}…`;
    }

    if (!insight) {
      return NextResponse.json({ error: "Empty insight" }, { status: 500 });
    }

    return NextResponse.json({ insight });
  } catch (e) {
    console.error("couple-result-shift:", e);
    return NextResponse.json({ error: "Could not generate insight" }, { status: 500 });
  }
}
