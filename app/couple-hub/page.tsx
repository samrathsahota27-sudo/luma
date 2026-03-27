"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { ArrowRight, Lock } from "lucide-react";
import { DailyQuestionCard } from "@/components/DailyQuestionCard";
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
  description: string;
  cta: string;
  href?: string;
};

const FEATURES: HubFeature[] = [
  {
    title: "Your Weekly Reflection",
    subtitle: "Relationship Weather",
    description: "Emotional forecast — what’s moving, what’s stuck, and what to do next",
    cta: "View Weekly Report",
    href: "/report",
  },
  {
    title: "See Where This Is Heading",
    subtitle: "Future Paths",
    description: "Two realistic directions from here — if nothing changes vs if you intervene",
    cta: "View Future Paths",
    href: "/future-paths",
  },
  {
    title: "Decode What They Really Meant",
    subtitle: "Emotional Translator",
    description: "Turn confusion into clarity",
    cta: "Translate Message",
    href: "/translator",
  },
  {
    title: "See What They’re Not Saying",
    subtitle: "What's On Their Mind",
    description: "Uncover hidden emotional patterns",
    cta: "Reveal Insight",
    href: "/mind",
  },
  {
    title: "Fix The Connection",
    subtitle: "Date Night AI",
    description: "Get a date designed for your current state",
    cta: "Get Plan",
    href: "/date",
  },
  {
    title: "Talk Without Escalation",
    subtitle: "AI Chat (Neutral Space)",
    description: "A neutral space to process things",
    cta: "Start Conversation",
    href: "/chat",
  },
];

