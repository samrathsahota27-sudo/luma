"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, Loader2 } from "lucide-react";

function CoupleJoinInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = searchParams.get("session");
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!session?.trim()) {
      setChecking(false);
      setValid(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/couple-sessions/${encodeURIComponent(session.trim())}`);
        if (cancelled) return;
        setValid(res.ok);
      } catch {
        if (!cancelled) setValid(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!session?.trim()) {
    return (
      <div className="max-w-[480px] mx-auto text-center px-4">
        <h1 className="font-serif text-xl text-white [font-family:var(--font-serif-display)]">Missing link</h1>
        <p className="mt-3 text-sm text-white/55">This page needs a valid session from your partner.</p>
        <Link href="/couple" className="mt-8 inline-block text-sm text-violet-300 hover:text-violet-200">
          Start from couple mode
        </Link>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-white/50">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Checking link…</p>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="max-w-[480px] mx-auto text-center px-4">
        <h1 className="font-serif text-xl text-white [font-family:var(--font-serif-display)]">Link expired or invalid</h1>
        <p className="mt-3 text-sm text-white/55">Ask your partner to send a fresh link from Couple Mode.</p>
        <Link href="/couple" className="mt-8 inline-block text-sm text-violet-300 hover:text-violet-200">
          Go to Couple Mode
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">Partner B</p>
      <h1 className="mt-4 font-serif text-2xl md:text-[1.75rem] text-white [font-family:var(--font-serif-display)] leading-tight">
        You&apos;re invited to reflect
      </h1>
      <p className="mt-4 text-sm text-white/60 leading-relaxed">
        Your partner started a couple reflection on Luma. Complete your part on this device when you&apos;re ready.
      </p>
      <button
        type="button"
        onClick={() => router.push(`/couple/partner-b?session=${encodeURIComponent(session.trim())}`)}
        className="mt-10 flex w-full min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-white text-[#0b0a0d] text-base font-semibold shadow-[0_8px_32px_rgba(255,255,255,0.12)] transition hover:opacity-95"
      >
        Continue
        <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-6 text-xs text-white/40 leading-relaxed">
        Your answers stay private until both of you finish.
      </p>
    </div>
  );
}

export default function CoupleJoinPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[#e8e4df]">
      <Navigation />
      <main className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))] pb-16 flex flex-col justify-center">
        <Suspense
          fallback={
            <div className="flex justify-center py-20 text-white/45">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <CoupleJoinInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
