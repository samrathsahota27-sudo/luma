"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { getLastIndividualReflection } from "@/lib/reflectionStorage";
import { UnmaskingProgress } from "@/components/UnmaskingProgress";

const CONNECT_RESULT_KEY = "luma_connect_result";

function excerpt(text, maxLen = 320) {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen).trim() + "…";
}

function MaskedPartnerPlaceholder() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Their inner world</p>
      <div className="mt-3 space-y-2" aria-hidden>
        {[72, 88, 64, 80].map((w, i) => (
          <div key={i} className="h-2 rounded-full bg-white/[0.07]" style={{ width: `${w}%` }} />
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground leading-relaxed">Still veiled — yours and theirs stay separate until you reveal.</p>
    </div>
  );
}

function AcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("invite");

  const [invite, setInvite] = useState(null);
  const [inviteError, setInviteError] = useState(null);
  const [partnerReflection, setPartnerReflection] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const recipientPinged = useRef(false);

  useEffect(() => {
    if (!inviteId) {
      setInviteError("No invite link provided.");
      return;
    }
    fetch(`/api/invites/${inviteId}`)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => {
          throw new Error(d.error || "Invite not found");
        });
        return res.json();
      })
      .then((data) => {
        setInvite(data);
        setInviteError(null);
      })
      .catch((err) => {
        setInviteError(err.message || "Invite not found or expired.");
      });
  }, [inviteId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const refresh = () => {
      const last = getLastIndividualReflection();
      setPartnerReflection(last?.content ?? null);
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  useEffect(() => {
    if (!inviteId || !invite?.fromReflectionContent || !partnerReflection || recipientPinged.current) return;
    recipientPinged.current = true;
    void fetch(`/api/invites/${inviteId}/recipient-ready`, { method: "POST" }).catch(() => {});
  }, [inviteId, invite, partnerReflection]);

  const handleGenerate = async () => {
    if (!invite?.fromReflectionContent || !partnerReflection) return;
    setGenError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/connect-inner-worlds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reflectionA: invite.fromReflectionContent,
          reflectionB: partnerReflection,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate insight");
      try {
        sessionStorage.setItem(
          CONNECT_RESULT_KEY,
          JSON.stringify({
            result: data.result,
            brutalTruth: data.brutalTruth ?? null,
            emotionalTag: data.emotionalTag ?? null,
            trackerInsight: data.trackerInsight ?? null,
            calendarState: data.calendarState ?? null,
            dangerousQuestion: data.dangerousQuestion ?? null,
            shadowInsight: data.shadowInsight ?? null,
            conflictFrictionPoints: data.conflictFrictionPoints ?? null,
            reflectionA: invite.fromReflectionContent,
            reflectionB: partnerReflection,
          })
        );
      } catch (e) {
        console.warn("SessionStorage set failed", e);
      }
      router.push("/connect/result");
    } catch (err) {
      setGenError(err.message || "Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!inviteId) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16">
          <div className="max-w-[520px] mx-auto text-center">
            <h1 className="font-serif text-2xl text-foreground [font-family:var(--font-serif-display)]">
              Invalid link
            </h1>
            <p className="mt-4 text-muted-foreground">This invite link is missing an invite code.</p>
            <Link href="/" className="inline-block mt-8 text-sm text-foreground underline underline-offset-4">
              Back to home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16">
          <div className="max-w-[520px] mx-auto text-center animate-luma-fade-in">
            <h1 className="font-serif text-2xl text-foreground [font-family:var(--font-serif-display)]">
              Invite not found
            </h1>
            <p className="mt-4 text-muted-foreground">{inviteError}</p>
            <Link
              href="/"
              className="inline-block mt-8 px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium hover:opacity-90"
            >
              Back to home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16 flex items-center justify-center">
          <p className="text-muted-foreground">Loading invite…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!partnerReflection) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navigation />
        <main className="flex-1 pt-20 px-5 py-14 md:py-20">
          <div className="max-w-[560px] mx-auto animate-luma-fade-in">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Connect inner worlds
            </p>
            <h1 className="mt-3 font-serif text-2xl md:text-3xl text-foreground [font-family:var(--font-serif-display)] text-center text-balance">
              Unmasking
            </h1>
            <p className="mt-4 text-muted-foreground text-center leading-relaxed">
              Someone left a reflection in waiting for you. You can&apos;t read it yet — not until yours is beside it.
            </p>

            <UnmaskingProgress
              className="mt-10"
              you={{
                label: "You",
                status: "needs_action",
                hint: "Complete and save an individual reflection — then come back to this link.",
              }}
              partner={{
                label: "Your partner",
                status: "sealed",
                hint: "Their inner world is here, held in silence, until you've brought yours.",
              }}
            />

            <div className="mt-10 flex flex-col items-center gap-4">
              <Link
                href="/test"
                className="inline-flex w-full max-w-sm justify-center px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Start Individual Reflection
              </Link>
              <p className="text-center text-sm text-muted-foreground leading-relaxed max-w-sm">
                Already saved one on this device? Return here — the screen will update when your reflection is detected.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />
      <main className="flex-1 pt-20 px-5 py-14 md:py-20">
        <div className="max-w-[640px] mx-auto animate-luma-fade-in">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Connect inner worlds
          </p>
          <h1 className="mt-3 font-serif text-2xl md:text-3xl text-foreground [font-family:var(--font-serif-display)] text-center text-balance">
            Both sides are here
          </h1>
          <p className="mt-4 text-muted-foreground text-center leading-relaxed text-pretty">
            Yours is open. Theirs is still behind glass. The combined read — how the two landscapes touch — unlocks in one motion.
          </p>

          <UnmaskingProgress
            className="mt-10"
            you={{
              label: "You",
              status: "complete",
              hint: "Your saved reflection is in the room.",
            }}
            partner={{
              label: "Your partner",
              status: "sealed",
              hint: "Their world stays obscured until you reveal the space between.",
            }}
          />

          <section className="mt-10" aria-labelledby="unmask-comparison-heading">
            <h2 id="unmask-comparison-heading" className="sr-only">
              Before you reveal
            </h2>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Before you reveal
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400/90">Your landscape</p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">{excerpt(partnerReflection)}</p>
              </div>
              <MaskedPartnerPlaceholder />
            </div>
          </section>

          {genError ? <p className="mt-6 text-center text-sm text-red-600">{genError}</p> : null}

          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full max-w-md px-6 py-3.5 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-base font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {generating ? "Weaving both worlds…" : "Reveal the space between"}
            </button>
            <p className="text-center text-xs text-muted-foreground max-w-sm leading-relaxed">
              This generates your shared insight — the first true side-by-side read.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ConnectAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background">
          <Navigation />
          <main className="flex-1 pt-20 flex items-center justify-center">
            <p className="text-muted-foreground">Loading…</p>
          </main>
          <Footer />
        </div>
      }
    >
      <AcceptContent />
    </Suspense>
  );
}
