"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { CoupleFlowSteps } from "@/components/CoupleFlowSteps";
import { Loader2, ArrowRight, Link2 } from "lucide-react";

function readDepthMode(): string {
  try {
    const raw = localStorage.getItem("luma_depth_mode");
    if (raw === "steel" || raw === "satin") return raw;
  } catch {
    /* ignore */
  }
  return "satin";
}

function CoupleWaitingInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [partnerAComplete, setPartnerAComplete] = useState(false);
  const [partnerBComplete, setPartnerBComplete] = useState(false);
  const [ready, setReady] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const poll = useCallback(async () => {
    if (!sessionId?.trim()) return;
    try {
      const res = await fetch(`/api/couple-sessions/${encodeURIComponent(sessionId.trim())}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json().catch(() => ({}));
      setPartnerAComplete(Boolean(data.partnerAComplete));
      setPartnerBComplete(Boolean(data.partnerBComplete));
      setReady(Boolean(data.readyForResult));
    } catch {
      /* ignore transient errors */
    } finally {
      setSessionLoading(false);
    }
  }, [sessionId]);

  const partnerBLink = useMemo(() => {
    if (typeof window === "undefined" || !sessionId?.trim()) return "";
    return `${window.location.origin}/couple/partner-b?sessionId=${encodeURIComponent(sessionId.trim())}`;
  }, [sessionId]);

  const flowStep = ready ? 3 : partnerAComplete ? 2 : 1;

  useEffect(() => {
    if (!sessionId?.trim()) return;
    void poll();
    const t = window.setInterval(poll, 3500);
    return () => window.clearInterval(t);
  }, [sessionId, poll]);

  if (!sessionId?.trim()) {
    return (
      <div className="max-w-[480px] mx-auto text-center px-4">
        <p className="text-sm text-white/55">No session in this link.</p>
        <Link href="/couple" className="mt-6 inline-block text-sm text-violet-300">
          Back to Couple Mode
        </Link>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-[480px] mx-auto text-center px-4">
        <h1 className="font-serif text-xl text-white">Session not found</h1>
        <Link href="/couple" className="mt-6 inline-block text-sm text-violet-300">
          Start again
        </Link>
      </div>
    );
  }

  const statusLine = ready
    ? "Ready to reveal your dynamic"
    : "Waiting for your partner";

  const subLine = ready
    ? "You’re both done. Open your shared result when you’re together—or whenever you’re ready."
    : partnerAComplete && !partnerBComplete
      ? "Partner A is done. We’re waiting on Partner B to finish on their device."
      : !partnerAComplete && partnerBComplete
        ? "Partner B is done. We’re waiting on Partner A to finish."
        : "When you’ve both finished all five rounds, your shared result will unlock.";

  const resultHref = `/couple/result?sessionId=${encodeURIComponent(sessionId.trim())}&dm=${encodeURIComponent(readDepthMode())}`;

  return (
    <div className="max-w-[480px] mx-auto px-4 text-center w-full min-w-0">
      <CoupleFlowSteps activeStep={flowStep} className="mb-6 text-left sm:text-center" />

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 md:py-12">
        {sessionLoading ? (
          <div className="space-y-4 py-4" aria-busy="true" aria-label="Loading session">
            <div className="h-10 w-10 rounded-full border-2 border-violet-400/25 border-t-violet-400/80 animate-spin mx-auto" />
            <div className="h-3 rounded-full bg-white/[0.08] animate-pulse max-w-[200px] mx-auto" />
            <div className="h-3 rounded-full bg-white/[0.06] animate-pulse max-w-[260px] mx-auto" />
            <p className="text-center text-sm text-white/45 pt-2">Checking session…</p>
          </div>
        ) : (
          <>
        {!ready && (
          <div className="flex justify-center mb-6" aria-hidden>
            <Loader2 className="h-10 w-10 text-violet-400/80 animate-spin" />
          </div>
        )}
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">Status</p>
        <h1 className="mt-3 font-serif text-xl md:text-2xl text-white [font-family:var(--font-serif-display)] leading-snug">
          {statusLine}
        </h1>
        <p className="mt-4 text-sm text-white/60 leading-relaxed">{subLine}</p>

        {!ready && partnerBLink ? (
          <div className="mt-8 text-left">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40 text-center">
              Invite Partner B
            </p>
            <p className="mt-2 text-xs text-white/50 text-center leading-relaxed">
              Send them this link to open the same session on their phone.
            </p>
            <button
              type="button"
              onClick={() => {
                if (!partnerBLink || !navigator.clipboard?.writeText) return;
                void navigator.clipboard.writeText(partnerBLink).then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                });
              }}
              className="mt-4 w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.1]"
            >
              <Link2 className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {copied ? "Copied!" : "Copy link for Partner B"}
            </button>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-2 text-left text-xs text-white/45 max-w-[280px] mx-auto">
          <p className="flex items-center gap-2">
            <span className={partnerAComplete ? "text-emerald-400/90" : ""}>●</span>
            Partner A {partnerAComplete ? "— done" : "— not done yet"}
          </p>
          <p className="flex items-center gap-2">
            <span className={partnerBComplete ? "text-emerald-400/90" : ""}>●</span>
            Partner B {partnerBComplete ? "— done" : "— not done yet"}
          </p>
        </div>

        {ready && (
          <Link
            href={resultHref}
            className="mt-10 inline-flex min-h-[56px] w-full max-w-sm mx-auto items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground text-base font-semibold shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.28)] transition hover:opacity-95"
          >
            See our result
            <ArrowRight className="h-5 w-5" />
          </Link>
        )}
          </>
        )}
      </div>

      <Link href="/couple-hub" className="mt-10 inline-block text-sm text-white/40 hover:text-white/65">
        Back to couple hub
      </Link>
    </div>
  );
}

export default function CoupleWaitingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[#e8e4df]">
      <Navigation />
      <main className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))] pb-16 flex flex-col justify-center">
        <Suspense
          fallback={
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
          }
        >
          <CoupleWaitingInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
