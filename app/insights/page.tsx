"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/client";

type ShiftDirection = "up" | "down";

type ShiftMetric = {
  label: string;
  value: number;
  direction: ShiftDirection;
};

function safeNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function safeArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function computeShiftMetrics(coupleSessions: any[]): ShiftMetric[] {
  const sorted = [...safeArray(coupleSessions)].sort(
    (a: any, b: any) => new Date(String(b?.date || 0)).getTime() - new Date(String(a?.date || 0)).getTime()
  );
  const latest = sorted[0] ?? {};
  const prev = sorted[1] ?? {};

  const latestDistance = safeNumber(latest?.drift?.value ?? latest?.drift ?? 0);
  const prevDistance = safeNumber(prev?.drift?.value ?? prev?.drift ?? latestDistance);
  const latestTension = safeNumber(latest?.tension?.value ?? latest?.tension ?? 0);
  const prevTension = safeNumber(prev?.tension?.value ?? prev?.tension ?? latestTension);
  const latestClarity = Math.max(0, Math.min(100, 100 - latestTension));
  const prevClarity = Math.max(0, Math.min(100, 100 - prevTension));

  return [
    {
      label: "Distance",
      value: Math.round(Math.abs(latestDistance - prevDistance)),
      direction: latestDistance <= prevDistance ? "down" : "up",
    },
    {
      label: "Clarity",
      value: Math.round(Math.abs(latestClarity - prevClarity)),
      direction: latestClarity >= prevClarity ? "up" : "down",
    },
    {
      label: "Tension",
      value: Math.round(Math.abs(latestTension - prevTension)),
      direction: latestTension <= prevTension ? "down" : "up",
    },
  ];
}

function MetricPill({ item }: { item: ShiftMetric }) {
  const positive =
    (item.label === "Distance" && item.direction === "down") ||
    (item.label === "Tension" && item.direction === "down") ||
    (item.label === "Clarity" && item.direction === "up");

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.15em] text-white/45">{item.label}</p>
      <p className={`mt-2 inline-flex items-center gap-1 text-sm font-medium ${positive ? "text-emerald-200" : "text-amber-200"}`}>
        {item.label === "Clarity" ? (
          item.direction === "up" ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )
        ) : item.direction === "down" ? (
          <TrendingDown className="h-4 w-4" />
        ) : (
          <TrendingUp className="h-4 w-4" />
        )}
        {item.label} {item.direction === "up" ? "↑" : "↓"} {item.value}
      </p>
    </div>
  );
}

function LockedCard({
  title,
  subtitle,
  unlocked,
  requirement,
  href,
}: {
  title: string;
  subtitle: string;
  unlocked: boolean;
  requirement: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-medium text-white">{title}</p>
          <p className="mt-1 text-sm text-white/55">{subtitle}</p>
        </div>
        {unlocked ? (
          <span className="rounded-full border border-emerald-200/30 bg-emerald-300/10 px-2.5 py-1 text-[11px] text-emerald-100">
            Unlocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/60">
            <Lock className="h-3.5 w-3.5" />
            Locked
          </span>
        )}
      </div>

      {unlocked ? (
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#100e15] hover:bg-white/90"
        >
          Open report
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <p className="mt-4 text-sm text-white/65">{requirement}</p>
      )}
    </div>
  );
}

export default function InsightsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [patternHistory, setPatternHistory] = useState<any[]>([]);
  const [coupleSessions, setCoupleSessions] = useState<any[]>([]);
  const [tonightLogsCount, setTonightLogsCount] = useState(0);
  const [replayCount, setReplayCount] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!active) return;
        setIsSignedIn(Boolean(user));
        if (!user) return;

        const [{ data: profile }, { count: tonightCount }, { count: repairCount }] = await Promise.all([
          supabase
            .from("user_profiles")
            .select("pattern_history, couple_sessions")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("tonight_mirror_logs")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .or("answer_for_you.not.is.null,answer_for_them.not.is.null"),
          supabase
            .from("repair_logs")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        if (!active) return;
        setPatternHistory(safeArray(profile?.pattern_history));
        setCoupleSessions(safeArray(profile?.couple_sessions));
        setTonightLogsCount(Number(tonightCount || 0));
        setReplayCount(Number(repairCount || 0));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  const reflectionsCount = patternHistory.length;
  const jointSessionsCount = coupleSessions.length;
  const hasAnySignal = reflectionsCount + tonightLogsCount + replayCount + jointSessionsCount > 0;
  const shiftMetrics = useMemo(() => computeShiftMetrics(coupleSessions), [coupleSessions]);

  const evolutionUnlocked = tonightLogsCount >= 7;
  const healthUnlocked = reflectionsCount >= 3 && tonightLogsCount >= 7 && jointSessionsCount >= 2;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a090d] text-white">
      <Navigation />
      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="mx-auto w-full max-w-5xl">
          <header className="text-center">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Insights</p>
            <h1 className="mt-3 font-serif text-[34px] leading-tight [font-family:var(--font-serif-display)]">
              Mirror Shift + Insights
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/60 md:text-base">
              Watch your relationship signals grow from reflections, nightly mirror questions, and repair work.
            </p>
          </header>

          {loading ? (
            <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/65">Loading your insights...</div>
          ) : null}

          {!loading && (!isSignedIn || !hasAnySignal) ? (
            <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_18px_60px_rgba(0,0,0,0.4)]">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-violet-200/25 bg-violet-300/[0.08]">
                <Sparkles className="h-5 w-5 text-violet-200" />
              </div>
              <p className="mt-5 font-serif text-2xl [font-family:var(--font-serif-display)]">Your insights will bloom here</p>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
                As you reflect, answer Tonight&apos;s Questions, and process conflicts, this space turns into your growth map.
              </p>
              <div className="mt-6">
                <Link
                  href="/test"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-[#100e15] hover:bg-white/90"
                >
                  Begin reflection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          ) : null}

          {!loading && hasAnySignal ? (
            <div className="mt-10 space-y-8">
              <section className="rounded-3xl border border-violet-200/20 bg-violet-300/[0.08] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.4)]">
                <p className="text-[11px] uppercase tracking-[0.16em] text-violet-100/70">Mirror Shift This Week</p>
                <p className="mt-2 text-sm text-violet-100/80">
                  Small directional shifts matter. This week&apos;s trend suggests you&apos;re building steadier signal where it used to go noisy.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {shiftMetrics.map((metric) => (
                    <MetricPill key={metric.label} item={metric} />
                  ))}
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-base font-medium text-white">Your Journey</p>
                  <p className="mt-1 text-sm text-white/55">Timeline of reflections and shifts.</p>
                  <p className="mt-3 text-xs text-white/45">
                    {reflectionsCount} reflections · {tonightLogsCount} nightly mirror answers · {replayCount} conflict replays
                  </p>
                  <Link
                    href="/timeline"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#100e15] hover:bg-white/90"
                  >
                    Open timeline
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <LockedCard
                  title="Evolution Report"
                  subtitle="Milestone-based narrative report"
                  unlocked={evolutionUnlocked}
                  requirement={`Unlock after 7 answered Tonight’s Questions (current: ${tonightLogsCount}/7).`}
                  href="/report"
                />

                <LockedCard
                  title="Relationship Health Report"
                  subtitle="Monthly health synthesis"
                  unlocked={healthUnlocked}
                  requirement={`Unlock after 3 reflections, 7 nightly answers, and 2 joint sessions (current: ${reflectionsCount}/3, ${tonightLogsCount}/7, ${jointSessionsCount}/2).`}
                  href="/report"
                />
              </section>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
