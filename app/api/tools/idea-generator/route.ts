import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";
import { buildRelationshipIntelligencePrompt } from "@/lib/relationshipIntelligencePrompt";

type IdeaType = "date_night" | "quick_reset" | "deep_talk_prompt" | "weekly_ritual";
type EnergyLevel = "low" | "medium" | "high";
type TimeAvailable = "15_min" | "1_hour" | "half_day";
type Mode = "generate" | "save";

type GeneratedIdea = {
  id: string;
  title: string;
  description: string;
  whyItFits: string;
  duration: string;
  cycleAnchor: string;
};

type IdeaResponse = {
  ideas: GeneratedIdea[];
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

function normalizeIdeas(value: unknown): GeneratedIdea[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row, idx) => {
      const rec = row && typeof row === "object" ? (row as Record<string, unknown>) : null;
      if (!rec) return null;
      const title = s(rec.title);
      const description = s(rec.description);
      const whyItFits = s(rec.whyItFits);
      const duration = s(rec.duration);
      const cycleAnchor = s(rec.cycleAnchor);
      if (!title || !description || !whyItFits) return null;
      return {
        id: s(rec.id) || `idea_${idx + 1}`,
        title,
        description,
        whyItFits,
        duration: duration || "Flexible",
        cycleAnchor: cycleAnchor || "Use this inside your current cycle week as a low-friction intervention.",
      };
    })
    .filter(Boolean)
    .slice(0, 3) as GeneratedIdea[];
}

function validateOutput(parsed: Record<string, unknown>): IdeaResponse {
  const telemetry =
    parsed.telemetry && typeof parsed.telemetry === "object" ? (parsed.telemetry as Record<string, unknown>) : {};
  const ideas = normalizeIdeas(parsed.ideas);
  if (!ideas.length) throw new Error("Invalid ideas");

  return {
    ideas,
    telemetry: {
      driftReference: s(telemetry.driftReference) || null,
      tensionReference: s(telemetry.tensionReference) || null,
      historyAnchors: Array.isArray(telemetry.historyAnchors)
        ? telemetry.historyAnchors.map((x) => s(x)).filter(Boolean).slice(0, 8)
        : [],
    },
  };
}

function buildSystemPrompt({
  ideaType,
  energyLevel,
  timeAvailable,
  accountContextJson,
  recentCoupleSessionsJson,
}: {
  ideaType: IdeaType;
  energyLevel: EnergyLevel;
  timeAvailable: TimeAvailable;
  accountContextJson: string;
  recentCoupleSessionsJson: string;
}) {
  return buildRelationshipIntelligencePrompt({
    task: `Generate hyper-personalized ${ideaType.replaceAll("_", " ")} ideas for this couple.
Energy level: ${energyLevel}. Time available: ${timeAvailable}.`,
    userInput: `User requested ideas in this mode: ${ideaType}`,
    accountContextJson,
    recentCoupleSessionsJson,
    extraRules: `Produce exactly 3 ideas.
Each idea must directly counter observed pattern friction from history.
Avoid generic date ideas.
Respect energy/time constraints.`,
    outputFormat: `{
  "ideas": [
    {
      "id": "short_id",
      "title": "short premium title",
      "description": "what to do in concrete steps",
      "whyItFits": "explicit tie to patterns + percentages/trends",
      "duration": "expected duration",
      "cycleAnchor": "how this supports current cycle week"
    },
    {
      "id": "short_id_2",
      "title": "short premium title",
      "description": "what to do in concrete steps",
      "whyItFits": "explicit tie to patterns + percentages/trends",
      "duration": "expected duration",
      "cycleAnchor": "how this supports current cycle week"
    },
    {
      "id": "short_id_3",
      "title": "short premium title",
      "description": "what to do in concrete steps",
      "whyItFits": "explicit tie to patterns + percentages/trends",
      "duration": "expected duration",
      "cycleAnchor": "how this supports current cycle week"
    }
  ],
  "telemetry": {
    "driftReference": "string or null",
    "tensionReference": "string or null",
    "historyAnchors": ["up to 8 concise anchors"]
  }
}`,
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const mode = (s(body.mode) || "generate") as Mode;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (mode === "save") {
      const idea = body.idea && typeof body.idea === "object" ? (body.idea as Record<string, unknown>) : null;
      if (!idea) return NextResponse.json({ error: "Idea payload missing" }, { status: 400 });

      if (user?.id) {
        await recordFeatureUsage({
          supabase,
          user,
          feature: "idea_generator_saved",
          input: {
            ideaId: s(idea.id),
            ideaTitle: s(idea.title),
          },
          output: {
            savedAt: new Date().toISOString(),
          },
        });
      }
      return NextResponse.json({ ok: true });
    }

    const ideaType = (s(body.ideaType) || "date_night") as IdeaType;
    const energyLevel = (s(body.energyLevel) || "medium") as EnergyLevel;
    const timeAvailable = (s(body.timeAvailable) || "1_hour") as TimeAvailable;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

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
      input: buildSystemPrompt({
        ideaType,
        energyLevel,
        timeAvailable,
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
      feature: "idea_generator_generated",
      input: {
        ideaType,
        energyLevel,
        timeAvailable,
      },
      output: {
        ideaTitles: output.ideas.map((x) => x.title).slice(0, 3),
        driftReference: output.telemetry.driftReference,
        tensionReference: output.telemetry.tensionReference,
      },
      metadata: {
        route: "/api/tools/idea-generator",
      },
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("idea-generator error:", error);
    return NextResponse.json({ error: "Could not generate ideas" }, { status: 500 });
  }
}
