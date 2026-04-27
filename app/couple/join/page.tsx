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
  const sessionId = searchParams.get("sessionId");
  const code = searchParams.get("code");
  const mirrorCode = searchParams.get("mirrorCode");
  const partnerRole = searchParams.get("partnerRole");
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [readyForResult, setReadyForResult] = useState(false);
  const [mirrorJoinState, setMirrorJoinState] = useState<"idle" | "joining" | "connected" | "error">("idle");
  const [mirrorError, setMirrorError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId?.trim()) return;
    try {
      const role = partnerRole === "partnerA" ? "partnerA" : "partnerB";
      sessionStorage.setItem("coupleRole", role);
      sessionStorage.setItem("coupleSessionId", sessionId.trim());
    } catch {
      // ignore
    }
  }, [sessionId, partnerRole]);

  useEffect(() => {
    if (!code?.trim()) return;
    let cancelled = false;
    setChecking(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/couple-sessions/by-code?code=${encodeURIComponent(code.trim().toUpperCase())}`
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setValid(false);
          setChecking(false);
          return;
        }
        router.replace(
          `/couple/join?sessionId=${encodeURIComponent(data.sessionId)}&partnerRole=partnerB`
        );
      } catch {
        if (!cancelled) {
          setValid(false);
          setChecking(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, router]);

  useEffect(() => {
    if (!mirrorCode?.trim()) return;
    let cancelled = false;
    setMirrorJoinState("joining");
    setMirrorError(null);
    (async () => {
      try {
        const res = await fetch(`/api/shared-mirror/${encodeURIComponent(mirrorCode.trim().toUpperCase())}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recentSelections: [] }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setMirrorJoinState("error");
          setMirrorError(data?.error || "Could not connect this mirror code.");
          return;
        }
        setMirrorJoinState("connected");
      } catch {
        if (!cancelled) {
          setMirrorJoinState("error");
          setMirrorError("Could not connect this mirror code.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mirrorCode]);

  useEffect(() => {
    if (code?.trim()) return;
    if (mirrorCode?.trim()) {
      setChecking(false);
      return;
    }
    if (!sessionId?.trim()) {
      setChecking(false);
      setValid(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/couple-sessions/${encodeURIComponent(sessionId.trim())}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        setValid(res.ok);
        setReadyForResult(Boolean(data?.readyForResult));
      } catch {
        if (!cancelled) {
          setValid(false);
          setReadyForResult(false);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, mirrorCode, code]);

  if (mirrorCode?.trim()) {
    return (
      <div className="max-w-[480px] mx-auto px-4 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">Shared Mirror</p>
        <h1 className="mt-4 font-serif text-2xl md:text-[1.75rem] text-white [font-family:var(--font-serif-display)] leading-tight">
          Connecting your mirrors
        </h1>
        <p className="mt-4 text-sm text-white/60 leading-relaxed">
          Code: <span className="font-mono text-white/80">{mirrorCode.trim().toUpperCase()}</span>
        </p>

        {mirrorJoinState === "joining" ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-white/65">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="text-sm">Merging your first mirror overlap...</p>
          </div>
        ) : null}

        {mirrorJoinState === "connected" ? (
          <>
            <p className="mt-8 text-sm text-emerald-200">Both mirrors connected ✨</p>
            <button
              type="button"
              onClick={() => router.push("/couple-hub")}
              className="mt-8 flex w-full min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-white text-[#0b0a0d] text-base font-semibold shadow-[0_8px_32px_rgba(255,255,255,0.12)] transition hover:opacity-95"
            >
              Open control panel
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        ) : null}

        {mirrorJoinState === "error" ? (
          <>
            <p className="mt-8 text-sm text-red-300/90">{mirrorError || "Could not connect this mirror code."}</p>
            <Link href="/couple-hub" className="mt-6 inline-block text-sm text-violet-300 hover:text-violet-200">
              Back to Control Panel
            </Link>
          </>
        ) : null}
      </div>
    );
  }

  if (code?.trim() && !checking && !valid) {
    return (
      <div className="max-w-[480px] mx-auto text-center px-4">
        <h1 className="font-serif text-xl text-white [font-family:var(--font-serif-display)]">Invalid code</h1>
        <p className="mt-3 text-sm text-white/55">Ask your partner for a fresh invite code.</p>
        <Link href="/couple" className="mt-8 inline-block text-sm text-violet-300 hover:text-violet-200">
          Go to Couple Mode
        </Link>
      </div>
    );
  }

  if (!sessionId?.trim()) {
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
        <h1 className="font-serif text-xl text-white [font-family:var(--font-serif-display)]">Invalid or incomplete session</h1>
        <p className="mt-3 text-sm text-white/55">Ask your partner to start again and share a fresh link.</p>
        <Link href="/couple" className="mt-8 inline-block text-sm text-violet-300 hover:text-violet-200">
          Go to Couple Mode
        </Link>
      </div>
    );
  }

  const showResult = readyForResult;

  return (
    <div className="max-w-[480px] mx-auto px-4 text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">Partner B</p>
      <h1 className="mt-4 font-serif text-2xl md:text-[1.75rem] text-white [font-family:var(--font-serif-display)] leading-tight">
        You&apos;re invited to reflect
      </h1>
      <p className="mt-4 text-sm text-white/60 leading-relaxed">
        {showResult
          ? "This session is completed. Open the shared result."
          : "Your partner started a couple reflection on Luma. Complete your part on this device when you're ready."}
      </p>
      <button
        type="button"
        onClick={() =>
          router.push(
            showResult
              ? `/couple/result?sessionId=${encodeURIComponent(sessionId.trim())}`
              : `/couple/partner-b?sessionId=${encodeURIComponent(sessionId.trim())}&partnerRole=partnerB`
          )
        }
        className="mt-10 flex w-full min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-white text-[#0b0a0d] text-base font-semibold shadow-[0_8px_32px_rgba(255,255,255,0.12)] transition hover:opacity-95"
      >
        {showResult ? "See result" : "Continue"}
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
