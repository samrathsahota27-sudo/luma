"use client";

import { useMemo, useState } from "react";
import { useEmotionTrackerMerged, type MergedEmotionEntry } from "@/hooks/useEmotionTrackerMerged";
import {
  CALENDAR_MOOD_META,
  dateKeyLocal,
  resolveCalendarMood,
  shortWeekdayLabel,
  type CalendarMood,
} from "@/lib/calendarOfUs";

const MOODS: CalendarMood[] = ["calm", "friction", "distance", "clarity"];

type DayBucket = {
  dateKey: string;
  labelShort: string;
  mood: CalendarMood;
  primary: MergedEmotionEntry;
  all: MergedEmotionEntry[];
};

function formatDayHeading(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function buildBuckets(entries: MergedEmotionEntry[]): DayBucket[] {
  const byDay = new Map<string, MergedEmotionEntry[]>();
  for (const e of entries) {
    const k = dateKeyLocal(e.at);
    if (!k) continue;
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(e);
  }
  const keys = Array.from(byDay.keys()).sort();
  return keys.map((dateKey) => {
    const list = byDay.get(dateKey)!;
    const sorted = [...list].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    const primary = sorted[0];
    const mood = resolveCalendarMood(primary.tag, primary.insight, primary.calendarState ?? null);
    return {
      dateKey,
      labelShort: shortWeekdayLabel(primary.at),
      mood,
      primary,
      all: sorted,
    };
  });
}

export function CalendarOfUsTimeline({
  className = "",
  variant = "dark",
  fetchLimit = 90,
  entriesOverride,
  loadingOverride,
}: {
  className?: string;
  variant?: "dark" | "light";
  fetchLimit?: number;
  entriesOverride?: MergedEmotionEntry[] | null;
  loadingOverride?: boolean;
}) {
  const { entries, loading } = useEmotionTrackerMerged(fetchLimit);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const effectiveEntries = entriesOverride ?? entries;
  const effectiveLoading = loadingOverride ?? (entriesOverride ? false : loading);
  const buckets = useMemo(() => buildBuckets(effectiveEntries), [effectiveEntries]);
  const selected = buckets.find((b) => b.dateKey === selectedKey) ?? null;

  const titleCls = variant === "dark" ? "text-[#f5f2ee]" : "text-foreground";
  const muted = variant === "dark" ? "text-[#8a847a]" : "text-muted-foreground";
  const cardCls =
    variant === "dark"
      ? "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md"
      : "rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm";
  const trackPad = variant === "dark" ? "pb-1" : "pb-1";

  return (
    <section className={className} aria-labelledby="calendar-of-us-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="calendar-of-us-heading"
            className={`font-serif text-xl md:text-2xl [font-family:var(--font-serif-display)] ${titleCls}`}
          >
            Calendar of Us
          </h2>
          <p className={`mt-2 text-sm ${muted} max-w-md leading-relaxed`}>
            How the emotional tone shifted across your reflections—oldest to newest. Tap a day for the insight.
          </p>
        </div>
      </div>

      {effectiveLoading ? (
        <p className={`mt-6 text-sm ${muted}`}>Loading…</p>
      ) : buckets.length === 0 ? (
        <p className={`mt-6 text-sm ${muted}`}>Complete a reflection to see your Calendar of Us.</p>
      ) : (
        <>
          <div
            className={`mt-8 -mx-1 overflow-x-auto overflow-y-visible ${trackPad} scroll-px-4 snap-x snap-mandatory [scrollbar-width:thin]`}
            role="list"
            aria-label="Emotional timeline by day"
          >
            <div className="flex min-h-[9.5rem] gap-4 px-1 pb-2 pt-1">
              {buckets.map((b) => {
                const meta = CALENDAR_MOOD_META[b.mood];
                const isOn = selectedKey === b.dateKey;
                return (
                  <button
                    key={b.dateKey}
                    type="button"
                    role="listitem"
                    onClick={() => setSelectedKey((k) => (k === b.dateKey ? null : b.dateKey))}
                    className={`group flex min-w-[4.75rem] max-w-[4.75rem] shrink-0 snap-center flex-col items-center gap-3 rounded-2xl px-2 py-4 transition-transform motion-safe:active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 md:min-w-[5.25rem] md:max-w-[5.25rem] md:py-5 ${
                      isOn ? `ring-2 ${meta.ringClass} ring-offset-2 ring-offset-transparent` : ""
                    }`}
                    aria-pressed={isOn}
                    aria-label={`${formatDayHeading(b.primary.at)}, ${meta.label}. Tap for insight.`}
                  >
                    <span className={`text-[10px] font-medium uppercase tracking-[0.14em] ${muted}`}>
                      {b.labelShort}
                    </span>
                    <div className="relative flex h-14 w-full flex-col items-center justify-end">
                      <div
                        className={`absolute bottom-2 left-1/2 h-9 w-[85%] -translate-x-1/2 rounded-full bg-gradient-to-t ${meta.waveClass} opacity-90 blur-[0.5px]`}
                        aria-hidden
                      />
                      <div
                        className={`relative z-10 h-3.5 w-3.5 rounded-full ${meta.dotClass} motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-110`}
                        aria-hidden
                      />
                      <div
                        className={`relative z-[1] mt-1 h-10 w-1.5 rounded-full bg-gradient-to-b ${meta.waveClass} opacity-80`}
                        aria-hidden
                      />
                    </div>
                    <span className={`text-center text-[11px] leading-tight ${muted} line-clamp-2`}>
                      {b.primary.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {MOODS.map((m) => {
              const meta = CALENDAR_MOOD_META[m];
              return (
                <span key={m} className={`inline-flex items-center gap-2 text-xs ${muted}`}>
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dotClass}`} aria-hidden />
                  {meta.label}
                </span>
              );
            })}
          </div>

          {selected ? (
            <div className={`mt-6 p-5 ${cardCls}`}>
              <p className={`text-[11px] uppercase tracking-[0.16em] ${muted}`}>
                {formatDayHeading(selected.primary.at)}
                {selected.all.length > 1 ? ` · ${selected.all.length} moments` : ""}
              </p>
              <p className={`mt-3 text-xs font-medium ${titleCls}`}>
                <span className="opacity-80">{CALENDAR_MOOD_META[selected.mood].label}</span>
                <span className={`mx-2 font-light opacity-50`}>·</span>
                {selected.primary.sessionType === "couple"
                  ? "Couple"
                  : selected.primary.sessionType === "connect"
                    ? "Connect"
                    : "Solo"}
              </p>
              <p className={`mt-2 text-lg font-medium leading-snug ${titleCls}`}>{selected.primary.tag}</p>
              <p className={`mt-3 text-[15px] leading-relaxed ${variant === "dark" ? "text-white/85" : "text-foreground/90"}`}>
                {selected.primary.insight}
              </p>
            </div>
          ) : (
            <p className={`mt-4 text-xs ${muted}`}>Tap a day above to read that snapshot.</p>
          )}
        </>
      )}
    </section>
  );
}
