import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";
import { buildRelationshipIntelligencePrompt } from "@/lib/relationshipIntelligencePrompt";

type ReplayOutput = {
  whatEachFelt: {
    you: string;
    them: string;
  };
  momentOfDivergence: {
    line: string;
    patternTie: string;
  };
  whatWasActuallyNeeded: {
    youNeeded: string;
    themNeeded: string;
    sharedNeed: string;
  };
  nextTimeGuide: {
    step1: string;
    step2: string;
    step3: string;
  };
  telemetry: {
    driftReference: string | null;
    tensionReference: string | null;
    historyAnchors: string[];
  };
};

export const CONFLICT_REPLAY_SYSTEM_PROMPT = `You are Luma's Conflict Replay mirror.
Your role is neutral, emotionally safe, and insight-focused.

Core behavior:
- Do NOT take sides.
- Do NOT moralize or blame.
- Translate two subjective versions into a shared pattern understanding.
- Tie insights to known couple patterns and trend data when available.
- Keep language healing, concrete, and de-escalating.

Output must help the couple process and learn from misalignment.`;

function s(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseJson(raw: string): Record<string, unknown> {
  const text = raw.trim();
  if (!text) return {};
  const cleaned = text.startsWith("```")
    ? text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "")
    : text;
  try {
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

function validateOutput(parsed: Record<string, unknown>): ReplayOutput {
  const whatEachFelt =
    parsed.whatEachFelt && typeof parsed.whatEachFelt === "object"
      ? (parsed.whatEachFelt as Record<string, unknown>)
      : {};
  const divergence =
    parsed.momentOfDivergence && typeof parsed.momentOfDivergence === "object"
      ? (parsed.momentOfDivergence as Record<string, unknown>)
      : {};
  const needed =
    parsed.whatWasActuallyNeeded && typeof parsed.whatWasActuallyNeeded === "object"
      ? (parsed.whatWasActuallyNeeded as Record<string, unknown>)
      : {};
  const nextTimeGuide =
    parsed.nextTimeGuide && typeof parsed.nextTimeGuide === "object"
      ? (parsed.nextTimeGuide as Record<string, unknown>)
      : {};
  const telemetry =
    parsed.telemetry && typeof parsed.telemetry === "object" ? (parsed.telemetry as Record<string, unknown>) : {};

  return {
    whatEachFelt: {
      you: s(whatEachFelt.you) || "You were trying to be understood without escalating the moment.",
      them: s(whatEachFelt.them) || "They were trying to protect themselves from feeling blamed or cornered.",
    },
    momentOfDivergence: {
      line: s(divergence.line) || "The conversation split when intent and impact were interpreted differently.",
      patternTie:
        s(divergence.patternTie) || "This mirrors your recurring pursue-withdraw cycle under stress.",
    },
    whatWasActuallyNeeded: {
      youNeeded: s(needed.youNeeded) || "A clear sign your feelings were being received, not corrected.",
      themNeeded: s(needed.themNeeded) || "A sense of safety before discussing details or accountability.",
      sharedNeed: s(needed.sharedNeed) || "Slower pacing plus explicit reassurance before problem-solving.",
    },
    nextTimeGuide: {
      step1: s(nextTimeGuide.step1) || "Name one feeling each before explaining facts.",
      step2: s(nextTimeGuide.step2) || "Reflect back one sentence to confirm you heard each other.",
      step3: s(nextTimeGuide.step3) || "Agree on one tiny repair action for the next 24 hours.",
    },
    telemetry: {
      driftReference: s(telemetry.driftReference) || null,
      tensionReference: s(telemetry.tensionReference) || null,
      historyAnchors: Array.isArray(telemetry.historyAnchors)
        ? telemetry.historyAnchors.map((x) => s(x)).filter(Boolean).slice(0, 8)
        : [],
    },
  };
}

function buildPrompt({
  myVersion,
  theirVersion,
  accountContextJson,
  recentCoupleSessionsJson,
}: {
  myVersion: string;
  theirVersion: string;
  accountContextJson: string;
  recentCoupleSessionsJson: string;
}) {
  return `${CONFLICT_REPLAY_SYSTEM_PROMPT}

${buildRelationshipIntelligencePrompt({
    task: "Process a conflict replay from two perspectives and produce a neutral healing map.",
    userInput: `My version:\n${myVersion}\n\nTheir version:\n${theirVersion}`,
    accountContextJson,
    recentCoupleSessionsJson,
    extraRules: `Maintain mirror neutrality.
Call out one clear moment of divergence.
Frame needs beneath reactions.
Give exactly 3 micro next-time steps.`,
    outputFormat: `{
  "whatEachFelt": {
    "you": "1-2 lines",
    "them": "1-2 lines"
  },
  "momentOfDivergence": {
    "line": "one highlighted divergence moment",
    "patternTie": "how this maps to known patterns"
  },
  "whatWasActuallyNeeded": {
    "youNeeded": "one need",
    "themNeeded": "one need",
    "sharedNeed": "one shared need"
  },
  "nextTimeGuide": {
    "step1": "short actionable step",
    "step2": "short actionable step",
    "step3": "short actionable step"
  },
  "telemetry": {
    "driftReference": "string or null",
    "tensionReference": "string or null",
    "historyAnchors": ["up to 8 concise anchors"]
  }
}`,
  })}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const myVersion = s(body.myVersion);
    const theirVersion = s(body.theirVersion);
    if (!myVersion || !theirVersion) {
      return NextResponse.json({ error: "Please provide both versions." }, { status: 400 });
    }

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
        myVersion,
        theirVersion,
        accountContextJson: accountContext.contextJson || "{}",
        recentCoupleSessionsJson,
      }),
    });

    const output = validateOutput(parseJson(s(completion.output_text)));

    await recordFeatureUsage({
      supabase,
      user,
      feature: "conflict_replay",
      input: {
        myVersionPreview: myVersion.slice(0, 260),
        theirVersionPreview: theirVersion.slice(0, 260),
      },
      output: {
        divergence: output.momentOfDivergence.line,
        driftReference: output.telemetry.driftReference,
        tensionReference: output.telemetry.tensionReference,
      },
      metadata: { route: "/api/tools/conflict-replay" },
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("conflict-replay error:", error);
    return NextResponse.json({ error: "Could not process conflict replay" }, { status: 500 });
  }
}
