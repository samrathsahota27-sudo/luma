import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildUnifiedAccountContext, recordFeatureUsage } from "@/lib/accountContext";

type LayerKey = "core_dynamic" | "hidden_pattern" | "conflict_pattern" | "transformation_arc";

type UnlockLayer = {
  key: LayerKey;
  title: string;
  subtitle: string;
  requiredDay: number;
  requiredReflections: number;
  requiredQuestions: number;
  requiredJointSessions: number;
  imagePool: string[];
};

const LAYERS: UnlockLayer[] = [
  {
    key: "core_dynamic",
    title: "Core Dynamic",
    subtitle: "Your baseline mirror pattern",
    requiredDay: 1,
    requiredReflections: 1,
    requiredQuestions: 0,
    requiredJointSessions: 0,
    imagePool: ["r1_a.jpg", "r1_b.jpg", "r2_a.jpg", "r3_b.jpg"],
  },
  {
    key: "hidden_pattern",
    title: "Hidden Pattern",
    subtitle: "The quieter loop under pressure",
    requiredDay: 7,
    requiredReflections: 2,
    requiredQuestions: 3,
    requiredJointSessions: 1,
    imagePool: ["r2_b.jpg", "r2_c.jpg", "r3_a.jpg", "r4_c.jpg"],
  },
  {
    key: "conflict_pattern",
    title: "Conflict Pattern",
    subtitle: "How friction escalates between you",
    requiredDay: 14,
    requiredReflections: 3,
    requiredQuestions: 7,
    requiredJointSessions: 2,
    imagePool: ["r2_d.jpg", "r3_c.jpg", "r4_b.jpg", "r4_d.jpg"],
  },
  {
    key: "transformation_arc",
    title: "Transformation Arc",
    subtitle: "What changed across your full cycle",
    requiredDay: 28,
    requiredReflections: 5,
    requiredQuestions: 14,
    requiredJointSessions: 3,
    imagePool: ["r1_d.jpg", "r3_d.jpg", "r4_a.jpg", "r4_d.jpg"],
  },
];

const PATTERN_UNLOCK_SYSTEM_PROMPT = `You are Luma's premium pattern unlock narrator.
Generate one concise discovery insight for a newly unlocked relationship layer.

Rules:
- Warm, precise, discovery tone (not a paywall tone).
- Mention how recent activity made this layer visible now.
- Tie to pattern and trend data when available.
- 2-3 short sentences, max 85 words.
- End with one gentle "next move tonight" line.
- No markdown and no emojis.
Return plain text only.`;

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function cycleDayFromStart(startDate: string | null) {
  if (!startDate) return 1;
  const ts = Date.parse(`${startDate}T00:00:00.000Z`);
  if (!Number.isFinite(ts)) return 1;
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const elapsed = Math.max(0, Math.floor((todayUtc - ts) / 86400000));
  return Math.min(28, elapsed + 1);
}

function normalizeSelectedImages(value: unknown, layer: UnlockLayer) {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => safeString(v))
    .filter((v) => layer.imagePool.includes(v))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 3);
}

function toLayerResponse({
  layer,
  cycleDay,
  reflectionsCount,
  questionsAnsweredCount,
  jointSessionsCount,
  row,
}: {
  layer: UnlockLayer;
  cycleDay: number;
  reflectionsCount: number;
  questionsAnsweredCount: number;
  jointSessionsCount: number;
  row?: Record<string, unknown> | null;
}) {
  const meets =
    cycleDay >= layer.requiredDay &&
    reflectionsCount >= layer.requiredReflections &&
    questionsAnsweredCount >= layer.requiredQuestions &&
    jointSessionsCount >= layer.requiredJointSessions;
  return {
    key: layer.key,
    title: layer.title,
    subtitle: layer.subtitle,
    locked: !meets,
    unlocked: meets,
    imagePool: layer.imagePool,
    insight: safeString(row?.generated_insight) || null,
    selectedImages: Array.isArray(row?.selected_images) ? row?.selected_images : [],
    generatedAt: row?.generated_at || null,
    unlockMessage: !meets
      ? "Your mirror isn’t ready to reveal this layer yet — keep reflecting together."
      : null,
    requirements: {
      day: layer.requiredDay,
      reflections: layer.requiredReflections,
      questions: layer.requiredQuestions,
      jointSessions: layer.requiredJointSessions,
    },
    progress: {
      day: cycleDay,
      reflections: reflectionsCount,
      questions: questionsAnsweredCount,
      jointSessions: jointSessionsCount,
    },
  };
}

