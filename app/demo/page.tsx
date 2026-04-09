"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ResultClinicalDisclaimer } from "@/components/ResultClinicalDisclaimer";
import { WhatToDoWithThis } from "@/components/WhatToDoWithThis";
import { ShareLumaFab } from "@/components/ShareLumaFab";
import { ReflectionRetentionPrompt } from "@/components/ReflectionRetentionPrompt";
import { IndividualResultCard } from "@/components/IndividualResultCard";
import { DangerousQuestionBlock } from "@/components/DangerousQuestionBlock";
import { ConflictAnalysisPanel } from "@/components/ConflictAnalysisPanel";
import { GeneratedCoupleArtImage } from "@/components/GeneratedCoupleArtImage";
import { cn } from "@/lib/utils";
import {
  DEMO_INDIVIDUAL_IMAGE,
  demoCoupleAlignment,
  demoCoupleConflictPoints,
  demoCoupleDistanceSignal,
  demoCoupleDrift,
  demoCoupleFrictionItems,
  demoCoupleImages,
  demoCouplePatternName,
  demoCouplePunchline,
  demoCoupleSharedInsight,
  demoCoupleSharedLandscape,
  demoCoupleTension,
  demoCoupleWhatHelps,
  demoIndividualBrutalTruth,
  demoIndividualDangerousQuestion,
  demoIndividualEmotionalTag,
  demoIndividualInsightSections,
  demoIndividualStructured,
} from "@/lib/demoReflectionStatic";

function DemoInsightSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6 backdrop-blur-sm">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{title}</h3>
      <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-white/75">{body}</p>
    </section>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
        active
          ? "bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] border border-white/15"
          : "text-white/55 hover:text-white/80 border border-transparent"
      )}
    >
      {children}
    </button>
  );
}

