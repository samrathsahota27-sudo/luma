"use client";

import { useCallback, useEffect, useState } from "react";
import { getMemory } from "@/lib/memory";
import { fetchEmotionTrackerRows } from "@/lib/emotionalTrackerSupabase";
import type { CalendarMood } from "@/lib/calendarOfUs";

export type MergedEmotionEntry = {
  id: string;
  tag: string;
  insight: string;
  at: string;
  sessionType: string;
  source: "cloud" | "local";
  /** Resolved or persisted mood for Calendar of Us (optional for older local rows). */
  calendarState?: CalendarMood | null;
};

function mergeDedupe(cloud: MergedEmotionEntry[], local: MergedEmotionEntry[]): MergedEmotionEntry[] {
  const keyOf = (e: MergedEmotionEntry) =>
    `${e.tag.trim().toLowerCase()}|${e.insight.trim().slice(0, 120).toLowerCase()}`;
  const map = new Map<string, MergedEmotionEntry>();
  for (const e of [...cloud, ...local]) {
    const k = keyOf(e);
    const prev = map.get(k);
    const t = new Date(e.at).getTime();
    if (!prev || t > new Date(prev.at).getTime()) map.set(k, e);
  }
  return Array.from(map.values()).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function useEmotionTrackerMerged(limit = 14) {
  const [entries, setEntries] = useState<MergedEmotionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const mem = getMemory();
    const localRaw = Array.isArray(mem?.emotionTracker) ? mem.emotionTracker : [];
    const local: MergedEmotionEntry[] = localRaw.map(
      (e: {
        id?: string;
        tag?: string;
        insight?: string;
        at?: string;
        sessionType?: string;
        calendarState?: string;
      }) => ({
        id: String(e.id ?? `local-${e.at}`),
        tag: String(e.tag ?? "").trim() || "—",
        insight: String(e.insight ?? "").trim(),
        at: String(e.at ?? new Date().toISOString()),
        sessionType: String(e.sessionType ?? "individual"),
        calendarState:
          e.calendarState === "calm" ||
          e.calendarState === "friction" ||
          e.calendarState === "distance" ||
          e.calendarState === "clarity"
            ? e.calendarState
            : null,
        source: "local" as const,
      })
    );

    const cloudRes = await fetchEmotionTrackerRows(limit);
    const cloudRows = cloudRes.rows ?? [];
    const cloud: MergedEmotionEntry[] = cloudRows.map(
      (r: {
        id: string;
        emotional_tag: string;
        short_insight: string;
        session_type: string;
        calendar_state?: string | null;
        created_at: string;
      }) => ({
        id: r.id,
        tag: (r.emotional_tag || "").trim() || "—",
        insight: (r.short_insight || "").trim(),
        at: r.created_at,
        sessionType: r.session_type || "individual",
        calendarState:
          r.calendar_state === "calm" ||
          r.calendar_state === "friction" ||
          r.calendar_state === "distance" ||
          r.calendar_state === "clarity"
            ? r.calendar_state
            : null,
        source: "cloud" as const,
      })
    );

    const merged = mergeDedupe(cloud, local).slice(0, limit);
    setEntries(merged);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onMem = () => load();
    window.addEventListener("luma_memory_updated", onMem as EventListener);
    return () => window.removeEventListener("luma_memory_updated", onMem as EventListener);
  }, [load]);

  return { entries, loading, refresh: load };
}
