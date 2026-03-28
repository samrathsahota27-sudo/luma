"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useEmotionTrackerMerged, type MergedEmotionEntry } from "@/hooks/useEmotionTrackerMerged";

const MIN_SLOTS = 7;

function sessionLabel(t: string) {
  try {
    return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function TrackerCard({
  entry,
  expanded,
  onToggle,
}: {
  entry: MergedEmotionEntry | null;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (!entry) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-muted-foreground">
        Complete a reflection to fill this spot.
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full text-left rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 transition-colors hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
      aria-expanded={expanded}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
            {sessionLabel(entry.at)} · {entry.sessionType === "couple" ? "Couple" : entry.sessionType === "connect" ? "Connect" : "Solo"}
          </p>
          <p className="font-medium text-foreground text-[15px] leading-snug line-clamp-2">{entry.tag}</p>
          {!expanded ? (
            <p className="mt-1.5 text-[13px] text-muted-foreground line-clamp-2 leading-snug">{entry.insight}</p>
          ) : null}
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform mt-0.5 ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        />
      </div>
      {expanded ? (
        <p className="mt-3 pt-3 border-t border-white/10 text-[14px] text-foreground/90 leading-relaxed">{entry.insight}</p>
      ) : null}
    </button>
  );
}

export function PatternOverTimeSection({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const { entries, loading } = useEmotionTrackerMerged(14);
  const [openId, setOpenId] = useState<string | null>(null);

  const slots: (MergedEmotionEntry | null)[] = [...entries];
  while (slots.length < MIN_SLOTS) slots.push(null);
  const display = slots.slice(0, Math.max(MIN_SLOTS, entries.length));

  const muted = variant === "dark" ? "text-[#8a847a]" : "text-muted-foreground";
  const title = variant === "dark" ? "text-[#f5f2ee]" : "text-foreground";

  return (
    <section className={className} aria-labelledby="pattern-over-time-heading">
      <h2 id="pattern-over-time-heading" className={`font-serif text-xl md:text-2xl [font-family:var(--font-serif-display)] ${title}`}>
        Your Pattern Over Time
      </h2>
      <p className={`mt-2 text-sm ${muted} max-w-md leading-relaxed`}>
        Recent emotional snapshots—tap a card to read the full line.
      </p>

      {loading ? (
        <p className={`mt-6 text-sm ${muted}`}>Loading…</p>
      ) : (
        <div className="mt-6 max-h-[min(70vh,520px)] overflow-y-auto pr-1 space-y-3 [scrollbar-gutter:stable]">
          {display.map((entry, i) => (
            <TrackerCard
              key={entry?.id ?? `placeholder-${i}`}
              entry={entry}
              expanded={entry ? openId === entry.id : false}
              onToggle={() => {
                if (!entry) return;
                setOpenId((id) => (id === entry.id ? null : entry.id));
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
