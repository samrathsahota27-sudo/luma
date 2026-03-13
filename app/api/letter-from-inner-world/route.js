import OpenAI from "openai";
import { NextResponse } from "next/server";

/**
 * Generates a short reflective "letter" (4–6 lines) from the user's reflection result.
 * Used only for "A Letter From Your Inner World" (individual mode, reflectionCount >= 3).
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { reflectionContent } = body;

    if (!reflectionContent || typeof reflectionContent !== "string") {
      return NextResponse.json(
        { error: "reflectionContent is required" },
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

    const prompt = `You are writing a very short reflective letter (4–6 lines) to the user, as if from their inner world. Base it only on this reflection text:

---
${reflectionContent}
---

Requirements:
- Write 4–6 short lines only.
- Tone: calm, poetic, reflective, emotionally intelligent.
- Speak to the user in second person ("you").
- Do not use analytical or clinical language.
- Example tone: "You often move toward quiet landscapes. There may be a part of you that prefers to observe before stepping forward. Something in your inner world may be preparing for movement."
- Output only the letter text, no heading or quotation marks. Use line breaks between phrases for readability.`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const letter = response.output[0].content[0].text;

    return NextResponse.json({ letter });
  } catch (error) {
    console.error("Letter from inner world error:", error);
    return NextResponse.json(
      { error: "Letter could not be generated" },
      { status: 500 }
    );
  }
}
