import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";
import { buildRelationshipIntelligencePrompt } from "@/lib/relationshipIntelligencePrompt";

type SourceKind = "text_message" | "voice_note" | "in_person";

type TranslatorOutput = {
  patternMatch: {
    name: string;
    matchPercent: number;
    line: string;
  };
  translatedMeaning: {
    sentence: string;
    baselineTieIn: string;
  };
  partnerLens: {
    likelyFeeling: string;
    patternReference: string;
  };
  actionImpulse: {
    suggestion: string;
    cycleAnchor: string;
  };
  telemetry: {
    driftReference: string | null;
    tensionReference: string | null;
    historyAnchors: string[];
  };
};

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clampPercent(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function parseJson(raw: string): Record<string, unknown> {
  const text = raw.trim();
  if (!text) throw new Error("Empty output");
  const cleaned = text.startsWith("```")
    ? text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "")
    : text;
  return JSON.parse(cleaned);
}

function normalizeScreenshotInputs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((url) => url.startsWith("data:image/") && url.length <= 7_000_000)
    .slice(0, 3);
}

function validateOutput(parsed: Record<string, unknown>): TranslatorOutput {
  const patternMatch =
    parsed.patternMatch && typeof parsed.patternMatch === "object"
      ? (parsed.patternMatch as Record<string, unknown>)
      : {};
  const translatedMeaning =
    parsed.translatedMeaning && typeof parsed.translatedMeaning === "object"
      ? (parsed.translatedMeaning as Record<string, unknown>)
      : {};
  const partnerLens =
    parsed.partnerLens && typeof parsed.partnerLens === "object"
      ? (parsed.partnerLens as Record<string, unknown>)
      : {};
  const actionImpulse =
    parsed.actionImpulse && typeof parsed.actionImpulse === "object"
      ? (parsed.actionImpulse as Record<string, unknown>)
      : {};
  const telemetry =
    parsed.telemetry && typeof parsed.telemetry === "object" ? (parsed.telemetry as Record<string, unknown>) : {};

  const historyAnchors = Array.isArray(telemetry.historyAnchors)
    ? telemetry.historyAnchors.map((v) => safeString(v)).filter(Boolean).slice(0, 6)
    : [];

  return {
    patternMatch: {
      name: safeString(patternMatch.name) || "Pattern Signal",
      matchPercent: clampPercent(patternMatch.matchPercent || 62),
      line:
        safeString(patternMatch.line) ||
        "Language pattern aligns with your recent protective-avoidance cycle under pressure.",
    },
    translatedMeaning: {
      sentence:
        safeString(translatedMeaning.sentence) ||
        "This message is less about facts and more about whether emotional safety is available right now.",
      baselineTieIn:
        safeString(translatedMeaning.baselineTieIn) ||
        "This mirrors your recent drift/tension profile from the last reflection window.",
    },
    partnerLens: {
      likelyFeeling:
        safeString(partnerLens.likelyFeeling) ||
        "They are likely feeling unseen, while simultaneously trying not to escalate further.",
      patternReference:
        safeString(partnerLens.patternReference) ||
        "Their response style appears consistent with prior partner-side tension episodes.",
    },
    actionImpulse: {
      suggestion:
        safeString(actionImpulse.suggestion) ||
        "Name one feeling, then one need, in one sentence before discussing details.",
      cycleAnchor:
        safeString(actionImpulse.cycleAnchor) ||
        "Use this as a Week-level regulation move in your 28-day cycle.",
    },
    telemetry: {
      driftReference: safeString(telemetry.driftReference) || null,
      tensionReference: safeString(telemetry.tensionReference) || null,
      historyAnchors,
    },
  };
}

function buildSystemPrompt({
  sourceKind,
  inputText,
  screenshotCount,
  accountContextJson,
  recentCoupleSessionsJson,
}: {
  sourceKind: SourceKind;
  inputText: string;
  screenshotCount: number;
  accountContextJson: string;
  recentCoupleSessionsJson: string;
}) {
  return buildRelationshipIntelligencePrompt({
    task: `Translate the provided ${sourceKind.replaceAll("_", " ")} into emotional pattern language for this couple. ${screenshotCount > 0 ? `Also analyze ${screenshotCount} uploaded screenshot(s) and extract message-level emotional signals from visible chat cues.` : ""}`,
    userInput: inputText || "No typed text provided. Use screenshot content as primary input.",
    accountContextJson,
    recentCoupleSessionsJson,
    extraRules:
      `Do not include markdown.
Do not include any keys outside schema.
"ActionImpulse.suggestion" must be one immediately actionable sentence.`,
    outputFormat: `{
  "patternMatch": {
    "name": "dominant matched pattern label",
    "matchPercent": 0-100 number,
    "line": "short line describing why this pattern matched"
  },
  "translatedMeaning": {
    "sentence": "one sharp translated meaning line",
    "baselineTieIn": "explicit tie to historical baseline/trend data with percentages where possible"
  },
  "partnerLens": {
    "likelyFeeling": "what partner is likely feeling now",
    "patternReference": "tie to partner pattern history and/or session trend"
  },
  "actionImpulse": {
    "suggestion": "one micro-suggestion action",
    "cycleAnchor": "how this helps in the 28-day cycle"
  },
  "telemetry": {
    "driftReference": "string or null",
    "tensionReference": "string or null",
    "historyAnchors": ["up to 6 concise factual anchors used"]
  }
}`,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const sourceKind = (safeString(body.sourceKind) || "text_message") as SourceKind;
    const inputText = safeString(body.text);
    const screenshots = normalizeScreenshotInputs(body.screenshots);
    if (!inputText && screenshots.length === 0) {
      return NextResponse.json({ error: "Text or screenshot is required." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const accountContext = await buildUnifiedAccountContext({
      supabase,
      user,
      clientContext: null,
      maxChars: 15000,
    });

    const { data: recentCoupleRows } = user?.id
      ? await supabase
          .from("couple_sessions")
          .select("id, created_at, result, result_generated, user_a_id, user_b_id")
          .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(10)
      : { data: [] };

    const recentCoupleSessionsJson = (() => {
      try {
        const compact = (recentCoupleRows || []).map((row) => ({
          id: row.id,
          created_at: row.created_at,
          result_generated: row.result_generated,
          result: row.result && typeof row.result === "object" ? row.result : null,
        }));
        return JSON.stringify(compact).slice(0, 13000);
      } catch {
        return "[]";
      }
    })();

    const openai = new OpenAI({ apiKey });
    const prompt = buildSystemPrompt({
      sourceKind,
      inputText,
      screenshotCount: screenshots.length,
      accountContextJson: accountContext.contextJson || "{}",
      recentCoupleSessionsJson,
    });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            ...screenshots.map((imageUrl) => ({
              type: "input_image" as const,
              image_url: imageUrl,
              detail: "auto" as const,
            })),
          ],
        },
      ],
    });

    const raw = response.output_text?.trim() || "";
    const parsed = parseJson(raw);
    const output = validateOutput(parsed);

    await recordFeatureUsage({
      supabase,
      user,
      feature: "emotional_translator_tool",
      input: {
        sourceKind,
        textPreview: inputText.slice(0, 320),
        screenshotCount: screenshots.length,
      },
      output: {
        pattern: output.patternMatch.name,
        matchPercent: output.patternMatch.matchPercent,
        driftReference: output.telemetry.driftReference,
        tensionReference: output.telemetry.tensionReference,
      },
      metadata: {
        route: "/api/tools/emotional-translator",
      },
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("emotional-translator error:", error);
    return NextResponse.json({ error: "Could not translate this interaction" }, { status: 500 });
  }
}
