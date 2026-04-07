import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const payload = await req.json().catch(() => ({}));
    const prompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
      style: "natural",
      quality: "standard",
    });

    const imageUrl = response.data?.[0]?.url ?? null;
    if (!imageUrl) {
      return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, imageUrl });
  } catch (e) {
    console.error("generate-image route:", e);
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}
