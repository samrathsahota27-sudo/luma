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
import { deriveThemeTone } from "@/lib/themeTone";
import { buildGuidingReflection } from "@/lib/guidingReflection";
import { derivePatternLabel } from "@/lib/patternLabel";
import { createClient } from "@/lib/supabase/server";

export async function POST(req) {
  try {
    console.log("🔴 ANALYZE ROUTE HIT");
    const request = req;
    console.log("=== API ROUTE HIT ===");
    console.log("Cookies:", request.headers.get("cookie")?.slice(0, 100));
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    console.log("User in API:", user?.id ?? "NULL", error?.message ?? "no error");

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
    const micro = deriveThemeTone(signals);
    const patternLabel = derivePatternLabel({ signals, selections: answers });

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
  "pattern": "${patternLabel}",
  "description": "When things get close, you go numb — then blame yourself for it.",
  "theme": { "title": "${micro.theme.title}", "subtitle": "${micro.theme.subtitle}" },
  "tone": { "title": "${micro.tone.title}", "subtitle": "${micro.tone.subtitle}" },
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
    const structured = validateIndividualStructured(parsed, null);
    const fallback = buildDeterministicVariantFallback({
      pattern: patternLabel,
      variant,
      theme: micro.theme,
      tone: micro.tone,
    });
    const finalCard = (() => {
      const base = structured || fallback;
      return {
        ...base,
        pattern: patternLabel,
        theme: micro.theme,
        tone: micro.tone,
      };
    })();
    const guidingReflection = buildGuidingReflection({
      pattern: finalCard.pattern,
      signals,
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

        const newEntry = {
          date: new Date().toISOString(),
          pattern: finalCard.pattern,
          description: finalCard.description,
          theme: finalCard.theme,
          tone: finalCard.tone,
          core_line: finalCard.core_line,
          depth_mode: depthMode,
        };

        const currentHistory = existingProfile?.pattern_history || [];
        console.log("🔴 ABOUT TO SAVE PROFILE");
        console.log("🔴 User ID:", user?.id);
        console.log("🔴 User email:", user?.email);

        const { error: saveError } = await supabase
          .from("user_profiles")
          .update({
            pattern_history: [...currentHistory, newEntry].slice(-50),
            depth_tone_preference: depthMode,
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
      guidingReflection,
    });
  } catch (error) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}

