"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Copy, Check } from "lucide-react";

const INVITER_REFLECTION_KEY = "luma_connect_inviter_reflection";

export default function ConnectPage() {
  const router = useRouter();
  const [reflection, setReflection] = useState(null);
  const [toEmail, setToEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);
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
    if (!reflection) return;
    router.prefetch("/connect/accept");
  }, [reflection, router]);

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

  if (reflection === null) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16">
          <div className="max-w-[520px] mx-auto text-center animate-luma-fade-in">
            <h1 className="font-serif text-2xl md:text-3xl text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              Connect Inner Worlds
            </h1>
            <p className="mt-4 text-[#5a5a5a] leading-relaxed">
              Complete an individual reflection first, then return here to invite someone to connect.
            </p>
            <Link
              href="/test"
              className="inline-block mt-8 px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-sm font-medium hover:opacity-90 transition-opacity"
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
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />
      <main className="flex-1 pt-20 px-6 py-16 md:py-20">
        <div className="max-w-[520px] mx-auto animate-luma-fade-in">
          <h1 className="font-serif text-2xl md:text-3xl text-[#2F2F2F] [font-family:var(--font-serif-display)] text-center">
            Connect Inner Worlds
          </h1>
          <p className="mt-4 text-[#5a5a5a] text-center leading-relaxed">
            Send an invite link to your partner. When they open it and have their own reflection, you can generate your Space Between.
          </p>

          {!inviteLink ? (
            <form onSubmit={handleSubmit} className="mt-10 space-y-4">
              <label htmlFor="partner-email" className="block text-sm font-medium text-[#2F2F2F]">
                Partner&apos;s email
              </label>
              <input
                id="partner-email"
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full rounded-[12px] border border-[#E8E3D9] bg-white px-4 py-3 text-[#2F2F2F] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-[#2F2F2F]/20 focus:border-[#E8E3D9]"
                disabled={loading}
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Creating invite…" : "Send invite link"}
              </button>
            </form>
          ) : (
            <div className="mt-10 rounded-2xl bg-[#f8f6f3] border border-[#E8E3D9] p-6">
              <p className="text-sm text-[#5a5a5a] mb-2">Share this link with your partner:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 rounded-[12px] border border-[#E8E3D9] bg-white px-4 py-2.5 text-sm text-[#2F2F2F]"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#2F2F2F] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-4 text-sm text-[#5a5a5a] leading-relaxed">
                When they open the link and have completed their own individual reflection, they can generate &quot;The Space Between Us&quot; with you.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
