const MEMORY_KEY = "luma_memory";

import { defaultMemory } from "@/lib/defaultMemory";

function normalizeMemoryShape(raw) {
  const base = defaultMemory;
  const obj = raw && typeof raw === "object" ? raw : {};
  const profile = obj.profile && typeof obj.profile === "object" ? obj.profile : {};
  const patterns = obj.patterns && typeof obj.patterns === "object" ? obj.patterns : {};
  const scores = obj.scores && typeof obj.scores === "object" ? obj.scores : {};

  return {
    ...base,
    ...obj,
    profile: {
      ...base.profile,
      ...profile,
    },
    reflections: Array.isArray(obj.reflections) ? obj.reflections : base.reflections,
    conflicts: Array.isArray(obj.conflicts) ? obj.conflicts : base.conflicts,
    patterns: {
      ...base.patterns,
      ...patterns,
      communication: Array.isArray(patterns.communication)
        ? patterns.communication
        : Array.isArray(obj.patterns?.communication)
          ? obj.patterns.communication
          : base.patterns.communication,
      emotionalTrends: Array.isArray(patterns.emotionalTrends)
        ? patterns.emotionalTrends
        : Array.isArray(obj.patterns?.emotionalTrends)
          ? obj.patterns.emotionalTrends
          : base.patterns.emotionalTrends,
    },
    scores: {
      ...base.scores,
      ...scores,
      connection: typeof scores.connection === "number" ? scores.connection : base.scores.connection,
      conflict: typeof scores.conflict === "number" ? scores.conflict : base.scores.conflict,
      distance: typeof scores.distance === "number" ? scores.distance : base.scores.distance,
    },
    timeline: Array.isArray(obj.timeline) ? obj.timeline : base.timeline,
    emotionTracker: Array.isArray(obj.emotionTracker)
      ? obj.emotionTracker
      : base.emotionTracker,
  };
}

export function getMemory() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    if (!stored) {
      const init = normalizeMemoryShape(null);
      localStorage.setItem(MEMORY_KEY, JSON.stringify(init));
      return init;
    }
    const parsed = JSON.parse(stored);
    const normalized = normalizeMemoryShape(parsed);
    // Re-save to guarantee shape after schema upgrades.
    localStorage.setItem(MEMORY_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    const init = normalizeMemoryShape(null);
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(init));
    } catch {}
    return init;
  }
}

export function setMemory(data) {
  if (typeof window === "undefined") return;
  try {
    const normalized = normalizeMemoryShape(data);
    localStorage.setItem(MEMORY_KEY, JSON.stringify(normalized));
    try {
      window.dispatchEvent(new CustomEvent("luma_memory_updated", { detail: normalized }));
    } catch {}
  } catch {
    /* ignore */
  }
}

export function updateMemory(updater) {
  const current = getMemory() ?? normalizeMemoryShape(null);
  const next = updater(current) ?? current;
  setMemory(next);
  return getMemory();
}

