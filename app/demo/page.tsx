"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Footer } from "@/components/footer";
import {
  IndividualResultCard,
  type IndividualStructuredResult,
} from "@/components/IndividualResultCard";
import { Navigation } from "@/components/navigation";
import {
  DEMO_IMAGE_CHOICES,
  type DemoInsightResponse,
} from "@/lib/demoReflectionFlow";
import { normalizePublicImageSrc } from "@/lib/publicImage";

const MIN_SELECTIONS = 4;
const MAX_SELECTIONS = 6;

export default function DemoPage() {
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [result, setResult] = useState<DemoInsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate =
    selectedImageIds.length >= MIN_SELECTIONS &&
    selectedImageIds.length <= MAX_SELECTIONS;

  const ctaLabel = useMemo(() => {
    if (isLoading) return "Generating insight...";
    if (selectedImageIds.length < MIN_SELECTIONS) {
      return `Select ${MIN_SELECTIONS - selectedImageIds.length} more image${
        MIN_SELECTIONS - selectedImageIds.length === 1 ? "" : "s"
      }`;
    }
    return "Generate Insight";
  }, [isLoading, selectedImageIds.length]);

  const toggleImage = (imageId: string) => {
    setError(null);
    setResult(null);
    setSelectedImageIds((current) => {
      if (current.includes(imageId)) {
        return current.filter((id) => id !== imageId);
      }
      if (current.length >= MAX_SELECTIONS) {
        return current;
      }
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedImageIds }),
      });
      if (!response.ok) {
        const fallback = "Unable to generate insight right now.";
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || fallback);
      }
      const data = (await response.json()) as DemoInsightResponse;
      setResult(data);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to generate insight right now.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07060a] text-white">
      <Navigation />
      <main className="mx-auto w-full max-w-[720px] px-4 pb-36 pt-20">
        <section className="text-center">
          <p className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/80">
            No login required
          </p>
          <h1 className="mt-4 font-serif text-3xl leading-tight [font-family:var(--font-serif-display)]">
            Try Luma in under 10 seconds
          </h1>
          <p className="mx-auto mt-3 max-w-[520px] text-sm leading-relaxed text-white/65">
            Pick 4-6 images and get an instant reflection. No signup. No friction.
          </p>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between text-xs text-white/65">
            <span>Select 4-6 images</span>
            <span>
              {selectedImageIds.length}/{MAX_SELECTIONS} selected
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {DEMO_IMAGE_CHOICES.map((choice) => {
              const selected = selectedImageIds.includes(choice.id);
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => toggleImage(choice.id)}
                  className={`group relative aspect-square overflow-hidden rounded-xl border transition ${
                    selected
                      ? "border-white/80 shadow-[0_0_0_2px_rgba(255,255,255,0.18)]"
                      : "border-white/15"
                  }`}
                  aria-pressed={selected}
                  aria-label={choice.alt}
                >
                  <Image
                    src={normalizePublicImageSrc(choice.src)}
                    alt={choice.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 220px"
                    className={`object-cover transition ${
                      selected ? "scale-[1.03]" : "group-hover:scale-[1.02]"
                    }`}
                  />
                  <div
                    className={`absolute inset-0 transition ${
                      selected ? "bg-black/10" : "bg-black/25"
                    }`}
                    aria-hidden
                  />
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-black/45 text-xs font-semibold">
                    {selected ? "✓" : ""}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-300/25 bg-red-400/10 px-4 py-3 text-sm text-red-100/90">
            {error}
          </p>
        ) : null}

        {result ? (
          <section className="mt-10 space-y-5">
            <IndividualResultCard
              badge="Instant demo insight"
              data={result.structured as IndividualStructuredResult}
              variant="full"
            />

            {Array.isArray(result.guidingReflection) &&
            result.guidingReflection.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-white/55">
                  Sit with this
                </p>
                <div className="mt-3 space-y-2">
                  {result.guidingReflection.slice(0, 3).map((line) => (
                    <p key={line} className="text-sm leading-relaxed text-white/80">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-violet-500/[0.12] to-transparent p-5">
              <Link
                href="/timeline?journey=1"
                className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0f0d14]"
              >
                Start your 28-day journey
              </Link>
              <Link
                href="/couple"
                className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/20 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white"
              >
                Do this with your partner
              </Link>
            </div>
          </section>
        ) : null}
      </main>

      {!result ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0a10]/95 px-4 py-3 backdrop-blur md:static md:mx-auto md:max-w-[720px] md:border-0 md:bg-transparent md:px-4 md:pb-8">
          <button
            type="button"
            disabled={!canGenerate || isLoading}
            onClick={handleGenerate}
            className="w-full min-h-[52px] rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0b0a0f] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {ctaLabel}
          </button>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}
