import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";
import { buildRelationshipIntelligencePrompt } from "@/lib/relationshipIntelligencePrompt";

type Mode = "bootstrap" | "explain";

type TheoryOutput = {
  selectedPattern: string;
  dominantPatterns: string[];
  sections: {
    theory: string;
    whyForYouTwo: string;
    journeyShift: string;
  };
  progression: {
    from: string;
    toward: string;
  };
  telemetry: {
    driftReference: string | null;
    tensionReference: string | null;
    historyAnchors: string[];
  };
};

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

function normalizePatterns(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => s(v)).filter(Boolean).slice(0, 5);
}

function validateOutput(parsed: Record<string, unknown>, fallbackPattern = "Your current dominant pattern"): TheoryOutput {
  const sections = parsed.sections && typeof parsed.sections === "object" ? (parsed.sections as Record<string, unknown>) : {};
  const progression =
    parsed.progression && typeof parsed.progression === "object" ? (parsed.progression as Record<string, unknown>) : {};
  const telemetry = parsed.telemetry && typeof parsed.telemetry === "object" ? (parsed.telemetry as Record<string, unknown>) : {};
  const dominantPatterns = normalizePatterns(parsed.dominantPatterns);
  const selectedPattern = s(parsed.selectedPattern) || fallbackPattern;

  return {
    selectedPattern,
    dominantPatterns: dominantPatterns.length ? dominantPatterns : [selectedPattern],
    sections: {
      theory:
        s(sections.theory) ||
        "Projective-image patterning often reflects learned emotional regulation strategies under closeness and uncertainty.",
      whyForYouTwo:
        s(sections.whyForYouTwo) ||
        "Your current relational data suggests this pattern appears most during moments where one partner seeks signal and the other seeks safety through distance.",
      journeyShift:
        s(sections.journeyShift) ||
        "Across the 28-day loop, repeated naming and micro-adjustments reduce automatic reactions and increase deliberate repair timing.",
    },
    progression: {
      from: s(progression.from) || "automatic protective reaction",
      toward: s(progression.toward) || "intentional co-regulation",
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
  selectedPattern,
  accountContextJson,
  recentCoupleSessionsJson,
}: {
  selectedPattern: string;
  accountContextJson: string;
  recentCoupleSessionsJson: string;
}) {
  return buildRelationshipIntelligencePrompt({
    task: `Explain the psychological theory behind the selected pattern "${selectedPattern}" in Theory Mode.`,
    userInput: `Selected pattern to explain: ${selectedPattern}`,
    accountContextJson,
    recentCoupleSessionsJson,
    extraRules: `Explain with light projective/attachment-informed framing.
Accessible, premium, no heavy jargon.
No deterministic or diagnostic language.`,
    outputFormat: `{
  "selectedPattern": "pattern name",
  "dominantPatterns": ["top pattern", "secondary pattern", "shadow pattern"],
  "sections": {
    "theory": "short paragraph",
    "whyForYouTwo": "short paragraph tied to their data",
    "journeyShift": "short paragraph about 28-day change mechanism"
  },
  "progression": {
    "from": "starting state phrase",
    "toward": "target state phrase"
  },
  "telemetry": {
    "driftReference": "string with % reference or null",
    "tensionReference": "string with % reference or null",
    "historyAnchors": ["up to 8 concise anchors used"]
  }
}`,
  });
}

function inferPatternsFromRows(rows: any[]): string[] {
  const counts = new Map<string, number>();
  for (const row of rows || []) {
    const result = row?.result && typeof row.result === "object" ? row.result : null;
    const pattern = s(result?.pattern || result?.sharedPattern || result?.primary_pattern);
    if (!pattern) continue;
    counts.set(pattern, (counts.get(pattern) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([pattern]) => pattern)
    .slice(0, 5);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const mode = (s(body.mode) || "bootstrap") as Mode;
    const requestedPattern = s(body.pattern);

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
          .limit(12)
      : { data: [] };

    const inferredPatterns = inferPatternsFromRows(recentCoupleRows || []);
    const selectedPattern = requestedPattern || inferredPatterns[0] || "Your current dominant pattern";

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
        selectedPattern,
        accountContextJson: accountContext.contextJson || "{}",
        recentCoupleSessionsJson,
      }),
    });
    const raw = completion.output_text?.trim() || "";
    const parsed = parseJson(raw);
    const output = validateOutput(parsed, selectedPattern);

    await recordFeatureUsage({
      supabase,
      user,
      feature: mode === "bootstrap" ? "theory_mode_open" : "theory_mode_explain",
      input: {
        requestedPattern: requestedPattern || null,
      },
      output: {
        selectedPattern: output.selectedPattern,
        dominantPatterns: output.dominantPatterns.slice(0, 3),
        driftReference: output.telemetry.driftReference,
        tensionReference: output.telemetry.tensionReference,
      },
      metadata: { route: "/api/tools/theory-mode" },
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("theory-mode error:", error);
    return NextResponse.json({ error: "Could not generate theory explanation" }, { status: 500 });
  }
}
