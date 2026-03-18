import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt";

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`OpenAI request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const result = data?.output?.[0]?.content?.[0]?.text ?? "";
  return result;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const selections = body?.selections ?? body?.answers;

    const prompt = buildPrompt(selections);
    const result = await callOpenAI(prompt);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}

