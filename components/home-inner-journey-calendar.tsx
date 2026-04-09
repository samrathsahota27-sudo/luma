"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  getReflections,
  buildMergedTimelineEntries,
  localDateKeyFromIso,
  type ReflectionEntry,
} from "@/lib/reflectionStorage";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0..6, Sun=0
  const diff = (day + 6) % 7; // Mon=0 ... Sun=6
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, days: number) {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

function excerpt(text: string, maxLen = 140) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen).trim() + "…";
}

function monthLabel(d: Date) {
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

export function HomeInnerJourneyCalendar() {
  const supabase = createClient();
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const refreshEntries = useCallback(async () => {
    const local = getReflections();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setEntries(local);
        return;
      }
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("pattern_history, couple_sessions")
        .eq("id", user.id)
        .single();
      setEntries(
        buildMergedTimelineEntries({
          local,
          userId: user.id,
          patternHistory: profile?.pattern_history,
          coupleSessions: profile?.couple_sessions,
        })
      );
    } catch {
      setEntries(local);
    }
  }, [supabase]);

  useEffect(() => {
    void refreshEntries();
  }, [refreshEntries]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void refreshEntries();
    });
    const onFocus = () => {
      void refreshEntries();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refreshEntries, supabase]);

  const byDate = useMemo(() => {
    const map = new Map<string, ReflectionEntry[]>();
    for (const e of entries) {
      const key = localDateKeyFromIso(String(e?.date ?? ""));
      if (!key) continue;
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    // newest first per day
    for (const [k, list] of map) {
      list.sort((a, b) => (b.date > a.date ? 1 : -1));
      map.set(k, list);
    }
    return map;
  }, [entries]);

  const range = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = addDays(startOfWeekMonday(today), 7 * 8 - 1); // 8 weeks grid
    const start = addDays(end, -(7 * 8 - 1));
    const days: Array<{ date: Date; key: string }> = [];
    for (let i = 0; i < 56; i++) {
      const date = addDays(start, i);
      days.push({ date, key: toDateKey(date) });
    }
    return { start, end, days, todayKey: toDateKey(today) };
  }, []);

  const hasAny = entries.length > 0;
  const selectedEntries = selectedKey ? byDate.get(selectedKey) ?? [] : [];
  const selected = selectedEntries[0] ?? null;
  const sid = selected ? String(selected.id) : "";
  const canOpenStoredDetail = Boolean(selected && !sid.startsWith("account-"));
  const accountDetailHref =
    selected?.mode === "couple" ? "/couple-hub" : "/result/latest";

  const mini = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = startOfWeekMonday(today);
    const days: Array<{ key: string; day: number }> = [];
    for (let i = 0; i < 21; i++) {
      const d = addDays(start, i);
      days.push({ key: toDateKey(d), day: d.getDate() });
    }
    return { days };
  }, []);

  const placeholderDotKeys = useMemo(() => {
    // Deterministic placeholders (faint “future value” hints)
    return new Set([mini.days[3]?.key, mini.days[10]?.key, mini.days[17]?.key].filter(Boolean));
  }, [mini.days]);

  return (
    <section className="border-t border-white/10 px-6 py-20 md:py-24">
      <div className="max-w-[960px] mx-auto">
        <div className="text-center">
          <h2 className="font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
            Your Inner Journey
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed text-base">
            Track how your inner world changes over time.
          </p>
        </div>

        {!hasAny ? (
          <div className="mt-12 max-w-[720px] mx-auto">
            <div className="rounded-[22px] bg-white/[0.06] border border-white/10 shadow-[0_12px_44px_rgba(31,26,23,0.06)] p-6 md:p-8">
              <Link
                href="/timeline"
                className={cn(
                  "block rounded-[18px] border border-white/10 bg-background",
                  "p-4 md:p-5 transition-all duration-200 ease-out",
                  "hover:shadow-[0_12px_36px_rgba(31,26,23,0.08)] hover:scale-[1.01]"
                )}
                aria-label="View your timeline"
              >
                <div className="grid grid-cols-7 gap-2">
                  {mini.days.map(({ key, day }) => {
                    const completed = (byDate.get(key) ?? []).length > 0;
                    const showPlaceholder = !hasAny && placeholderDotKeys.has(key);
                    return (
                      <div
                        key={key}
                        className={cn(
                          "relative aspect-square rounded-[10px] border border-white/10",
                          completed ? "bg-violet-400/15" : "bg-white/[0.04]"
                        )}
                      >
                        <span className="absolute top-1 left-1 text-[10px] text-muted-foreground opacity-70">
                          {day}
                        </span>
                        {(completed || showPlaceholder) && (
                          <span
                            aria-hidden
                            className={cn(
                              "absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full",
                              completed ? "bg-violet-400/50" : "bg-violet-400/20"
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Link>

              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  Start your first reflection — your journey will appear here
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-12">
            <div className="flex items-center justify-between max-w-[760px] mx-auto px-1">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {monthLabel(range.end)}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-400/50" aria-hidden />
                  Completed
                </span>
              </p>
            </div>

            <div className="mt-5 overflow-x-auto scrollbar-none">
              <div className="min-w-[560px] max-w-[760px] mx-auto">
                {/* Weekday labels */}
                <div className="grid grid-cols-7 gap-2 px-1">
                  {WEEKDAYS.map((d) => (
                    <div key={d} className="text-[11px] text-muted-foreground text-center uppercase tracking-[0.16em]">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="mt-3 grid grid-cols-7 gap-2 px-1">
                  {range.days.map(({ date, key }) => {
                    const list = byDate.get(key) ?? [];
                    const completed = list.length > 0;
                    const selected = selectedKey === key;
                    const isToday = range.todayKey === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedKey(selected ? null : key)}
                        className={cn(
                          "relative aspect-square rounded-[12px] transition-all duration-200 ease-out",
                          "border border-white/10",
                          completed ? "bg-violet-400/15 hover:bg-violet-400/20" : "bg-background opacity-70 hover:opacity-90",
                          "hover:shadow-[0_8px_24px_rgba(31,26,23,0.06)] hover:scale-[1.02]",
                          selected && "ring-2 ring-ring/30 shadow-[0_10px_30px_rgba(31,26,23,0.10)]",
                          isToday && !selected && "ring-1 ring-ring/25"
                        )}
                        aria-pressed={selected}
                        aria-label={`${
                          completed ? "Reflection saved" : "No reflection"
                        } on ${key}`}
                      >
                        <span className="absolute top-1.5 left-1.5 text-[11px] text-muted-foreground">
                          {date.getDate()}
                        </span>
                        {completed && (
                          <span
                            aria-hidden
                            className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-violet-400/50"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected day detail */}
            {selectedKey && (
              <div className="mt-8 max-w-[760px] mx-auto">
                {selected ? (
                  <div className="rounded-[20px] bg-white/[0.05] border border-white/10 shadow-[0_10px_35px_rgba(31,26,23,0.06)] p-6 md:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          Reflection from this day
                        </p>
                        <p className="mt-3 text-foreground text-sm md:text-[15px] leading-relaxed">
                          {excerpt(selected.content, 180) || "—"}
                        </p>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-background border border-white/10 text-muted-foreground whitespace-nowrap">
                        {selected.mode === "couple" ? "Couple" : "Individual"}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {canOpenStoredDetail ? (
                        <Link
                          href={`/dashboard/reflection/${selected.id}`}
                          className="inline-flex items-center justify-center rounded-full px-5 py-3 bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium transition-opacity hover:opacity-90"
                        >
                          View Full Result
                        </Link>
                      ) : (
                        <Link
                          href={accountDetailHref}
                          className="inline-flex items-center justify-center rounded-full px-5 py-3 bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium transition-opacity hover:opacity-90"
                        >
                          {selected?.mode === "couple" ? "Open couple hub" : "View latest insight"}
                        </Link>
                      )}
                      {selectedEntries.length > 1 && (
                        <span className="text-xs text-muted-foreground">
                          {selectedEntries.length} reflections saved that day
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[20px] bg-background border border-white/10 p-6 text-center text-sm text-muted-foreground">
                    No reflection saved on this day.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

