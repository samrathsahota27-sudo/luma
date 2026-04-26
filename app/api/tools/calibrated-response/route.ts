import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";
import { buildRelationshipIntelligencePrompt } from "@/lib/relationshipIntelligencePrompt";

type Mode = "analyze" | "recalibrate";
type HeatMode = "casual" | "heated" | "distant";
type ResponseTone = "soften" | "modern" | "direct";

type CalibratedResponse = {
  persona: string;
  label: string;
  response: string;
  whyItWorks: string;
};

type ToolOutput = {
  pulse: {
    temperature: number;
    sentence: string;
    patternLink: string;
  };
  hiddenLayers: {
    partnerLikelyFeeling: string;
    likelyNeed: string;
    historicalAnchor: string;
  };
  minefield: {
    avoid: string[];
    reason: string;
  };
  calibratedResponses: CalibratedResponse[];
  telemetry: {
    driftReference: string | null;
    tensionReference: string | null;
    historyAnchors: string[];
  };
};

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clamp(value: unknown, min = 0, max = 100) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function parseJson(raw: string): Record<string, unknown> {
  const text = raw.trim();
  if (!text) throw new Error("Empty model output");
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

function normalizeCalibratedResponses(value: unknown): CalibratedResponse[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : null;
      if (!rec) return null;
      const persona = safeString(rec.persona);
      const label = safeString(rec.label);
      const response = safeString(rec.response);
      const whyItWorks = safeString(rec.whyItWorks);
      if (!persona || !label || !response) return null;
      return {
        persona,
        label,
        response,
        whyItWorks: whyItWorks || "Grounded in your pattern history and current emotional temperature.",
      };
    })
    .filter(Boolean) as CalibratedResponse[];
}

function validateOutput(parsed: Record<string, unknown>): ToolOutput {
  const pulseRaw = parsed?.pulse && typeof parsed.pulse === "object" ? (parsed.pulse as Record<string, unknown>) : {};
  const hiddenRaw =
    parsed?.hiddenLayers && typeof parsed.hiddenLayers === "object"
      ? (parsed.hiddenLayers as Record<string, unknown>)
      : {};
  const mineRaw =
    parsed?.minefield && typeof parsed.minefield === "object" ? (parsed.minefield as Record<string, unknown>) : {};
  const telemetryRaw =
    parsed?.telemetry && typeof parsed.telemetry === "object" ? (parsed.telemetry as Record<string, unknown>) : {};

  const calibratedResponses = normalizeCalibratedResponses(parsed?.calibratedResponses);
  if (calibratedResponses.length < 1) {
    throw new Error("Invalid calibrated responses");
  }

  const avoid = Array.isArray(mineRaw.avoid)
    ? mineRaw.avoid.map((v) => safeString(v)).filter(Boolean).slice(0, 5)
    : [];

  return {
    pulse: {
      temperature: clamp(pulseRaw.temperature, 0, 100),
      sentence: safeString(pulseRaw.sentence) || "Emotional heat is rising faster than trust in this exchange.",
      patternLink:
        safeString(pulseRaw.patternLink) || "Pattern clash detected from your recent reflection and session history.",
    },
    hiddenLayers: {
      partnerLikelyFeeling:
        safeString(hiddenRaw.partnerLikelyFeeling) || "Defensive and unseen, while still seeking signal from you.",
      likelyNeed: safeString(hiddenRaw.likelyNeed) || "A clear sign of safety before discussing details.",
      historicalAnchor:
        safeString(hiddenRaw.historicalAnchor) ||
        "This mirrors the recurring pattern in your recent couple sessions and reflection trend.",
    },
    minefield: {
      avoid: avoid.length ? avoid : ["Defensive fact-checking", "Sarcastic minimization", "Scorekeeping phrasing"],
      reason:
        safeString(mineRaw.reason) ||
        "These response styles historically increase friction when drift and tension are already elevated.",
    },
    calibratedResponses,
    telemetry: {
      driftReference: safeString(telemetryRaw.driftReference) || null,
      tensionReference: safeString(telemetryRaw.tensionReference) || null,
      historyAnchors: Array.isArray(telemetryRaw.historyAnchors)
        ? telemetryRaw.historyAnchors.map((v) => safeString(v)).filter(Boolean).slice(0, 6)
        : [],
    },
  };
}

