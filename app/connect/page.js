"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Copy, Check } from "lucide-react";
import { UnmaskingProgress } from "@/components/UnmaskingProgress";

const INVITER_REFLECTION_KEY = "luma_connect_inviter_reflection";
const INVITE_META_KEY = "luma_connect_invite_meta";

export default function ConnectPage() {
  const router = useRouter();
  const [reflection, setReflection] = useState(null);
  const [toEmail, setToEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);
  const [inviteId, setInviteId] = useState(null);
  const [recipientReady, setRecipientReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(INVITER_REFLECTION_KEY);
      if (raw) setReflection(raw);
    } catch {
      setReflection(null);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(INVITE_META_KEY);
      if (!raw) return;
      const m = JSON.parse(raw);
      if (typeof m.inviteId === "string") setInviteId(m.inviteId);
      if (typeof m.inviteLink === "string") setInviteLink(m.inviteLink);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!reflection) return;
    router.prefetch("/connect/accept");
  }, [reflection, router]);

  useEffect(() => {
    if (!inviteId || recipientReady) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/invites/${inviteId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.recipientReady) setRecipientReady(true);
      } catch {
        /* ignore */
      }
    };
    poll();
    const t = setInterval(poll, 4000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [inviteId, recipientReady]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const email = toEmail.trim();
    if (!email) {
      setError("Please enter your partner's email.");
      return;
    }
    if (!reflection) {
      setError("Your reflection is missing. Please complete an individual reflection first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromReflectionContent: reflection,
          toEmail: email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create invite");
      setInviteLink(data.inviteLink);
      setInviteId(data.inviteId);
      setRecipientReady(false);
      try {
        sessionStorage.setItem(
          INVITE_META_KEY,
          JSON.stringify({
            inviteId: data.inviteId,
            inviteLink: data.inviteLink,
            toEmail: email,
          })
        );
      } catch {
        /* ignore */
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const partnerSideStatus = !inviteLink
    ? {
        label: "Your partner",
        status: "needs_action",
        hint: "Their side stays empty until you send the invite — neither of you sees the full picture yet.",
      }
    : recipientReady
      ? {
          label: "Your partner",
          status: "complete",
          hint: "They're here with a saved reflection. The veil lifts when they reveal the space between you.",
        }
      : {
          label: "Your partner",
          status: "pending",
          hint: "Waiting for your partner to complete theirs — the mask stays on until you both meet.",
        };

  if (reflection === null) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16">
          <div className="max-w-[520px] mx-auto text-center animate-luma-fade-in">
            <h1 className="font-serif text-2xl md:text-3xl text-foreground [font-family:var(--font-serif-display)]">
              Unmasking
            </h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Complete an individual reflection first. Then you&apos;ll invite your partner — two inner worlds, revealed only
              when you&apos;re both ready.
            </p>
            <Link
              href="/test"
              className="inline-block mt-8 px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start Individual Reflection
            </Link>
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
        <div className="max-w-[560px] mx-auto animate-luma-fade-in">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Connect inner worlds
          </p>
          <h1 className="mt-3 font-serif text-2xl md:text-3xl text-foreground [font-family:var(--font-serif-display)] text-center text-balance">
            Unmasking
          </h1>
          <p className="mt-4 text-muted-foreground text-center leading-relaxed text-pretty max-w-[480px] mx-auto">
            You&apos;ve sealed your reflection. Your partner hasn&apos;t seen it — and you haven&apos;t seen theirs — until you
            both arrive. That tension is the point.
          </p>

          <UnmaskingProgress
            className="mt-10"
            you={{
              label: "You",
              status: "complete",
              hint: "Your reflection is sealed and waiting.",
            }}
            partner={partnerSideStatus}
          />

          {inviteLink && !recipientReady ? (
            <p className="mt-6 text-center text-sm font-medium text-foreground/90 leading-relaxed">
              Waiting for your partner to complete theirs.
            </p>
          ) : null}

          {inviteLink && recipientReady ? (
            <p className="mt-6 text-center text-sm text-violet-200/90 leading-relaxed">
              They&apos;re ready. When they open your link, they can lift the veil on both worlds at once.
            </p>
          ) : null}

          {!inviteLink ? (
            <form onSubmit={handleSubmit} className="mt-10 space-y-4">
              <label htmlFor="partner-email" className="block text-sm font-medium text-foreground">
                Partner&apos;s email
              </label>
              <input
                id="partner-email"
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-white/10"
                disabled={loading}
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-base font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Creating invite…" : "Send invite link"}
              </button>
            </form>
          ) : (
            <div className="mt-10 luma-glass border border-white/10 p-6 rounded-[12px]">
              <p className="text-sm text-muted-foreground mb-2">Share this link with your partner:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-2.5 backdrop-blur-sm text-sm text-foreground"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                They&apos;ll complete their own reflection, then this screen will show both sides ready — and they&apos;ll
                choose when to reveal the shared field between you.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
