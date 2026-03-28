"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useLumaMemory } from "@/hooks/useLumaMemory";
import {
  getCoupleHubPatternInsight,
  shouldShowCoupleHubInactivityNudge,
  snoozeCoupleHubInactivityNudge,
  snoozeCoupleHubPatternNudge,
} from "@/lib/coupleHubNudges";

function NudgeCard({
  eyebrow,
  body,
  ctaHref,
  ctaLabel,
  onDismiss,
  dismissLabel,
  variant,
}: {
  eyebrow: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
  onDismiss: () => void;
  dismissLabel: string;
  variant: "amber" | "violet";
}) {
  const border =
    variant === "amber"
      ? "border-amber-400/25 bg-amber-400/[0.06]"
      : "border-violet-400/25 bg-violet-400/[0.06]";
  return (
    <div
      className={`relative w-full max-w-md mx-auto rounded-2xl border px-4 py-4 text-left shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md md:px-5 md:py-4 ${border}`}
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/45"
        aria-label={dismissLabel}
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 pr-8">{eyebrow}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-white/88 md:text-[15px]">{body}</p>
      <Link
        href={ctaHref}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-200/95 hover:text-white transition-colors"
      >
        {ctaLabel}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

/**
 * In-app only: gentle return + pattern insight for couple hub (no push).
 */
export function CoupleHubNudges() {
  const memory = useLumaMemory();
  const [showInactivity, setShowInactivity] = useState(false);
  const [patternDismissed, setPatternDismissed] = useState(false);

  useEffect(() => {
    setShowInactivity(shouldShowCoupleHubInactivityNudge());
  }, []);

  const patternLine = useMemo(() => {
    if (!memory) return null;
    return getCoupleHubPatternInsight(memory as Record<string, unknown>);
  }, [memory]);

  const showPattern = Boolean(patternLine) && !patternDismissed;

  if (!showInactivity && !showPattern) return null;

  return (
    <div
      className="mx-auto mt-6 flex w-full max-w-lg flex-col gap-3 px-1"
      role="region"
      aria-label="Gentle reminders"
    >
      {showInactivity ? (
        <div role="status" aria-live="polite">
          <NudgeCard
            variant="amber"
            eyebrow="Been a little quiet"
            body="It’s been a few days since a check-in or couple reflection. One quick tap below keeps your pattern honest—no full test needed."
            ctaHref="#hub-daily-heading"
            ctaLabel="Jump to today’s question"
            dismissLabel="Dismiss inactivity reminder"
            onDismiss={() => {
              snoozeCoupleHubInactivityNudge(7);
              setShowInactivity(false);
            }}
          />
        </div>
      ) : null}
      {showPattern ? (
        <div role="status" aria-live="polite">
          <NudgeCard
            variant="violet"
            eyebrow="Pattern insight"
            body={patternLine ?? ""}
            ctaHref="/couple"
            ctaLabel="Retake couple reflection"
            dismissLabel="Dismiss pattern insight"
            onDismiss={() => {
              snoozeCoupleHubPatternNudge(7);
              setPatternDismissed(true);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