function buildAnalyzePrompt({
  conversation,
  screenshotCount,
  heatMode,
  responseTone,
  accountContextJson,
  recentCoupleSessionsJson,
}: {
  conversation: string;
  screenshotCount: number;
  heatMode: HeatMode;
  responseTone: ResponseTone;
  accountContextJson: string;
  recentCoupleSessionsJson: string;
}) {
  return buildRelationshipIntelligencePrompt({
    task: `Analyze the provided conversation context and generate Chat Assistant calibrated responses. Tone check is "${heatMode}". Response style is "${responseTone}". ${screenshotCount > 0 ? `Also analyze ${screenshotCount} uploaded screenshot(s) of the chat and extract emotional cues from message wording, pacing, punctuation, and response gaps.` : ""}`,
    userInput: conversation || "No typed text provided. Use screenshot content as primary input.",
    accountContextJson,
    recentCoupleSessionsJson,
    extraRules: `All 3 responses must be distinct strategies.
Keep each response concise and copy-ready.
Match selected response style: ${responseTone}.
Never be accusatory.
Never output vague therapy clichés.`,
    outputFormat: `{
  "pulse": {
    "temperature": 0-100 number,
    "sentence": "One sharp line describing emotional thermal state",
    "patternLink": "Explicit pattern-level read with history anchor"
  },
  "hiddenLayers": {
    "partnerLikelyFeeling": "Likely internal state",
    "likelyNeed": "What they need right now",
    "historicalAnchor": "Specific tie to prior reflections/tools/sessions"
  },
  "minefield": {
    "avoid": ["3-5 short bullets of what to avoid now"],
    "reason": "Why these worsen this exact dynamic"
  },
  "calibratedResponses": [
    { "persona": "The Anchor", "label": "De-escalator", "response": "copy-ready response", "whyItWorks": "why for this couple history" },
    { "persona": "The Reset", "label": "Vulnerable", "response": "copy-ready response", "whyItWorks": "why for this couple history" },
    { "persona": "The Clarity", "label": "Direct", "response": "copy-ready response", "whyItWorks": "why for this couple history" }
  ],
  "telemetry": {
    "driftReference": "string or null",
    "tensionReference": "string or null",
    "historyAnchors": ["up to 6 short factual anchors"]
  }
}`,
  });
}

function buildRecalibratePrompt({
  responseTone,
  existingAnalysisJson,
}: {
  responseTone: ResponseTone;
  existingAnalysisJson: string;
}) {
  return `You are adjusting response phrasing only.
Given existing calibrated analysis, rewrite ONLY "calibratedResponses" with style "${responseTone}".

Keep the same emotional intent and strategic direction, but shift delivery tone.
- soften: warmer, lower intensity, more cushioning language
- modern: balanced, clear, natural contemporary tone
- direct: concise, clear edges, still non-accusatory

Return ONLY JSON:
{
  "calibratedResponses": [
    { "persona": "...", "label": "...", "response": "...", "whyItWorks": "..." },
    { "persona": "...", "label": "...", "response": "...", "whyItWorks": "..." },
    { "persona": "...", "label": "...", "response": "...", "whyItWorks": "..." }
  ]
}

Existing analysis:
${existingAnalysisJson}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const mode = safeString(body.mode) === "recalibrate" ? "recalibrate" : "analyze";
    const conversation = safeString(body.conversation);
    const screenshots = normalizeScreenshotInputs(body.screenshots);
    const heatMode = (safeString(body.heatMode) || "casual") as HeatMode;
    const responseTone = (safeString(body.responseTone) || "modern") as ResponseTone;

    if (!conversation && mode === "analyze" && screenshots.length === 0) {
      return NextResponse.json({ error: "Conversation text or screenshot is required." }, { status: 400 });
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
      maxChars: 14000,
    });

    const { data: recentCoupleRows } = user?.id
      ? await supabase
          .from("couple_sessions")
          .select("id, created_at, result, result_generated, user_a_id, user_b_id")
          .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(8)
      : { data: [] };

    const recentCoupleSessionsJson = (() => {
      try {
        const compact = (recentCoupleRows || []).map((row) => ({
          id: row.id,
          created_at: row.created_at,
          result_generated: row.result_generated,
          result: row.result && typeof row.result === "object" ? row.result : null,
        }));
        return JSON.stringify(compact).slice(0, 12000);
      } catch {
        return "[]";
      }
    })();

    const openai = new OpenAI({ apiKey });
    const prompt =
      mode === "recalibrate"
        ? buildRecalibratePrompt({
            responseTone,
            existingAnalysisJson: JSON.stringify(body.existingAnalysis || {}).slice(0, 10000),
          })
        : buildAnalyzePrompt({
            conversation,
            screenshotCount: screenshots.length,
            heatMode,
            responseTone,
            accountContextJson: accountContext.contextJson || "{}",
            recentCoupleSessionsJson,
          });

    const completion =
      mode === "analyze"
        ? await openai.responses.create({
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
          })
        : await openai.responses.create({
            model: "gpt-4.1-mini",
            input: prompt,
          });
    const raw = completion.output_text?.trim() || "";
    const parsed = parseJson(raw);

    if (mode === "recalibrate") {
      const calibratedResponses = normalizeCalibratedResponses(parsed.calibratedResponses);
      if (!calibratedResponses.length) {
        throw new Error("Invalid recalibrated responses");
      }

      await recordFeatureUsage({
        supabase,
        user,
        feature: "calibrated_response_recalibrate",
        input: {
          tone: responseTone,
          heatMode,
        },
        output: {
          personas: calibratedResponses.map((r) => r.persona).slice(0, 3),
        },
      });

      return NextResponse.json({ calibratedResponses });
    }

    const output = validateOutput(parsed);

    await recordFeatureUsage({
      supabase,
      user,
      feature: "calibrated_response_analyze",
      input: {
        heatMode,
        responseTone,
        conversationPreview: conversation.slice(0, 300),
        screenshotCount: screenshots.length,
      },
      output: {
        pulseTemperature: output.pulse.temperature,
        driftReference: output.telemetry.driftReference,
        tensionReference: output.telemetry.tensionReference,
        personas: output.calibratedResponses.map((x) => x.persona).slice(0, 3),
      },
      metadata: {
        route: "/api/tools/calibrated-response",
      },
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("calibrated-response error:", error);
    return NextResponse.json({ error: "Could not generate calibrated responses" }, { status: 500 });
  }
}
