"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, Lock } from "lucide-react";
import { PatternOverTimeSection } from "@/components/PatternOverTimeSection";
import { CalendarOfUsTimeline } from "@/components/CalendarOfUsTimeline";
import { createClient } from "@/lib/supabase/client";

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

function buildEmergingPatternText(entries: any[]) {
  const recent = Array.isArray(entries) ? entries.slice(0, 3) : [];
  if (recent.length === 0) return null;

  const latest = recent[0] ?? {};
  const latestPattern = String(latest?.pattern || "").trim();
  const latestLine = String(latest?.core_line || latest?.description || "").trim();

  const patterns = recent
    .map((e) => String(e?.pattern || "").trim())
    .filter(Boolean);

  const frequency = new Map<string, number>();
  for (const p of patterns) frequency.set(p, (frequency.get(p) || 0) + 1);

  const dominant = [...frequency.entries()].sort((a, b) => b[1] - a[1])[0];
  const dominantPattern = dominant?.[0] || latestPattern;
  const dominantCount = dominant?.[1] || 0;

  const lineA =
    dominantPattern && dominantCount >= 2
      ? `${dominantPattern} appears repeatedly across your recent reflections.`
      : dominantPattern
        ? `Your recent reflections center around ${dominantPattern}.`
        : "Your recent reflections show a consistent emotional thread.";

  const lineB = latestLine ? excerpt(latestLine, 120) : "";
  return [lineA, lineB].filter(Boolean).join(" ");
}

const placeholderLastSummary = "You tend to overthink emotional distance.";

