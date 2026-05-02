"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RelationshipMapHero } from "@/components/RelationshipMapHero";
import { Footer } from "@/components/footer";
import {
  IndividualResultCard,
  type IndividualStructuredResult,
} from "@/components/IndividualResultCard";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DEMO_IMAGE_CHOICES, type DemoInsightResponse } from "@/lib/demoReflectionFlow";
import { normalizePublicImageSrc } from "@/lib/publicImage";

const MIN_SELECTIONS = 4;
const MAX_SELECTIONS = 6;

type DemoMode = "individual" | "couples";
type CoupleStep = 1 | 2 | 3;
type MirrorMetrics = { drift: number; tension: number; alignment: number };

const PATTERN_BUCKETS: Array<{ label: string; tags: string[] }> = [
  { label: "Quiet Withdrawal", tags: ["distance", "avoidance", "disconnection", "guarded", "withdraw", "silence"] },
  { label: "Mental Overload", tags: ["overthinking", "chaos", "mental_noise", "internal_conflict", "instability"] },
  { label: "Reaching for Connection", tags: ["connection", "openness", "support", "shared_peace", "closeness"] },
  { label: "Protective Composure", tags: ["calm", "still", "protection", "control", "careful"] },
  { label: "Reorientation Urge", tags: ["clarity", "direction", "uncertain"] },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildMetrics(tags: string[]): MirrorMetrics {
  let drift = 38;
  let tension = 46;
  let alignment = 58;
  tags.forEach((tag) => {
    if (["distance", "avoidance", "disconnection", "withdraw", "guarded", "silence"].includes(tag)) {
      drift += 4;
      tension += 2;
      alignment -= 3;
    }
    if (["internal_conflict", "instability", "chaos", "overthinking", "mental_noise"].includes(tag)) {
      tension += 4;
      alignment -= 2;
    }
    if (["connection", "openness", "support", "shared_peace", "closeness"].includes(tag)) {
      drift -= 3;
      tension -= 2;
      alignment += 4;
    }
    if (["clarity", "direction"].includes(tag)) {
      alignment += 2;
      drift -= 1;
    }
  });
  return {
    drift: clamp(Math.round(drift), 18, 92),
    tension: clamp(Math.round(tension), 22, 94),
    alignment: clamp(Math.round(alignment), 20, 95),
  };
}

function buildTopPatterns(tags: string[]): string[] {
  const counts = PATTERN_BUCKETS.map((bucket) => ({
    label: bucket.label,
    score: tags.reduce((sum, tag) => (bucket.tags.includes(tag) ? sum + 1 : sum), 0),
  }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!counts.length) return ["Protective Composure"];
  return counts.slice(0, 2).map((entry) => entry.label);
}

function buildActionableInsight(primaryPattern: string) {
  if (primaryPattern === "Quiet Withdrawal") return "Name one feeling before you pull away tonight.";
  if (primaryPattern === "Mental Overload") return "Trade analysis for one honest sentence with someone safe.";
  if (primaryPattern === "Reaching for Connection") return "Ask directly for the reassurance you keep hinting at.";
  return "Share one unfiltered thought before your day ends.";
}

function buildCoupleSharedInsight(patternA: string, patternB: string) {
  if (patternA === patternB) return `You both lean into ${patternA.toLowerCase()} under stress, so repair starts fast when one of you names it.`;
  if (patternA === "Quiet Withdrawal" || patternB === "Quiet Withdrawal")
    return "One of you goes quiet to regulate while the other reads quiet as distance — naming intent early changes the loop.";
  if (patternA === "Reaching for Connection" || patternB === "Reaching for Connection")
    return "Pursuit here is care, not control; direct reassurance lowers friction quickly.";
  return "Your care languages differ more in timing than in love — small pacing agreements create a major shift.";
}

export default function DemoPage() {
  const [mode, setMode] = useState<DemoMode>("individual");
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [result, setResult] = useState<DemoInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [coupleStep, setCoupleStep] = useState<CoupleStep>(1);
  const [partnerASelections, setPartnerASelections] = useState<string[]>([]);
  const [partnerBSelections, setPartnerBSelections] = useState<string[]>([]);

  useEffect(() => {
    try {
      const queryMode = new URLSearchParams(window.location.search).get("mode");
      if (queryMode === "couples") setMode("couples");
    } catch {
      // ignore
    }
  }, []);

  const canGenerate = selectedImageIds.length >= MIN_SELECTIONS && selectedImageIds.length <= MAX_SELECTIONS;
  const ctaLabel = useMemo(() => {
    if (isLoading) return "Generating insight...";
    if (selectedImageIds.length < MIN_SELECTIONS) return `Select ${MIN_SELECTIONS - selectedImageIds.length} more image${MIN_SELECTIONS - selectedImageIds.length === 1 ? "" : "s"}`;
    return "Generate Insight";
  }, [isLoading, selectedImageIds.length]);

  const selectedChoices = useMemo(
    () => DEMO_IMAGE_CHOICES.filter((choice) => selectedImageIds.includes(choice.id)),
    [selectedImageIds]
  );
  const partnerAChoices = useMemo(
    () => DEMO_IMAGE_CHOICES.filter((choice) => partnerASelections.includes(choice.id)),
    [partnerASelections]
  );
  const partnerBChoices = useMemo(
    () => DEMO_IMAGE_CHOICES.filter((choice) => partnerBSelections.includes(choice.id)),
    [partnerBSelections]
  );

  const mirrorMoment = useMemo(() => {
    if (!result) return null;
    const tags = selectedChoices.flatMap((choice) => choice.psychologicalTags);
    const keyPatterns = buildTopPatterns(tags);
    const metrics = buildMetrics(tags);
    return {
      keyPatterns,
      metrics,
      toneLine: `This week carries a ${result.structured.tone.title.toLowerCase()} tone: you look steady outside while your inner world asks for clearer emotional contact.`,
      action: buildActionableInsight(keyPatterns[0] || result.structured.pattern),
    };
  }, [result, selectedChoices]);

  const coupleResult = useMemo(() => {
    if (coupleStep !== 3) return null;
    const tagsA = partnerAChoices.flatMap((choice) => choice.psychologicalTags);
    const tagsB = partnerBChoices.flatMap((choice) => choice.psychologicalTags);
    const patternA = buildTopPatterns(tagsA)[0];
    const patternB = buildTopPatterns(tagsB)[0];
    const aMetrics = buildMetrics(tagsA);
    const bMetrics = buildMetrics(tagsB);
    const mismatch = patternA === patternB ? 0 : 1;
    const metrics = {
      drift: clamp(Math.round((aMetrics.drift + bMetrics.drift) / 2 + mismatch * 6), 20, 92),
      tension: clamp(Math.round((aMetrics.tension + bMetrics.tension) / 2 + mismatch * 7), 24, 95),
      alignment: clamp(Math.round((aMetrics.alignment + bMetrics.alignment) / 2 - mismatch * 8), 20, 96),
    };
    return {
      patternA,
      patternB,
      metrics,
      sharedInsight: buildCoupleSharedInsight(patternA, patternB),
    };
  }, [coupleStep, partnerAChoices, partnerBChoices]);

  const toggleImage = (imageId: string, source: "individual" | "A" | "B") => {
    const setter =
      source === "individual" ? setSelectedImageIds : source === "A" ? setPartnerASelections : setPartnerBSelections;
    const max = source === "individual" ? MAX_SELECTIONS : 4;
    setError(null);
    if (source === "individual") setResult(null);
    setter((current) => {
      if (current.includes(imageId)) return current.filter((id) => id !== imageId);
      if (current.length >= max) return current;
      return [...current, imageId];
    });
  };

  const handleGenerate = async () => {
    if (!canGenerate || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/demo-reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedImageIds }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Unable to generate insight right now.");
      }
      setResult((await response.json()) as DemoInsightResponse);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to generate insight right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07060a] text-white">
      <Navigation />
      <main className="mx-auto w-full max-w-[720px] px-4 pb-36 pt-20">
        <section className="text-center">
          <p className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/80">No login required</p>
          <h1 className="mt-4 font-serif text-3xl leading-tight [font-family:var(--font-serif-display)]">Try Luma Demo</h1>
          <p className="mx-auto mt-3 max-w-[560px] text-sm leading-relaxed text-white/65">
            {mode === "couples"
              ? "Partner A + Partner B in one no-login flow. See your merged Relationship Map instantly."
              : "Pick 4-6 images and get an instant reflection. No signup. No friction."}
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setMode("individual")} className={`rounded-2xl border p-4 text-left transition ${mode === "individual" ? "border-white/40 bg-white/[0.08]" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}>
            <p className="text-xs uppercase tracking-[0.14em] text-white/55">Solo</p>
            <p className="mt-1 text-base font-semibold text-white">Try Individual Demo</p>
          </button>
          <button type="button" onClick={() => setMode("couples")} className={`rounded-2xl border p-4 text-left transition ${mode === "couples" ? "border-violet-300/55 bg-violet-500/[0.12]" : "border-white/10 bg-white/[0.03] hover:border-violet-300/35"}`}>
            <p className="text-xs uppercase tracking-[0.14em] text-violet-200/80">Us mode</p>
            <p className="mt-1 text-base font-semibold text-white">Try Couples Mode</p>
          </button>
        </section>

        {mode === "individual" ? (
          <>
            <section className="mt-8">
              <div className="mb-3 flex items-center justify-between text-xs text-white/65"><span>Select 4-6 images</span><span>{selectedImageIds.length}/{MAX_SELECTIONS} selected</span></div>
              <div className="grid grid-cols-2 gap-3">
                {DEMO_IMAGE_CHOICES.map((choice) => {
                  const selected = selectedImageIds.includes(choice.id);
                  return (
                    <button key={choice.id} type="button" onClick={() => toggleImage(choice.id, "individual")} className={`group relative aspect-square overflow-hidden rounded-xl border transition ${selected ? "border-white/80 shadow-[0_0_0_2px_rgba(255,255,255,0.18)]" : "border-white/15"}`}>
                      <Image src={normalizePublicImageSrc(choice.src)} alt={choice.alt} fill sizes="(max-width: 768px) 50vw, 220px" className={`object-cover transition ${selected ? "scale-[1.03]" : "group-hover:scale-[1.02]"}`} />
                      <div className={`absolute inset-0 ${selected ? "bg-black/10" : "bg-black/25"}`} />
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-black/45 text-xs font-semibold">{selected ? "✓" : ""}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {error ? <p className="mt-4 rounded-xl border border-red-300/25 bg-red-400/10 px-4 py-3 text-sm text-red-100/90">{error}</p> : null}

            {result && mirrorMoment ? (
              <section className="mt-10 space-y-5">
                <Card className="overflow-hidden border-white/10 bg-white/[0.04] text-white">
                  <CardHeader className="px-5 pt-5 pb-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Your mirror moment</p>
                    <CardTitle className="mt-2 font-serif text-2xl [font-family:var(--font-serif-display)]">Your Pattern This Week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 px-5 pb-5">
                    <div className="grid grid-cols-6 gap-2 rounded-2xl border border-white/10 bg-black/20 p-2">
                      {selectedChoices.slice(0, 6).map((choice, index) => (
                        <div key={choice.id} className={`relative min-h-[72px] overflow-hidden rounded-xl ${index === 0 ? "col-span-3 row-span-2" : index === 1 ? "col-span-3" : "col-span-2"}`}>
                          <Image src={normalizePublicImageSrc(choice.src)} alt={choice.alt} fill sizes="(max-width: 768px) 33vw, 160px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-white/50">Your Pattern This Week</p>
                      <p className="mt-2 text-lg font-semibold">{mirrorMoment.keyPatterns.join(" + ")}</p>
                      <p className="mt-2 text-sm text-white/75">{mirrorMoment.toneLine}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                      {(["drift", "tension", "alignment"] as const).map((k) => (
                        <div key={k}>
                          <div className="mb-1 flex items-center justify-between text-xs text-white/65"><span className="capitalize">{k}</span><span>{mirrorMoment.metrics[k]}%</span></div>
                          <Progress value={mirrorMoment.metrics[k]} className="h-2 bg-white/10" />
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-violet-300/25 bg-violet-500/[0.08] p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-violet-100/80">One actionable insight</p>
                      <p className="mt-2 text-sm text-white/90">{mirrorMoment.action}</p>
                    </div>
                  </CardContent>
                </Card>

                <IndividualResultCard badge="Instant demo insight" data={result.structured as IndividualStructuredResult} variant="full" />
              </section>
            ) : null}
          </>
        ) : (
          <section className="mt-8">
            <Card className="border-white/10 bg-white/[0.04] text-white">
              <CardHeader>
                <p className="text-[11px] uppercase tracking-[0.16em] text-violet-200/80">Couples demo · step {coupleStep}/3</p>
                <CardTitle className="font-serif text-2xl [font-family:var(--font-serif-display)]">
                  {coupleStep === 1 ? "Partner A selects images" : coupleStep === 2 ? "Partner B selects images" : "Your Relationship Map"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {coupleStep <= 2 ? (
                  <>
                    <div className="mb-2 flex items-center justify-between text-xs text-white/65"><span>Select 2-4 images</span><span>{(coupleStep === 1 ? partnerASelections.length : partnerBSelections.length)}/4 selected</span></div>
                    <div className="grid grid-cols-2 gap-3">
                      {DEMO_IMAGE_CHOICES.map((choice) => {
                        const selected = coupleStep === 1 ? partnerASelections.includes(choice.id) : partnerBSelections.includes(choice.id);
                        return (
                          <button key={choice.id} type="button" onClick={() => toggleImage(choice.id, coupleStep === 1 ? "A" : "B")} className={`group relative aspect-square overflow-hidden rounded-xl border transition ${selected ? "border-violet-200/80 shadow-[0_0_0_2px_rgba(196,181,253,0.2)]" : "border-white/15"}`}>
                            <Image src={normalizePublicImageSrc(choice.src)} alt={choice.alt} fill sizes="(max-width: 768px) 50vw, 220px" className={`object-cover transition ${selected ? "scale-[1.03]" : "group-hover:scale-[1.02]"}`} />
                            <div className={`absolute inset-0 ${selected ? "bg-black/10" : "bg-black/25"}`} />
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {coupleStep === 2 ? (
                        <button type="button" onClick={() => setPartnerBSelections(DEMO_IMAGE_CHOICES.slice(2, 5).map((x) => x.id))} className="min-h-[46px] flex-1 rounded-xl border border-white/20 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white">
                          Use sample Partner B
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setCoupleStep(coupleStep === 1 ? 2 : 3)}
                        disabled={coupleStep === 1 ? partnerASelections.length < 2 : partnerBSelections.length < 2}
                        className="min-h-[46px] flex-1 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#0f0d14] disabled:opacity-45"
                      >
                        {coupleStep === 1 ? "Continue to Partner B" : "Generate Relationship Map"}
                      </button>
                    </div>
                  </>
                ) : null}

                {coupleStep === 3 && coupleResult ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="border-white/10 bg-white/[0.03] text-white">
                        <CardHeader className="pb-2">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Partner A</p>
                          <CardTitle className="text-base">{coupleResult.patternA}</CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="border-white/10 bg-white/[0.03] text-white">
                        <CardHeader className="pb-2">
                          <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Partner B</p>
                          <CardTitle className="text-base">{coupleResult.patternB}</CardTitle>
                        </CardHeader>
                      </Card>
                    </div>

                    <RelationshipMapHero connection={coupleResult.metrics.alignment} distance={coupleResult.metrics.drift} conflict={coupleResult.metrics.tension} resolvedCount={2} className="rounded-2xl" />

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                      {(["drift", "tension", "alignment"] as const).map((k) => (
                        <div key={k}>
                          <div className="mb-1 flex items-center justify-between text-xs text-white/65"><span className="capitalize">{k}</span><span>{coupleResult.metrics[k]}%</span></div>
                          <Progress value={coupleResult.metrics[k]} className="h-2 bg-white/10" />
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-violet-300/25 bg-violet-500/[0.08] p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-violet-100/80">Shared insight</p>
                      <p className="mt-2 text-sm text-white/90">{coupleResult.sharedInsight}</p>
                    </div>

                    <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
                      Full joint reflections, sync memory, and evolving “us” insights unlock in Pro.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link href="/choose-mode" className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0f0d14]">
                        Start your journey
                      </Link>
                      <button type="button" onClick={() => { setCoupleStep(1); setPartnerASelections([]); setPartnerBSelections([]); }} className="min-h-[48px] flex-1 rounded-xl border border-white/20 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white">
                        Try another couple
                      </button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {mode === "individual" && !result ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0a10]/95 px-4 py-3 backdrop-blur md:static md:mx-auto md:max-w-[720px] md:border-0 md:bg-transparent md:px-4 md:pb-8">
          <button type="button" disabled={!canGenerate || isLoading} onClick={handleGenerate} className="w-full min-h-[52px] rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0b0a0f] disabled:cursor-not-allowed disabled:opacity-45">
            {ctaLabel}
          </button>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}
