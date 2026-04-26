"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { FEATURE_ONBOARDING_COPY, FEATURE_SEEN_STORAGE_KEYS } from "@/lib/featureOnboarding";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { appendTranscriptValue, useSpeechToText } from "@/hooks/useSpeechToText";

export default function SilentSignalPage() {
  const [seenIntro, setSeenIntro] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<{
    patternMatch: { name: string; confidence: number; line: string };
    hiddenMeaning: { summary: string; tieIn: string };
    bridgeSuggestion: { suggestion: string; whyItWorks: string };
    telemetry: { driftReference: string | null; tensionReference: string | null; historyAnchors: string[] };
  } | null>(null);
  const copy = FEATURE_ONBOARDING_COPY.silent_signal;
  const {
    isSupported: isMicSupported,
    isListening,
    error: micError,
    toggle: toggleMic,
    stop: stopMic,
  } = useSpeechToText((transcript) => {
    setInput((prev) => appendTranscriptValue(prev, transcript));
  });
  const presets = [
    "24h no reply",
    "Awkward dinner silence",
    "Bedtime no talk",
  ] as const;

  useEffect(() => {
    if (loading && isListening) {
      stopMic();
    }
  }, [loading, isListening, stopMic]);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(FEATURE_SEEN_STORAGE_KEYS.silent_signal) === "true";
      setSeenIntro(seen);
    } catch {
      setSeenIntro(false);
    }
  }, []);

  async function analyzeSilence() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/tools/silent-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "silent_signal_failed");
      setOutput(data);
    } catch {
      setError("Could not analyze this silence right now. Try again.");
    } finally {
      setLoading(false);
    }
  }

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
        <style jsx>{`
          @keyframes scanline {
            0% {
              transform: translateX(-120%);
              opacity: 0;
            }
            25% {
              opacity: 0.85;
            }
            100% {
              transform: translateX(120%);
              opacity: 0;
            }
          }
        `}</style>
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

            <div className="mt-8 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Describe the silence (how long, what happened before, how it feels)
              </p>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                {loading ? (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden">
                    <div
                      className="h-full w-1/2 bg-gradient-to-r from-transparent via-violet-300/90 to-transparent"
                      style={{ animation: "scanline 1.1s linear infinite" }}
                    />
                  </div>
                ) : null}
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  rows={7}
                  placeholder="Describe the silence..."
                  className="min-h-[160px] border-0 bg-transparent text-white placeholder:text-white/35 focus-visible:ring-0"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <SpeechMicButton
                  isListening={isListening}
                  isSupported={isMicSupported}
                  disabled={loading}
                  onToggle={toggleMic}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setInput("")}
                  disabled={loading || !input.trim()}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Clear
                </Button>
                {presets.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    onClick={() => setInput(preset)}
                    className="border-white/20 bg-black/20 text-white/75 hover:bg-white/10"
                  >
                    {preset}
                  </Button>
                ))}
              </div>

              <Button
                type="button"
                onClick={analyzeSilence}
                disabled={loading || !input.trim()}
                className="w-full bg-white text-[#120f18] hover:bg-white/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  "Analyze Silence"
                )}
              </Button>

              {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
              {micError ? <p className="text-xs text-amber-200/85">{micError}</p> : null}

              {output ? (
                <div className="mt-2 space-y-3">
                  <Card className="border-white/10 bg-white/[0.03]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-white">Pattern Match</CardTitle>
                      <CardDescription className="text-white/60">
                        {output.patternMatch.name} detected - {output.patternMatch.confidence}% match
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/80">{output.patternMatch.line}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/[0.03]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-white">Hidden Meaning</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-white/85">{output.hiddenMeaning.summary}</p>
                      <p className="text-xs text-white/55">{output.hiddenMeaning.tieIn}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-white/10 bg-white/[0.03]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-white inline-flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-200" />
                        Gentle Bridge Suggestion
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-white/85">{output.bridgeSuggestion.suggestion}</p>
                      <p className="text-xs text-white/55">{output.bridgeSuggestion.whyItWorks}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

