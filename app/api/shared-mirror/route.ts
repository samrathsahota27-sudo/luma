import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getBaseUrl } from "@/utils/getBaseUrl";

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

export const MIRROR_OVERLAP_SYSTEM_PROMPT = `You are Luma's poetic relationship intelligence writer.
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

function buildCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  const pick = () => chars[Math.floor(Math.random() * chars.length)];
  return `${pick()}${pick()}${pick()}-${pick()}${pick()}${pick()}`;
}

async function generateUniqueCode(admin: NonNullable<ReturnType<typeof createSupabaseAdmin>>) {
  for (let i = 0; i < 16; i += 1) {
    const code = buildCode();
    const { data } = await admin.from("couple_sessions").select("id").eq("mirror_code", code).limit(1);
    if (!Array.isArray(data) || data.length === 0) return code;
  }
  return `${buildCode()}-${Date.now().toString(36).slice(-3).toUpperCase()}`;
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
    return "Your mirrors meet where one reaches for clarity and the other guards for safety; the overlap is gentle, alive, and waiting to be named together.";
  }

  const openai = new OpenAI({ apiKey });
  const userPrompt = `Partner A recent selections: ${JSON.stringify(partnerASelections)}
Partner B recent selections: ${JSON.stringify(partnerBSelections)}
Partner A pattern snapshot: ${JSON.stringify(partnerAProfile)}
Partner B pattern snapshot: ${JSON.stringify(partnerBProfile)}

Write one "First Mirror Overlap" line.`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: `${MIRROR_OVERLAP_SYSTEM_PROMPT}\n\n${userPrompt}`,
  });

  const text = safeString(response.output_text || "");
  if (!text) {
    return "Your mirrors overlap in a quiet way: one seeking reassurance, one seeking space, both trying to protect connection from being misunderstood.";
  }
  return text.slice(0, 220);
}

export async function GET() {
  try {
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

    const { data: session } = await admin
      .from("couple_sessions")
      .select(
        "id, mirror_code, mirror_state, mirror_joined_at, mirror_overlap, partner_a_recent_selections, partner_b_recent_selections, user_a_id, user_b_id, created_at"
      )
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .not("mirror_code", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ hasSession: false });
    }

    return NextResponse.json({
      hasSession: true,
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
    console.error("shared-mirror GET error:", error);
    return NextResponse.json({ error: "Could not fetch shared mirror status" }, { status: 500 });
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

    const admin = createSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const selections = normalizeSelections(body.recentSelections);

    const { data: existing } = await admin
      .from("couple_sessions")
      .select(
        "id, mirror_code, mirror_state, mirror_joined_at, mirror_overlap, partner_a_recent_selections, partner_b_recent_selections, user_a_id, user_b_id"
      )
      .eq("user_a_id", user.id)
      .not("mirror_code", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing && existing.mirror_code) {
      if (selections.length > 0) {
        await admin
          .from("couple_sessions")
          .update({ partner_a_recent_selections: selections, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      }
      return NextResponse.json({
        sessionId: existing.id,
        code: existing.mirror_code,
        state: existing.mirror_state || "waiting",
        partnerJoined: existing.mirror_state === "connected",
        overlap: existing.mirror_overlap || null,
        joinUrl: `${getBaseUrl()}/couple/join?mirrorCode=${encodeURIComponent(existing.mirror_code)}`,
      });
    }

    const code = await generateUniqueCode(admin);
    const sessionId = crypto.randomUUID();
    const { error } = await admin.from("couple_sessions").insert({
      id: sessionId,
      user_a_id: user.id,
      user_b_id: null,
      partner_a: null,
      partner_b: null,
      status: "awaiting_partner",
      result_generated: false,
      result: null,
      mirror_code: code,
      mirror_state: "waiting",
      partner_a_recent_selections: selections,
      partner_b_recent_selections: [],
      mirror_overlap: null,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;

    return NextResponse.json({
      sessionId,
      code,
      state: "waiting",
      partnerJoined: false,
      overlap: null,
      joinUrl: `${getBaseUrl()}/couple/join?mirrorCode=${encodeURIComponent(code)}`,
    });
  } catch (error) {
    console.error("shared-mirror POST error:", error);
    return NextResponse.json({ error: "Could not generate mirror code" }, { status: 500 });
  }
}
