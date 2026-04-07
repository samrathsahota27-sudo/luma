"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Smartphone, Users, Copy, Check, Share2, Loader2, ArrowRight } from "lucide-react";

type Mode = "same" | "remote" | null;

export default function CouplePreStartPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(null);
  const [creating, setCreating] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [joinUrl, setJoinUrl] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function startRemoteSession() {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/couple-sessions", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create link");
      setSessionId(data.sessionId);
      const joinPath = typeof data.joinPath === "string" ? data.joinPath : "";
      const absoluteJoinUrl =
        joinPath && typeof window !== "undefined" ? `${window.location.origin}${joinPath}` : joinPath;
      setJoinUrl(absoluteJoinUrl || null);
      try {
        localStorage.setItem("luma_couple_remote_session_id", data.sessionId);
      } catch {
        /* ignore */
      }
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  function selectSameDevice() {
    setMode("same");
    try {
      localStorage.removeItem("luma_couple_remote_session_id");
    } catch {
      /* ignore */
    }
    router.push("/couple/start");
  }

  function selectDifferentDevices() {
    setMode("remote");
    void startRemoteSession();
  }

  async function copyLink() {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function shareLink() {
    if (!joinUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Luma — Couple reflection",
          text: "Join me to finish our couple reflection on Luma.",
          url: joinUrl,
        });
        return;
      }
      await copyLink();
    } catch {
      /* user cancelled share or error */
    }
  }

  const cardBase =
    "w-full text-left rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-200 active:scale-[0.99] md:hover:border-white/18 md:hover:bg-white/[0.06] min-h-[120px] md:min-h-[132px]";

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[#e8e4df]">
      <Navigation />
      <main className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))] pb-16 px-5 md:px-6">
        <div className="max-w-[520px] mx-auto">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
            Couple mode
          </p>
          <h1 className="mt-4 font-serif text-[1.65rem] md:text-[2rem] text-center text-white [font-family:var(--font-serif-display)] tracking-tight leading-tight px-1">
            How will you take this together?
          </h1>
          <p className="mt-3 text-center text-sm text-white/55 leading-relaxed">
            Choose one path. You can always start again if you change your mind.
          </p>

          {!mode && (
            <div className="mt-10 flex flex-col gap-4">
              <button type="button" onClick={selectSameDevice} className={cardBase}>
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-white/90">
                    <Smartphone className="h-6 w-6" aria-hidden />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h2 className="font-serif text-lg md:text-xl text-white [font-family:var(--font-serif-display)]">
                      Same device
                    </h2>
                    <p className="mt-1 text-[15px] font-medium text-white/90">Take it together</p>
                    <p className="mt-2 text-sm text-white/55 leading-snug">
                      Pass the phone and answer one by one.
                    </p>
                  </div>
                </div>
              </button>

              <button type="button" onClick={selectDifferentDevices} disabled={creating} className={`${cardBase} disabled:opacity-60`}>
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-white/90">
                    <Users className="h-6 w-6" aria-hidden />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h2 className="font-serif text-lg md:text-xl text-white [font-family:var(--font-serif-display)]">
                      Different devices
                    </h2>
                    <p className="mt-1 text-[15px] font-medium text-white/90">Take it separately</p>
                    <p className="mt-2 text-sm text-white/55 leading-snug">
                      Get a private link and answer on your own device.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {mode === "remote" && (
            <div className="mt-10 space-y-6 animate-in fade-in duration-300">
              {creating && (
                <div className="flex flex-col items-center gap-3 py-10 text-white/50">
                  <Loader2 className="h-9 w-9 animate-spin opacity-70" />
                  <p className="text-sm">Creating your link…</p>
                </div>
              )}

              {createError && (
                <p className="text-center text-sm text-red-300/90" role="alert">
                  {createError}
                </p>
              )}

              {!creating && joinUrl && sessionId && (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/45">
                      Link for your partner
                    </p>
                    <p className="mt-3 break-all text-sm text-white/85 leading-relaxed font-mono bg-black/30 rounded-xl px-3 py-3 border border-white/10">
                      {joinUrl}
                    </p>
                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={copyLink}
                        className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-white text-[#0b0a0d] text-base font-semibold shadow-[0_8px_28px_rgba(255,255,255,0.12)] transition hover:opacity-95"
                      >
                        {copyDone ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        {copyDone ? "Copied" : "Copy link"}
                      </button>
                      <button
                        type="button"
                        onClick={shareLink}
                        className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] text-base font-semibold text-white transition hover:bg-white/[0.1]"
                      >
                        <Share2 className="h-5 w-5" />
                        Share
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.07] px-5 py-4 text-sm leading-relaxed text-white/80">
                    <p>Both of you need to complete it to see the full result.</p>
                    <p className="mt-2 text-white/65">
                      Your answers stay private until both of you finish.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/couple/start?sessionId=${encodeURIComponent(sessionId)}`)}
                    className="flex w-full min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground text-base font-semibold shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.28)] transition hover:opacity-95"
                  >
                    Continue as Partner A
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode(null);
                      setSessionId(null);
                      setJoinUrl(null);
                    }}
                    className="w-full py-3 text-sm text-white/45 hover:text-white/70 transition-colors"
                  >
                    ← Back to choices
                  </button>
                </>
              )}
            </div>
          )}

          <p className="mt-12 text-center">
            <Link href="/couple-hub" className="text-sm text-white/40 hover:text-white/65 transition-colors">
              Back to couple hub
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
