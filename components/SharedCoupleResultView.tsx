"use client";

import { ConflictAnalysisPanel, type ConflictFrictionPoint } from "@/components/ConflictAnalysisPanel";
import { GeneratedCoupleArtImage } from "@/components/GeneratedCoupleArtImage";
import { DangerousQuestionBlock } from "@/components/DangerousQuestionBlock";
import { WhatToDoWithThis } from "@/components/WhatToDoWithThis";
import { ShareLumaFab } from "@/components/ShareLumaFab";
import { cn } from "@/lib/utils";

function clampPercent(value: unknown, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function proxyImage(src: string | null | undefined) {
  const t = String(src || "").trim();
  if (!t) return null;
  if (t.startsWith("http://") || t.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(t)}`;
  }
  return t;
}

export type SharedCouplePayload = Record<string, unknown>;

export function SharedCoupleResultView({
  data,
  readOnlyBanner,
}: {
  data: SharedCouplePayload;
  readOnlyBanner?: boolean;
}) {
  const result = typeof data.result === "string" ? data.result : "";
  const nameA = typeof data.nameA === "string" ? data.nameA : null;
  const nameB = typeof data.nameB === "string" ? data.nameB : null;
  const structured =
    data.structured && typeof data.structured === "object" ? (data.structured as Record<string, unknown>) : null;

  const patternName =
    (structured?.pattern as string) ||
    (data.sharedPattern as string) ||
    (data.pattern as string) ||
    "Shared pattern";

  const punchline =
    (structured?.summary as string) ||
    (data.patternDescription as string) ||
    (data.description as string) ||
    "";

  const innerA = proxyImage(data.innerWorldA as string);
  const innerB = proxyImage(data.innerWorldB as string);
  const space = proxyImage(data.spaceBetween as string);

  const driftValue = clampPercent(
    (structured?.drift as { value?: number })?.value ?? data.drift,
    0
  );
  const tensionValue = clampPercent(
    (structured?.tension as { value?: number })?.value ?? data.tension,
    0
  );
  const alignmentValue = clampPercent(structured?.alignment ?? data.alignment, 0);

  const sharedInsight =
    (structured?.insight as string) ||
    (data.sharedInsight as string) ||
    (data.oneSharedInsight as string) ||
    "";

  const distanceSignal =
    (structured?.distance_signal as string) ||
    (data.distanceSignal as string) ||
    (data.distance_signal as string) ||
    "";

  const conflictPoints = (Array.isArray(data.conflictFrictionPoints)
    ? data.conflictFrictionPoints
    : null) as ConflictFrictionPoint[] | null;

  const brutalTruth = typeof data.brutalTruth === "string" ? data.brutalTruth : null;
  const dangerousQuestion = typeof data.dangerousQuestion === "string" ? data.dangerousQuestion : null;
  const emotionalTag = typeof data.emotionalTag === "string" ? data.emotionalTag : null;

  const frictionItems = (() => {
    const diffs = Array.isArray(structured?.differences)
      ? (structured?.differences as { label?: string; title?: string; description?: string; text?: string }[])
      : [];
    const mapped = diffs
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        label: String(x.label || x.title || "").trim(),
        description: String(x.description || x.text || "").trim(),
      }))
      .filter((x) => x.label && x.description);
    if (mapped.length) return mapped.slice(0, 4);
    return [
      {
        label: "How you each show care",
        description:
          "Your instincts differ—what feels like connection to one of you can feel like pressure to the other.",
      },
      {
        label: "What silence means",
        description: "The same quiet moment can read as peace or as distance, depending on who’s looking.",
      },
    ];
  })();

  const whatHelps = (() => {
    const w = Array.isArray(structured?.whatHelps)
      ? (structured?.whatHelps as string[]).filter((x) => typeof x === "string" && x.trim())
      : [];
    if (w.length) return w.slice(0, 5);
    return [
      "Name the pace: “I need a short pause, then I want to come back.”",
      "One small check-in this week with zero problem-solving.",
    ];
  })();

  return (
    <div className="bg-background text-foreground pb-16">
      <main className="mx-auto max-w-[720px] px-4 pt-24 md:pt-28">
        {readOnlyBanner ? (
          <p className="mb-6 rounded-xl border border-amber-400/25 bg-amber-500/[0.08] px-4 py-3 text-center text-sm text-amber-100/90">
            Shared read-only view. Link expires after 7 days; images may not load if original links expired.
          </p>
        ) : null}

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
            Couple reflection
          </p>
          <div className="mt-4 flex items-end justify-between gap-2 sm:gap-4">
            {(
              [
                { src: innerA, label: nameA ? `${nameA}'s world` : "Inner world A" },
                { src: space, label: "Space between", emphasis: true },
                { src: innerB, label: nameB ? `${nameB}'s world` : "Inner world B" },
              ] as const
            ).map((item) => (
              <div key={item.label} className="flex flex-1 min-w-0 flex-col items-center">
                <div
                  className={cn(
                    "relative aspect-square w-full max-w-[118px] overflow-hidden rounded-xl border shadow-lg",
                    item.emphasis ? "border-white/20 ring-1 ring-white/10" : "border-white/10"
                  )}
                >
                  {item.src ? (
                    <GeneratedCoupleArtImage src={item.src} alt="" className="absolute inset-0 h-full w-full" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1c1830] to-[#141c28]" />
                  )}
                </div>
                <p className="mt-2 text-center text-[11px] text-white/55 leading-tight">{item.label}</p>
              </div>
            ))}
          </div>

          <h1 className="mt-8 font-serif text-[22px] leading-tight text-white sm:text-[26px] [font-family:var(--font-serif-display)]">
            {patternName}
          </h1>
          {punchline ? (
            <p className="mt-2 text-sm leading-relaxed text-white/65">{punchline}</p>
          ) : null}

          <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-widest text-white/55">Shared landscape</p>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              {result
                ? String(result).split(/\n\s*\n+/)[0]?.trim().slice(0, 520) ||
                  "A snapshot of how you each move in the relationship—and where your rhythms meet or miss."
                : "A snapshot of how you each move in the relationship—and where your rhythms meet or miss."}
            </p>
          </section>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-widest text-white/60">Drift</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white">{driftValue}%</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-widest text-white/60">Tension</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-white">{tensionValue}%</p>
            </div>
          </div>

          {sharedInsight ? (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-widest text-white/60">One shared insight</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white">{sharedInsight}</p>
            </div>
          ) : null}

          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-widest text-white/60">Alignment</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${alignmentValue}%`,
                  background: "linear-gradient(90deg, rgba(140,110,200,0.9), rgba(230,230,235,0.8))",
                }}
              />
            </div>
            <p className="mt-2 text-xs text-white/55 tabular-nums">{alignmentValue}% aligned</p>
          </div>

          {distanceSignal ? (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-widest text-white/60">Distance signal</p>
              <p className="mt-2 text-base font-medium leading-relaxed text-white">{distanceSignal}</p>
            </div>
          ) : null}
        </div>

        <section className="mb-8 mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <h2 className="font-serif text-[20px] text-foreground [font-family:var(--font-serif-display)]">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200/85 not-italic">
              Friction map
            </span>
            <span className="mt-1 block text-white">Where you diverge</span>
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {frictionItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 border-l-2 border-l-orange-400/30 bg-[#0f0b14] p-4"
              >
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {conflictPoints && conflictPoints.length > 0 ? (
          <ConflictAnalysisPanel
            points={conflictPoints}
            labelA={nameA?.trim() || "Partner A"}
            labelB={nameB?.trim() || "Partner B"}
          />
        ) : null}

        <section className="mb-8 w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <h2 className="font-serif text-[20px] text-foreground [font-family:var(--font-serif-display)]">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-200/90 not-italic">
              What could help
            </span>
            <span className="mt-1 block text-white">Small shifts to try</span>
          </h2>
          <div className="mt-4 space-y-2.5">
            {whatHelps.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300/90" aria-hidden />
                <p className="text-sm font-medium leading-relaxed text-white/85">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {result ? (
          <section className="luma-glass mb-8 border border-white/10 p-5">
            <h3 className="font-serif text-lg text-foreground [font-family:var(--font-serif-display)]">Reflection</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/70">{result}</p>
          </section>
        ) : null}

        <DangerousQuestionBlock
          text={dangerousQuestion}
          brutalTruth={brutalTruth}
          emotionalTag={emotionalTag}
          resultPreview={result}
          mode="couple"
        />

        <WhatToDoWithThis variant="dark" className="mb-10" />
      </main>

      <ShareLumaFab
        insightSnippet={
          patternName !== "Shared pattern"
            ? patternName
            : punchline
              ? punchline.replace(/\s+/g, " ").trim().slice(0, 120)
              : result
                ? result.replace(/\s+/g, " ").trim().slice(0, 120)
                : null
        }
      />
    </div>
  );
}
