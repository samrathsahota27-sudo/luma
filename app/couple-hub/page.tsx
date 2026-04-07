"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { ArrowRight, Brain, CalendarHeart, ChevronRight, MessageSquareText, Sparkles, Waves } from "lucide-react";
import { DailyQuestionCard } from "@/components/DailyQuestionCard";
import { RelationshipMapHero } from "@/components/RelationshipMapHero";
import { FutureProjectionPanel } from "@/components/FutureProjectionPanel";
import { CoupleHubOverlay } from "@/components/CoupleHubOverlay";
import { CalendarOfUsTimeline } from "@/components/CalendarOfUsTimeline";
import { useLumaMemory } from "@/hooks/useLumaMemory";
import { CoupleHubNudges } from "@/components/CoupleHubNudges";
import {
  JOURNEY_PROGRESS_STORAGE_KEY,
  clampJourneyStep,
  getNextStepLabel,
  getProgressPercentFromStep,
  getWeekFromStep,
} from "@/lib/coupleJourney";

const QUOTES = [
  "Love fails in translation.",
  "You’re not fighting each other. You’re fighting misinterpretation.",
  "Connection is built, not assumed.",
] as const;

type HubFeature = {
  title: string;
  subtitle: string;
  cta: string;
  href?: string;
  kind?: "translator" | "chat" | "date" | "mind";
  comingSoon?: boolean;
  Icon?: any;
};

const FEATURES: HubFeature[] = [
  {
    title: "Emotional Translator",
    subtitle: "Decode",
    cta: "Open",
    kind: "translator",
    Icon: MessageSquareText,
  },
  {
    title: "AI Chat",
    subtitle: "Resolve",
    cta: "Open",
    kind: "chat",
    Icon: Waves,
  },
  {
    title: "Date AI",
    subtitle: "Fix",
    cta: "Open",
    kind: "date",
    Icon: CalendarHeart,
  },
  {
    title: "Their Mind",
    subtitle: "Theory",
    cta: "Open",
    kind: "mind",
    Icon: Brain,
  },
  {
    title: "Silent Signal",
    subtitle: "Send",
    cta: "Open",
    href: "/silent-signal",
    comingSoon: true,
    Icon: Sparkles,
  },
];

