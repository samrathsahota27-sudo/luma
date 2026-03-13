"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { getLastIndividualReflection } from "@/lib/reflectionStorage";

const CONNECT_RESULT_KEY = "luma_connect_result";

function AcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams.get("invite");

  const [invite, setInvite] = useState(null);
  const [inviteError, setInviteError] = useState(null);
  const [partnerReflection, setPartnerReflection] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  useEffect(() => {
    if (!inviteId) {
      setInviteError("No invite link provided.");
      return;
    }
    fetch(`/api/invites/${inviteId}`)
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error || "Invite not found"); });
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
    const last = getLastIndividualReflection();
    setPartnerReflection(last?.content ?? null);
  }, []);

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
      <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16">
          <div className="max-w-[520px] mx-auto text-center">
            <h1 className="font-serif text-2xl text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              Invalid link
            </h1>
            <p className="mt-4 text-[#5a5a5a]">This invite link is missing an invite code.</p>
            <Link href="/" className="inline-block mt-8 text-sm text-[#2F2F2F] underline underline-offset-4">Back to home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16">
          <div className="max-w-[520px] mx-auto text-center animate-luma-fade-in">
            <h1 className="font-serif text-2xl text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              Invite not found
            </h1>
            <p className="mt-4 text-[#5a5a5a]">{inviteError}</p>
            <Link href="/" className="inline-block mt-8 px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-sm font-medium hover:opacity-90">Back to home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16 flex items-center justify-center">
          <p className="text-[#5a5a5a]">Loading invite…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!partnerReflection) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16">
          <div className="max-w-[520px] mx-auto text-center animate-luma-fade-in">
            <h1 className="font-serif text-2xl text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              Connect your inner worlds
            </h1>
            <p className="mt-4 text-[#5a5a5a] leading-relaxed">
              Someone invited you to generate &quot;The Space Between Us&quot; from your reflections. Complete and save an individual reflection first, then return to this link.
            </p>
            <Link href="/test" className="inline-block mt-8 px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Start Individual Reflection
            </Link>
            <p className="mt-6 text-sm text-[#5a5a5a]">
              Already have a saved reflection? Make sure you&apos;re on the same device where you saved it.
            </p>
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
        <div className="max-w-[520px] mx-auto animate-luma-fade-in text-center">
          <h1 className="font-serif text-2xl md:text-3xl text-[#2F2F2F] [font-family:var(--font-serif-display)]">
            The Space Between Us
          </h1>
          <p className="mt-4 text-[#5a5a5a] leading-relaxed">
            You have a saved reflection. Your partner has shared theirs. Generate a couple insight from both inner worlds.
          </p>
          {genError && <p className="mt-4 text-sm text-red-600">{genError}</p>}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="mt-8 px-6 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {generating ? "Generating…" : "Generate The Space Between"}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ConnectAcceptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-[#F7F6F3]">
        <Navigation />
        <main className="flex-1 pt-20 flex items-center justify-center"><p className="text-[#5a5a5a]">Loading…</p></main>
        <Footer />
      </div>
    }>
      <AcceptContent />
    </Suspense>
  );
}
