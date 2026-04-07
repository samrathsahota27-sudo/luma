"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Check, Copy } from "lucide-react";

function CoupleShareInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId")?.trim() || "";
  const [copied, setCopied] = useState(false);

  const joinPath = useMemo(() => {
    if (!sessionId) return "";
    return `/couple/join?sessionId=${encodeURIComponent(sessionId)}`;
  }, [sessionId]);

  const joinUrl = useMemo(() => {
    if (!joinPath) return "";
    if (typeof window === "undefined") return joinPath;
    return `${window.location.origin}${joinPath}`;
  }, [joinPath]);

  async function onCopy() {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* no-op */
    }
  }

  if (!sessionId) {
    return (
      <div className="max-w-[520px] mx-auto text-center px-4">
        <h1 className="font-serif text-xl text-white [font-family:var(--font-serif-display)]">
          Missing session
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Start from Couple Mode to create a valid share link.
        </p>
        <Link href="/couple" className="mt-8 inline-block text-sm text-violet-300 hover:text-violet-200">
          Back to Couple Mode
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[520px] mx-auto px-4 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">Partner A done</p>
      <h1 className="mt-4 font-serif text-2xl md:text-[1.75rem] text-white [font-family:var(--font-serif-display)] leading-tight">
        Send this to your partner to complete the reflection
      </h1>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left">
        <p className="text-xs uppercase tracking-widest text-white/50">Share link</p>
        <p className="mt-3 break-all rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white/85 font-mono">
          {joinUrl}
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-white text-[#0b0a0d] text-sm font-semibold transition hover:opacity-95"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

export default function CoupleSharePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[#e8e4df]">
      <Navigation />
      <main className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))] pb-16 flex flex-col justify-center">
        <Suspense fallback={<div className="py-20 text-center text-white/40">Loading…</div>}>
          <CoupleShareInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
