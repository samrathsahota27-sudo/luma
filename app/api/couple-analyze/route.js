import OpenAI from "openai";
import { NextResponse } from "next/server";
import { extractOpenAIResponsesText, parseAiReflectionOutput } from "@/lib/aiReflectionOutput";
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

function buildCouplePrompt(partnerA, partnerB, relationshipDescription) {
  return `
Two partners each completed a 5-round emotional reflection test. Below are their answers.

Partner A answers:
${JSON.stringify(partnerA, null, 2)}

Partner B answers:
${JSON.stringify(partnerB, null, 2)}

The user described their relationship as:
${relationshipDescription || "—"}

Generate a relationship reflection (about 350–450 words) that weaves both perspectives together. Structure it into exactly 4 sections with clear headings. Use short paragraphs and a blank line between sections.

Section 1 — Shared emotional patterns
Identify themes, feelings, or choices that appear in both partners’ responses. Name what they have in common emotionally.

Section 2 — Where your inner rhythms differ
Note where their images or words diverge. Describe the difference with care, without judging either as right or wrong.

Section 3 — What may be asking for attention
From the combined picture, what tension, need, or possibility seems to be asking for attention in the relationship or in each person?
Use the Round 5 relationship-space description above to ground what feels close vs. distant, present vs. missing, within the “space between you both”.

Section 4 — A gentle direction for growth
Offer one or two gentle, concrete suggestions for how the couple might nurture what emerged—together or individually.

Tone: Calm, psychologically precise, respectful of both partners. Speak to "you" (the couple) in second person. Do not diagnose or prescribe; reflect and invite.

Identity-based language (for reflection body, brutalTruth, trackerInsight, shadowInsight, conflictFrictionPoints, dangerousQuestion):
- Use habit phrasing that feels personally seen: e.g. "You both tend to…", "You often…", "One of you tends to… while the other…", "You reach for…", "You avoid naming…" — vary stems; do not repeat the same opening every time.
- Anchor each claim in behaviors or dynamics visible in their answers—not generic couple traits ("You are both communicators") or empty praise.
- personA / personB lines in conflictFrictionPoints should describe how each partner shows up in that slice (behavioral), using "tends to" / "often" where natural; mismatch explains mechanics, not blame.
- Forbidden: vague personality labels, horoscope tone, or filler with no specific read of their data.

CRITICAL — OUTPUT FORMAT:
Return a single JSON object only. No markdown code fences, no text before or after the JSON.

Required keys:
- "brutalTruth": one sentence only (about 12–22 words). Direct, emotionally sharp, slightly uncomfortable, honest but never insulting. Names the core tension between these two people (e.g. both talking, neither feeling heard; conflict avoided while resentment builds). Not generic or soft.
- "emotionalTag": 2–5 words, shared relationship mood label for a timeline (e.g. "Pursue–withdraw loop", "Parallel loneliness"). Not generic.
- "trackerInsight": one line max ~100 characters—relationship snapshot for a pattern card; second person plural ("you"); identity-habit phrasing when it fits ("You both tend to…" / "You often…"); scannable; grounded in their answers.
- "calendarState": exactly one of "calm" | "friction" | "distance" | "clarity" for this couple snapshot (same definitions as solo: calm / friction / distance / clarity).
- "reflection": string containing the full woven reflection (all four sections with headings and blank lines between sections, same length target as above). Preserve newlines inside this string.
- "dangerousQuestion": REQUIRED. Exactly one short question (one sentence, must end with ?). For both of you—name a specific tension from their answers; invites honest conversation, slightly uncomfortable but fair. Not cruel or shaming. Not generic ("How do you feel about this?"). Examples: "What are you each afraid will happen if you stop editing what you say?"; "When did you last feel they were really listening—not just waiting to respond?"
- "shadowInsight": one or two short sentences (max ~220 characters). Something you both may be avoiding or not fully seeing—specific to their answers, not generic. ~70% naming the relational pattern (behavior + cost) and ~30% grounding or reframe. No harsh labels; behaviors and interpretations only. Speak to "you" as the couple.

Do not repeat brutalTruth, emotionalTag, trackerInsight, dangerousQuestion, shadowInsight, or the conflictFrictionPoints rows inside "reflection".

${ARCHETYPE_RULES_FOR_PROMPT}

Also include these keys (required). Each value must be 1–2 short sentences, max ~220 characters, for mobile. Ground them in the reflection and Round 5 descriptions—tie visuals to emotional patterns using the vocabulary above. Speak to the couple as "you" for mapReadBetween; for inner worlds use "this landscape" / "this side" (not diagnosis).
- "mapReadInnerA": why Partner A's inner-world image would look the way it does (e.g. jagged vs smooth, fade, distance, overlap, repetition).
- "mapReadInnerB": same for Partner B.
- "mapReadBetween": why the shared "space between" image fits what lives between you (e.g. fading link vs clear bridge, spikes in the middle ground).
- "conflictFrictionPoints": JSON array of exactly 2 or 3 objects (no more, no fewer when possible). Each object MUST have: "personA" (one short sentence, ≤120 chars)—how Partner A shows up in that slice; "personB" (same for Partner B); "mismatch" (one sentence, ≤160 chars)—why those two styles create repeated friction or misunderstanding (mechanics, not blame). Cover different angles across rows: communication style, emotional expression, conflict response, and/or needs vs behavior. Do not use harsh labels. Keep personA and personB parallel (both about behavior), put the contrast in "mismatch".
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

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const raw = extractOpenAIResponsesText(response);
    const {
      brutalTruth,
      body: reflectionBody,
      emotionalTag,
      trackerInsight,
      calendarState,
      dangerousQuestion,
      shadowInsight,
      mapReadInnerA,
      mapReadInnerB,
      mapReadBetween,
      conflictFrictionPoints,
    } = parseAiReflectionOutput(raw);
    const result = reflectionBody || raw;
    if (!result) {
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
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
      brutalTruth,
      conflictFrictionPoints,
    });
    const futureProjection = buildFutureProjectionFromPartners(
      partnerA,
      partnerB,
      conflictSummary,
      null,
      depthMode
    );

    return NextResponse.json({
      result,
      ...(brutalTruth ? { brutalTruth } : {}),
      ...(emotionalTag ? { emotionalTag } : {}),
      ...(trackerInsight ? { trackerInsight } : {}),
      ...(calendarState ? { calendarState } : {}),
      ...(dangerousQuestion ? { dangerousQuestion } : {}),
      ...(shadowInsight ? { shadowInsight } : {}),
      ...(mapReadInnerA ? { mapReadInnerA } : {}),
      ...(mapReadInnerB ? { mapReadInnerB } : {}),
      ...(mapReadBetween ? { mapReadBetween } : {}),
      ...(conflictFrictionPoints?.length ? { conflictFrictionPoints } : {}),
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
