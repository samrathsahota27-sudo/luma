import { supabase } from "@/lib/supabase";

/**
 * Insert one row into emotion_tracker_entries (requires Supabase migration + RLS).
 */
export async function insertEmotionTrackerRow({ emotionalTag, shortInsight, sessionType, calendarState }) {
  const tag = String(emotionalTag ?? "").trim();
  const insight = String(shortInsight ?? "").trim();
  if (!tag || !insight) return { ok: false, error: "empty" };

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return { ok: false, error: "no user" };

  const row = {
    user_id: user.id,
    emotional_tag: tag.slice(0, 160),
    short_insight: insight.slice(0, 500),
    session_type: sessionType || "individual",
  };
  const cs = String(calendarState ?? "").trim().toLowerCase();
  if (cs === "calm" || cs === "friction" || cs === "distance" || cs === "clarity") {
    row.calendar_state = cs;
  }

  const { error } = await supabase.from("emotion_tracker_entries").insert(row);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Avoid duplicate cloud rows for the same session (tab sessionStorage). */
export async function insertEmotionTrackerRowOncePerSession(sessionSignature, payload) {
  const sig = String(sessionSignature || "").trim();
  if (!sig) return { ok: false, error: "no sig" };
  const k = `luma_et_cloud:${sig.slice(0, 200)}`;
  try {
    if (sessionStorage.getItem(k)) return { ok: true, skipped: true };
  } catch {
    /* ignore */
  }
  const res = await insertEmotionTrackerRow(payload);
  if (res.ok) {
    try {
      sessionStorage.setItem(k, "1");
    } catch {
      /* ignore */
    }
  }
  return res;
}

export async function fetchEmotionTrackerRows(limit = 14) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: true, rows: [] };

  const { data, error } = await supabase
    .from("emotion_tracker_entries")
    .select("id, emotional_tag, short_insight, session_type, calendar_state, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { ok: false, rows: [], error: error.message };
  return { ok: true, rows: data || [] };
}
