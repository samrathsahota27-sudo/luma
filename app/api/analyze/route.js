import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  depthModeInstructions,
  readDepthModeFromBody,
} from "@/lib/depthMode";
import { extractOpenAIResponsesText } from "@/lib/aiReflectionOutput";
import { parseStrictJsonObject, validateIndividualStructured } from "@/lib/aiStructuredCards";
import { extractTagSignalsFromSelections, scoreIndividualPatternsTop3 } from "@/lib/patternScoring";
import { matchPatternVariant } from "@/lib/patternVariants";
import { buildDeterministicVariantFallback, variantCopy } from "@/lib/patternVariantCopy";

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
    const signals = extractTagSignalsFromSelections(answers);
    const profile = scoreIndividualPatternsTop3(signals);
    const chosenPattern = profile.primary;
    const variant = matchPatternVariant(chosenPattern.id, signals);
    const variantSeed = variant ? variantCopy[variant] : null;

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

${depthModeInstructions(depthMode)}

CRITICAL — STRICT STRUCTURED OUTPUT (INDIVIDUAL):
Return a single JSON object only. No markdown, no code fences, no text before or after JSON.
Use direct psychological language (attachment, avoidance, control, distance, pursuit). No "vibes/energy/spiritual".
Each string: 1–2 lines max. Short, sharp, honest.

Required JSON schema:
{
  "pattern": "${chosenPattern.name}",
  "description": "When things get close, you go numb — then blame yourself for it.",
  "theme": { "title": "Safety", "subtitle": "protecting yourself" },
  "tone": { "title": "Soft", "subtitle": "not dramatic" },
  "core_line": "You call it 'peace' when it's actually avoidance.",
  "reach": "Less noise. More control. A room you can breathe in.",
  "shift": "A small truth said early — before you disappear."
}

Do NOT include any other keys.`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const raw = extractOpenAIResponsesText(response);
    const parsed = parseStrictJsonObject(raw);
    const structured = validateIndividualStructured(parsed, chosenPattern.name);
    const fallback = buildDeterministicVariantFallback({
      pattern: chosenPattern.name,
      variant,
      theme: { title: "Safety", subtitle: "protecting yourself" },
      tone: { title: "Soft", subtitle: "not dramatic" },
    });
    const finalCard = structured || fallback;

    return NextResponse.json({
      structured: finalCard,
      patternProfile: {
        primary_pattern: profile.primary.name,
        secondary_pattern: profile.secondary.name,
        shadow_pattern: profile.shadow.name,
      },
      ...(variant ? { variant } : {}),
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
    });
  } catch (error) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}

