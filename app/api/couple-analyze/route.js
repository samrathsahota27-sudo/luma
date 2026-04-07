import OpenAI from "openai";
import { NextResponse } from "next/server";
import { extractOpenAIResponsesText } from "@/lib/aiReflectionOutput";
import { validateCoupleStructured } from "@/lib/aiStructuredCards";
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
import { createClient } from "@/lib/supabase/server";

function extractJSON(text) {
  const t = String(text ?? "");
  const firstBrace = t.indexOf("{");
  const lastBrace = t.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON found in AI response");
  }
  return t.slice(firstBrace, lastBrace + 1);
}

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
Return ONLY valid JSON. Do not include explanations, text, or formatting outside JSON.
Use direct psychological language (attachment, avoidance, control, distance, pursuit). No "vibes/energy/spiritual".
Each string: 1–2 lines max. Short, sharp, honest. No paragraphs.

Required JSON schema:
{
  "pattern": "Soft Pursuit",
  "summary": "One reaches gently. The other goes quiet. Both feel rejected.",
  "drift": { "value": 41, "label": "rising slowly" },
  "tension": { "value": 58, "label": "hot/cold" },
  "insight": "When one softens, the other follows—just a beat later.",
  "alignment": 72,
  "distance_signal": "Silence feels like peace for one of you—and punishment for the other.",
  "differences": [
    { "label": "How you handle conflict", "description": "One sentence showing how they diverge." },
    { "label": "Short title", "description": "One sentence showing how they diverge." },
    { "label": "Short title", "description": "One sentence showing how they diverge." }
  ],
  "riskPatterns": [
    { "label": "Short title", "description": "One honest sentence about what could go wrong." },
    { "label": "Short title", "description": "One honest sentence about what could go wrong." }
  ],
  "whatHelps": [
    "One concrete actionable suggestion — no therapy speak.",
    "One concrete actionable suggestion — no therapy speak.",
    "One concrete actionable suggestion — no therapy speak."
  ],
  "partnerDecoder": {
    "partnerA": "One paragraph about how Partner A processes emotion and what they need.",
    "partnerB": "One paragraph about how Partner B processes emotion and what they need.",
    "whenTheyMeet": "One paragraph about what happens when these two patterns interact."
  },
  "frictionMap": [{ "title": "Short title", "text": "1–2 lines of contrast, specific to them." }],
  "bridge": [{ "title": "Doable move", "text": "1–2 lines, concrete and non-generic." }],
  "decoder": "Partner A: ...\n\nPartner B: ...\n\nWhen you meet: ..."
}

Extra requirements:
- differences: exactly 3 items; specific to their image choices; not generic.
- riskPatterns: 2–3 items; honest, slightly uncomfortable; not alarmist.
- whatHelps: exactly 3 items. Each must be a direct directive, not advice. Format each as:
  'Partner A: [exact action in plain words]' or
  'Partner B: [exact action in plain words]' or
  'Both: [exact shared action]'
  Use the fewest words possible.
  Make it something they can do tonight.
  No words like: consider, try, explore, practice, communicate, validate, journey, reflect.
  Wrong: 'Partner A should try to name their feelings'
  Right: 'Partner A: Say I am overwhelmed before you go quiet'
- partnerDecoder: warm but honest; write in second person (e.g. "Partner A tends to...").
- frictionMap: 2–3 items; title + 1–2 line contrast; no generic "you’re different" statements.
- bridge: 2–3 items; concrete + specific; no generic advice.
- decoder: a single string with 3 short paragraphs (Partner A / Partner B / When you meet). No bullets.

You may include both the legacy deep-insight fields (differences/whatHelps/partnerDecoder) and the new ones (frictionMap/bridge/decoder). If you include both, make them consistent.
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
      quality: "standard",
    });
    return response.data?.[0]?.url ?? null;
  } catch (e) {
    console.warn("Couple image generation failed:", e.message);
    return null;
  }
}

const interpretImage = async (openai, imageUrl, role, patternName) => {
  if (!imageUrl) return null;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
            {
              type: "text",
              text: `This is ${role} in a couple emotional reflection for the pattern "${patternName}".
In 2-3 short sentences, interpret what the specific colors, shapes and movement in this image represent emotionally.
Be specific to what you actually see — name actual colors and forms.
No generic statements. No "this represents".
Write directly: "The deep red at the center..." "The soft blue edges..." etc.
Keep it under 60 words.`,
            },
          ],
        },
      ],
    });
    return response.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.warn("Image interpretation failed:", e.message);
    return null;
  }
};

export async function POST(req) {
  try {
    console.log("🔴 COUPLE ANALYZE ROUTE HIT");
    const request = req;
    console.log("=== API ROUTE HIT ===");
    console.log("Cookies:", request.headers.get("cookie")?.slice(0, 100));
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    console.log("User in API:", user?.id ?? "NULL", error?.message ?? "no error");

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

    const rawText = extractOpenAIResponsesText(response);
    let parsed = null;
    try {
      const cleaned = extractJSON(rawText);
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("RAW AI RESPONSE:", rawText);
      try {
        console.error("CLEANED:", extractJSON(rawText));
      } catch {
        /* ignore */
      }
      throw new Error("Invalid JSON from AI");
    }

    const card = validateCoupleStructured(parsed, chosenPattern.name);
    if (!card) {
      return NextResponse.json({ error: "AI returned invalid structured JSON" }, { status: 500 });
    }

    if (user) {
      try {
        // First try to get existing profile
        const { data: existingProfile, error: fetchError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        console.log("Existing profile:", existingProfile, fetchError);

        if (fetchError?.code === "PGRST116") {
          // Profile doesn't exist yet — create it first
          await supabase.from("user_profiles").insert({
            id: user.id,
            email: user.email,
            pattern_history: [],
            couple_sessions: [],
          });
        }

        const coupleEntry = {
          date: new Date().toISOString(),
          pattern: card.pattern,
          summary: card.summary,
          drift: card.drift,
          tension: card.tension,
          alignment: card.alignment,
          insight: card.insight,
        };

        const currentHistory = existingProfile?.couple_sessions || [];
        console.log("🔴 ABOUT TO SAVE PROFILE");
        console.log("🔴 User ID:", user?.id);
        console.log("🔴 User email:", user?.email);

        const { error: saveError } = await supabase
          .from("user_profiles")
          .update({
            couple_sessions: [...currentHistory, coupleEntry].slice(-20),
            last_updated: new Date().toISOString(),
          })
          .eq("id", user.id);

        console.log("🔴 SAVE COMPLETE - error:", saveError);
      } catch (e) {
        console.error("PROFILE SAVE ERROR:", {
          message: e.message,
          code: e.code,
          details: e.details,
          hint: e.hint,
        });
        // Do not throw — result should still return
      }
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
    const [interpretA, interpretB, interpretBetween] = await Promise.all([
      interpretImage(openai, innerWorldA, "Partner A's inner world", card.pattern),
      interpretImage(openai, innerWorldB, "Partner B's inner world", card.pattern),
      interpretImage(openai, spaceBetween, "the space between the couple", card.pattern),
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
      imageInterpretA: interpretA ?? null,
      imageInterpretB: interpretB ?? null,
      imageInterpretBetween: interpretBetween ?? null,
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
