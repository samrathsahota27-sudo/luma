import OpenAI from "openai";
import { NextResponse } from "next/server";

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
`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { reflectionA, reflectionB } = body;

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

    const result = response.output[0].content[0].text;

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Connect inner worlds error:", error);
    return NextResponse.json(
      { error: "Could not generate couple insight" },
      { status: 500 }
    );
  }
}
