"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  getReflections,
  daysUntilNextReflection,
  type ReflectionEntry,
} from "@/lib/reflectionStorage";
import { ArrowRight, Lock } from "lucide-react";
import { PatternOverTimeSection } from "@/components/PatternOverTimeSection";
import { CalendarOfUsTimeline } from "@/components/CalendarOfUsTimeline";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function excerpt(text: string, maxLen: number) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= maxLen ? t : t.slice(0, maxLen) + "…";
}

const teaserInsight = "You tend to withdraw when overwhelmed.";

const placeholderLastSummary = "You tend to overthink emotional distance.";

export default function DashboardPage() {
  /** Placeholder until saved progress / resume state is wired */
  const hasStarted = false;

  const [lastReflection, setLastReflection] = useState<ReflectionEntry | null>(null);
  const [recentCount, setRecentCount] = useState(0);
  const [daysUntil, setDaysUntil] = useState<number | null>(null);

  useEffect(() => {
    const all = getReflections();
    const sorted = [...all].sort((a, b) => (b.date > a.date ? 1 : -1));
    if (sorted.length > 0) setLastReflection(sorted[0]);
    setRecentCount(all.length);
    setDaysUntil(daysUntilNextReflection());
  }, []);

  const canReflect = daysUntil === null;

  const lastSummary = lastReflection
    ? excerpt(lastReflection.content, 140)
    : placeholderLastSummary;

  return (
    <div className="min-h-screen flex flex-col bg-[#100f12] text-[#e8e4e0]">
      <Navigation />

      <main className="flex-1 pt-24 pb-24 px-6 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,100,160,0.12),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(90,70,50,0.08),transparent)]"
          aria-hidden
        />

        <div className="relative max-w-[900px] mx-auto w-full space-y-16 md:space-y-24">
          <header className="text-center space-y-5">
            <h1 className="font-serif text-[2.25rem] md:text-4xl lg:text-[2.65rem] leading-[1.15] tracking-tight text-[#f5f2ee] [font-family:var(--font-serif-display)] font-normal">
              Your Inner Map
            </h1>
            <p className="text-[#a39e97] text-base md:text-lg max-w-lg mx-auto leading-relaxed text-pretty font-light">
              Understand how you think, feel, and connect
            </p>
            <p className="pt-2 text-[#c4b8a8] text-sm md:text-base max-w-md mx-auto leading-relaxed italic font-light opacity-90">
              {teaserInsight}
            </p>
          </header>

          <section className="flex flex-col items-center">
            {canReflect ? (
              <Link
                href="/test"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#2a282e] bg-[#1a181d]/90 px-8 py-3.5 text-sm font-medium text-[#ece8e2] shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.02] hover:border-[#3d3a44] hover:bg-[#222028] hover:opacity-95"
              >
                {hasStarted ? "Continue Your Reflection" : "Start Your First Reflection"}
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            ) : (
              <p className="text-sm text-[#8a847a] text-center max-w-sm leading-relaxed">
                You can return for another reflection in {daysUntil} day{daysUntil === 1 ? "" : "s"}.
              </p>
            )}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 md:items-stretch">
            <div className="group flex h-full min-h-[300px] flex-col rounded-2xl border border-[#2a282e] bg-[#18161b]/80 p-8 md:p-10 shadow-[0_12px_48px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[#35323c] hover:shadow-[0_20px_56px_rgba(0,0,0,0.55)]">
              <span className="inline-flex w-fit rounded-full border border-[#3d3a44] bg-[#141318] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#9c968c]">
                Free
              </span>
              <h2 className="mt-6 font-serif text-xl md:text-2xl text-[#f5f2ee] [font-family:var(--font-serif-display)] leading-snug">
                Understand Yourself
              </h2>
              <p className="mt-3 flex-1 text-[#988f83] text-[15px] md:text-base leading-relaxed font-light">
                Explore your inner patterns and emotional responses
              </p>
              <div className="mt-8">
                {canReflect ? (
                  <Link
                    href="/test"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8e4e0] px-5 py-3 text-sm font-medium text-[#1a1816] transition-all duration-200 hover:opacity-90 hover:scale-[1.01]"
                  >
                    Start Test
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <p className="text-sm text-[#8a847a] leading-relaxed">
                    You can return for another reflection in {daysUntil} day{daysUntil === 1 ? "" : "s"}.
                  </p>
                )}
              </div>
            </div>

            <div className="relative md:z-10 md:scale-[1.03] md:-my-1">
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#6b5a8c]/25 via-transparent to-[#8b7355]/20 opacity-80 blur-sm" aria-hidden />
              <div className="pointer-events-none absolute -inset-[1px] rounded-2xl shadow-[0_0_48px_-8px_rgba(130,110,180,0.35)]" aria-hidden />

              <div className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-[#3d3550]/60 bg-[#1c1825]/90 p-8 md:p-10 shadow-[0_16px_56px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 ease-out hover:scale-[1.03] hover:border-[#524868]/70 hover:shadow-[0_22px_64px_rgba(40,30,60,0.45)]">
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a090c]/80 via-transparent to-[#1a1522]/40"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#6b5a8c]/10 blur-3xl"
                  aria-hidden
                />

                <div className="relative flex items-start justify-between gap-4">
                  <span className="inline-flex rounded-full border border-[#5c4f7c]/50 bg-[#261f35]/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#c4b8dd]">
                    Premium
                  </span>
                  <Lock className="h-4 w-4 shrink-0 text-[#6b6578]" strokeWidth={1.5} aria-hidden />
                </div>

                <h2 className="relative mt-6 font-serif text-xl md:text-2xl text-[#f2eef8] [font-family:var(--font-serif-display)] leading-snug">
                  Understand Your Dynamic
                </h2>
                <p className="relative mt-3 flex-1 text-[#a89ebc] text-[15px] md:text-base leading-relaxed font-light">
                  Reveal how you and your partner truly connect
                </p>

                <div className="relative mt-8">
                  <Link
                    href="/couple-hub"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#5c4f7c]/40 bg-gradient-to-br from-[#2a2438] to-[#1f1a2a] px-5 py-3 text-sm font-medium text-[#ebe6f5] transition-all duration-200 hover:border-[#766899]/50 hover:opacity-95 hover:scale-[1.02]"
                  >
                    Start Together
                    <ArrowRight className="h-4 w-4 opacity-80" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#2a282e] bg-[#161419]/70 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm">
            <PatternOverTimeSection variant="dark" />
          </section>

          <section className="rounded-2xl border border-[#2a282e] bg-[#161419]/70 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm">
            <CalendarOfUsTimeline variant="dark" fetchLimit={90} />
          </section>

          <section className="space-y-5">
            <h2 className="font-serif text-xl text-[#f5f2ee] [font-family:var(--font-serif-display)]">
              Your Last Reflection
            </h2>
            <div className="rounded-2xl border border-[#2a282e] bg-[#161419]/70 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-300 hover:border-[#35323c]">
              {lastReflection && (
                <p className="text-xs text-[#6e685f] mb-3 tracking-wide">
                  {formatDate(lastReflection.date)}
                  {lastReflection.mode === "couple" ? " · Couple reflection" : ""}
                </p>
              )}
              <p className="text-[#b8ae9f] leading-relaxed font-light">{lastSummary}</p>
              <Link
                href={
                  lastReflection ? `/dashboard/reflection/${lastReflection.id}` : "/test"
                }
                className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-[#d4ccc0] transition-all duration-200 hover:opacity-75 hover:translate-x-0.5"
              >
                View Full Insight
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <p className="text-center text-xs md:text-sm text-[#6e685f] font-light tracking-wide">
            You&apos;ve explored yourself {recentCount} time{recentCount === 1 ? "" : "s"}
          </p>

          <div className="flex justify-center pt-2">
            <Link
              href="/dashboard/gallery"
              className="text-sm text-[#8a847a] hover:text-[#c4b8a8] transition-colors duration-200 underline-offset-4 hover:underline"
            >
              Browse your inner landscapes
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
