import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt";

export async function POST(req) {
  try {
    const { answers } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("AI ERROR: Missing OPENAI_API_KEY");
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY on the server." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const prompt = buildPrompt(answers);

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const result = response.output[0].content[0].text;

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}

