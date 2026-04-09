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

function oneLine(text, fallback = "") {
  const t = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return t || fallback;
}

function buildCoupleFallbackCard({ chosenPattern, profile, rawText }) {
  const patternName = String(chosenPattern?.name || "Shared Pattern").trim();
  const patternCore = oneLine(chosenPattern?.core, "You move toward connection differently under pressure.");
  const secondaryCore = oneLine(
    profile?.secondary?.core,
    "A secondary pattern adds mixed timing in how each of you reaches out."
  );
  const shadowCore = oneLine(
    profile?.shadow?.core,
    "Under strain, both of you can misread silence and intent."
  );
  const rawLead = oneLine(rawText?.split(/\n+/)?.[0], "");

  return {
    pattern: patternName,
    summary: oneLine(
      rawLead,
      `${patternCore} ${secondaryCore}`.slice(0, 220)
    ),
    drift: { value: 56, label: "elevated" },
    tension: { value: 62, label: "active friction" },
    insight: oneLine(shadowCore, "You care about each other, but your repair timing is misaligned."),
    alignment: 54,
    distance_signal:
      "Silence creates opposite meanings for each of you, so both can feel unseen at the same time.",
    differences: [
      {
        label: "How you signal distress",
        description: "One goes quiet to regulate; the other seeks contact to feel safe.",
      },
      {
        label: "How repair starts",
        description: "One needs space first, while the other needs reassurance first.",
      },
      {
        label: "How intent is read",
        description: "Protective distance can be read as rejection, not care.",
      },
    ],
    riskPatterns: [
      {
        label: "Timing mismatch",
        description: "You can miss each other at the exact moment repair is possible.",
      },
      {
        label: "Meaning drift",
        description: "The same silence gets interpreted in opposite ways.",
      },
    ],
    whatHelps: ["Name the silence early.", "Ask what was heard.", "Repair before shutdown."],
    partnerDecoder: {
      partnerA:
        "Partner A tends to regulate inward first, then reconnect once pressure drops.",
      partnerB:
        "Partner B tends to seek immediate signal and reassurance before calming.",
      whenTheyMeet:
        "When these styles meet without naming them, both feel misread despite good intent.",
    },
    frictionMap: [
      {
        title: "Silence vs signal",
        text: "Quiet can feel stabilizing for one and abandoning for the other.",
      },
      {
        title: "Pace mismatch",
        text: "One slows down to process while the other speeds up to repair.",
      },
    ],
    bridge: [
      { title: "Name intent first", text: "Say what your silence or urgency means before reacting." },
      { title: "Set repair timing", text: "Agree on when to revisit the hard moment the same day." },
    ],
    decoder:
      "Partner A: You protect connection by stepping inward first, then returning once you feel organized.\n\n" +
      "Partner B: You protect connection by moving toward contact quickly to prevent emotional distance.\n\n" +
      "When you meet: Your care strategies collide on timing, not love; naming that timing gap early changes the outcome.",
  };
}

function buildEmergencyCoupleCard() {
  return {
    pattern: "Shared Pattern",
    summary: "Your emotional timing is misaligned under pressure, even when intent is good.",
    drift: { value: 55, label: "elevated" },
    tension: { value: 60, label: "active friction" },
    insight: "You both protect the bond differently, which can look like rejection in the moment.",
    alignment: 52,
    distance_signal:
      "Silence carries opposite meanings for each of you, so both can feel alone at once.",
    differences: [
      {
        label: "Signal mismatch",
        description: "One withdraws to regulate while the other reaches out to stabilize.",
      },
      {
        label: "Repair timing",
        description: "You look for repair at different moments after conflict.",
      },
      {
        label: "Intent vs impact",
        description: "Protective behavior is often interpreted as disconnection.",
      },
    ],
    riskPatterns: [
      {
        label: "Escalation loop",
        description: "Misread timing can turn small misses into repeated friction.",
      },
      {
        label: "Distance drift",
        description: "Unspoken assumptions accumulate when signals stay unnamed.",
      },
    ],
    whatHelps: ["Name intent early.", "Ask what was heard.", "Repair before shutdown."],
    partnerDecoder: {
      partnerA: "Partner A tends to process inward first, then reconnect after pressure drops.",
      partnerB: "Partner B tends to seek immediate signal to feel emotionally secure.",
      whenTheyMeet: "Without naming this timing gap, both of you can feel unseen despite caring.",
    },
    frictionMap: [
      { title: "Silence gap", text: "Quiet can soothe one person and alarm the other." },
      { title: "Pace conflict", text: "One slows down while the other pushes for contact." },
    ],
    bridge: [
      { title: "State intent", text: "Say what your silence or urgency means before reacting." },
      { title: "Set repair time", text: "Agree on a same-day time to revisit hard moments." },
    ],
    decoder:
      "Partner A: You protect connection by stepping inward first and returning when you feel clearer.\n\n" +
      "Partner B: You protect connection by seeking immediate signs of care and reassurance.\n\n" +
      "When you meet: Your strategies clash on timing, not love; naming the timing gap changes the outcome.",
  };
}

