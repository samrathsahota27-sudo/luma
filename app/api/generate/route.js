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

    const prompt = `
You are augmenting a deterministic pattern system. You are NOT allowed to invent or rename patterns.

Selected library pattern (MUST USE EXACT NAME):
- pattern_name: ${chosenPattern.name}
- pattern_core: ${chosenPattern.core}

Variant (MUST influence wording; do not reuse generic lines):
- variant: ${variant || "none"}
- variant_nuance: ${variantSeed?.nuance || "—"}
- variant_seed_phrasing (use or paraphrase; must feel distinct for this variant):
  - description_seed: ${variantSeed?.description || "—"}
  - core_line_seed: ${variantSeed?.core_line || "—"}
  - reach_seed: ${variantSeed?.reach || "—"}
  - shift_seed: ${variantSeed?.shift || "—"}

Secondary influence (mention subtly, not equal to primary):
- secondary_pattern_name: ${profile.secondary.name}
- secondary_pattern_core: ${profile.secondary.core}

Shadow pattern (less obvious; use in mirror_line tension; slightly uncomfortable):
- shadow_pattern_name: ${profile.shadow.name}
- shadow_pattern_core: ${profile.shadow.core}

User signals (tags + words):
${signals.length ? JSON.stringify(signals).slice(0, 6000) : "[]"}

Optional relationship context:
${contextJson || "—"}

${depthModeInstructions(depthMode)}

Write short, sharp lines. No paragraphs. No extra keys.
Forbidden phrasing: "this suggests", "you tend to".
No vague words ("vibes", "energy", "spiritual").
`;

    const structuredSuffix = `

CRITICAL — STRICT STRUCTURED OUTPUT (INDIVIDUAL, UI-ALIGNED):
Return a single JSON object only. No markdown, no code fences, no text before or after JSON.
Use direct psychological language (attachment, avoidance, control, distance, pursuit). No "vibes/energy/spiritual".
Each string: 1–2 lines max. Short, sharp, honest.

Required JSON schema:
{
  "pattern": "${patternLabel}",
  "description": "When things get close, you go numb — then blame yourself for it.",
  "theme": { "title": "${micro.theme.title}", "subtitle": "${micro.theme.subtitle}" },
  "tone": { "title": "${micro.tone.title}", "subtitle": "${micro.tone.subtitle}" },
  "core_line": "You call it 'peace' when it's actually avoidance.",
  "reach": "Less noise. More control. A room you can breathe in.",
  "shift": "A small truth said early — before you disappear."
}

Do NOT include any other keys.`;

    const raw = await callOpenAI(prompt + structuredSuffix);
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

