import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";
import { buildRelationshipIntelligencePrompt } from "@/lib/relationshipIntelligencePrompt";

function s(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clampPercent(value: unknown, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
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

type SignalOutput = {
  signalStrength: {
    polarity: "positive" | "risk";
    score: number;
    impactLabel: string;
  };
  positiveSignal: {
    detected: boolean;
    title: string;
    alignmentPotentialDelta: number;
    line: string;
  };
  riskSignal: {
    detected: boolean;
    title: string;
    tensionRiskDelta: number;
    line: string;
  };
  calibratedMicroResponse: {
    response: string;
    whyItFits: string;
  };
  telemetry: {
    driftReference: string | null;
    tensionReference: string | null;
    priorSignalOutcomeReference: string | null;
    historyAnchors: string[];
  };
};

function validateOutput(parsed: Record<string, unknown>): SignalOutput {
  const signalStrength =
    parsed.signalStrength && typeof parsed.signalStrength === "object"
      ? (parsed.signalStrength as Record<string, unknown>)
      : {};
  const positiveSignal =
    parsed.positiveSignal && typeof parsed.positiveSignal === "object"
      ? (parsed.positiveSignal as Record<string, unknown>)
      : {};
  const riskSignal =
    parsed.riskSignal && typeof parsed.riskSignal === "object"
      ? (parsed.riskSignal as Record<string, unknown>)
      : {};
  const calibratedMicroResponse =
    parsed.calibratedMicroResponse && typeof parsed.calibratedMicroResponse === "object"
      ? (parsed.calibratedMicroResponse as Record<string, unknown>)
      : {};
  const telemetry = parsed.telemetry && typeof parsed.telemetry === "object" ? (parsed.telemetry as Record<string, unknown>) : {};

  const polarity = s(signalStrength.polarity) === "positive" ? "positive" : "risk";
  const score = clampPercent(signalStrength.score, 50);
  const alignmentPotentialDelta = Number(positiveSignal.alignmentPotentialDelta);
  const tensionRiskDelta = Number(riskSignal.tensionRiskDelta);

  return {
    signalStrength: {
      polarity,
      score,
      impactLabel:
        s(signalStrength.impactLabel) ||
        (polarity === "positive" ? "Stabilizing signal" : "Escalation risk signal"),
    },
    positiveSignal: {
      detected: Boolean(positiveSignal.detected),
      title: s(positiveSignal.title) || "Positive Signal Detected",
      alignmentPotentialDelta: Number.isFinite(alignmentPotentialDelta) ? Math.round(alignmentPotentialDelta) : 12,
      line:
        s(positiveSignal.line) ||
        "The behavior contains a low-pressure connection cue that can improve alignment timing.",
    },
    riskSignal: {
      detected: Boolean(riskSignal.detected),
      title: s(riskSignal.title) || "Risk Signal Detected",
      tensionRiskDelta: Number.isFinite(tensionRiskDelta) ? Math.round(tensionRiskDelta) : 10,
      line:
        s(riskSignal.line) ||
        "The behavior also carries a withdrawal/misread risk if left unnamed in this cycle phase.",
    },
    calibratedMicroResponse: {
      response:
        s(calibratedMicroResponse.response) ||
        "I want to read this right before I react - are you needing space, or are you feeling disconnected from me?",
      whyItFits:
        s(calibratedMicroResponse.whyItFits) ||
        "This response lowers defensive interpretation while preserving connection intent.",
    },
    telemetry: {
      driftReference: s(telemetry.driftReference) || null,
      tensionReference: s(telemetry.tensionReference) || null,
      priorSignalOutcomeReference: s(telemetry.priorSignalOutcomeReference) || null,
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
    task: "Detect subtle positive/risk signals and estimate drift/tension impact from the user input.",
    userInput: text,
    accountContextJson,
    recentCoupleSessionsJson,
    extraRules: `If a positive signal exists, include explicit alignment potential (e.g., +12%).
If a risk signal exists, include explicit tension risk delta.`,
    outputFormat: `{
  "signalStrength": {
    "polarity": "positive" or "risk",
    "score": 0-100 number,
    "impactLabel": "short gauge label"
  },
  "positiveSignal": {
    "detected": true/false,
    "title": "Positive Signal Detected",
    "alignmentPotentialDelta": signed integer percent,
    "line": "one sharp personalized line"
  },
  "riskSignal": {
    "detected": true/false,
    "title": "Risk Signal Detected",
    "tensionRiskDelta": signed integer percent,
    "line": "one sharp personalized line"
  },
  "calibratedMicroResponse": {
    "response": "single actionable micro-response sentence",
    "whyItFits": "why it fits this couple's patterns"
  },
  "telemetry": {
    "driftReference": "string or null",
    "tensionReference": "string or null",
    "priorSignalOutcomeReference": "string or null",
    "historyAnchors": ["up to 8 concise anchors"]
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
      feature: "signal_detector",
      input: { textPreview: text.slice(0, 300) },
      output: {
        polarity: output.signalStrength.polarity,
        score: output.signalStrength.score,
        alignmentPotentialDelta: output.positiveSignal.alignmentPotentialDelta,
        tensionRiskDelta: output.riskSignal.tensionRiskDelta,
        driftReference: output.telemetry.driftReference,
        tensionReference: output.telemetry.tensionReference,
      },
      metadata: { route: "/api/tools/signal-detector" },
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("signal-detector error:", error);
    return NextResponse.json({ error: "Could not detect signal" }, { status: 500 });
  }
}