function deriveCouplePersona({ tension, drift, alignment }) {
  const t = Number.isFinite(Number(tension)) ? Number(tension) : 0;
  const d = Number.isFinite(Number(drift)) ? Number(drift) : 0;
  const a = Number.isFinite(Number(alignment)) ? Number(alignment) : 0;

  if (t >= 65 && a >= 50) {
    return {
      name: "The High-Frequency Loopers",
      description:
        "You stay highly engaged, but intensity keeps pulling you into repeat conflict loops.",
    };
  }
  if (d >= 60 || a <= 45) {
    return {
      name: "The Parallel Voyagers",
      description:
        "You move side by side with too little overlap, so distance grows without loud conflict.",
    };
  }
  if (a >= 62 && t <= 52 && d <= 52) {
    return {
      name: "The Silent Guardians",
      description:
        "You protect the bond by holding things in — until it quietly builds pressure.",
    };
  }
  if (t >= 55 && a >= 56) {
    return {
      name: "The Friction Pair",
      description:
        "There is heat and loyalty here; you clash hard, then pull each other back in.",
    };
  }
  return {
    name: "The Silent Guardians",
    description:
      "You keep the relationship stable by containing discomfort, which can turn honesty into delay.",
  };
}

function buildCouplePrompt(partnerA, partnerB, relationshipDescription) {
  const imageA =
    (typeof partnerA?.[5]?.imageId === "string" && partnerA[5].imageId.trim()) ||
    (typeof partnerA?.[5]?.selectedImageId === "number" ? `#${partnerA[5].selectedImageId + 1}` : "unknown");
  const imageB =
    (typeof partnerB?.[5]?.imageId === "string" && partnerB[5].imageId.trim()) ||
    (typeof partnerB?.[5]?.selectedImageId === "number" ? `#${partnerB[5].selectedImageId + 1}` : "unknown");
  const optionalA = (
    partnerA?.[5]?.text ??
    partnerA?.[5]?.noneText ??
    partnerA?.[5]?.userExplanation ??
    ""
  )
    .toString()
    .trim();
  const optionalB = (
    partnerB?.[5]?.text ??
    partnerB?.[5]?.noneText ??
    partnerB?.[5]?.userExplanation ??
    ""
  )
    .toString()
    .trim();

  return `
SYSTEM PROMPT:
You analyze relational dynamics between two people based on their choices.
You do NOT summarize.
You reveal patterns between them.

INPUT:
- Partner A image: ${imageA}
- Partner B image: ${imageB}
- Optional texts:
  - Partner A: ${optionalA || "—"}
  - Partner B: ${optionalB || "—"}

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

OUTPUT STRUCTURE (MANDATORY reasoning map):
1. Contrast
2. Hidden Dynamic
3. Tension Point
4. Connection Potential
5. One Sharp Insight (power line)

CRITICAL — OUTPUT FORMAT:
Return a single JSON object only. No markdown, no code fences, no text before or after JSON.
Return ONLY valid JSON. Do not include explanations, text, or formatting outside JSON.
Use direct psychological language (attachment, avoidance, control, distance, pursuit). No "vibes/energy/spiritual".
Tone: insightful, slightly confronting, emotionally precise.
MUST compare A vs B directly (not separate standalone analyses).
MUST mention both image choices explicitly.
NO generic relationship advice. NO clichés like "communication is key".
The long-form narrative ("decoder") must be 180–250 words.

ALL fields in the schema below are REQUIRED. Do NOT omit any field. Every key must be present in your response.

Required JSON schema (every field is mandatory):
{
  "pattern": "Soft Pursuit",
  "summary": "Contrast: one concise comparative read of A vs B (must mention both image choices explicitly).",
  "drift": { "value": 41, "label": "rising slowly" },
  "tension": { "value": 58, "label": "hot/cold" },
  "insight": "Hidden Dynamic: what happens when these two styles interact.",
  "alignment": 72,
  "distance_signal": "Tension Point: where misunderstanding/conflict is most likely.",
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
    "Say it earlier.",
    "Break the silence first.",
    "Name the need directly."
  ],
  "partnerDecoder": {
    "partnerA": "One paragraph about how Partner A processes emotion and what they need.",
    "partnerB": "One paragraph about how Partner B processes emotion and what they need.",
    "whenTheyMeet": "One paragraph about what happens when these two patterns interact."
  },
  "frictionMap": [{ "title": "Short title", "text": "1–2 lines of contrast, specific to them." }],
  "bridge": [{ "title": "Connection Potential", "text": "1–2 lines on where they naturally align." }],
  "decoder": "180–250 words total. Five short sections in order: Contrast, Hidden Dynamic, Tension Point, Connection Potential, One Sharp Insight. Must feel premium, comparative, and specific to BOTH image choices."
}

Extra requirements:
- differences: exactly 3 items; specific to their image choices; not generic.
- riskPatterns: 2–3 items; honest, slightly uncomfortable; not alarmist.
- whatHelps: exactly 3 items.
  Write actions as short micro-commands (max 6–8 words, imperative tone, no explanation).
  One line per item only.
  Make each command something they can do tonight.
  No words like: consider, try, explore, practice, communicate, validate, journey, reflect.
  Wrong: 'Try expressing your needs earlier before things build up'
  Right: 'Say it earlier.'
- partnerDecoder: warm but honest; write in second person (e.g. "Partner A tends to...").
- frictionMap: 2–3 items; title + 1–2 line contrast; no generic "you’re different" statements.
- bridge: 2–3 items; concrete + specific; no generic advice.
- decoder: a single string, 180–250 words, with exactly five short sections in this order:
  Contrast / Hidden Dynamic / Tension Point / Connection Potential / One Sharp Insight.
  No bullets. Mention both image choices explicitly in the first two sections.
  Make this feel like something users would pay for.

You MUST include ALL fields: differences, riskPatterns, whatHelps, partnerDecoder, frictionMap, bridge, decoder. None are optional. If you include both legacy and new fields, make them consistent.
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
In 2-3 short sentences, interpret the emotional structure of the image.
Do NOT rely primarily on color meanings.
Instead analyze:
- where elements are placed (center, edges, isolated)
- how elements interact (colliding, avoiding, blending)
- movement (static vs flowing)
- balance vs imbalance
- density vs emptiness
Color can support meaning, but NEVER be the main explanation.
No generic statements. No "this represents".
BAD: "The red suggests passion"
GOOD: "The intensity is concentrated in one area, while the rest pulls away — this creates a push-pull dynamic rather than full expression"
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
  let payloadSafe = null;
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
    payloadSafe = payload;
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
    console.log("[couple-reflection][final-prompt]", prompt);

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
    console.log("[couple-reflection][final-response]", rawText);
    let parsed = null;
    try {
      const cleaned = extractJSON(rawText);
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("RAW AI RESPONSE:", rawText);
      try {
        console.error("CLEANED:", extractJSON(rawText));
      } catch {
        /* ignore */
      }
    }

    let card = parsed ? validateCoupleStructured(parsed, chosenPattern.name) : null;
    // If model pattern naming drifts, salvage valid structure and force selected pattern.
    if (!card && parsed) {
      const relaxed = validateCoupleStructured(parsed);
      if (relaxed) {
        card = { ...relaxed, pattern: chosenPattern.name };
      }
    }
    if (!card) {
      console.warn("Falling back to deterministic couple card due to invalid AI JSON.");
      card = buildCoupleFallbackCard({ chosenPattern, profile, rawText });
    }
    const relationshipPersona = deriveCouplePersona({
      tension: card.tension?.value,
      drift: card.drift?.value,
      alignment: card.alignment,
    });

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
          relationshipPersona,
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
      relationshipPersona,
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
    try {
      const partnerA = payloadSafe?.partnerA;
      const partnerB = payloadSafe?.partnerB;
      const signals =
        partnerA && partnerB
          ? [...extractTagSignalsFromSelections(partnerA), ...extractTagSignalsFromSelections(partnerB)]
          : [];
      const profile = signals.length ? scoreCouplePatternsTop3(signals) : null;
      const fallbackCard = buildEmergencyCoupleCard();
      const forcedPattern = profile?.primary?.name ? { ...fallbackCard, pattern: profile.primary.name } : fallbackCard;
      const relationshipPersona = deriveCouplePersona({
        tension: forcedPattern.tension?.value,
        drift: forcedPattern.drift?.value,
        alignment: forcedPattern.alignment,
      });
      return NextResponse.json({
        structured: forcedPattern,
        relationshipPersona,
        patternProfile: profile
          ? {
              primary_pattern: profile.primary.name,
              secondary_pattern: profile.secondary.name,
              shadow_pattern: profile.shadow.name,
            }
          : null,
        result: [
          `Shared pattern: “${forcedPattern.pattern}”`,
          forcedPattern.summary,
          "",
          `Drift: ${forcedPattern.drift.value}% (${forcedPattern.drift.label})`,
          `Tension: ${forcedPattern.tension.value}% (${forcedPattern.tension.label})`,
          "",
          `One shared insight: ${forcedPattern.insight}`,
          `Alignment: ${forcedPattern.alignment}%`,
          `Distance signal: ${forcedPattern.distance_signal}`,
        ].join("\n"),
        innerWorldA: null,
        innerWorldB: null,
        spaceBetween: null,
        imageInterpretA: null,
        imageInterpretB: null,
        imageInterpretBetween: null,
        coupleNarrative: null,
        futureProjection: null,
      });
    } catch (fallbackError) {
      console.error("Couple analyze fallback error:", fallbackError);
      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 }
      );
    }
  }
}
