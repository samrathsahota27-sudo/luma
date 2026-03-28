import { updateMemory } from "@/lib/memory";
import { resolveCalendarMood } from "@/lib/calendarOfUs";

const MAX_LOCAL = 48;
const SIG_KEY = "luma_emotion_tracker_sig";

/** Stable id for dedupe (local + cloud) per session. */
export function buildEmotionSessionSignature({
  resultPreview,
  brutalTruth,
  emotionalTag,
  sessionType = "individual",
}) {
  return `${sessionType}:${String(resultPreview ?? "").slice(0, 200)}|${brutalTruth || ""}|${emotionalTag || ""}`;
}

function clip(s, n) {
  const t = String(s ?? "").trim();
  if (!t) return "";
  return t.length <= n ? t : t.slice(0, n - 1) + "…";
}

function buildFallbackTag(brutalTruth, resultPreview) {
  const src = String(brutalTruth ?? "").trim() || String(resultPreview ?? "").trim();
  if (!src) return "In motion";
  const words = src
    .replace(/[.,;:!?]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  const joined = words.join(" ");
  return clip(joined, 42) || "In motion";
}

function buildFallbackInsight(brutalTruth, resultPreview) {
  const t = String(brutalTruth ?? "").trim();
  if (t) return clip(t, 240);
  return clip(String(resultPreview ?? "").replace(/\s+/g, " "), 240);
}

/**
 * Append one emotional tracker snapshot to local memory (luma_memory.emotionTracker).
 * Deduped with sessionStorage so refreshes do not duplicate.
 * @returns {Object|null} entry or null if skipped / empty
 */
export function tryRecordEmotionTrackerSession({
  emotionalTag,
  trackerInsight,
  brutalTruth,
  resultPreview,
  sessionType = "individual",
  sessionSignature,
  calendarState: calendarHint = null,
}) {
  if (typeof window === "undefined") return null;
  const sig = String(sessionSignature || "").trim();
  if (!sig) return null;

  try {
    const prev = sessionStorage.getItem(SIG_KEY);
    if (prev === sig) return null;
    sessionStorage.setItem(SIG_KEY, sig);
  } catch {
    /* ignore */
  }

  const tag = clip(emotionalTag || buildFallbackTag(brutalTruth, resultPreview), 80);
  const insight = clip(
    trackerInsight || buildFallbackInsight(brutalTruth, resultPreview),
    280
  );
  if (!insight) return null;

  const calendarState = resolveCalendarMood(
    tag || buildFallbackTag(brutalTruth, resultPreview),
    insight,
    calendarHint
  );
  const entry = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tag: tag || buildFallbackTag(brutalTruth, resultPreview),
    insight,
    at: new Date().toISOString(),
    sessionType: sessionType || "individual",
    calendarState,
  };

  updateMemory((m) => {
    const prevList = Array.isArray(m.emotionTracker) ? m.emotionTracker : [];
    return { ...m, emotionTracker: [entry, ...prevList].slice(0, MAX_LOCAL) };
  });

  return entry;
}