export default function DashboardPage() {
  const supabase = createClient();
  const [patternHistory, setPatternHistory] = useState<any[]>([]);
  const [coupleSessions, setCoupleSessions] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const signedIn = Boolean(user);
      setIsSignedIn(signedIn);
      if (!user) {
        setPatternHistory([]);
        setCoupleSessions([]);
        setHistoryLoaded(true);
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("pattern_history, couple_sessions")
        .eq("id", user.id)
        .single();

      if (profile) {
        setPatternHistory(profile.pattern_history || []);
        setCoupleSessions(profile.couple_sessions || []);
      } else {
        setPatternHistory([]);
        setCoupleSessions([]);
      }
    } finally {
      setHistoryLoaded(true);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchDashboardData();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void fetchDashboardData();
    });
    const onFocus = () => {
      void fetchDashboardData();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [fetchDashboardData, supabase]);

  const canReflect = true;
  const hasStarted = patternHistory.length > 0;

  const sortedPatternHistory = useMemo(
    () =>
      [...patternHistory].sort(
        (a, b) =>
          new Date(String(b?.date || 0)).getTime() -
          new Date(String(a?.date || 0)).getTime()
      ),
    [patternHistory]
  );
  const lastPatternEntry = sortedPatternHistory[0] ?? null;
  const emergingPatternText = buildEmergingPatternText(sortedPatternHistory);
  const individualReflectionCount = patternHistory.length;
  const recentCount = patternHistory.length + coupleSessions.length;
  const lastSummary = lastPatternEntry
    ? excerpt(
        String(
          lastPatternEntry.fullInsight ||
            lastPatternEntry.description ||
            lastPatternEntry.summary ||
            lastPatternEntry.core_line ||
            ""
        ),
        120
      )
    : historyLoaded
      ? "Complete your first reflection to see your latest insight here."
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
            {emergingPatternText ? (
              <>
                <p className="pt-2 text-[#c4b8a8] text-xs md:text-sm max-w-md mx-auto leading-relaxed uppercase tracking-[0.14em] opacity-80">
                  Emerging Pattern (based on recent reflections)
                </p>
                <p className="pt-1 text-[#c4b8a8] text-sm md:text-base max-w-md mx-auto leading-relaxed italic font-light opacity-90">
                  {emergingPatternText}
                </p>
              </>
            ) : null}
            {isSignedIn === false ? (
              <div className="pt-1">
                <Link
                  href="/auth"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[12px] bg-white text-[#0b0a0d] text-base font-medium transition-opacity hover:opacity-90 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_40px_rgba(120,90,180,0.2)]"
                >
                  Sign in
                </Link>
              </div>
            ) : null}
          </header>

          {isSignedIn && historyLoaded ? (
            <section className="rounded-2xl border border-[#2a282e] bg-[#161419]/70 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm space-y-6">
              <div>
                <p className="text-sm font-medium text-[#e8e4e0]">
                  You&apos;ve completed{" "}
                  <span className="tabular-nums text-[#f5f2ee]">
                    {individualReflectionCount + coupleSessions.length}
                  </span>{" "}
                  reflection
                  {individualReflectionCount + coupleSessions.length === 1 ? "" : "s"}
                </p>
                <p className="mt-1 text-xs text-[#8a847a]">
                  {individualReflectionCount} individual
                  {individualReflectionCount === 1 ? "" : "s"}
                  {coupleSessions.length > 0
                    ? ` · ${coupleSessions.length} couple session${coupleSessions.length === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>
              <div
                className="rounded-xl border border-dashed border-[#3d3a44] bg-[#0f0e12]/80 px-4 py-10 text-center"
                aria-hidden={false}
              >
                <p className="text-sm text-[#8a847a]">Pattern tracker — coming soon</p>
              </div>
            </section>
          ) : null}

          <section className="flex flex-col items-center">
            {canReflect ? (
              <Link
                href="/test?start=1"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#2a282e] bg-[#1a181d]/90 px-8 py-3.5 text-sm font-medium text-[#ece8e2] shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.02] hover:border-[#3d3a44] hover:bg-[#222028] hover:opacity-95"
              >
                {hasStarted ? "Continue Your Reflection" : "Start Your First Reflection"}
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            ) : (
              <p className="text-sm text-[#8a847a] text-center max-w-sm leading-relaxed">
                You can return for another reflection soon.
              </p>
            )}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 md:items-stretch">
            <div className="group flex h-full min-h-[300px] flex-col rounded-2xl border border-[#2a282e] bg-[#18161b]/80 p-8 md:p-10 shadow-[0_12px_48px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:border-[#35323c] hover:shadow-[0_20px_56px_rgba(0,0,0,0.55)]">
              <span className="inline-flex w-fit rounded-full border border-[#3d3a44] bg-[#141318] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#9c968c]">
                Free
              </span>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#c7c0b5]/80">
                Individual Reflection
              </p>
              <div className="mt-3 h-px w-16 bg-gradient-to-r from-[#b9b1a6]/35 to-transparent" aria-hidden />
              <h2 className="mt-6 font-serif text-xl md:text-2xl text-[#f5f2ee] [font-family:var(--font-serif-display)] leading-snug">
                Understand Yourself
              </h2>
              <p className="mt-3 flex-1 text-[#988f83] text-[15px] md:text-base leading-relaxed font-light">
                Explore your inner patterns and emotional responses
              </p>
              <div className="mt-8">
                {canReflect ? (
                  <>
                    <Link
                      href="/test?start=1"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8e4e0] px-5 py-3 text-sm font-medium text-[#1a1816] transition-all duration-200 hover:opacity-90 hover:scale-[1.01]"
                    >
                      Start Reflection
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-[#cfc7ba]/80">
                      A 2-minute image-based reflection that reveals how you process emotions.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-[#8a847a] leading-relaxed">
                    You can return for another reflection soon.
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
                <p className="relative mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#d9cef0]/80">
                  Couple Reflection
                </p>
                <div
                  className="relative mt-3 h-px w-16 bg-gradient-to-r from-[#8f7bb8]/45 to-transparent"
                  aria-hidden
                />

                <h2 className="relative mt-6 font-serif text-xl md:text-2xl text-[#f2eef8] [font-family:var(--font-serif-display)] leading-snug">
                  Understand Your Dynamic
                </h2>
                <p className="relative mt-3 flex-1 text-[#a89ebc] text-[15px] md:text-base leading-relaxed font-light">
                  Reveal how you and your partner truly connect
                </p>

                <div className="relative mt-8">
                  <Link
                    href="/couple/start"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#5c4f7c]/40 bg-gradient-to-br from-[#2a2438] to-[#1f1a2a] px-5 py-3 text-sm font-medium text-[#ebe6f5] transition-all duration-200 hover:border-[#766899]/50 hover:opacity-95 hover:scale-[1.02]"
                  >
                    Start Together
                    <ArrowRight className="h-4 w-4 opacity-80" />
                  </Link>
                  <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-[#d8cfea]/75">
                    Take this with your partner and compare how you both experience the relationship.
                  </p>
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
            <p className="text-sm text-[#b8ae9f]/80">
              {individualReflectionCount} reflection{individualReflectionCount === 1 ? "" : "s"} completed
            </p>
            <div className="rounded-2xl border border-[#2a282e] bg-[#161419]/70 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-300 hover:border-[#35323c]">
              {lastPatternEntry?.date && (
                <p className="text-xs text-[#6e685f] mb-3 tracking-wide">
                  {formatDate(lastPatternEntry.date)}
                </p>
              )}
              <p className="text-[#b8ae9f] leading-relaxed font-light">{lastSummary}</p>
              <Link
                href="/result/latest"
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