async function ensureRows({
  supabase,
  userId,
  cycleStartDate,
  cycleDay,
  reflectionsCount,
  questionsAnsweredCount,
  jointSessionsCount,
}: {
  supabase: any;
  userId: string;
  cycleStartDate: string;
  cycleDay: number;
  reflectionsCount: number;
  questionsAnsweredCount: number;
  jointSessionsCount: number;
}) {
  const nowIso = new Date().toISOString();
  for (const layer of LAYERS) {
    const unlocked =
      cycleDay >= layer.requiredDay &&
      reflectionsCount >= layer.requiredReflections &&
      questionsAnsweredCount >= layer.requiredQuestions &&
      jointSessionsCount >= layer.requiredJointSessions;
    const { data: existing } = await supabase
      .from("pattern_unlock_progress")
      .select("id, unlocked_at")
      .eq("user_id", userId)
      .eq("cycle_start_date", cycleStartDate)
      .eq("layer_key", layer.key)
      .maybeSingle();

    if (!existing?.id) {
      await supabase.from("pattern_unlock_progress").insert({
        user_id: userId,
        cycle_start_date: cycleStartDate,
        layer_key: layer.key,
        unlocked_at: unlocked ? nowIso : null,
      });
      continue;
    }

    if (unlocked && !existing.unlocked_at) {
      await supabase
        .from("pattern_unlock_progress")
        .update({ unlocked_at: nowIso, updated_at: nowIso })
        .eq("id", existing.id);
    }
  }
}

