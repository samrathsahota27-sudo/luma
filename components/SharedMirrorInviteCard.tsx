"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Loader2, Share2, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reflectionRounds } from "@/lib/reflection/reflectionRounds";
import { createClient } from "@/lib/supabase/client";

type MirrorSelection = {
  round: number;
  image: string;
  label?: string;
};

type MirrorOverlap = {
  generated_at?: string;
  partnerASelections: MirrorSelection[];
  partnerBSelections: MirrorSelection[];
  insight: string;
};

type MirrorStatePayload = {
  hasSession?: boolean;
  sessionId?: string;
  code?: string;
  state?: "waiting" | "connected";
  partnerJoined?: boolean;
  partnerJoinedAt?: string | null;
  overlap?: MirrorOverlap | null;
  joinUrl?: string;
};

const roundImageLookup: Record<number, string[]> = Object.fromEntries(
  (reflectionRounds || []).map((round: any) => [Number(round.roundNumber), Array.isArray(round.images) ? round.images : []])
);

function collectRecentSelectionsFromLocal(): MirrorSelection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("luma_profile");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const answers = parsed?.user && typeof parsed.user === "object" ? parsed.user : null;
    if (!answers) return [];

    const picks: MirrorSelection[] = [];
    for (const key of Object.keys(answers)) {
      const round = Number(key);
      if (!Number.isFinite(round)) continue;
      const answer = answers[key];
      const idx =
        typeof answer?.selectedImageId === "number"
          ? answer.selectedImageId
          : typeof answer?.image === "number"
            ? answer.image
            : null;
      if (idx == null) continue;
      const image = roundImageLookup[round]?.[idx];
      if (!image) continue;
      picks.push({
        round,
        image,
        label: `Round ${round}`,
      });
    }
    return picks.sort((a, b) => a.round - b.round).slice(0, 5);
  } catch {
    return [];
  }
}

