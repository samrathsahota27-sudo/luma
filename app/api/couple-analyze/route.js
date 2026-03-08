import OpenAI from "openai";
import { NextResponse } from "next/server";

function buildCouplePrompt(partnerA, partnerB) {
  return `
Two partners each completed a 4-round emotional reflection test. Below are their answers.

Partner A answers:
${JSON.stringify(partnerA, null, 2)}

Partner B answers:
${JSON.stringify(partnerB, null, 2)}

Generate a relationship reflection (about 350–450 words) that weaves both perspectives together. Structure it into exactly 4 sections with clear headings. Use short paragraphs and a blank line between sections.

Section 1 — Shared emotional patterns
Identify themes, feelings, or choices that appear in both partners’ responses. Name what they have in common emotionally.

Section 2 — Where your inner rhythms differ
Note where their images or words diverge. Describe the difference with care, without judging either as right or wrong.

Section 3 — What may be asking for attention
From the combined picture, what tension, need, or possibility seems to be asking for attention in the relationship or in each person?

Section 4 — A gentle direction for growth
Offer one or two gentle, concrete suggestions for how the couple might nurture what emerged—together or individually.

Tone: Calm, psychologically precise, respectful of both partners. Speak to "you" (the couple) in second person. Do not diagnose or prescribe; reflect and invite.
`;
}

async function generateImage(openai, prompt) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
      style: "natural",
    });
    return response.data?.[0]?.url ?? null;
  } catch (e) {
    console.warn("Couple image generation failed:", e.message);
    return null;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { partnerA, partnerB } = body;

    if (!partnerA || !partnerB) {
      return NextResponse.json(
        { error: "partnerA and partnerB answers are required" },
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
    const prompt = buildCouplePrompt(partnerA, partnerB);

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const result = response.output[0].content[0].text;

    const imagePromptA =
      "Serene, abstract visual metaphor for one person's inner emotional landscape. Soft pastel colors, dreamlike, no text, no people.";
    const imagePromptB =
      "Serene, abstract visual metaphor for another person's inner emotional landscape. Soft pastel colors, dreamlike, no text, no people.";
    const imagePromptBetween =
      "Serene, abstract visual metaphor for the emotional field and connection between two people. Soft pastels, space and closeness, no text, no faces.";

    const [innerWorldA, innerWorldB, spaceBetween] = await Promise.all([
      generateImage(openai, imagePromptA),
      generateImage(openai, imagePromptB),
      generateImage(openai, imagePromptBetween),
    ]);

    return NextResponse.json({
      result,
      innerWorldA: innerWorldA ?? null,
      innerWorldB: innerWorldB ?? null,
      spaceBetween: spaceBetween ?? null,
    });
  } catch (error) {
    console.error("Couple analyze error:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
