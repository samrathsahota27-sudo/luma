"use client";

import { useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { ArrowLeft, Check, Copy, Loader2 } from "lucide-react";
import { DepthModeSelector } from "@/components/DepthModeSelector";
import { useDepthMode } from "@/hooks/useDepthMode";
import { buildRelationshipContext, recordFeatureUse } from "@/lib/relationshipContext";
import { mindTagline } from "@/lib/depthUiMicrocopy";

type MindResult = {
  behavior: string;
  interpretations: string;
  need: string;
  confirm: string;
};

const REVEAL_DELAY_MS = 520;

export default function MindPage() {
  const { depthMode, setDepthMode } = useDepthMode();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MindResult | null>(null);
  const [copiedConfirm, setCopiedConfirm] = useState(false);

  async function handleReveal() {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setResult(null);
    setCopiedConfirm(false);
    setLoading(true);

    try {
      recordFeatureUse("mind");
      const res = await fetch("/api/mind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          depthMode,
          context: buildRelationshipContext("mind"),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError("Couldn't read the situation. Try again.");
        return;
      }

      if (
        data &&
        typeof data.behavior === "string" &&
        (typeof data.interpretations === "string" || typeof data.inner === "string") &&
        typeof data.need === "string" &&
        typeof data.confirm === "string"
      ) {
        await new Promise((r) => setTimeout(r, REVEAL_DELAY_MS));
        setResult({
          behavior: data.behavior,
          interpretations:
            typeof data.interpretations === "string" ? data.interpretations : data.inner,
          need: data.need,
          confirm: data.confirm,
        });
      } else {
        setError("Couldn't read the situation. Try again.");
      }
    } catch {
      setError("Couldn't read the situation. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyConfirm() {
    if (!result?.confirm) return;
    try {
      await navigator.clipboard.writeText(result.confirm);
      setCopiedConfirm(true);
      window.setTimeout(() => setCopiedConfirm(false), 2200);
    } catch {
      setCopiedConfirm(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a090c] text-[#e8e4df]">
      <Navigation />
      <TimelineBar />

      <main className={`flex-1 ${COUPLE_MAIN_PADDING_TOP} pb-20 px-6 relative overflow-hidden`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_45%_at_50%_-15%,rgba(80,65,110,0.14),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_90%,rgba(70,55,45,0.08),transparent)]"
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
              Inside Their Mind
            </h1>
            <p className="mt-3 text-center text-[#9a9288] text-sm md:text-base font-light leading-relaxed">
              {mindTagline(depthMode)}
            </p>

            <DepthModeSelector
              value={depthMode}
              onChange={setDepthMode}
              disabled={loading}
              className="mt-6"
            />

            <label className="mt-8 block">
              <span className="sr-only">What did they do or say?</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What did they do or say?"
                rows={5}
                disabled={loading}
                className="w-full rounded-xl border border-[#35303d] bg-[#0e0c10]/90 px-4 py-3 text-[15px] text-[#e8e4df] placeholder:text-[#5c564c] outline-none transition-colors focus:border-[#524a60] focus:ring-1 focus:ring-[#524a60]/40 disabled:opacity-50 resize-y min-h-[120px] placeholder:font-light"
              />
            </label>
            <p className="mt-2 text-xs text-[#5c564c] font-light leading-relaxed italic">
              Example: They&apos;ve been replying late and acting distant
            </p>

            {error && (
              <p className="mt-4 text-center text-sm text-[#c49a8c]" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleReveal}
                disabled={loading || !text.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3d3848] bg-[#1f1c24] px-8 py-3 text-sm font-medium text-[#ece8e2] shadow-[0_0_32px_-6px_rgba(100,85,130,0.18)] transition-all duration-300 hover:scale-[1.02] hover:border-[#524a60] hover:bg-[#25222c] disabled:pointer-events-none disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin opacity-80" />
                    Reading the signals…
                  </>
                ) : (
                  "Reveal Insight"
                )}
              </button>
            </div>
          </div>

          {result && (
            <div className="mt-10 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <section className="rounded-2xl border border-[#2e2a35]/90 bg-[#131118]/80 p-6 md:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.42)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a7288]">
                  Surface Behavior
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#c9c0b4] font-light">
                  {result.behavior}
                </p>
              </section>

              <section className="rounded-2xl border border-[#2e2a35]/90 bg-[#131118]/80 p-6 md:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.42)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a7288]">
                  Possible Interpretations
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#c9c0b4] font-light whitespace-pre-wrap">
                  {result.interpretations}
                </p>
              </section>

              <section className="rounded-2xl border border-[#3d3550]/70 bg-[#16131d]/85 p-6 md:p-7 shadow-[0_16px_48px_rgba(0,0,0,0.45),0_0_44px_-12px_rgba(85,70,115,0.18)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a8cb8]">
                  What They Might Need
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#b8ae9f] font-light">
                  {result.need}
                </p>
              </section>

              <section className="relative overflow-hidden rounded-2xl border border-[#4a7c6a]/45 bg-gradient-to-br from-[#101814]/98 via-[#121c1a]/95 to-[#14101c]/95 p-6 md:p-8 shadow-[0_20px_56px_rgba(0,0,0,0.5),0_0_48px_-10px_rgba(80,160,130,0.18)] backdrop-blur-md ring-1 ring-[#5a9e82]/25 transition-transform duration-300 hover:-translate-y-0.5">
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#4a9080]/12 blur-3xl"
                  aria-hidden
                />
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7ec9a8]">
                    Ask To Confirm
                  </h2>
                  <button
                    type="button"
                    onClick={copyConfirm}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#4a7c6a]/50 bg-[#0f1814]/90 px-3 py-1.5 text-xs font-medium text-[#b8e4cc] transition-all hover:border-[#5aae88]/55 hover:bg-[#152018] hover:text-[#d4f0e2]"
                  >
                    {copiedConfirm ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy question
                      </>
                    )}
                  </button>
                </div>
                <p className="relative mt-4 text-[16px] md:text-[17px] leading-relaxed text-[#e4f2ea] font-light">
                  {result.confirm}
                </p>
                <p className="relative mt-3 text-xs text-[#6d9a80]/90 font-light leading-relaxed">
                  Use this as a check-in — theories aren&apos;t facts until they say so.
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
