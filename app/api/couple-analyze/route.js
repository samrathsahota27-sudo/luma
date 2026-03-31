import OpenAI from "openai";
import { NextResponse } from "next/server";
import { extractOpenAIResponsesText } from "@/lib/aiReflectionOutput";
import { parseStrictJsonObject, validateCoupleStructured } from "@/lib/aiStructuredCards";
import { ARCHETYPE_RULES_FOR_PROMPT } from "@/lib/psychologicalArchetypes";
import { buildCoupleNarrativeFromPartners } from "@/lib/narrative/coupleNarrativeEngine";
import {
  buildConflictSummaryFromCoupleResult,
  buildFutureProjectionFromPartners,
} from "@/lib/narrative/futureProjectionEngine";
import {
  coupleAnalyzeDepthSuffix,
  depthModeInstructions,
  readDepthModeFromBody,
} from "@/lib/depthMode";
import {
  buildDalleCoupleBetweenPrompt,
  buildDalleCoupleInnerWorldPrompt,
} from "@/lib/aiImageGeneration";
import {
  extractTagSignalsFromSelections,
  scoreCouplePatternsTop3,
} from "@/lib/patternScoring";

function buildCouplePrompt(partnerA, partnerB, relationshipDescription) {
  return `
Two partners each completed a 5-round emotional reflection test. Below are their answers.

Partner A answers:
${JSON.stringify(partnerA, null, 2)}

Partner B answers:
${JSON.stringify(partnerB, null, 2)}

The user described their relationship as:
${relationshipDescription || "—"}

User Reflection Context (Round 5, optional user-provided inputs):
- Partner A tags: ${(partnerA?.[5]?.relationshipTags && Array.isArray(partnerA[5].relationshipTags) ? partnerA[5].relationshipTags.join(", ") : "—")}
- Partner A summary: ${partnerA?.[5]?.relationshipSummary || "—"}
- Partner A loves: ${partnerA?.[5]?.lovePart || "—"}
- Partner A missing: ${partnerA?.[5]?.missingPart || "—"}
- Partner A wants change: ${partnerA?.[5]?.changePart || "—"}

- Partner B tags: ${(partnerB?.[5]?.relationshipTags && Array.isArray(partnerB[5].relationshipTags) ? partnerB[5].relationshipTags.join(", ") : "—")}
- Partner B summary: ${partnerB?.[5]?.relationshipSummary || "—"}
- Partner B loves: ${partnerB?.[5]?.lovePart || "—"}
- Partner B missing: ${partnerB?.[5]?.missingPart || "—"}
- Partner B wants change: ${partnerB?.[5]?.changePart || "—"}

Instruction:
Use the user's own words wherever possible. Reference their tags and statements naturally.
Avoid sounding generic. Make it feel like the insight is built from their exact input.
If these fields are empty, do not mention them.

CRITICAL — OUTPUT FORMAT:
Return a single JSON object only. No markdown, no code fences, no text before or after JSON.
Use direct psychological language (attachment, avoidance, control, distance, pursuit). No "vibes/energy/spiritual".
Each string: 1–2 lines max. Short, sharp, honest. No paragraphs.

Required JSON schema (ONLY these keys):
{
  "pattern": "Soft Pursuit",
  "summary": "One reaches gently. The other goes quiet. Both feel rejected.",
  "drift": { "value": 41, "label": "rising slowly" },
  "tension": { "value": 58, "label": "hot/cold" },
  "insight": "When one softens, the other follows—just a beat later.",
  "alignment": 72,
  "distance_signal": "Silence feels like peace for one of you—and punishment for the other."
}

Do NOT include any other keys.
`;
}

async function generateImage(openai, prompt) {
  try {
    // DALL·E 3: no API `negative_prompt`—all exclusions must be in `prompt` (see lib/aiImageGeneration.js).
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
      style: "natural",
      quality: "hd",
    });
    return response.data?.[0]?.url ?? null;
  } catch (e) {
    console.warn("Couple image generation failed:", e.message);
    return null;
  }
}

