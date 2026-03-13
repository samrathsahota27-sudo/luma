import OpenAI from "openai";
import { NextResponse } from "next/server";

/**
 * Compares a user's previous reflection with their current one and returns
 * a short, reflective description of how their inner landscape may have shifted.
 * Used only for the "Your Inner Shift" section (returning users).
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { previousContent, currentContent } = body;

    if (!previousContent || !currentContent) {
      return NextResponse.json(
        { error: "previousContent and currentContent are required" },
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

    const prompt = `You are writing a brief, reflective note for someone who has just completed a second reflection experience. They have two reflections to compare:

PREVIOUS REFLECTION:
${previousContent}

CURRENT REFLECTION:
${currentContent}

Write 2–4 short sentences that describe how their inner landscape may have shifted between then and now. Use a calm, poetic, reflective tone. Speak directly to the user ("you"). Do not analyze clinically or use jargon. Do not repeat the reflections verbatim. Focus on the emotional quality and subtle movement—what might be beginning to change, what feels different. Example tone: "Last time your reflection suggested a quiet observational state. This time your choices feel slightly more open and curious. Something in your inner landscape may be beginning to move."

Output only the comparison text, no heading or label.`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const comparison = response.output[0].content[0].text;

    return NextResponse.json({ comparison });
  } catch (error) {
    console.error("Compare reflections error:", error);
    return NextResponse.json(
      { error: "Comparison could not be generated" },
      { status: 500 }
    );
  }
}
