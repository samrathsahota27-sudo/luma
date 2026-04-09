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
import { extractOpenAIResponsesText } from "@/lib/aiReflectionOutput";
import {
  parseStrictJsonObject,
  validateIndividualStructured,
} from "@/lib/aiStructuredCards";
import {
  extractTagSignalsFromSelections,
  scoreIndividualPatternsTop3,
} from "@/lib/patternScoring";
import { matchPatternVariant } from "@/lib/patternVariants";
import { buildDeterministicVariantFallback, variantCopy } from "@/lib/patternVariantCopy";
import { deriveThemeTone } from "@/lib/themeTone";
import { buildGuidingReflection } from "@/lib/guidingReflection";
import { derivePatternLabel } from "@/lib/patternLabel";
import { createClient } from "@/lib/supabase/server";
import { buildSoloReflectionPrompt } from "@/lib/soloReflectionPrompt";

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
    console.log("🔴 GENERATE ROUTE HIT");
    const payload = await req.json().catch(() => ({}));
    const selections = payload?.selections ?? payload?.answers;
    if (!selections || typeof selections !== "object") {
      return NextResponse.json({ error: "Missing or invalid selections payload" }, { status: 400 });
    }

    const signals = extractTagSignalsFromSelections(selections);
    const profile = scoreIndividualPatternsTop3(signals);
    const chosenPattern = profile.primary;
    const variant = matchPatternVariant(chosenPattern.id, signals);
    const variantSeed = variant ? variantCopy[variant] : null;
    const micro = deriveThemeTone(signals);
    const patternLabel = derivePatternLabel({ signals, selections });

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

    const prompt = buildSoloReflectionPrompt({
      selections,
      patternLabel,
      depthInstructions: depthModeInstructions(depthMode),
      contextJson,
    });
    // Temporary debug logs requested.
    console.log("[solo-reflection][final-prompt]", prompt);
    const raw = await callOpenAI(prompt);
    console.log("[solo-reflection][final-response]", raw);
    if (!raw) {
      throw new Error("AI result was empty");
    }

    const parsed = parseStrictJsonObject(raw);
    const card = validateIndividualStructured(parsed, null);
    const fallback = buildDeterministicVariantFallback({
      pattern: patternLabel,
      variant,
      theme: micro.theme,
      tone: micro.tone,
    });
    const finalCard = (() => {
      const base = card || fallback;
      // Enforce deterministic theme/tone regardless of model drift.
      return {
        ...base,
        pattern: patternLabel,
        theme: micro.theme,
        tone: micro.tone,
      };
    })();

    const round5SpaceBetween = buildRound5SpaceBetweenFromAnswersBlock(selections?.[5]);
    const finalNarrative = buildFinalNarrativeFromSelections(selections);
    const guidingReflection = buildGuidingReflection({
      pattern: finalCard.pattern,
      signals,
    });
    const fullInsight = [
      `Pattern: ${finalCard.pattern}`,
      finalCard.description,
      `Theme: ${finalCard.theme.title} — ${finalCard.theme.subtitle}`,
      `Tone: ${finalCard.tone.title} — ${finalCard.tone.subtitle}`,
      `One line you'll keep hearing: ${finalCard.core_line}`,
      `What you reach for: ${finalCard.reach}`,
      `What shifts this: ${finalCard.shift}`,
    ]
      .filter((line) => typeof line === "string" && line.trim().length > 0)
      .join("\n\n");
    const fullTextResponse = raw;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("🔴 User in generate:", user?.id ?? "NULL", authError?.message ?? "no auth error");

    if (user) {
      try {
        const newEntry = {
          date: new Date().toISOString(),
          pattern: finalCard?.pattern ?? card?.pattern,
          description: finalCard?.description ?? card?.description,
          theme: finalCard?.theme ?? card?.theme,
          core_line: finalCard?.core_line ?? card?.core_line,
          fullInsight,
          full_text_response: fullTextResponse,
        };

        console.log("🔴 SAVING ENTRY:", newEntry);

        const { data: existingProfile } = await supabase
          .from("user_profiles")
          .select("pattern_history")
          .eq("id", user.id)
          .single();

        const currentHistory = existingProfile?.pattern_history || [];

        const { error: saveError } = await supabase
          .from("user_profiles")
          .upsert({
            id: user.id,
            email: user.email,
            pattern_history: [...currentHistory, newEntry].slice(-50),
            last_updated: new Date().toISOString(),
          });

        console.log("🔴 SAVE ERROR:", saveError?.message ?? "none");
      } catch (e) {
        console.error("🔴 SAVE CRASH:", e.message);
      }
    }

    return NextResponse.json({
      structured: finalCard,
      fullInsight,
      full_text_response: fullTextResponse,
      patternProfile: {
        primary_pattern: profile.primary.name,
        secondary_pattern: profile.secondary.name,
        shadow_pattern: profile.shadow.name,
      },
      patternId: chosenPattern.id,
      ...(variant ? { variant } : {}),
      // Legacy text field for existing UI; derived from the structured card.
      result: [
        `Pattern: “${finalCard.pattern}”`,
        finalCard.description,
        "",
        `Theme: ${finalCard.theme.title} — ${finalCard.theme.subtitle}`,
        `Tone: ${finalCard.tone.title} — ${finalCard.tone.subtitle}`,
        "",
        `One line you'll keep hearing: ${finalCard.core_line}`,
        `What you reach for: ${finalCard.reach}`,
        `What shifts it: ${finalCard.shift}`,
      ].join("\n"),
      ...(round5SpaceBetween ? { round5SpaceBetween } : {}),
      finalNarrative,
      guidingReflection,
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