export async function POST(req) {
  try {
    const payload = await req.json();
    const { partnerA, partnerB } = payload;
    const depthMode = readDepthModeFromBody(payload);

    if (!partnerA || !partnerB) {
      return NextResponse.json(
        { error: "partnerA and partnerB answers are required" },
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
    const round5A =
      partnerA?.[5]?.text ?? partnerA?.[5]?.noneText ?? partnerA?.[5]?.userExplanation ?? "";
    const round5B =
      partnerB?.[5]?.text ?? partnerB?.[5]?.noneText ?? partnerB?.[5]?.userExplanation ?? "";
    const round5MetaParts = [];
    for (const [label, p] of [
      ["Partner A", partnerA],
      ["Partner B", partnerB],
    ]) {
      const b = p?.[5];
      if (!b || typeof b !== "object") continue;
      const id = typeof b.imageId === "string" ? b.imageId.trim() : "";
      const psych = Array.isArray(b.psychologicalTags)
        ? b.psychologicalTags.filter((x) => typeof x === "string" && x.trim())
        : [];
      if (id) round5MetaParts.push(`${label} round5_image_id=${id}`);
      if (psych.length) {
        round5MetaParts.push(`${label} round5_psychological_tags=${psych.join(", ")}`);
      }
    }
    const relationshipDescription = [
      [round5A, round5B].filter((t) => String(t ?? "").trim().length > 0).join(" / "),
      ...round5MetaParts,
    ]
      .filter(Boolean)
      .join(" | ");

    const prompt =
      buildCouplePrompt(partnerA, partnerB, relationshipDescription) +
      depthModeInstructions(depthMode) +
      coupleAnalyzeDepthSuffix(depthMode);

    const signals = [
      ...extractTagSignalsFromSelections(partnerA),
      ...extractTagSignalsFromSelections(partnerB),
    ];
    const profile = scoreCouplePatternsTop3(signals);
    const chosenPattern = profile.primary;

    const strictCardSuffix = `

Selected library pattern (MUST USE EXACT NAME):
- pattern_name: ${chosenPattern.name}
- pattern_core: ${chosenPattern.core}

Secondary influence (mention subtly, not equal to primary):
- secondary_pattern_name: ${profile.secondary.name}
- secondary_pattern_core: ${profile.secondary.core}

Shadow pattern (less obvious; use in distance_signal/insight tension; slightly uncomfortable):
- shadow_pattern_name: ${profile.shadow.name}
- shadow_pattern_core: ${profile.shadow.core}

User signals (tags + words):
${signals.length ? JSON.stringify(signals).slice(0, 6000) : "[]"}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt + strictCardSuffix,
    });

    const raw = extractOpenAIResponsesText(response);
    const parsed = parseStrictJsonObject(raw);
    const card = validateCoupleStructured(parsed, chosenPattern.name);
    if (!card) {
      return NextResponse.json({ error: "AI returned invalid structured JSON" }, { status: 500 });
    }

    const imagePromptA = buildDalleCoupleInnerWorldPrompt(
      "One partner's inner emotional world—pure abstraction and atmosphere; no human figures, faces, or bodies; soft pastels and depth welcome when they serve the mood."
    );
    const imagePromptB = buildDalleCoupleInnerWorldPrompt(
      "The other partner's inner emotional world—pure abstraction and atmosphere; no human figures, faces, or bodies; soft pastels and depth welcome when they serve the mood."
    );
    const imagePromptBetween = buildDalleCoupleBetweenPrompt(
      relationshipDescription || "the sense of space and closeness between them"
    );

    const [innerWorldA, innerWorldB, spaceBetween] = await Promise.all([
      generateImage(openai, imagePromptA),
      generateImage(openai, imagePromptB),
      generateImage(openai, imagePromptBetween),
    ]);

    const coupleNarrative = buildCoupleNarrativeFromPartners(
      partnerA,
      partnerB,
      depthMode
    );

    const conflictSummary = buildConflictSummaryFromCoupleResult({
      brutalTruth: null,
      conflictFrictionPoints: null,
    });
    const futureProjection = buildFutureProjectionFromPartners(
      partnerA,
      partnerB,
      conflictSummary,
      null,
      depthMode
    );

    return NextResponse.json({
      structured: card,
      patternProfile: {
        primary_pattern: profile.primary.name,
        secondary_pattern: profile.secondary.name,
        shadow_pattern: profile.shadow.name,
      },
      patternId: chosenPattern.id,
      // Legacy text field for existing UI; derived from the structured card.
      result: [
        `Shared pattern: “${card.pattern}”`,
        card.summary,
        "",
        `Drift: ${card.drift.value}% (${card.drift.label})`,
        `Tension: ${card.tension.value}% (${card.tension.label})`,
        "",
        `One shared insight: ${card.insight}`,
        `Alignment: ${card.alignment}%`,
        `Distance signal: ${card.distance_signal}`,
      ].join("\n"),
      innerWorldA: innerWorldA ?? null,
      innerWorldB: innerWorldB ?? null,
      spaceBetween: spaceBetween ?? null,
      coupleNarrative,
      futureProjection,
    });
  } catch (error) {
    console.error("Couple analyze error:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
