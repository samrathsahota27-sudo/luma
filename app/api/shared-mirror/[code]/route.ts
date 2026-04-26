import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

type MirrorSelection = {
  round: number;
  image: string;
  label?: string;
};

type ProfileSnapshot = {
  dominantPattern: string | null;
  recentPattern: string | null;
  recentLine: string | null;
};

const MIRROR_OVERLAP_SYSTEM_PROMPT = `You are Luma's poetic relationship intelligence writer.
Write one concise "First Mirror Overlap" insight line for a couple.

Rules:
- Warm, intimate, non-clinical, never generic.
- 16-30 words only.
- Reference overlap or contrast between both partners' recent image choices and emotional patterns.
- Avoid advice. This line should feel like a mirror, not instructions.
- No emojis.`;

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function normalizeSelections(input: unknown): MirrorSelection[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const rec = item && typeof item === "object" ? (item as Record<string, unknown>) : null;
      if (!rec) return null;
      const round = Number(rec.round);
      const image = safeString(rec.image);
      const label = safeString(rec.label);
      if (!Number.isFinite(round) || round < 1 || !image) return null;
      return {
        round: Math.max(1, Math.min(5, Math.floor(round))),
        image: image.slice(0, 120),
        label: label ? label.slice(0, 80) : undefined,
      };
    })
    .filter(Boolean)
    .slice(0, 6) as MirrorSelection[];
}

function pickProfileSnapshot(profile: Record<string, unknown> | null): ProfileSnapshot {
  const history = Array.isArray(profile?.pattern_history) ? (profile?.pattern_history as Record<string, unknown>[]) : [];
  const latest = history[history.length - 1] || null;
  return {
    dominantPattern: safeString(profile?.dominant_pattern) || safeString(latest?.pattern) || null,
    recentPattern: safeString(latest?.pattern) || null,
    recentLine: safeString(latest?.core_line) || safeString(latest?.description) || null,
  };
}

async function buildOverlapInsight({
  partnerASelections,
  partnerBSelections,
  partnerAProfile,
  partnerBProfile,
}: {
  partnerASelections: MirrorSelection[];
  partnerBSelections: MirrorSelection[];
  partnerAProfile: ProfileSnapshot;
  partnerBProfile: ProfileSnapshot;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "Your mirrors touch in a delicate way: one reaches for steadiness, the other for safety, and both are trying to protect closeness.";
  }

  const openai = new OpenAI({ apiKey });
  const prompt = `Partner A recent selections: ${JSON.stringify(partnerASelections)}
Partner B recent selections: ${JSON.stringify(partnerBSelections)}
Partner A pattern snapshot: ${JSON.stringify(partnerAProfile)}
Partner B pattern snapshot: ${JSON.stringify(partnerBProfile)}

Write one "First Mirror Overlap" line.`;
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: `${MIRROR_OVERLAP_SYSTEM_PROMPT}\n\n${prompt}`,
  });
  const text = safeString(response.output_text || "");
  if (!text) {
    return "Your recent mirrors suggest a gentle mismatch in tempo, not intention—both of you are reaching for connection through different emotional doors.";
  }
  return text.slice(0, 220);
}

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const normalized = normalizeCode(code || "");
    if (!normalized) return NextResponse.json({ error: "Code is required." }, { status: 400 });

    const admin = createSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { data: session } = await admin
      .from("couple_sessions")
      .select(
        "id, mirror_code, mirror_state, mirror_joined_at, mirror_overlap, partner_a_recent_selections, partner_b_recent_selections, user_a_id, user_b_id"
      )
      .eq("mirror_code", normalized)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: "Mirror code not found." }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: session.id,
      code: session.mirror_code,
      state: session.mirror_state || "waiting",
      partnerJoined: session.mirror_state === "connected",
      partnerJoinedAt: session.mirror_joined_at || null,
      overlap: session.mirror_overlap || null,
      selections: {
        a: Array.isArray(session.partner_a_recent_selections) ? session.partner_a_recent_selections : [],
        b: Array.isArray(session.partner_b_recent_selections) ? session.partner_b_recent_selections : [],
      },
    });
  } catch (error) {
    console.error("shared-mirror code GET error:", error);
    return NextResponse.json({ error: "Could not load shared mirror state" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const normalized = normalizeCode(code || "");
    if (!normalized) return NextResponse.json({ error: "Code is required." }, { status: 400 });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const partnerSelections = normalizeSelections(body.recentSelections);

    const { data: session } = await admin
      .from("couple_sessions")
      .select(
        "id, user_a_id, user_b_id, mirror_code, mirror_state, partner_a_recent_selections, partner_b_recent_selections, mirror_overlap"
      )
      .eq("mirror_code", normalized)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: "Mirror code not found." }, { status: 404 });
    }

    if (session.user_a_id && session.user_a_id === user.id) {
      return NextResponse.json({ error: "This is your own mirror code." }, { status: 400 });
    }

    const patch: Record<string, unknown> = {
      mirror_state: "connected",
      mirror_joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (!session.user_b_id) patch.user_b_id = user.id;
    if (partnerSelections.length > 0) patch.partner_b_recent_selections = partnerSelections;

    let overlap = session.mirror_overlap && typeof session.mirror_overlap === "object" ? session.mirror_overlap : null;

    const partnerASelections = Array.isArray(session.partner_a_recent_selections)
      ? (session.partner_a_recent_selections as MirrorSelection[])
      : [];
    const partnerBSelections =
      partnerSelections.length > 0
        ? partnerSelections
        : Array.isArray(session.partner_b_recent_selections)
          ? (session.partner_b_recent_selections as MirrorSelection[])
          : [];

    if (!overlap) {
      const [profileA, profileB] = await Promise.all([
        session.user_a_id
          ? admin.from("user_profiles").select("pattern_history, dominant_pattern").eq("id", session.user_a_id).maybeSingle()
          : Promise.resolve({ data: null }),
        admin.from("user_profiles").select("pattern_history, dominant_pattern").eq("id", user.id).maybeSingle(),
      ]);

      const insight = await buildOverlapInsight({
        partnerASelections,
        partnerBSelections,
        partnerAProfile: pickProfileSnapshot((profileA.data as Record<string, unknown> | null) || null),
        partnerBProfile: pickProfileSnapshot((profileB.data as Record<string, unknown> | null) || null),
      });

      overlap = {
        generated_at: new Date().toISOString(),
        partnerASelections,
        partnerBSelections,
        insight,
      };
      patch.mirror_overlap = overlap;
    }

    const { error: updateError } = await admin.from("couple_sessions").update(patch).eq("id", session.id);
    if (updateError) throw updateError;

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      code: session.mirror_code,
      state: "connected",
      partnerJoined: true,
      overlap,
    });
  } catch (error) {
    console.error("shared-mirror code POST error:", error);
    return NextResponse.json({ error: "Could not join mirror code" }, { status: 500 });
  }
}
