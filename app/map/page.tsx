"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { ArrowLeft, Lock } from "lucide-react";
import { RelationshipMapHero } from "@/components/RelationshipMapHero";

/** Flip when Pro / entitlements are wired */
const MAP_LOCKED = false;

export type RelationshipMapSnapshot = {
  /** ISO timestamp for when this reading was captured */
  at: string;
  connection: number;
  distance: number;
  conflict: number;
};

const MOCK_DATA = {
  connection: 65,
  distance: 40,
  conflict: 55,
} as const;

const WEEKLY_DELTAS = [
  { label: "Connection", value: "+5%", up: true },
  { label: "Conflict", value: "-10%", up: false },
  { label: "Distance", value: "+3%", up: true },
] as const;

function MetricBar({
  label,
  value,
  animate,
  invertWarm = false,
}: {
  label: string;
  value: number;
  animate: boolean;
  /** Higher = more strain (distance/conflict) */
  invertWarm?: boolean;
}) {
  const width = animate ? value : 0;
  const hue = invertWarm
    ? value > 60
      ? "from-[#8b5a4a] to-[#c47a65]"
      : value > 35
        ? "from-[#6b5a50] to-[#9a8578]"
        : "from-[#4a6055] to-[#6d8a7a]"
    : value > 60
      ? "from-[#4a6050] to-[#6d9078]"
      : value > 35
        ? "from-[#5a5a68] to-[#7a7a90]"
        : "from-[#5a5048] to-[#7a6a5a]";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-[#b8ae9f]">{label}</span>
        <span className="text-xs tabular-nums text-[#8a8278]">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#1a171e] ring-1 ring-[#2e2a35]/80">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${hue} transition-[width] duration-1000 ease-out shadow-[0_0_20px_rgba(120,100,160,0.15)]`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function RelationshipMapPage() {
  const [animateBars, setAnimateBars] = useState(false);
  /**
   * Future (Pro): load `RelationshipMapSnapshot[]` from storage/API after each reflection/test;
   * compare latest vs previous snapshot to drive bar values + weekly delta labels.
   */
  const [_snapshotHistory, _setSnapshotHistory] = useState<RelationshipMapSnapshot[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimateBars(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a090c] text-[#e8e4df]">
      <Navigation />
      <TimelineBar />

      <main className={`relative flex-1 ${COUPLE_MAIN_PADDING_TOP} pb-20 px-6 overflow-hidden`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_50%_at_50%_-20%,rgba(95,75,125,0.16),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_80%_100%,rgba(110,85,65,0.1),transparent)]"
          aria-hidden
        />

        <div
          className={`relative mx-auto w-full max-w-[560px] transition-[filter] duration-300 ${
            MAP_LOCKED ? "blur-[10px] pointer-events-none select-none" : ""
          }`}
        >
          <Link
            href="/couple-hub"
            className={`inline-flex items-center gap-2 text-sm text-[#8a8278] transition-colors hover:text-[#c9c0b4] ${
              MAP_LOCKED
                ? "sr-only"
                : "mb-8"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to hub
          </Link>

          <header className="text-center mb-10">
            <h1 className="font-serif text-2xl md:text-[1.85rem] text-[#f5f1ec] [font-family:var(--font-serif-display)] tracking-tight">
              Your Relationship Map
            </h1>
            <p className="mt-3 text-[#9a9288] text-sm md:text-base font-light leading-relaxed">
              Where you are. Where you&apos;re going.
            </p>
          </header>

          <div className="mb-10 -mx-1 sm:mx-0">
            <RelationshipMapHero
              size="md"
              className="rounded-2xl border-[#2e2a35]/90 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
              connection={MOCK_DATA.connection}
              distance={MOCK_DATA.distance}
              conflict={MOCK_DATA.conflict}
              resolvedCount={2}
            />
          </div>

          <div className="rounded-2xl border border-[#2e2a35]/90 bg-[#131118]/88 p-7 md:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="space-y-8">
              <MetricBar
                label="Connection Level"
                value={MOCK_DATA.connection}
                animate={animateBars}
              />
              <MetricBar
                label="Emotional Distance"
                value={MOCK_DATA.distance}
                animate={animateBars}
                invertWarm
              />
              <MetricBar
                label="Conflict Intensity"
                value={MOCK_DATA.conflict}
                animate={animateBars}
                invertWarm
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {WEEKLY_DELTAS.map((d) => (
                <span
                  key={d.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#2e2a35] bg-[#161419]/90 px-3 py-1.5 text-xs text-[#a39a8c] tabular-nums"
                >
                  <span className={d.up ? "text-[#8fbc8f]" : "text-[#9ab87a]"}>
                    {d.up ? "↑" : "↓"}
                  </span>
                  {d.label}{" "}
                  <span className="text-[#e8e0d4] font-medium">{d.value}</span>
                </span>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-[11px] text-[#5c564c] font-light max-w-sm mx-auto">
            Future readings can be stored and compared to spot drift before it hardens.
          </p>
        </div>

        {MAP_LOCKED && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a090c]/75 backdrop-blur-[14px] px-6">
            <Link
              href="/couple-hub"
              className="absolute left-6 top-[max(5.5rem,env(safe-area-inset-top)+4rem)] z-[110] inline-flex items-center gap-2 text-sm text-[#b8ae9f] transition-colors hover:text-[#f5f1ec]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to hub
            </Link>
            <div className="relative max-w-md w-full rounded-2xl border border-[#4a3f5c]/55 bg-[#141218]/95 p-8 md:p-10 shadow-[0_0_60px_-12px_rgba(120,90,160,0.4),0_24px_64px_rgba(0,0,0,0.55)] text-center">
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-[#2a2038]/30 via-transparent to-[#1a1510]/20"
                aria-hidden
              />
              <Lock
                className="relative mx-auto h-10 w-10 text-[#9a8cb8]"
                strokeWidth={1.25}
                aria-hidden
              />
              <h2 className="relative mt-6 font-serif text-xl md:text-2xl text-[#f2eef6] [font-family:var(--font-serif-display)]">
                Relationship map
              </h2>
              <p className="relative mt-3 text-sm text-[#9a9288] font-light leading-relaxed">
                Track connection, distance, and conflict over time — and see where you&apos;re trending
                before small shifts become habits.
              </p>
              <Link
                href="/couple-hub"
                className="relative mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#e8e4e0] px-6 py-3.5 text-sm font-semibold text-[#1a1816] transition-opacity hover:opacity-90"
              >
                Back to hub
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
