import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt";
import {
  depthModeInstructions,
  individualReflectionDepthSuffix,
  readDepthModeFromBody,
} from "@/lib/depthMode";
import { extractOpenAIResponsesText, parseAiReflectionOutput } from "@/lib/aiReflectionOutput";

export async function POST(req) {
  try {
    const payload = await req.json().catch(() => ({}));
    const answers = payload?.answers;
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Missing or invalid answers" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("AI ERROR: Missing OPENAI_API_KEY");
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY on the server." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const depthMode = readDepthModeFromBody(payload);
    const prompt =
      buildPrompt(answers, depthMode) +
      depthModeInstructions(depthMode) +
      individualReflectionDepthSuffix(depthMode);

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const raw = extractOpenAIResponsesText(response);
    const {
      brutalTruth,
      body: reflectionBody,
      inSimpleWords,
      emotionalTag,
      trackerInsight,
      calendarState,
      dangerousQuestion,
      shadowInsight,
    } = parseAiReflectionOutput(raw);
    const result = reflectionBody || raw;
    if (!result) {
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    return NextResponse.json({
      result,
      ...(Array.isArray(inSimpleWords) && inSimpleWords.length > 0 ? { inSimpleWords } : {}),
      ...(brutalTruth ? { brutalTruth } : {}),
      ...(emotionalTag ? { emotionalTag } : {}),
      ...(trackerInsight ? { trackerInsight } : {}),
      ...(calendarState ? { calendarState } : {}),
      ...(dangerousQuestion ? { dangerousQuestion } : {}),
      ...(shadowInsight ? { shadowInsight } : {}),
    });
  } catch (error) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}

