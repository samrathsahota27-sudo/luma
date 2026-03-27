"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  JOURNEY_PROGRESS_STORAGE_KEY,
  JOURNEY_STEPS,
  clampJourneyStep,
  getJourneyStepFromPath,
} from "@/lib/coupleJourney";

export type TimelineBarProps = {
  /**
   * Active index 0–4. Wire to weekly reports / backend later.
   * @default 2
   */
  currentStep?: number;
  /**
   * Fixed offset from top. Use `top-0` when there is no global Navigation
   * (e.g. full-screen chat).
   * @default top-16 — below fixed Navigation
   */
  topOffsetClass?: string;
  className?: string;
  /**
   * When false, the last step stays visually locked unless you pass currentStep &lt; 4.
   */
  finalReflectionUnlocked?: boolean;
};

/** Use on `main` when Navigation + TimelineBar are both fixed. */
export const COUPLE_MAIN_PADDING_TOP = "pt-36";

/** Below `Navigation` (z-50); chat page passes `className="z-[52]"` so bar sits above the z-40 shell. */
const Z_BAR = "z-[48]";

function clampStep(n: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(n)));
}

export function TimelineBar({
  currentStep,
  topOffsetClass = "top-16",
  className = "",
  finalReflectionUnlocked = true,
}: TimelineBarProps) {
  const pathname = usePathname();
  const last = JOURNEY_STEPS.length - 1;
  const autoStep = clampStep(getJourneyStepFromPath(pathname), last);
  const active = clampStep(currentStep ?? autoStep, last);
  const showFinalAsLocked = !finalReflectionUnlocked && active >= last;

  const fillPercent = useMemo(() => (last === 0 ? 100 : (active / last) * 100), [active, last]);

  useEffect(() => {
    try {
      const existing = Number(localStorage.getItem(JOURNEY_PROGRESS_STORAGE_KEY) ?? "0");
      const maxReached = Math.max(clampJourneyStep(existing), active);
      localStorage.setItem(JOURNEY_PROGRESS_STORAGE_KEY, String(maxReached));
    } catch {
      /* ignore storage issues */
    }
  }, [active]);

  return (
    <div
      role="navigation"
      aria-label="Relationship journey progress"
      className={`fixed left-0 right-0 ${topOffsetClass} ${Z_BAR} border-b border-white/[0.08] bg-[#121015]/90 backdrop-blur-md ${className}`}
    >
      <div className="mx-auto max-w-4xl px-3 pb-2 pt-2.5 md:px-5">
        <div className="relative px-2 md:px-3">
          <div className="pointer-events-none absolute left-4 right-4 top-[11px] h-0.5 rounded-full bg-white/[0.14] md:left-5 md:right-5" aria-hidden />
          <div
            className="pointer-events-none absolute left-4 top-[11px] h-0.5 max-w-[calc(100%-2rem)] rounded-full bg-gradient-to-r from-white/40 via-white/70 to-white/90 shadow-[0_0_14px_rgba(255,255,255,0.22)] transition-[width] duration-700 ease-out md:left-5 md:max-w-[calc(100%-2.5rem)]"
            style={{ width: `${fillPercent}%` }}
            aria-hidden
          />

          <div className="relative grid grid-cols-5 gap-0">
            {JOURNEY_STEPS.map((label, i) => {
              const isPast = i < active;
              const isActive = i === active;
              const isFuture = i > active;
              const finalLocked = i === last && showFinalAsLocked;

              return (
                <div key={label} className="flex flex-col items-center text-center">
                  <div className="relative flex h-[22px] w-full items-center justify-center">
                    <span
                      className={[
                        "relative z-[1] h-2.5 w-2.5 shrink-0 rounded-full border transition-all duration-500",
                        isActive
                          ? "scale-125 border-white/80 bg-white shadow-[0_0_14px_rgba(255,255,255,0.55)]"
                          : isPast
                            ? "border-white/45 bg-white/35"
                            : "border-white/20 bg-[#1a181d]",
                        finalLocked ? "opacity-50" : "",
                        isFuture ? "opacity-35" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-current={isActive ? "step" : undefined}
                    />
                  </div>
                  <span
                    className={[
                      "mt-1.5 max-w-[4.5rem] text-[9px] font-medium uppercase leading-tight tracking-wide text-white/45 md:max-w-none md:text-[10px]",
                      isActive ? "text-white/95" : "",
                      isPast && !isActive ? "text-white/65" : "",
                      isFuture ? "text-white/30" : "",
                      finalLocked ? "text-white/35" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
