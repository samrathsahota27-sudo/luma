"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { DepthModeSelector } from "@/components/DepthModeSelector";
import { useDepthMode } from "@/hooks/useDepthMode";
import { buildRelationshipContext, recordFeatureUse } from "@/lib/relationshipContext";
import { dateExampleHint, dateTagline } from "@/lib/depthUiMicrocopy";
import { FEATURE_ONBOARDING_COPY, FEATURE_SEEN_STORAGE_KEYS } from "@/lib/featureOnboarding";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { appendTranscriptValue, useSpeechToText } from "@/hooks/useSpeechToText";

type DateResult = {
  state: string;
  missing: string;
  plan: string;
};

const REVEAL_DELAY_MS = 540;

export default function DatePrescriptionPage() {
  const { depthMode, setDepthMode } = useDepthMode();
  const [seenIntro, setSeenIntro] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DateResult | null>(null);
  const featureCopy = FEATURE_ONBOARDING_COPY.date_ai;
  const mic = useSpeechToText((transcript) => setText((prev) => appendTranscriptValue(prev, transcript)));

  useEffect(() => {
    try {
      const seen = localStorage.getItem(FEATURE_SEEN_STORAGE_KEYS.date_ai) === "true";
      setSeenIntro(seen);
    } catch {
      setSeenIntro(false);
    }
  }, []);

  async function handleGetPlan() {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setResult(null);
    setLoading(true);

    try {
      recordFeatureUse("date");
      const res = await fetch("/api/date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          depthMode,
          context: buildRelationshipContext("date"),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError("Couldn't generate plan. Try again.");
        return;
      }

      if (
        data &&
        typeof data.state === "string" &&
        (typeof data.missing === "string" || typeof data.need === "string") &&
        typeof data.plan === "string"
      ) {
        await new Promise((r) => setTimeout(r, REVEAL_DELAY_MS));
        setResult({
          state: data.state,
          missing: typeof data.missing === "string" ? data.missing : data.need,
          plan: data.plan,
        });
      } else {
        setError("Couldn't generate plan. Try again.");
      }
    } catch {
      setError("Couldn't generate plan. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!seenIntro) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a090c] text-[#e8e4df]">
        <Navigation />
        <TimelineBar />
        <main className={`relative flex ${COUPLE_MAIN_PADDING_TOP} min-h-[calc(100svh-3.5rem)] items-center px-5 pb-10`}>
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(135,110,190,0.18),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto w-full max-w-[560px] rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-8">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Feature intro</p>
            <h1 className="mt-3 font-serif text-[28px] leading-tight text-white [font-family:var(--font-serif-display)]">
              {featureCopy.title}
            </h1>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/70">{featureCopy.intro}</p>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem(FEATURE_SEEN_STORAGE_KEYS.date_ai, "true");
                } catch {}
                setSeenIntro(true);
              }}
              className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0b0a0d] shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_16px_48px_rgba(255,255,255,0.08)] transition-opacity hover:opacity-95"
            >
              Start
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a090c] text-[#e8e4df]">
      <Navigation />
      <TimelineBar />

      <main className={`flex-1 ${COUPLE_MAIN_PADDING_TOP} pb-20 px-6 relative overflow-hidden`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_48%_at_50%_-18%,rgba(95,75,55,0.12),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_42%_at_90%_85%,rgba(75,60,110,0.12),transparent)]"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[560px]">
          <Link
            href="/couple-hub"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[#8a8278] transition-colors hover:text-[#c9c0b4]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to hub
          </Link>

          <div className="rounded-2xl border border-[#2e2a35]/90 bg-[#131118]/88 p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.52)] backdrop-blur-xl">
            <h1 className="font-serif text-2xl md:text-[1.85rem] text-[#f5f1ec] [font-family:var(--font-serif-display)] tracking-tight text-center">
              Fix The Connection
            </h1>
            <p className="mt-3 whitespace-pre-line text-center text-[#9a9288] text-sm md:text-base font-light leading-relaxed">
              {featureCopy.short}
            </p>
            <p className="mt-3 text-center text-[#9a9288] text-sm md:text-base font-light leading-relaxed">
              Not a date. A prescription.
            </p>

            <DepthModeSelector
              value={depthMode}
              onChange={setDepthMode}
              disabled={loading}
              className="mt-6"
            />

            <label className="mt-8 block">
              <span className="sr-only">What&apos;s been happening between you two?</span>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's been happening between you two?"
                  rows={5}
                  disabled={loading}
                  className="w-full rounded-xl border border-[#35303d] bg-[#0e0c10]/90 px-4 py-3 pr-24 text-[15px] text-[#e8e4df] placeholder:text-[#5c564c] outline-none transition-colors focus:border-[#524a60] focus:ring-1 focus:ring-[#524a60]/40 disabled:opacity-50 resize-y min-h-[120px] placeholder:font-light"
                />
                <SpeechMicButton
                  isListening={mic.isListening}
                  isSupported={mic.isSupported}
                  disabled={loading}
                  onToggle={mic.toggle}
                  className="absolute right-3 top-3"
                />
              </div>
              {mic.error ? <p className="mt-2 text-xs text-[#c49a8c]">{mic.error}</p> : null}
            </label>
            <p className="mt-2 text-xs text-[#5c564c] font-light leading-relaxed">
              {dateExampleHint(depthMode)}
            </p>

            {error && (
              <p className="mt-4 text-center text-sm text-[#c49a8c]" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleGetPlan}
                disabled={loading || !text.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3d3848] bg-[#1f1c24] px-8 py-3 text-sm font-medium text-[#ece8e2] shadow-[0_0_32px_-6px_rgba(120,95,75,0.2)] transition-all duration-300 hover:scale-[1.02] hover:border-[#524a60] hover:bg-[#25222c] disabled:pointer-events-none disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin opacity-80" />
                    Crafting your plan…
                  </>
                ) : (
                  "Get Plan"
                )}
              </button>
            </div>
          </div>

          {result && (
            <div className="mt-10 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <section className="rounded-2xl border border-[#2e2a35]/90 bg-[#131118]/80 p-6 md:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.42)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a7288]">
                  Your Current State
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#c9c0b4] font-light">
                  {result.state}
                </p>
              </section>

              <section className="rounded-2xl border border-[#2e2a35]/90 bg-[#131118]/80 p-6 md:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.42)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a7288]">
                  What’s missing
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#c9c0b4] font-light">
                  {result.missing}
                </p>
              </section>

              <section className="relative overflow-hidden rounded-2xl border border-[#6b5a45]/45 bg-gradient-to-br from-[#1f1814]/95 via-[#16131a]/95 to-[#14101c]/95 p-6 md:p-8 shadow-[0_20px_56px_rgba(0,0,0,0.5),0_0_48px_-10px_rgba(180,140,100,0.15)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(0,0,0,0.55),0_0_56px_-8px_rgba(200,160,110,0.12)]">
                <div
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#c9a87c]/10 blur-3xl"
                  aria-hidden
                />
                <div className="relative flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#c9a87c]" strokeWidth={1.5} aria-hidden />
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c9a87c]">
                    Your Prescription
                  </h2>
                </div>
                <p className="relative mt-4 text-[16px] md:text-[17px] leading-relaxed text-[#ebe4d8] font-light">
                  {result.plan}
                </p>
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