export default function CoupleHubPage() {
  const [quote, setQuote] = useState<string | null>(null);
  const [journeyStep, setJourneyStep] = useState(0);

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
  const nextHref =
    journeyStep <= 0
      ? "/translator"
      : journeyStep === 1
        ? "/date"
        : journeyStep === 2
          ? "/report"
          : journeyStep === 3
            ? "/map"
            : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a090c] text-[#e8e4df]">
      <Navigation />
      <TimelineBar />

      <main className={`flex-1 ${COUPLE_MAIN_PADDING_TOP} pb-28 px-6 relative overflow-hidden`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(90,60,120,0.22),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_80%,rgba(120,70,50,0.12),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_50%,rgba(60,50,90,0.1),transparent)]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-[720px] w-full">
          <header className="text-center space-y-6 mb-20 md:mb-28">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a7288] font-medium">
              Couples
            </p>
            <h1 className="font-serif text-[2rem] md:text-[2.5rem] lg:text-[2.75rem] leading-[1.12] text-[#f5f1ec] [font-family:var(--font-serif-display)] font-normal tracking-tight">
              Understand Your Dynamic
            </h1>
            <p className="text-[#9a9288] text-base md:text-lg max-w-xl mx-auto leading-relaxed font-light">
              This is not about you. It&apos;s about what exists between you.
            </p>
            <div className="mx-auto mt-2 w-full max-w-[560px] rounded-2xl border border-[#322d3a]/90 bg-[#120f16]/75 px-4 py-4 md:px-5">
              <p className="text-sm text-[#d8d1c8]">
                You are on Week {week} of your relationship reset
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.1]" aria-hidden>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c8b9ff] to-[#f0e6d8] transition-[width] duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                <span className="text-[#9a9288]">{progressPercent}% complete</span>
                <span className="text-[#bfb6cc]">Next: {nextStep}</span>
              </div>
              <p className="mt-2 text-xs text-[#8d849c]">You&apos;ve come further than most couples do.</p>
            </div>
            <blockquote className="pt-4 border-t border-[#2a2633]/80 mt-8 min-h-[4.5rem] flex items-center justify-center">
              <p
                className={`text-[#b5a99c] text-sm md:text-base italic font-light leading-relaxed max-w-md mx-auto text-center transition-opacity duration-500 ${
                  quote ? "opacity-100" : "opacity-0"
                }`}
                key={quote ?? "pending"}
              >
                {quote ? `“${quote}”` : "\u00a0"}
              </p>
            </blockquote>

            <DailyQuestionCard />
          </header>

          <div className="flex flex-col gap-6 md:gap-8">
            {FEATURES.map((f, index) => (
              <article
                key={f.subtitle}
                className="group relative rounded-2xl border border-[#2e2a35]/90 bg-[#141218]/75 backdrop-blur-xl p-7 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-500 ease-out hover:border-[#3f3a4a] hover:shadow-[0_28px_64px_rgba(35,25,55,0.35)] hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#4a3f6b]/[0.07] via-transparent to-transparent"
                  aria-hidden
                />
                {nextHref && f.href === nextHref && (
                  <span className="absolute right-4 top-4 rounded-full border border-[#5b4f73] bg-[#241d31]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d0c1ec]">
                    Next Step
                  </span>
                )}
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#6d6578] font-medium mb-3">
                  {f.subtitle}
                </p>
                <h2 className="font-serif text-xl md:text-[1.35rem] text-[#eee9e2] [font-family:var(--font-serif-display)] leading-snug">
                  {f.title}
                </h2>
                <p className="mt-3 text-[#928a7e] text-[15px] leading-relaxed font-light">
                  {f.description}
                </p>
                {f.href ? (
                  <Link
                    href={f.href}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#3d3848] bg-[#1c191f]/90 px-5 py-3 text-sm font-medium text-[#ddd8d0] transition-all duration-300 hover:border-[#524a60] hover:bg-[#25222b] hover:scale-[1.02] active:scale-[0.99]"
                  >
                    {f.cta}
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#3d3848] bg-[#1c191f]/90 px-5 py-3 text-sm font-medium text-[#ddd8d0] transition-all duration-300 hover:border-[#524a60] hover:bg-[#25222b] hover:scale-[1.02] active:scale-[0.99]"
                  >
                    {f.cta}
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </button>
                )}
              </article>
            ))}

            <article className="relative rounded-2xl border border-[#4a3f5c]/50 bg-[#16131d]/80 backdrop-blur-xl p-7 md:p-8 shadow-[0_0_60px_-12px_rgba(100,80,140,0.35),0_24px_56px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 hover:shadow-[0_0_70px_-8px_rgba(120,90,160,0.4),0_28px_64px_rgba(0,0,0,0.55)] hover:-translate-y-0.5">
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0810]/90 via-[#14101a]/50 to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#5c4d8c]/20 blur-3xl"
                aria-hidden
              />

              <div className="relative flex items-start justify-between gap-4">
                <span className="inline-flex rounded-full border border-[#5c4f7c]/55 bg-[#221a32]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c9b8e8]">
                  Pro
                </span>
                <Lock className="w-4 h-4 text-[#7a7088]" strokeWidth={1.75} aria-hidden />
              </div>

              <div className="relative mt-5 rounded-xl border border-[#2a2535]/80 bg-[#0f0d12]/60 p-5 md:p-6 backdrop-blur-md">
                <div className="pointer-events-none select-none blur-[1.5px] opacity-[0.65]">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#5c5468] font-medium mb-2">
                    Relationship Map
                  </p>
                  <h2 className="font-serif text-xl md:text-[1.35rem] text-[#e8e3dc] [font-family:var(--font-serif-display)]">
                    Your Relationship Map
                  </h2>
                  <p className="mt-2 text-[#7a7268] text-[15px] leading-relaxed font-light">
                    Track how your connection is evolving
                  </p>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl bg-[#0a090c]/25 backdrop-blur-[2px]"
                  aria-hidden
                />
              </div>

              <div className="relative mt-6">
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#3a3448]/80 bg-[#1a161f]/80 px-5 py-3 text-sm font-medium text-[#ddd8d0] transition-all duration-300 hover:border-[#524a60] hover:bg-[#25222b] hover:scale-[1.02]"
                >
                  View Map
                  <Lock className="w-3.5 h-3.5 opacity-70" aria-hidden />
                </Link>
              </div>
            </article>
          </div>

          <p className="mt-16 text-center text-xs text-[#5c564c] font-light leading-relaxed max-w-sm mx-auto">
            These tools are for two people willing to look at the space between them — honestly.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
