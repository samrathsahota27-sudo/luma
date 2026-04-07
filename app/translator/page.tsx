"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { ArrowLeft, Check, Copy, Loader2 } from "lucide-react";
import { DepthModeSelector } from "@/components/DepthModeSelector";
import { useDepthMode } from "@/hooks/useDepthMode";
import { buildRelationshipContext, recordFeatureUse } from "@/lib/relationshipContext";
import { translatorTagline } from "@/lib/depthUiMicrocopy";
import { updateMemory } from "@/lib/memory";
import { supabase } from "@/lib/supabase";
import { setMemory } from "@/lib/memory";
import { FEATURE_ONBOARDING_COPY, FEATURE_SEEN_STORAGE_KEYS } from "@/lib/featureOnboarding";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { appendTranscriptValue, useSpeechToText } from "@/hooks/useSpeechToText";

type TranslateResult = {
  said: string;
  meant: string;
  trap: string;
  do: string;
};

type MemoryDraft = Record<string, unknown> & {
  conflicts?: unknown[];
  timeline?: unknown[];
  scores?: { connection?: number; conflict?: number; distance?: number };
  patterns?: Record<string, unknown> & { communication?: unknown[] };
};

export default function TranslatorPage() {
  const { depthMode, setDepthMode } = useDepthMode();
  const [seenIntro, setSeenIntro] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [copiedBetter, setCopiedBetter] = useState(false);
  const featureCopy = FEATURE_ONBOARDING_COPY.emotional_translator;
  const mic = useSpeechToText((transcript) => setMessage((prev) => appendTranscriptValue(prev, transcript)));

  useEffect(() => {
    try {
      const seen = localStorage.getItem(FEATURE_SEEN_STORAGE_KEYS.emotional_translator) === "true";
      setSeenIntro(seen);
    } catch {
      setSeenIntro(false);
    }
  }, []);

  async function handleTranslate() {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setError(null);
    setResult(null);
    setCopiedBetter(false);
    setLoading(true);

    try {
      recordFeatureUse("translate");

      // STEP 1/2: Load user memory from Supabase (best-effort).
      // This ensures Translator personalization uses the latest cross-device memory.
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: memoryData } = await supabase
            .from("users_memory")
            .select("memory")
            .eq("user_id", user.id)
            .single();
          const memory = memoryData?.memory ?? null;
          if (memory) {
            setMemory(memory);
          }
        } else {
          console.log("No user logged in");
        }
      } catch {
        // Ignore — fallback is basic behavior without cloud memory.
      }

      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          depthMode,
          context: buildRelationshipContext("translate"),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError("Couldn't decode this. Try again.");
        return;
      }

      const doText =
        typeof data.do === "string"
          ? data.do
          : typeof data.whatToDo === "string"
            ? data.whatToDo
            : typeof data.better === "string"
              ? data.better
              : typeof data.betterResponse === "string"
                ? data.betterResponse
                : "";

      if (
        data &&
        typeof data.said === "string" &&
        typeof data.meant === "string" &&
        typeof data.trap === "string" &&
        doText
      ) {
        // Structured memory: store this as a "conflict" event (best effort).
        try {
          const now = new Date().toISOString();
          const memory = updateMemory((m: MemoryDraft) => {
            const conflicts = Array.isArray(m.conflicts) ? m.conflicts : [];
            const timeline = Array.isArray(m.timeline) ? m.timeline : [];
            const scores = m.scores ?? { connection: 0, conflict: 0 };

            conflicts.push({
              originalText: trimmed,
              aiInterpretation: data,
              createdAt: now,
            });
            timeline.push({ type: "translator", date: now });

            const prevPatterns =
              m.patterns && typeof m.patterns === "object"
                ? m.patterns
                : ({} as Record<string, unknown> & { communication?: unknown[] });
            return {
              ...m,
              conflicts,
              timeline,
              scores: {
                connection: scores.connection ?? 0,
                conflict: (scores.conflict ?? 0) + 1,
              },
              patterns: {
                ...prevPatterns,
                communication: [
                  ...(Array.isArray(prevPatterns.communication) ? prevPatterns.communication : []),
                  { type: "translator_used", at: now },
                ],
              },
            };
          });

          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("users_memory").upsert({
              user_id: user.id,
              memory,
              updated_at: new Date().toISOString(),
            });
          }
        } catch {}

        setResult({
          said: data.said,
          meant: data.meant,
          trap: data.trap,
          do: doText,
        });
      } else {
        setError("Couldn't decode this. Try again.");
      }
    } catch {
      setError("Couldn't decode this. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyBetter() {
    if (!result?.do) return;
    try {
      await navigator.clipboard.writeText(result.do);
      setCopiedBetter(true);
      window.setTimeout(() => setCopiedBetter(false), 2200);
    } catch {
      setCopiedBetter(false);
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
                  localStorage.setItem(FEATURE_SEEN_STORAGE_KEYS.emotional_translator, "true");
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
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(100,80,140,0.15),transparent)]"
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

          <div className="rounded-2xl border border-[#2e2a35]/90 bg-[#131118]/85 p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_24px_70px_rgba(45,35,65,0.25)]">
            <h1 className="font-serif text-2xl md:text-[1.75rem] text-[#f5f1ec] [font-family:var(--font-serif-display)] tracking-tight text-center">
              Decode Their Words
            </h1>
            <p className="mt-3 whitespace-pre-line text-center text-[#9a9288] text-sm md:text-base font-light leading-relaxed">
              {featureCopy.short}
            </p>
            <p className="mt-3 text-center text-[#9a9288] text-sm md:text-base font-light leading-relaxed">
              {translatorTagline(depthMode)}
            </p>

            <DepthModeSelector
              value={depthMode}
              onChange={setDepthMode}
              disabled={loading}
              className="mt-6"
            />

            <label className="mt-8 block">
              <span className="sr-only">Their message</span>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Paste their message here..."
                  rows={6}
                  disabled={loading}
                  className="w-full rounded-xl border border-[#35303d] bg-[#0e0c10]/90 px-4 py-3 pr-24 text-[15px] text-[#e8e4df] placeholder:text-[#5c564c] outline-none transition-colors focus:border-[#524a60] focus:ring-1 focus:ring-[#524a60]/40 disabled:opacity-50 resize-y min-h-[140px]"
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

            {error && (
              <p className="mt-4 text-center text-sm text-[#c49a8c]" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleTranslate}
                disabled={loading || !message.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3d3848] bg-[#1f1c24] px-8 py-3 text-sm font-medium text-[#ece8e2] shadow-[0_0_28px_-4px_rgba(120,100,160,0.2)] transition-all duration-300 hover:scale-[1.02] hover:border-[#524a60] hover:bg-[#25222c] disabled:pointer-events-none disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin opacity-80" />
                    Decoding…
                  </>
                ) : (
                  "Translate"
                )}
              </button>
            </div>
          </div>

          {result && (
            <div className="mt-10 space-y-5 animate-in fade-in duration-500">
              <section className="group rounded-2xl border border-[#2e2a35]/90 bg-[#131118]/80 p-6 md:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3f3a4a] hover:shadow-[0_20px_56px_rgba(35,25,55,0.2)]">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a7288]">
                  What they said
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#c9c0b4] font-light">
                  {result.said}
                </p>
              </section>

              <section className="group rounded-2xl border border-[#2e2a35]/90 bg-[#131118]/80 p-6 md:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3f3a4a] hover:shadow-[0_20px_56px_rgba(35,25,55,0.2)]">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a7288]">
                  What they likely meant
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#c9c0b4] font-light">
                  {result.meant}
                </p>
              </section>

              <section className="group rounded-2xl border border-[#3d3550]/70 bg-[#16131d]/85 p-6 md:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.45),0_0_40px_-12px_rgba(90,70,120,0.2)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4a4260] hover:shadow-[0_22px_60px_rgba(40,30,60,0.3)]">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a8cb8]">
                  The Trap
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#b8ae9f] font-light">
                  {result.trap}
                </p>
              </section>

              <section className="relative overflow-hidden rounded-2xl border border-[#5c4d78]/50 bg-gradient-to-br from-[#1a1628]/98 via-[#14101c]/95 to-[#120e18]/95 p-6 md:p-8 shadow-[0_20px_56px_rgba(0,0,0,0.5),0_0_52px_-10px_rgba(130,100,200,0.22)] backdrop-blur-md ring-1 ring-[#7b6aa8]/30 transition-all duration-300 hover:-translate-y-0.5">
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#6b5a9c]/18 blur-3xl"
                  aria-hidden
                />
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c4b8e8]">
                    What to do
                  </h2>
                  <button
                    type="button"
                    onClick={copyBetter}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#5c4d78]/55 bg-[#16101f]/95 px-3 py-1.5 text-xs font-medium text-[#ddd4f0] transition-all hover:border-[#7b6aa8]/60 hover:bg-[#1c1528] hover:text-[#f0e8ff]"
                  >
                    {copiedBetter ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="relative mt-4 text-[16px] md:text-[17px] leading-relaxed text-[#ebe6f8] font-light">
                  {result.do}
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
