import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";
import { buildRelationshipIntelligencePrompt } from "@/lib/relationshipIntelligencePrompt";

function s(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseJson(raw: string): Record<string, unknown> {
  const text = raw.trim();
  if (!text) throw new Error("Empty output");
  const cleaned = text.startsWith("```")
    ? text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "")
    : text;
  return JSON.parse(cleaned);
}

function validateOutput(parsed: Record<string, unknown>) {
  const patternMatch =
    parsed.patternMatch && typeof parsed.patternMatch === "object"
      ? (parsed.patternMatch as Record<string, unknown>)
      : {};
  const hiddenMeaning =
    parsed.hiddenMeaning && typeof parsed.hiddenMeaning === "object"
      ? (parsed.hiddenMeaning as Record<string, unknown>)
      : {};
  const bridgeSuggestion =
    parsed.bridgeSuggestion && typeof parsed.bridgeSuggestion === "object"
      ? (parsed.bridgeSuggestion as Record<string, unknown>)
      : {};
  const telemetry = parsed.telemetry && typeof parsed.telemetry === "object" ? (parsed.telemetry as Record<string, unknown>) : {};

  const confidence = Math.max(0, Math.min(100, Math.round(Number(patternMatch.confidence || 62))));

  return {
    patternMatch: {
      name: s(patternMatch.name) || "Silence-protection loop",
      confidence,
      line: s(patternMatch.line) || "The silence looks more like protective distancing than indifference.",
    },
    hiddenMeaning: {
      summary:
        s(hiddenMeaning.summary) ||
        "The silence appears to be carrying unspoken threat-management rather than emotional absence.",
      tieIn:
        s(hiddenMeaning.tieIn) ||
        "This aligns with your latest relational pattern trend and prior friction timing.",
    },
    bridgeSuggestion: {
      suggestion:
        s(bridgeSuggestion.suggestion) ||
        "Name the silence gently first: 'I feel distance right now and I want us back in the same room emotionally.'",
      whyItWorks:
        s(bridgeSuggestion.whyItWorks) ||
        "This lowers defensiveness while signaling connection intent before content.",
    },
    telemetry: {
      driftReference: s(telemetry.driftReference) || null,
      tensionReference: s(telemetry.tensionReference) || null,
      historyAnchors: Array.isArray(telemetry.historyAnchors)
        ? telemetry.historyAnchors.map((v) => s(v)).filter(Boolean).slice(0, 8)
        : [],
    },
  };
}

function buildPrompt({
  text,
  accountContextJson,
  recentCoupleSessionsJson,
}: {
  text: string;
  accountContextJson: string;
  recentCoupleSessionsJson: string;
}) {
  return buildRelationshipIntelligencePrompt({
    task: "Analyze the described silence and return pattern, hidden meaning, and bridge suggestion.",
    userInput: text,
    accountContextJson,
    recentCoupleSessionsJson,
    outputFormat: `{
  "patternMatch": {
    "name": "dominant pattern label",
    "confidence": 0-100 number,
    "line": "one-line read of the silence pattern"
  },
  "hiddenMeaning": {
    "summary": "what the silence likely means psychologically",
    "tieIn": "explicit tie to this couple's historical data and trend percentages"
  },
  "bridgeSuggestion": {
    "suggestion": "one gentle bridge action/sentence",
    "whyItWorks": "why this bridge fits this couple's pattern"
  },
  "telemetry": {
    "driftReference": "string or null",
    "tensionReference": "string or null",
    "historyAnchors": ["up to 8 concise anchors used"]
  }
}`,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const text = s(body.text);
    if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Server configuration error" }, { status: 500 });

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
    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: buildPrompt({
        text,
        accountContextJson: accountContext.contextJson || "{}",
        recentCoupleSessionsJson,
      }),
    });

    const raw = completion.output_text?.trim() || "";
    const parsed = parseJson(raw);
    const output = validateOutput(parsed);

    await recordFeatureUsage({
      supabase,
      user,
      feature: "silent_signals",
      input: { textPreview: text.slice(0, 300) },
      output: {
        pattern: output.patternMatch.name,
        confidence: output.patternMatch.confidence,
        driftReference: output.telemetry.driftReference,
        tensionReference: output.telemetry.tensionReference,
      },
      metadata: { route: "/api/tools/silent-signals" },
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("silent-signals error:", error);
    return NextResponse.json({ error: "Could not analyze silence" }, { status: 500 });
  }
}
