import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildPrompt } from "@/lib/prompt";
import { depthModeInstructions, normalizeDepthMode } from "@/lib/depthMode";

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const client = new OpenAI({ apiKey });
  const aiResponse = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const outputText = aiResponse.output_text?.trim?.() ?? "";
  if (outputText) {
    return outputText;
  }

  const fallbackText =
    aiResponse?.output?.[0]?.content?.find?.((c) => c?.type === "output_text")?.text ?? "";

  if (!fallbackText || typeof fallbackText !== "string") {
    console.log("AI RAW:", aiResponse);
    throw new Error("OpenAI returned empty output");
  }

  return fallbackText.trim();
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const selections = body?.selections ?? body?.answers;
    if (!selections || typeof selections !== "object") {
      return NextResponse.json({ error: "Missing or invalid selections payload" }, { status: 400 });
    }

    const context = body?.context ?? null;
    const depthMode = normalizeDepthMode(body?.depthMode);
    const contextJson = (() => {
      if (!context || typeof context !== "object") return "";
      try {
        const s = JSON.stringify(context);
        return s.length > 8000 ? `${s.slice(0, 8000)}…` : s;
      } catch {
        return "";
      }
    })();

    const prompt =
      buildPrompt(selections) +
      depthModeInstructions(depthMode) +
      (contextJson
        ? `\n\nRelationship Context:\n${contextJson}\n\nInstructions:\nUse this context to interpret. If context is missing/unknown, say so rather than guessing.`
        : "");
    const result = await callOpenAI(prompt);
    if (!result) {
      throw new Error("AI result was empty");
    }

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("API CRASH:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

