import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GOAL_SET = new Set(["communication", "intimacy", "conflict", "fun"]);

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeGoals(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => safeString(v).toLowerCase())
    .filter((v) => GOAL_SET.has(v))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 4);
}

function cap(value: string, max = 800) {
  if (!value) return "";
  return value.length > max ? value.slice(0, max) : value;
}

function pickLatestPattern(profile: Record<string, unknown> | null) {
  const history = Array.isArray(profile?.pattern_history) ? profile.pattern_history : [];
  const latest = history.length > 0 && typeof history[history.length - 1] === "object" ? history[history.length - 1] : null;
  if (!latest || typeof latest !== "object") return null;
  const rec = latest as Record<string, unknown>;
  return {
    pattern: safeString(rec.pattern) || null,
    theme: safeString((rec.theme as Record<string, unknown> | null)?.title) || null,
    tone: safeString((rec.tone as Record<string, unknown> | null)?.title) || null,
    coreLine: safeString(rec.core_line) || null,
  };
}

async function generateMirrorSummary({
  goals,
  improveText,
  strengthText,
  latestPattern,
}: {
  goals: string[];
  improveText: string;
  strengthText: string;
  latestPattern: { pattern: string | null; theme: string | null; tone: string | null; coreLine: string | null } | null;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "You’re entering this cycle with honest intention: protect what already works, and turn recurring friction into clearer, steadier connection.";
  }
  const openai = new OpenAI({ apiKey });
  const prompt = `Write a concise "Mirror Summary" for a couple psychology app user.

Input:
- Goals: ${JSON.stringify(goals)}
- Improve: ${JSON.stringify(improveText)}
- Going well: ${JSON.stringify(strengthText)}
- Latest image-pattern snapshot: ${JSON.stringify(latestPattern)}

Rules:
- 2-3 sentences, max 75 words.
- Personal, warm, specific, non-generic.
- Must reference both growth edge and existing strength.
- If latest pattern exists, gently weave it in.
- No bullets, no markdown, no emojis.`;

  const res = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const text = safeString(res.output_text || "");
  if (!text) {
    return "You’re starting this cycle with real clarity: strengthen what already feels good between you, and work the exact places where connection breaks under pressure.";
  }
  return text.slice(0, 520);
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ shouldShow: false, reason: "guest" });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select(
        "id, reflection_count, pattern_history, onboarding_goals, onboarding_improve_text, onboarding_strength_text, mirror_summary, onboarding_completed_at"
      )
      .eq("id", user.id)
      .maybeSingle();

    const reflectionCount =
      typeof profile?.reflection_count === "number"
        ? profile.reflection_count
        : Array.isArray(profile?.pattern_history)
          ? profile.pattern_history.length
          : 0;
    const completed = Boolean(profile?.onboarding_completed_at);
    const shouldShow = reflectionCount >= 1 && !completed;

    return NextResponse.json({
      shouldShow,
      completed,
      reflectionCount,
      goals: Array.isArray(profile?.onboarding_goals) ? profile.onboarding_goals : [],
      improveText: safeString(profile?.onboarding_improve_text),
      strengthText: safeString(profile?.onboarding_strength_text),
      mirrorSummary: safeString(profile?.mirror_summary),
    });
  } catch (error) {
    console.error("smart onboarding GET error:", error);
    return NextResponse.json({ shouldShow: false });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const goals = normalizeGoals(body.goals);
    const improveText = cap(safeString(body.improveText), 900);
    const strengthText = cap(safeString(body.strengthText), 900);

    if (goals.length === 0) {
      return NextResponse.json({ error: "Select at least one goal." }, { status: 400 });
    }
    if (!improveText || improveText.length < 12) {
      return NextResponse.json({ error: "Please add a bit more detail about what to improve." }, { status: 400 });
    }
    if (!strengthText || strengthText.length < 12) {
      return NextResponse.json({ error: "Please share what is going well." }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, email, pattern_history")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    if (!profile?.id) {
      const { error: insertError } = await supabase.from("user_profiles").insert({
        id: user.id,
        email: user.email ?? null,
        pattern_history: [],
        couple_sessions: [],
      });
      if (insertError) throw insertError;
    }

    const latestPattern = pickLatestPattern((profile as Record<string, unknown> | null) || null);
    const mirrorSummary = await generateMirrorSummary({
      goals,
      improveText,
      strengthText,
      latestPattern,
    });

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        onboarding_goals: goals,
        onboarding_improve_text: improveText,
        onboarding_strength_text: strengthText,
        mirror_summary: mirrorSummary,
        onboarding_completed_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (updateError) throw updateError;

    return NextResponse.json({
      ok: true,
      goals,
      improveText,
      strengthText,
      mirrorSummary,
    });
  } catch (error) {
    console.error("smart onboarding POST error:", error);
    return NextResponse.json({ error: "Could not save smart onboarding" }, { status: 500 });
  }
}
