"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAILY_MIRROR_EXAMPLES = [
  {
    pattern: "Quiet Withdrawal",
    day: "Day 6 · Settling the distance loop",
    question: "Tonight ask: “Was there a moment today you felt unseen?”",
    microInsight:
      "When this pattern is active, silence can look calm while disconnection quietly grows.",
    shiftNudge:
      "Shift nudge: Name one moment you pulled away, then one thing you needed instead.",
  },
  {
    pattern: "Soft Pursuit",
    day: "Day 12 · Rewiring reassurance",
    question: "Tonight ask: “What were you hoping I would notice without you saying it?”",
    microInsight:
      "This pattern often carries love through urgency, but urgency can be heard as pressure.",
    shiftNudge:
      "Shift nudge: Replace one repeated ask with one direct sentence.",
  },
  {
    pattern: "Protective Composure",
    day: "Day 19 · Moving from control to contact",
    question: "Tonight ask: “What did you keep tidy on the outside that felt messy inside?”",
    microInsight:
      "Composure keeps things stable, but it can also hide the exact emotion that needs care.",
    shiftNudge:
      "Shift nudge: Share one unpolished feeling before problem-solving.",
  },
];

export function HomeDailyMirror() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DAILY_MIRROR_EXAMPLES.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const active = DAILY_MIRROR_EXAMPLES[activeIndex];

  return (
    <section className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(74,54,116,0.14),rgba(8,7,12,0.98))] px-4 py-14 md:py-20">
      <div className="max-w-[920px] mx-auto">
        <div className="text-center max-w-[640px] mx-auto">
          <h2 className="font-serif text-[26px] md:text-[32px] text-white [font-family:var(--font-serif-display)]">
            Your Daily Mirror
          </h2>
          <p className="mt-3 text-sm md:text-[15px] text-white/65">
            One pattern-aware question each evening
          </p>
        </div>

        <Card className="mt-10 border-white/10 bg-white/[0.04] text-white shadow-[0_16px_56px_rgba(0,0,0,0.32)] transition-all duration-500">
          <CardHeader className="gap-3 pb-1">
            <p className="text-[11px] uppercase tracking-[0.16em] text-violet-200/80">
              {active.day}
            </p>
            <CardTitle className="font-serif text-2xl [font-family:var(--font-serif-display)]">
              {active.pattern}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-base leading-relaxed text-white/90">{active.question}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                  Micro insight preview
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{active.microInsight}</p>
              </div>
              <div className="rounded-xl border border-violet-300/20 bg-violet-500/[0.08] p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-violet-100/80">
                  Shift nudge
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">{active.shiftNudge}</p>
              </div>
            </div>

            <p className="text-xs text-white/50">
              In the 28-day journey, prompts adapt as your patterns evolve — so each evening builds on the last.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/how-it-works"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/20 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
              >
                See how it works
              </Link>
              <Link
                href="/choose-mode"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0f0d14] transition hover:opacity-95"
              >
                Start your journey
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
