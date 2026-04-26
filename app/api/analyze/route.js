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
import { buildSoloReflectionPrompt } from "@/lib/soloReflectionPrompt";
import {
  bumpMonthlyReflectionCount,
  FREE_INDIVIDUAL_REFLECTIONS_PER_MONTH,
} from "@/lib/reflectionUsage";
import { buildIndividualWeeklyInsight } from "@/lib/weeklyInsight";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";

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

    const accountContext = await buildUnifiedAccountContext({
      supabase,
      user,
      clientContext: payload?.context ?? null,
    });

    const prompt = buildSoloReflectionPrompt({
      selections: answers,
      patternLabel,
      depthInstructions: depthModeInstructions(depthMode),
      contextJson: accountContext.contextJson,
    });
    // Temporary debug logs requested.
    console.log("[solo-reflection][final-prompt]", prompt);

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const raw = extractOpenAIResponsesText(response);
    console.log("[solo-reflection][final-response]", raw);
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

    let reflectionUsage = null;
    let weeklyShiftInsight = null;
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
            start_date: new Date().toISOString().slice(0, 10),
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
          fullInsight,
          full_text_response: fullTextResponse,
        };

        const currentHistory = existingProfile?.pattern_history || [];
        const previousEntry =
          Array.isArray(currentHistory) && currentHistory.length > 0
            ? currentHistory[currentHistory.length - 1]
            : null;
        weeklyShiftInsight = buildIndividualWeeklyInsight(previousEntry, finalCard);
        if (weeklyShiftInsight) {
          newEntry.weekly_shift_insight = weeklyShiftInsight;
        }
        const prevCount =
          fetchError?.code === "PGRST116" ? 0 : existingProfile?.reflection_count;
        const prevMonth =
          fetchError?.code === "PGRST116" ? null : existingProfile?.reflection_count_month;
        const { reflection_count, reflection_count_month } = bumpMonthlyReflectionCount(
          prevCount,
          prevMonth
        );
        console.log("🔴 ABOUT TO SAVE PROFILE");
        console.log("🔴 User ID:", user?.id);
        console.log("🔴 User email:", user?.email);

        const { error: saveError } = await supabase
          .from("user_profiles")
          .update({
            pattern_history: [...currentHistory, newEntry].slice(-50),
            depth_tone_preference: depthMode,
            last_updated: new Date().toISOString(),
            reflection_count,
            reflection_count_month,
          })
          .eq("id", user.id);

        console.log("🔴 SAVE COMPLETE - error:", saveError);
        if (!saveError) {
          reflectionUsage = {
            individualReflectionsThisMonth: reflection_count,
            freeMonthlyLimit: FREE_INDIVIDUAL_REFLECTIONS_PER_MONTH,
          };
        }
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

    await recordFeatureUsage({
      supabase,
      user,
      feature: "individual_reflection",
      input: {
        depthMode,
        patternLabel,
      },
      output: {
        pattern: finalCard.pattern,
        theme: finalCard.theme?.title ?? null,
        tone: finalCard.tone?.title ?? null,
        weeklyShiftInsight: weeklyShiftInsight ?? null,
      },
    });

    return NextResponse.json({
      structured: finalCard,
      fullInsight,
      full_text_response: fullTextResponse,
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
      weeklyShiftInsight,
      ...(reflectionUsage ? { reflectionUsage } : {}),
    });
  } catch (error) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}

