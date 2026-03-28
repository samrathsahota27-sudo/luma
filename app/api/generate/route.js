import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildPrompt } from "@/lib/prompt";
import { buildRound5SpaceBetweenFromAnswersBlock } from "@/lib/reflection/round5OutputGenerator";
import { buildFinalNarrativeFromSelections } from "@/lib/narrative/finalNarrativeEngine";
import {
  depthModeInstructions,
  individualReflectionDepthSuffix,
  readDepthModeFromBody,
} from "@/lib/depthMode";
import { extractOpenAIResponsesText, parseAiReflectionOutput } from "@/lib/aiReflectionOutput";

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

  const outputText = extractOpenAIResponsesText(aiResponse);
  if (!outputText) {
    console.log("AI RAW:", aiResponse);
    throw new Error("OpenAI returned empty output");
  }

  return outputText;
}

export async function POST(req) {
  try {
    const payload = await req.json().catch(() => ({}));
    const selections = payload?.selections ?? payload?.answers;
    if (!selections || typeof selections !== "object") {
      return NextResponse.json({ error: "Missing or invalid selections payload" }, { status: 400 });
    }

    const context = payload?.context ?? null;
    const depthMode = readDepthModeFromBody(payload);
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
      buildPrompt(selections, depthMode) +
      depthModeInstructions(depthMode) +
      individualReflectionDepthSuffix(depthMode) +
      (contextJson
        ? `\n\nRelationship Context:\n${contextJson}\n\nInstructions:\nUse this context to interpret. If context is missing/unknown, say so rather than guessing.`
        : "");
    const raw = await callOpenAI(prompt);
    if (!raw) {
      throw new Error("AI result was empty");
    }

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
    if (!reflectionBody) {
      throw new Error("AI result was empty");
    }

    const round5SpaceBetween = buildRound5SpaceBetweenFromAnswersBlock(selections?.[5]);
    const finalNarrative = buildFinalNarrativeFromSelections(selections);

    return NextResponse.json({
      result: reflectionBody,
      ...(Array.isArray(inSimpleWords) && inSimpleWords.length > 0 ? { inSimpleWords } : {}),
      ...(brutalTruth ? { brutalTruth } : {}),
      ...(emotionalTag ? { emotionalTag } : {}),
      ...(trackerInsight ? { trackerInsight } : {}),
      ...(calendarState ? { calendarState } : {}),
      ...(dangerousQuestion ? { dangerousQuestion } : {}),
      ...(shadowInsight ? { shadowInsight } : {}),
      ...(round5SpaceBetween ? { round5SpaceBetween } : {}),
      finalNarrative,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("API CRASH:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