export default function DemoPage() {
  const [tab, setTab] = useState<"individual" | "couple">("individual");

  return (
    <div className="min-h-screen flex flex-col bg-[#07060a] text-foreground">
      <Navigation />

      <main className="flex-1 pt-20 pb-16 px-4 md:px-6">
        <div className="mx-auto max-w-[640px]">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/[0.08] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-amber-100/90">
              This is a sample
            </span>
          </div>

          <h1 className="text-center font-serif text-[28px] md:text-[34px] leading-tight text-white [font-family:var(--font-serif-display)]">
            See how a reflection reads
          </h1>
          <p className="mt-3 text-center text-sm text-white/55 leading-relaxed max-w-[420px] mx-auto">
            Static preview—no account, no API. Toggle to compare individual and couple outputs.
          </p>

          <div
            className="mt-8 flex rounded-2xl border border-white/10 bg-white/[0.03] p-1 gap-1"
            role="tablist"
            aria-label="Demo type"
          >
            <TabButton active={tab === "individual"} onClick={() => setTab("individual")}>
              Individual
            </TabButton>
            <TabButton active={tab === "couple"} onClick={() => setTab("couple")}>
              Couple
            </TabButton>
          </div>

          {tab === "individual" ? (
            <div className="mt-10 space-y-8 animate-in fade-in duration-300">
              <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 aspect-[4/3] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                <Image
                  src={DEMO_INDIVIDUAL_IMAGE}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 640px"
                  priority
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20"
                />
                <p className="absolute bottom-4 left-4 right-4 text-xs text-white/70">
                  Visual metaphor for your inner landscape—soft edges, layered mood, no single “right” reading.
                </p>
              </div>

              <IndividualResultCard
                badge="Sample reflection"
                data={demoIndividualStructured}
                variant="full"
                className="!max-w-[640px] w-full"
              />

              <div className="space-y-4">
                {demoIndividualInsightSections.map((s) => (
                  <DemoInsightSection key={s.title} title={s.title} body={s.body} />
                ))}
              </div>

              <DangerousQuestionBlock
                text={demoIndividualDangerousQuestion}
                brutalTruth={demoIndividualBrutalTruth}
                emotionalTag={demoIndividualEmotionalTag}
                resultPreview={demoIndividualStructured.description}
                mode="individual"
                className="!mt-6 md:!mt-8"
              />
            </div>
          ) : (
            <div className="mt-10 space-y-8 animate-in fade-in duration-300">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 md:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_80px_rgba(0,0,0,0.5)]">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45 text-center mb-4">
                  Shared visual field
                </p>
                <div className="flex items-end justify-between gap-2 sm:gap-4">
                  {(
                    [
                      { src: demoCoupleImages.partnerA, label: "Inner world A" },
                      { src: demoCoupleImages.spaceBetween, label: "Space between" },
                      { src: demoCoupleImages.partnerB, label: "Inner world B" },
                    ] as const
                  ).map((item) => (
                    <div key={item.label} className="flex flex-col items-center flex-1 min-w-0">
                      <div className="relative w-full aspect-square max-w-[120px] rounded-xl overflow-hidden border border-white/12 shadow-lg">
                        <GeneratedCoupleArtImage src={item.src} alt="" className="absolute inset-0 h-full w-full" />
                      </div>
                      <p className="mt-2 text-[11px] text-white/55 text-center leading-tight">{item.label}</p>
                    </div>
                  ))}
                </div>

                <h2 className="mt-8 font-serif text-[22px] md:text-[26px] text-white [font-family:var(--font-serif-display)] leading-tight">
                  {demoCouplePatternName}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{demoCouplePunchline}</p>

                <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-widest text-white/55">Shared landscape</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{demoCoupleSharedLandscape}</p>
                </section>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-widest text-white/60">Drift</p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-white">{demoCoupleDrift.value}%</p>
                    <p className="mt-1 text-xs text-white/50">{demoCoupleDrift.label}</p>
                    <p className="mt-1 text-xs text-emerald-300/80">{demoCoupleDrift.status}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-widest text-white/60">Tension</p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-white">{demoCoupleTension.value}%</p>
                    <p className="mt-1 text-xs text-white/50">{demoCoupleTension.label}</p>
                    <p className="mt-1 text-xs text-amber-200/75">{demoCoupleTension.status}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60">One shared insight</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-white">{demoCoupleSharedInsight}</p>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60">Alignment</p>
                  <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${demoCoupleAlignment}%`,
                        background: "linear-gradient(90deg, rgba(140,110,200,0.9), rgba(230,230,235,0.8))",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/55 tabular-nums">{demoCoupleAlignment}% aligned</p>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60">Distance signal</p>
                  <p className="mt-2 text-base font-medium leading-relaxed text-white">{demoCoupleDistanceSignal}</p>
                </div>
              </div>

              <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <h3 className="font-serif text-[20px] text-foreground [font-family:var(--font-serif-display)]">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200/85 not-italic">
                    Friction map
                  </span>
                  <span className="mt-1 block text-white">Where you diverge</span>
                </h3>
                <div className="mt-4 flex flex-col gap-3">
                  {demoCoupleFrictionItems.map((item) => (
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

              <ConflictAnalysisPanel points={demoCoupleConflictPoints} labelA="Partner A" labelB="Partner B" />

              <section className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <h3 className="font-serif text-[20px] text-foreground [font-family:var(--font-serif-display)]">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-200/90 not-italic">
                    What could help
                  </span>
                  <span className="mt-1 block text-white">Small shifts, outsized impact</span>
                </h3>
                <div className="mt-4 space-y-2.5">
                  {demoCoupleWhatHelps.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300/90" aria-hidden />
                      <p className="text-sm font-medium text-white/85 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          <div className="mt-14 md:mt-16 rounded-2xl border border-white/10 bg-gradient-to-b from-violet-500/[0.12] to-transparent p-6 md:p-8 text-center">
            {tab === "individual" ? (
              <>
                <p className="text-sm text-white/65">Ready for your own mirror?</p>
                <Link
                  href="/reflect"
                  className="mt-4 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0b0a0d] shadow-[0_12px_40px_rgba(120,90,180,0.25)] transition hover:opacity-95"
                >
                  Generate your own reflection
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-white/65">Explore your dynamic together</p>
                <Link
                  href="/couple"
                  className="mt-4 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0b0a0d] shadow-[0_12px_40px_rgba(120,90,180,0.25)] transition hover:opacity-95"
                >
                  Start couple reflection
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/reflect"
                  className="mt-4 block text-sm text-white/50 hover:text-white/75 underline underline-offset-4"
                >
                  Or try individual first →
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <div className="border-t border-white/10 bg-[#07060a] px-4 py-6 space-y-6">
        <WhatToDoWithThis variant="dark" />
        <ReflectionRetentionPrompt variant={tab === "couple" ? "couple" : "individual"} />
        <ResultClinicalDisclaimer />
      </div>

      <Footer />

      <ShareLumaFab
        insightSnippet={tab === "couple" ? demoCouplePatternName : demoIndividualStructured.pattern}
      />
    </div>
  );
}