async function buildUnlockInsight({
  layer,
  selectedImages,
  contextJson,
}: {
  layer: UnlockLayer;
  selectedImages: string[];
  contextJson: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return `You unlocked ${layer.title}. Your recent reflections and daily signals are now strong enough to reveal this layer. Tonight, ask one clearer question before reacting.`;
  }
  const openai = new OpenAI({ apiKey });
  const res = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: `${PATTERN_UNLOCK_SYSTEM_PROMPT}

Unlocked layer: ${layer.title} (${layer.key})
Targeted selected images: ${JSON.stringify(selectedImages)}
Account context:
${contextJson}`,
  });
  const text = safeString(res.output_text || "");
  return text || `You unlocked ${layer.title}. This layer appears now because your recent reflection and repair signals reached real consistency. Tonight, name one pattern gently before it hardens.`;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("start_date, couple_journey_start_date, pattern_history")
      .eq("id", user.id)
      .maybeSingle();

    const cycleStartDate =
      safeString(profile?.couple_journey_start_date) || safeString(profile?.start_date) || todayDateString();
    const cycleDay = cycleDayFromStart(cycleStartDate);
    const reflectionsCount = Array.isArray(profile?.pattern_history) ? profile.pattern_history.length : 0;

    const [{ count: questionCount }, { count: jointCount }] = await Promise.all([
      supabase
        .from("tonight_mirror_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .or("answer_for_you.not.is.null,answer_for_them.not.is.null"),
      supabase
        .from("couple_sessions")
        .select("id", { count: "exact", head: true })
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .eq("result_generated", true),
    ]);

    const questionsAnsweredCount = Number(questionCount || 0);
    const jointSessionsCount = Number(jointCount || 0);

    await ensureRows({
      supabase,
      userId: user.id,
      cycleStartDate,
      cycleDay,
      reflectionsCount,
      questionsAnsweredCount,
      jointSessionsCount,
    });

    const { data: rows } = await supabase
      .from("pattern_unlock_progress")
      .select("layer_key, generated_insight, selected_images, generated_at, unlocked_at")
      .eq("user_id", user.id)
      .eq("cycle_start_date", cycleStartDate);

    const byLayer = new Map<string, Record<string, unknown>>();
    for (const row of rows || []) byLayer.set(String(row.layer_key), row as Record<string, unknown>);

    return NextResponse.json({
      cycleStartDate,
      cycleDay,
      layers: LAYERS.map((layer) =>
        toLayerResponse({
          layer,
          cycleDay,
          reflectionsCount,
          questionsAnsweredCount,
          jointSessionsCount,
          row: byLayer.get(layer.key) || null,
        })
      ),
    });
  } catch (error) {
    console.error("pattern-unlocks GET error:", error);
    return NextResponse.json({ error: "Could not load pattern unlock state" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const layerKey = safeString(body.layerKey) as LayerKey;
    const layer = LAYERS.find((x) => x.key === layerKey);
    if (!layer) return NextResponse.json({ error: "Invalid layer key." }, { status: 400 });

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("start_date, couple_journey_start_date, pattern_history")
      .eq("id", user.id)
      .maybeSingle();

    const cycleStartDate =
      safeString(profile?.couple_journey_start_date) || safeString(profile?.start_date) || todayDateString();
    const cycleDay = cycleDayFromStart(cycleStartDate);
    const reflectionsCount = Array.isArray(profile?.pattern_history) ? profile.pattern_history.length : 0;
    const [{ count: questionCount }, { count: jointCount }] = await Promise.all([
      supabase
        .from("tonight_mirror_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .or("answer_for_you.not.is.null,answer_for_them.not.is.null"),
      supabase
        .from("couple_sessions")
        .select("id", { count: "exact", head: true })
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .eq("result_generated", true),
    ]);
    const questionsAnsweredCount = Number(questionCount || 0);
    const jointSessionsCount = Number(jointCount || 0);

    const unlocked =
      cycleDay >= layer.requiredDay &&
      reflectionsCount >= layer.requiredReflections &&
      questionsAnsweredCount >= layer.requiredQuestions &&
      jointSessionsCount >= layer.requiredJointSessions;
    if (!unlocked) {
      return NextResponse.json(
        { error: "This layer is still locked. Keep reflecting together to reveal it." },
        { status: 400 }
      );
    }

    const selectedImages = normalizeSelectedImages(body.selectedImages, layer);
    if (selectedImages.length < 2) {
      return NextResponse.json({ error: "Select at least 2 images for this unlock." }, { status: 400 });
    }

    const accountContext = await buildUnifiedAccountContext({
      supabase,
      user,
      clientContext: null,
      maxChars: 14000,
    });

    const insight = await buildUnlockInsight({
      layer,
      selectedImages,
      contextJson: accountContext.contextJson || "{}",
    });

    const nowIso = new Date().toISOString();
    const { data: upserted, error: upsertError } = await supabase
      .from("pattern_unlock_progress")
      .upsert(
        {
          user_id: user.id,
          cycle_start_date: cycleStartDate,
          layer_key: layer.key,
          unlocked_at: nowIso,
          generated_insight: insight,
          selected_images: selectedImages,
          generated_at: nowIso,
          updated_at: nowIso,
          metadata: {
            cycleDay,
            reflectionsCount,
            questionsAnsweredCount,
            jointSessionsCount,
          },
        },
        { onConflict: "user_id,cycle_start_date,layer_key" }
      )
      .select("layer_key, generated_insight, selected_images, generated_at, unlocked_at")
      .single();
    if (upsertError) throw upsertError;

    await recordFeatureUsage({
      supabase,
      user,
      feature: "pattern_unlock_generated",
      input: {
        layer: layer.key,
        selectedImages,
      },
      output: {
        insight,
      },
      metadata: {
        route: "/api/pattern-unlocks",
      },
    });

    return NextResponse.json({
      ok: true,
      layer: toLayerResponse({
        layer,
        cycleDay,
        reflectionsCount,
        questionsAnsweredCount,
        jointSessionsCount,
        row: upserted as Record<string, unknown>,
      }),
    });
  } catch (error) {
    console.error("pattern-unlocks POST error:", error);
    return NextResponse.json({ error: "Could not generate unlock insight" }, { status: 500 });
  }
}
