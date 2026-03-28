import OpenAI from "openai";
import { NextResponse } from "next/server";
import { extractOpenAIResponsesText, parseAiReflectionOutput } from "@/lib/aiReflectionOutput";

/**
 * Generates a couple insight from two users' individual reflection texts.
 * Used by "Connect Inner Worlds" — does not use the couple test or modify existing reflection APIs.
 */
function buildConnectPrompt(reflectionA, reflectionB) {
  return `
Two people have each completed an individual reflection experience. Below are their reflection texts (AI-generated summaries of their inner landscape based on image choices and short written responses).

Reflection A (Person A's inner world):
---
${reflectionA}
---

Reflection B (Person B's inner world):
---
${reflectionB}
---

Generate a relationship reflection (about 350–450 words) that weaves both perspectives together. Structure it into exactly 4 sections with clear headings. Use short paragraphs and a blank line between sections.

Section 1 — Shared emotional patterns
Identify themes, feelings, or qualities that appear in both reflections. Name what they have in common emotionally.

Section 2 — Where your inner rhythms differ
Note where the two inner landscapes diverge. Describe the difference with care, without judging either as right or wrong.

Section 3 — What may be asking for attention
From the combined picture, what tension, need, or possibility seems to be asking for attention in the relationship or in each person?

Section 4 — A gentle direction for growth
Offer one or two gentle, concrete suggestions for how the couple might nurture what emerged—together or individually.

Tone: Calm, psychologically precise, respectful of both. Speak to "you" (the couple) in second person. Do not diagnose or prescribe; reflect and invite.

Identity-based language (reflection, brutalTruth, trackerInsight, shadowInsight, conflictFrictionPoints, dangerousQuestion):
- Habit phrasing that lands as personally seen: "You both tend to…", "You often…", "One of you tends to… while the other…", "You avoid…", "You reach for…" — vary stems; ground every claim in the two reflection texts below.
- No generic couple platitudes ("You balance each other") unless tied to a specific pattern in the texts.
- conflictFrictionPoints: personA / personB as behavioral snapshots ("tends to" / "often"); mismatch = mechanics.
- Forbidden: vague personality typing, horoscope tone, filler.

CRITICAL — OUTPUT FORMAT:
Return a single JSON object only. No markdown code fences, no text before or after the JSON.

Required keys:
- "brutalTruth": one sentence only (about 14–26 words). Prefer "You both tend to…" / "You often…" (or similar identity-habit open) naming a concrete relational tension visible across these two reflection texts, with a clear cost. Direct, emotionally sharp, slightly uncomfortable, honest but never insulting. Not generic or soft.
- "emotionalTag": 2–5 words, shared mood between these two inner worlds for a timeline.
- "trackerInsight": one line max ~100 characters; "you" as the couple; identity-habit phrasing when natural; scannable; grounded in the two texts.
- "calendarState": exactly one of "calm" | "friction" | "distance" | "clarity" for this couple snapshot.
- "reflection": string containing the full four-section reflection (headings, blank lines between sections). Preserve newlines.
- "dangerousQuestion": REQUIRED. Exactly one short question (one sentence, must end with ?). For the couple—specific to the two reflection texts below; invites real conversation, slightly uncomfortable but fair. Not generic.
- "shadowInsight": one or two short sentences (max ~220 characters). A pattern both may be missing—specific to these two reflection texts. ~70% pattern / ~30% grounding. Behaviors only; no harsh labels.
- "conflictFrictionPoints": JSON array of 2 or 3 objects. Each object: "personA" (≤120 chars, one sentence about the author of Reflection A’s style in that slice), "personB" (same for Reflection B), "mismatch" (≤160 chars, why those patterns collide—mechanics not blame). Vary rows across communication, emotional expression, conflict response, needs vs behavior.

Do not repeat brutalTruth, emotionalTag, trackerInsight, dangerousQuestion, shadowInsight, or conflictFrictionPoints inside "reflection".
`;
}

export async function POST(req) {
  try {
    const payload = await req.json();
    const { reflectionA, reflectionB } = payload;

    if (!reflectionA || !reflectionB || typeof reflectionA !== "string" || typeof reflectionB !== "string") {
      return NextResponse.json(
        { error: "reflectionA and reflectionB are required strings" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const prompt = buildConnectPrompt(reflectionA, reflectionB);

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const raw = extractOpenAIResponsesText(response);
    const {
      brutalTruth,
      body: reflectionBody,
      emotionalTag,
      trackerInsight,
      dangerousQuestion,
      shadowInsight,
      conflictFrictionPoints,
    } = parseAiReflectionOutput(raw);
    const result = reflectionBody || raw;
    if (!result) {
      return NextResponse.json({ error: "Could not generate couple insight" }, { status: 500 });
    }

    return NextResponse.json({
      result,
      ...(brutalTruth ? { brutalTruth } : {}),
      ...(emotionalTag ? { emotionalTag } : {}),
      ...(trackerInsight ? { trackerInsight } : {}),
      ...(calendarState ? { calendarState } : {}),
      ...(dangerousQuestion ? { dangerousQuestion } : {}),
      ...(shadowInsight ? { shadowInsight } : {}),
      ...(conflictFrictionPoints?.length ? { conflictFrictionPoints } : {}),
    });
  } catch (error) {
    console.error("Connect inner worlds error:", error);
    return NextResponse.json(
      { error: "Could not generate couple insight" },
      { status: 500 }
    );
  }
}
