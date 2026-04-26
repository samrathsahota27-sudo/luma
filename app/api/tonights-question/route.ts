import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";

type QuestionPayload = {
  questionForYou: string;
  questionForThem: string;
  rationale: string;
};

type ReflectionPayload = {
  mirrorReflection: string;
  microShiftInsight: string;
};

export const TONIGHTS_QUESTION_SYSTEM_PROMPT = `You are Luma's nightly retention engine for couples.
Generate one deeply personal "Tonight's Mirror Question" pair using ONLY supplied account data.

Goals:
- Make both questions feel emotionally precise, gentle, and askable tonight.
- Create asymmetry: one question is "for you to ask them", the other is "for them to ask you".
- Reflect image-based patterns, drift/tension trajectory, cycle week, and onboarding goals.

Hard rules:
- No generic therapy wording.
- Mention at least one specific pattern signal if available (e.g., Quiet Withdrawal, Soft Pursuit).
- Keep each question short (max 22 words).
- Keep tone warm and non-accusatory.
- One question can be vulnerable, the other can be clarifying — but both should feel safe.
- Never output markdown.

Return strict JSON only:
{
  "questionForYou": "string",
  "questionForThem": "string",
  "rationale": "1 concise sentence describing what this pair targets"
}`;

const TONIGHTS_REFLECTION_SYSTEM_PROMPT = `You are Luma's Mirror Reflection writer.
Given today's two answered questions, produce:
1) a brief mirror reflection
2) one micro-shift insight for tonight

Rules:
- 2 short sentences for mirrorReflection (max 55 words total).
- microShiftInsight is 1 sentence (max 24 words), concrete and gentle.
- Tie to known pattern dynamics if available.
- No blame, no diagnosis, no markdown.

Return strict JSON:
{
  "mirrorReflection": "string",
  "microShiftInsight": "string"
}`;

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cap(text: string, max = 700) {
  return text.length > max ? text.slice(0, max) : text;
}

function parseModelJson(raw: string): Record<string, unknown> {
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

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getCycleWeek(startDate: string | null) {
  if (!startDate) return 1;
  const startTs = Date.parse(`${startDate}T00:00:00.000Z`);
  if (!Number.isFinite(startTs)) return 1;
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const elapsedDays = Math.max(0, Math.floor((todayUtc - startTs) / 86400000));
  return Math.max(1, Math.min(4, Math.floor(elapsedDays / 7) + 1));
}

function latestPatternSignals(profile: Record<string, unknown>) {
  const patternHistory = Array.isArray(profile?.pattern_history) ? profile.pattern_history : [];
  const coupleSessions = Array.isArray(profile?.couple_sessions) ? profile.couple_sessions : [];
  const latestPattern = patternHistory.length > 0 ? (patternHistory[patternHistory.length - 1] as Record<string, unknown>) : null;
  const latestCouple = coupleSessions.length > 0 ? (coupleSessions[coupleSessions.length - 1] as Record<string, unknown>) : null;
  return {
    pattern: safeString(latestPattern?.pattern) || null,
    coreLine: safeString(latestPattern?.core_line) || safeString(latestPattern?.description) || null,
    drift:
      typeof latestCouple?.drift === "number"
        ? latestCouple.drift
        : typeof (latestCouple?.drift as Record<string, unknown> | null)?.value === "number"
          ? (latestCouple?.drift as Record<string, unknown>).value
          : null,
    tension:
      typeof latestCouple?.tension === "number"
        ? latestCouple.tension
        : typeof (latestCouple?.tension as Record<string, unknown> | null)?.value === "number"
          ? (latestCouple?.tension as Record<string, unknown>).value
          : null,
  };
}

function normalizeQuestionPayload(parsed: Record<string, unknown>): QuestionPayload {
  const questionForYou = cap(safeString(parsed.questionForYou), 220);
  const questionForThem = cap(safeString(parsed.questionForThem), 220);
  const rationale = cap(safeString(parsed.rationale), 260);
  return {
    questionForYou:
      questionForYou || "Ask them: Was there a moment today you needed reassurance but stayed quiet about it?",
    questionForThem:
      questionForThem || "Invite them to ask you: What made you feel most emotionally distant today, even briefly?",
    rationale: rationale || "This pair reduces misread intent by inviting one vulnerable cue and one clarifying cue.",
  };
}

function normalizeReflectionPayload(parsed: Record<string, unknown>): ReflectionPayload {
  const mirrorReflection = cap(safeString(parsed.mirrorReflection), 380);
  const microShiftInsight = cap(safeString(parsed.microShiftInsight), 220);
  return {
    mirrorReflection:
      mirrorReflection ||
      "Your answers show care is present, but timing and expression still misalign. Naming the moment before defending it helps both of you feel less alone.",
    microShiftInsight:
      microShiftInsight ||
      "Tonight, mirror one feeling before offering a fix; this lowers tension faster than explanation.",
  };
}

async function generateQuestions({
  openai,
  contextJson,
  brief,
}: {
  openai: OpenAI;
  contextJson: string;
  brief: string;
}) {
  const res = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: `${TONIGHTS_QUESTION_SYSTEM_PROMPT}\n\nAccount context:\n${contextJson}\n\nNightly brief:\n${brief}`,
  });
  return normalizeQuestionPayload(parseModelJson(safeString(res.output_text)));
}

