"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { FEATURE_ONBOARDING_COPY, FEATURE_SEEN_STORAGE_KEYS } from "@/lib/featureOnboarding";

export default function SilentSignalPage() {
  const [seenIntro, setSeenIntro] = useState(false);
  const copy = FEATURE_ONBOARDING_COPY.silent_signal;

  useEffect(() => {
    try {
      const seen = localStorage.getItem(FEATURE_SEEN_STORAGE_KEYS.silent_signal) === "true";
      setSeenIntro(seen);
    } catch {
      setSeenIntro(false);
    }
  }, []);

  if (!seenIntro) {
    return (
      <div className="min-h-screen bg-[#050508] text-[#e8e4df]">
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
              {copy.title}
            </h1>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/70">{copy.intro}</p>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem(FEATURE_SEEN_STORAGE_KEYS.silent_signal, "true");
                } catch {
                  // ignore storage errors
                }
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
    <div className="min-h-screen flex flex-col bg-[#050508] text-[#e8e4df]">
      <Navigation />
      <TimelineBar />
      <main className={`flex-1 ${COUPLE_MAIN_PADDING_TOP} pb-20 px-6 relative overflow-hidden`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_45%_at_50%_-15%,rgba(80,65,110,0.14),transparent)]"
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

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.52)] backdrop-blur-xl">
            <h1 className="font-serif text-2xl md:text-[1.85rem] text-[#f5f1ec] [font-family:var(--font-serif-display)] tracking-tight text-center">
              {copy.title}
            </h1>
            <p className="mt-3 whitespace-pre-line text-center text-sm md:text-base font-light leading-relaxed text-white/65">
              {copy.short}
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">Coming soon</p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Silent Signal is in active build. You&apos;ll be able to send low-pressure emotional cues when words feel
                too loaded.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