export function SharedMirrorInviteCard({
  className = "",
  autoCreate = false,
}: {
  className?: string;
  autoCreate?: boolean;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [state, setState] = useState<MirrorStatePayload>({
    hasSession: false,
  });
  const pollTimerRef = useRef<number | null>(null);

  const clearPoll = useCallback(() => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const fetchCurrent = useCallback(async () => {
    const res = await fetch("/api/shared-mirror", { cache: "no-store" });
    const json = (await res.json().catch(() => ({}))) as MirrorStatePayload & { error?: string };
    if (!res.ok) {
      throw new Error(json?.error || "Could not load mirror state.");
    }
    setState(json);
    return json;
  }, []);

  const createCode = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const recentSelections = collectRecentSelectionsFromLocal();
      const res = await fetch("/api/shared-mirror", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentSelections }),
      });
      const json = (await res.json().catch(() => ({}))) as MirrorStatePayload & { error?: string };
      if (!res.ok) throw new Error(json?.error || "Could not generate code.");
      setState((prev) => ({ ...prev, ...json, hasSession: true }));
    } catch (e: any) {
      setError(e?.message || "Could not generate code.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!active) return;
        setIsAuthenticated(Boolean(user));
      } catch {
        if (!active) return;
        setIsAuthenticated(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (isAuthenticated !== true) {
      setLoading(false);
      clearPoll();
      return;
    }
    let active = true;
    (async () => {
      try {
        const current = await fetchCurrent();
        if (!active) return;
        if ((!current?.hasSession || !current?.code) && autoCreate) {
          await createCode();
        }
      } catch (e: any) {
        if (active) setError(e?.message || "Could not load mirror invite.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      clearPoll();
    };
  }, [autoCreate, clearPoll, createCode, fetchCurrent, isAuthenticated]);

  useEffect(() => {
    clearPoll();
    if (!state?.code || state?.state !== "waiting") return;
    pollTimerRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/shared-mirror/${encodeURIComponent(state.code || "")}`, { cache: "no-store" });
        const json = (await res.json().catch(() => ({}))) as MirrorStatePayload;
        if (res.ok && json) {
          setState((prev) => ({ ...prev, ...json, hasSession: true }));
        }
      } catch {
        // keep current UI state; next poll can recover
      }
    }, 4500);
    return clearPoll;
  }, [clearPoll, state?.code, state?.state]);

  const joinUrl = useMemo(() => {
    if (state.joinUrl) return state.joinUrl;
    if (!state.code) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/couple/join?mirrorCode=${encodeURIComponent(state.code)}`;
  }, [state.code, state.joinUrl]);

  const handleCopy = useCallback(async () => {
    if (!state.code) return;
    try {
      await navigator.clipboard.writeText(state.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy code.");
    }
  }, [state.code]);

  const handleShare = useCallback(async () => {
    if (!state.code) return;
    const shareText = `Join my Luma mirror with code ${state.code}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Luma Partner Invite",
          text: shareText,
          url: joinUrl || undefined,
        });
        return;
      }
      await navigator.clipboard.writeText(joinUrl || shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not share invite.");
    }
  }, [joinUrl, state.code]);

  const handleJoin = useCallback(async () => {
    const normalized = joinCode.trim().toUpperCase();
    if (!normalized || busy) return;
    setBusy(true);
    setError(null);
    try {
      const recentSelections = collectRecentSelectionsFromLocal();
      const res = await fetch(`/api/shared-mirror/${encodeURIComponent(normalized)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recentSelections }),
      });
      const json = (await res.json().catch(() => ({}))) as MirrorStatePayload & { error?: string };
      if (!res.ok) throw new Error(json?.error || "Could not join mirror code.");
      setState((prev) => ({ ...prev, ...json, hasSession: true }));
      setJoinCode("");
    } catch (e: any) {
      setError(e?.message || "Could not join mirror code.");
    } finally {
      setBusy(false);
    }
  }, [busy, joinCode]);

  const partnerASelections = Array.isArray(state?.overlap?.partnerASelections) ? state.overlap!.partnerASelections : [];
  const partnerBSelections = Array.isArray(state?.overlap?.partnerBSelections) ? state.overlap!.partnerBSelections : [];

  return (
    <Card className={`border-white/10 bg-white/[0.03] shadow-[0_20px_80px_rgba(0,0,0,0.45)] ${className}`}>
      <CardHeader>
        <CardTitle className="font-serif text-[24px] leading-tight [font-family:var(--font-serif-display)] text-white">
          Invite Your Partner
        </CardTitle>
        <CardDescription className="text-white/65">
          Share this code to connect your mirrors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated === false ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white/80">Sign in to generate and share your mirror code.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparing your shared mirror...
          </div>
        ) : (
          <>
            {state.code ? (
              <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4">
                <p className="text-center font-mono text-[34px] tracking-[0.16em] text-white">{state.code}</p>
              </div>
            ) : (
              <Button type="button" onClick={createCode} disabled={busy} className="bg-white text-[#120f18] hover:bg-white/90">
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Generate Mirror Code"
                )}
              </Button>
            )}

            {state.code ? (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={handleCopy} disabled={busy} className="bg-[#2f2d34] text-white hover:bg-[#3b3842]">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button type="button" onClick={handleShare} disabled={busy} className="bg-black text-white hover:bg-black/85">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            ) : null}

            {state.state === "connected" ? (
              <div className="rounded-xl border border-emerald-200/25 bg-emerald-400/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-emerald-100">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-300 animate-pulse" />
                  Both mirrors connected ✨
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 opacity-80" aria-hidden>
                  <div className="h-8 w-8 rounded-full bg-violet-300/35 animate-pulse" />
                  <div className="h-1 w-8 rounded-full bg-white/30" />
                  <div className="h-8 w-8 rounded-full bg-amber-200/35 animate-pulse [animation-delay:120ms]" />
                </div>
              </div>
            ) : state.code ? (
              <p className="text-sm text-white/65">Waiting for your partner to join...</p>
            ) : null}

            <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">Have a code already?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="A75-A0O"
                  className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/30"
                />
                <Button type="button" onClick={handleJoin} disabled={busy || !joinCode.trim()} className="h-10 bg-white text-[#120f18] hover:bg-white/90">
                  Join
                </Button>
              </div>
            </div>

            {state.state === "connected" && state.overlap ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">First Mirror Overlap</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <p className="text-xs text-white/60">Your recent picks</p>
                    <div className="grid grid-cols-2 gap-2">
                      {partnerASelections.slice(0, 4).map((item, idx) => (
                        <div key={`a-${idx}`} className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/${item.image}`} alt={item.label || `Round ${item.round}`} className="h-16 w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-white/60">Partner recent picks</p>
                    <div className="grid grid-cols-2 gap-2">
                      {partnerBSelections.slice(0, 4).map((item, idx) => (
                        <div key={`b-${idx}`} className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/${item.image}`} alt={item.label || `Round ${item.round}`} className="h-16 w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/80">
                  <Sparkles className="mr-1 inline h-4 w-4 text-violet-200" />
                  {state.overlap.insight}
                </p>
              </div>
            ) : null}
          </>
        )}

        {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