export default function CoupleHubPage() {
  const [quote, setQuote] = useState<string | null>(null);
  const [journeyStep, setJourneyStep] = useState(0);
  const memory = useLumaMemory();
  const [overlay, setOverlay] = useState<null | "translator" | "chat" | "date" | "mind">(null);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    try {
      const saved = Number(localStorage.getItem(JOURNEY_PROGRESS_STORAGE_KEY) ?? "0");
      setJourneyStep(clampJourneyStep(saved));
    } catch {
      setJourneyStep(0);
    }
  }, []);

  const week = getWeekFromStep(journeyStep);
  const progressPercent = getProgressPercentFromStep(journeyStep);
  const nextStep = getNextStepLabel(journeyStep);

  const scores = useMemo(() => memory?.scores ?? { connection: 55, conflict: 40, distance: 45 }, [memory]);
  const connection = scores?.connection ?? 55;
  const conflict = scores?.conflict ?? 40;
  const distance = scores?.distance ?? 45;
  const resolvedCount = useMemo(() => {
    const n = Array.isArray(memory?.conflicts) ? memory?.conflicts.length : 0;
    return Math.max(0, Math.min(10, Math.floor(n / 2)));
  }, [memory]);

  const hubFeatureCardClasses =
    "group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-[transform,background-color,box-shadow] duration-300 min-h-[5.75rem] motion-safe:active:scale-[0.99] md:min-h-[6.25rem] md:rounded-3xl md:px-6 md:py-6";

  const ControlPanel = (
    <main className={`flex-1 ${COUPLE_MAIN_PADDING_TOP} pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(90,60,120,0.26),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_80%,rgba(120,70,50,0.14),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_50%,rgba(60,50,90,0.1),transparent)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-2xl md:max-w-3xl lg:max-w-5xl">
        {/* Top: title + journey (timeline is fixed above) */}
        <header className="pt-1 pb-8 text-center md:pb-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">Couples</p>
          <h1 className="mt-2 font-serif text-[30px] leading-[1.08] text-white [font-family:var(--font-serif-display)] tracking-tight md:mt-3 md:text-[40px]">
            Control Panel
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/60 md:text-base">
            <span className="font-medium text-white/75">
              {connection >= 60 ? "Aligned." : distance >= 60 ? "Drifting." : "Unsteady."}
            </span>{" "}
            {quote ? `“${quote}”` : ""}
          </p>

          <div className="mx-auto mt-6 flex w-full max-w-md flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-center text-[12px] text-white/60 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_48px_rgba(0,0,0,0.45),0_0_40px_rgba(140,110,200,0.08)] backdrop-blur-md md:text-[13px]">
            <span className="tabular-nums font-medium text-white/85">{progressPercent}%</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:inline" aria-hidden />
            <span>Week {week}</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:inline" aria-hidden />
            <span className="text-white/55">Next: {nextStep}</span>
          </div>

          <CoupleHubNudges />
        </header>

        {/* Middle: relationship map — primary focal */}
        <section
          aria-labelledby="hub-map-heading"
          className="flex min-h-[min(82svh,720px)] flex-col justify-center pb-16 md:min-h-[min(78svh,800px)] md:pb-20"
        >
          <h2 id="hub-map-heading" className="sr-only">
            Relationship map
          </h2>
          <div className="relative mx-auto w-full">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[36px] bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(140,110,200,0.28),transparent_72%)] opacity-80 blur-3xl motion-safe:animate-[pulse_5s_ease-in-out_infinite] md:-inset-10"
            />
            <div className="relative rounded-[28px] animate-luma-map-hub-glow">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                <RelationshipMapHero
                  size="lg"
                  className="rounded-[28px] border-white/10 shadow-none"
                  connection={connection}
                  distance={distance}
                  conflict={conflict}
                  resolvedCount={resolvedCount}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-16 md:py-24">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-4 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:px-8 md:py-10">
            <CalendarOfUsTimeline variant="dark" fetchLimit={90} />
          </div>
        </section>

        {/* Daily check-in */}
        <section className="border-t border-white/10 py-16 md:py-24" aria-labelledby="hub-daily-heading">
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">Daily</p>
            <h2
              id="hub-daily-heading"
              className="mt-3 font-serif text-[26px] text-white [font-family:var(--font-serif-display)] tracking-tight md:text-[34px]"
            >
              One tap.
            </h2>
            <p className="mt-3 text-sm text-white/55 md:text-base">
              One prompt per day—yes/no or a short choice—so you stay in touch without another full test.
            </p>
          </div>

          <div className="mx-auto mt-12 w-full max-w-full animate-in fade-in slide-in-from-bottom-2 duration-700 md:mt-14">
            <DailyQuestionCard />
          </div>
        </section>

        {/* Tools — full-width stacked cards */}
        <section className="border-t border-white/10 py-16 md:py-24" aria-labelledby="hub-tools-heading">
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">Tools</p>
            <h2
              id="hub-tools-heading"
              className="mt-3 font-serif text-[26px] text-white [font-family:var(--font-serif-display)] tracking-tight md:text-[34px]"
            >
              Click the tension.
            </h2>
            <p className="mt-3 text-sm text-white/55 md:text-base">Get the underneath.</p>
          </div>

          <ul className="mx-auto mt-12 flex w-full max-w-full flex-col gap-4 md:mt-14 md:gap-5">
            {FEATURES.map((f) => {
              const Icon = f.Icon;
              const isComingSoon = Boolean(f.comingSoon);

              const inner = (
                <>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(ellipse_55%_40%_at_50%_0%,rgba(180,150,255,0.14),transparent),radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(255,210,160,0.08),transparent)]"
                  />
                  <div className="relative flex w-full items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_0_32px_rgba(140,110,220,0.12)] motion-safe:transition-shadow motion-safe:duration-500 group-hover:shadow-[0_0_40px_rgba(140,110,220,0.2)] md:h-16 md:w-16">
                      {Icon ? <Icon className="h-7 w-7 text-white/90 md:h-8 md:w-8" strokeWidth={1.5} /> : null}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">{f.subtitle}</p>
                      <p className="mt-1 text-[17px] font-medium leading-snug text-white md:text-lg">{f.title}</p>
                      <p className="mt-1 text-sm text-white/55">
                        {isComingSoon
                          ? "Coming soon. Preview the concept."
                          : f.kind
                            ? "Tap to open"
                            : f.href
                              ? "Unlock"
                              : f.cta}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] p-2.5 md:p-3">
                      <ChevronRight
                        className="h-5 w-5 text-white/50 motion-safe:transition-transform motion-safe:duration-300 group-hover:translate-x-0.5 group-hover:text-white/80 md:h-6 md:w-6"
                        aria-hidden
                      />
                    </div>
                  </div>
                </>
              );

              if (f.kind) {
                return (
                  <li key={f.title} className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setOverlay(f.kind!)}
                      className={`${hubFeatureCardClasses} hover:border-white/15 hover:bg-white/[0.07] hover:shadow-[0_0_48px_rgba(140,110,200,0.12)]`}
                    >
                      {inner}
                    </button>
                  </li>
                );
              }

              if (f.href) {
                return (
                  <li key={f.title} className="flex justify-center">
                    <Link
                      href={f.href}
                      className={`${hubFeatureCardClasses} hover:border-white/15 hover:bg-white/[0.07] hover:shadow-[0_0_48px_rgba(140,110,200,0.12)]`}
                    >
                      {inner}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={f.title} className="flex justify-center">
                  <div className={`${hubFeatureCardClasses} cursor-default opacity-60`}>{inner}</div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Direction + reflection CTA */}
        <section className="border-t border-white/10 py-16 md:py-24" aria-labelledby="hub-future-heading">
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">Direction</p>
            <h2
              id="hub-future-heading"
              className="mt-3 font-serif text-[26px] text-white [font-family:var(--font-serif-display)] tracking-tight md:text-[34px]"
            >
              Where this goes.
            </h2>
            <p className="mt-3 text-sm text-white/55 md:text-base">Two paths. One choice.</p>
          </div>

          <div className="mx-auto mt-12 w-full animate-in fade-in slide-in-from-bottom-2 duration-700 md:mt-14">
            <FutureProjectionPanel
              className="w-full rounded-[28px] border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_26px_120px_rgba(0,0,0,0.7)]"
              connection={connection}
              distance={distance}
              conflict={conflict}
            />
          </div>

          <p className="mt-10 text-center text-xs text-white/40 md:mt-12">Less reading. More seeing.</p>

          <div className="mx-auto mt-8 flex max-w-md justify-center md:mt-10">
            <Link
              href="/couple"
              className="group relative inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-[#0b0a0d] shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_20px_90px_rgba(255,255,255,0.1)] transition hover:opacity-95 min-h-[3.25rem] motion-safe:active:scale-[0.99]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(180,150,255,0.22),transparent),radial-gradient(ellipse_60%_45%_at_90%_120%,rgba(255,210,160,0.14),transparent)] opacity-70"
              />
              <span className="relative">Start couple reflection</span>
              <ArrowRight className="relative h-5 w-5 opacity-70 motion-safe:transition-transform motion-safe:duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[#e8e4df]">
      <Navigation />
      <TimelineBar />
      <CoupleHubOverlay open={overlay != null} kind={(overlay ?? "translator") as any} onClose={() => setOverlay(null)} />
      {ControlPanel}

      <Footer />
    </div>
  );
}