async function generateReflection({
  openai,
  contextJson,
  questionForYou,
  questionForThem,
  answerForYou,
  answerForThem,
}: {
  openai: OpenAI;
  contextJson: string;
  questionForYou: string;
  questionForThem: string;
  answerForYou: string;
  answerForThem: string;
}) {
  const prompt = `${TONIGHTS_REFLECTION_SYSTEM_PROMPT}

Context:
${contextJson}

Question for you to ask them:
${questionForYou}
Answer:
${answerForYou || "(no answer)"}

Question for them to ask you:
${questionForThem}
Answer:
${answerForThem || "(no answer)"}`;
  const res = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });
  return normalizeReflectionPayload(parseModelJson(safeString(res.output_text)));
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        questionDate: getTodayDate(),
        questionForYou: "Ask them: What was the moment today you felt most alone, even if nothing looked wrong?",
        questionForThem: "Invite them to ask you: What did I do today that made you feel closest to me?",
        rationale: "A soft asymmetry creates one vulnerable and one affirming path.",
        answered: false,
      });
    }

    const today = getTodayDate();
    const { data: existing } = await supabase
      .from("tonight_mirror_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("question_date", today)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        questionDate: existing.question_date,
        cycleWeek: existing.cycle_week,
        questionForYou: existing.question_for_you,
        questionForThem: existing.question_for_them,
        rationale: existing.rationale || "",
        answerForYou: existing.answer_for_you || "",
        answerForThem: existing.answer_for_them || "",
        mirrorReflection: existing.mirror_reflection || null,
        microShiftInsight: existing.micro_shift_insight || null,
        savedAsRitual: Boolean(existing.saved_as_ritual),
        answered: Boolean(existing.answer_for_you || existing.answer_for_them),
      });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const cycleStart =
      safeString(profile?.couple_journey_start_date) || safeString(profile?.start_date) || null;
    const cycleWeek = getCycleWeek(cycleStart);
    const goals = Array.isArray(profile?.onboarding_goals) ? profile.onboarding_goals : [];
    const patternSignals = latestPatternSignals((profile as Record<string, unknown>) || {});

    const accountContext = await buildUnifiedAccountContext({
      supabase,
      user,
      clientContext: null,
      maxChars: 14000,
    });

    const apiKey = process.env.OPENAI_API_KEY;
    const questionPayload = apiKey
      ? await generateQuestions({
          openai: new OpenAI({ apiKey }),
          contextJson: accountContext.contextJson || "{}",
          brief: `Cycle week ${cycleWeek}. Goals: ${JSON.stringify(goals)}. Pattern snapshot: ${JSON.stringify(patternSignals)}.`,
        })
      : normalizeQuestionPayload({});

    const insertRow = {
      user_id: user.id,
      question_date: today,
      cycle_week: cycleWeek,
      onboarding_goals: goals,
      question_for_you: questionPayload.questionForYou,
      question_for_them: questionPayload.questionForThem,
      rationale: questionPayload.rationale,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("tonight_mirror_logs")
      .insert(insertRow)
      .select("*")
      .single();
    if (insertError) throw insertError;

    await recordFeatureUsage({
      supabase,
      user,
      feature: "tonights_question_generated",
      input: {
        cycleWeek,
        goals,
      },
      output: {
        questionForYou: questionPayload.questionForYou,
        questionForThem: questionPayload.questionForThem,
      },
      metadata: {
        route: "/api/tonights-question",
      },
    });

    return NextResponse.json({
      id: inserted.id,
      questionDate: inserted.question_date,
      cycleWeek: inserted.cycle_week,
      questionForYou: inserted.question_for_you,
      questionForThem: inserted.question_for_them,
      rationale: inserted.rationale || "",
      answerForYou: "",
      answerForThem: "",
      mirrorReflection: null,
      microShiftInsight: null,
      savedAsRitual: false,
      answered: false,
    });
  } catch (error) {
    console.error("tonights-question GET error:", error);
    return NextResponse.json({ error: "Could not load tonight's question" }, { status: 500 });
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
    const answerForYou = cap(safeString(body.answerForYou), 900);
    const answerForThem = cap(safeString(body.answerForThem), 900);
    const saveAsRitual = Boolean(body.saveAsRitual);

    if (!answerForYou && !answerForThem) {
      return NextResponse.json({ error: "Please answer at least one question." }, { status: 400 });
    }

    const today = getTodayDate();
    const { data: existing } = await supabase
      .from("tonight_mirror_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("question_date", today)
      .maybeSingle();
    if (!existing) {
      return NextResponse.json({ error: "Tonight's question is not ready yet." }, { status: 404 });
    }

    const accountContext = await buildUnifiedAccountContext({
      supabase,
      user,
      clientContext: null,
      maxChars: 14000,
    });

    const apiKey = process.env.OPENAI_API_KEY;
    const reflectionPayload = apiKey
      ? await generateReflection({
          openai: new OpenAI({ apiKey }),
          contextJson: accountContext.contextJson || "{}",
          questionForYou: safeString(existing.question_for_you),
          questionForThem: safeString(existing.question_for_them),
          answerForYou,
          answerForThem,
        })
      : normalizeReflectionPayload({});

    const { data: updated, error: updateError } = await supabase
      .from("tonight_mirror_logs")
      .update({
        answer_for_you: answerForYou || existing.answer_for_you,
        answer_for_them: answerForThem || existing.answer_for_them,
        mirror_reflection: reflectionPayload.mirrorReflection,
        micro_shift_insight: reflectionPayload.microShiftInsight,
        saved_as_ritual: saveAsRitual || Boolean(existing.saved_as_ritual),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (updateError) throw updateError;

    await recordFeatureUsage({
      supabase,
      user,
      feature: "tonights_question_answered",
      input: {
        answerForYou: answerForYou.slice(0, 280),
        answerForThem: answerForThem.slice(0, 280),
      },
      output: {
        mirrorReflection: reflectionPayload.mirrorReflection,
        microShiftInsight: reflectionPayload.microShiftInsight,
        savedAsRitual: Boolean(updated.saved_as_ritual),
      },
      metadata: {
        route: "/api/tonights-question",
      },
    });

    return NextResponse.json({
      id: updated.id,
      questionDate: updated.question_date,
      cycleWeek: updated.cycle_week,
      questionForYou: updated.question_for_you,
      questionForThem: updated.question_for_them,
      rationale: updated.rationale || "",
      answerForYou: updated.answer_for_you || "",
      answerForThem: updated.answer_for_them || "",
      mirrorReflection: updated.mirror_reflection || null,
      microShiftInsight: updated.micro_shift_insight || null,
      savedAsRitual: Boolean(updated.saved_as_ritual),
      answered: true,
    });
  } catch (error) {
    console.error("tonights-question POST error:", error);
    return NextResponse.json({ error: "Could not save tonight's answers" }, { status: 500 });
  }
}
