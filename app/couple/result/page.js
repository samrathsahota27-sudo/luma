"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { saveCoupleReflectionWithEmail } from "@/lib/reflectionStorage";
import { generateStoryCardBlob, downloadStoryCard, shareOrDownloadStoryCard } from "@/lib/storyCard";
import { StructuredResultSections } from "@/components/structured-result-sections";

const COUPLE_RESULT_STORAGE_KEY = "luma_couple_result";

const REVEAL_DELAY_A = 300;
const REVEAL_DELAY_B = 700;
const REVEAL_DELAY_BETWEEN = 1400;
const REVEAL_DELAY_TEXT = 2100;

function ImageOrPlaceholder({ src, alt, visible }) {
  const show = visible !== false;
  const transition = "transition-all duration-500 ease-out";
  const hidden = "opacity-0 translate-y-4";
  const visibleClass = "opacity-100 translate-y-0";

  if (src) {
    return (
      <div
        className={`relative w-full aspect-square rounded-[16px] overflow-hidden bg-[#E6E8F0]/50 shadow-[0_8px_30px_rgba(0,0,0,0.05)] ${transition} ${show ? visibleClass : hidden}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className={`w-full aspect-square rounded-[16px] bg-gradient-to-br from-[#E6E8F0] to-[#E8E3D9] flex items-center justify-center ${transition} ${show ? visibleClass : hidden}`}
      aria-hidden
    >
      <span className="text-xs text-muted-foreground">Reflection</span>
    </div>
  );
}

export default function CoupleResultPage() {
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);
  const [reveal, setReveal] = useState({
    innerA: false,
    innerB: false,
    spaceBetween: false,
    text: false,
  });
  const [saveEmail, setSaveEmail] = useState("");
  const [savedWithEmail, setSavedWithEmail] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(COUPLE_RESULT_STORAGE_KEY);
      if (!raw) {
        setMissing(true);
        return;
      }
      setData(JSON.parse(raw));
    } catch {
      setMissing(true);
    }
  }, []);

  useEffect(() => {
    if (data == null) return;
    const t1 = setTimeout(() => setReveal((r) => ({ ...r, innerA: true })), REVEAL_DELAY_A);
    const t2 = setTimeout(() => setReveal((r) => ({ ...r, innerB: true })), REVEAL_DELAY_B);
    const t3 = setTimeout(() => setReveal((r) => ({ ...r, spaceBetween: true })), REVEAL_DELAY_BETWEEN);
    const t4 = setTimeout(() => setReveal((r) => ({ ...r, text: true })), REVEAL_DELAY_TEXT);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [data]);

  const handleBackToHome = () => {
    try {
      sessionStorage.removeItem(COUPLE_RESULT_STORAGE_KEY);
    } catch {}
  };

  if (missing && data === null) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F6F3]">
        <Navigation />
        <main className="flex-1 pt-24 pb-20 px-6 flex flex-col items-center justify-center">
          <div className="max-w-[720px] mx-auto text-center space-y-6">
            <h1 className="font-serif text-[22px] text-[#2F2F2F]">
              No reflection to show
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Complete the couple reflection from the start to see your result.
            </p>
            <Link
              href="/couple"
              className="inline-flex items-center justify-center px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90"
            >
              Back to Couple Reflection
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const result = data?.result ?? null;
  const innerWorldA = data?.innerWorldA ?? null;
  const innerWorldB = data?.innerWorldB ?? null;
  const spaceBetween = data?.spaceBetween ?? null;
  const nameA = data?.nameA ?? null;
  const nameB = data?.nameB ?? null;
  const titleA = nameA && nameA.trim() ? `${nameA.trim()}'s Inner World` : "Inner World A";
  const titleB = nameB && nameB.trim() ? `${nameB.trim()}'s Inner World` : "Inner World B";
  const titleBetween = nameA?.trim() && nameB?.trim() ? `The Space Between ${nameA.trim()} & ${nameB.trim()}` : "The Space Between Us";

  const formattedResult =
    result != null ? result.replace(/\n/g, "<br>") : null;

  const transition = "transition-all duration-500 ease-out";
  const hidden = "opacity-0 translate-y-4";
  const visibleClass = "opacity-100 translate-y-0";

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3]">
      <Navigation />

      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Couple Reflection
            </span>
            <h1 className="font-serif text-[22px] md:text-[28px] mt-4 text-[#2F2F2F]">
              The Space Between You
            </h1>
          </div>

          {/* Top row: Inner World A | Inner World B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div
              className={`rounded-[16px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col ${transition} ${reveal.innerA ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-[#2F2F2F] mb-1">
                {titleA}
              </h2>
              <p className="text-muted-foreground text-base mb-4 leading-relaxed">
                A symbolic representation of Partner A&apos;s inner landscape.
              </p>
              <ImageOrPlaceholder
                src={innerWorldA}
                alt="Partner A's inner world"
                visible={reveal.innerA}
              />
            </div>
            <div
              className={`rounded-[16px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col ${transition} ${reveal.innerB ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-[#2F2F2F] mb-1">
                {titleB}
              </h2>
              <p className="text-muted-foreground text-base mb-4 leading-relaxed">
                A symbolic representation of Partner B&apos;s inner landscape.
              </p>
              <ImageOrPlaceholder
                src={innerWorldB}
                alt="Partner B's inner world"
                visible={reveal.innerB}
              />
            </div>
          </div>

          {/* Centered: The Space Between */}
          <div className="flex justify-center mb-14">
            <div
              className={`w-full max-w-xl rounded-[16px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col ${transition} ${reveal.spaceBetween ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-[#2F2F2F] mb-1 text-center">
                {titleBetween}
              </h2>
              <p className="text-muted-foreground text-base mb-4 leading-relaxed text-center">
                A symbolic reflection of the emotional field created between
                both inner worlds.
              </p>
              <ImageOrPlaceholder
                src={spaceBetween}
                alt="The space between both partners"
                visible={reveal.spaceBetween}
              />
            </div>
          </div>

          {/* Reflection text sections */}
          {formattedResult && (
            <div
              className={`mb-10 ${transition} ${reveal.text ? visibleClass : hidden}`}
            >
              <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">
                Your reflection
              </span>
              <StructuredResultSections result={result ?? ""} />
            </div>
          )}

          {/* Share / Download Story — relationship card + optional Partner A/B cards */}
          <div className={`mb-10 flex flex-wrap gap-3 justify-center ${transition} ${reveal.spaceBetween ? visibleClass : "opacity-0 pointer-events-none"}`}>
            <button
              type="button"
              disabled={storyLoading}
              onClick={async () => {
                setStoryLoading(true);
                try {
                  const blob = await generateStoryCardBlob({
                    mode: "couple",
                    imageUrl: spaceBetween || undefined,
                    nameA: nameA || undefined,
                    nameB: nameB || undefined,
                    cardVariant: "relationship",
                  });
                  await shareOrDownloadStoryCard(blob);
                } catch (e) {
                  console.warn("Story share failed", e);
                } finally {
                  setStoryLoading(false);
                }
              }}
              className="px-5 py-3 rounded-xl border border-[#e8e3d9] text-[#2a2a2a] text-sm font-medium hover:bg-[#f8f6f3] transition-colors disabled:opacity-60"
            >
              {storyLoading ? "Preparing…" : "Share Story"}
            </button>
            <button
              type="button"
              disabled={storyLoading}
              onClick={async () => {
                setStoryLoading(true);
                try {
                  const blob = await generateStoryCardBlob({
                    mode: "couple",
                    imageUrl: spaceBetween || undefined,
                    nameA: nameA || undefined,
                    nameB: nameB || undefined,
                    cardVariant: "relationship",
                  });
                  downloadStoryCard(blob);
                } catch (e) {
                  console.warn("Story download failed", e);
                } finally {
                  setStoryLoading(false);
                }
              }}
              className="px-5 py-3 rounded-xl bg-[#2a2a2a] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {storyLoading ? "Preparing…" : "Download Story"}
            </button>
            {innerWorldA && (
              <button
                type="button"
                disabled={storyLoading}
                onClick={async () => {
                  setStoryLoading(true);
                  try {
                    const blob = await generateStoryCardBlob({
                      mode: "couple",
                      imageUrl: innerWorldA,
                      nameA: nameA || undefined,
                      nameB: nameB || undefined,
                      cardVariant: "partnerA",
                    });
                    downloadStoryCard(blob, `luma-story-${(nameA || "partner-a").toString().toLowerCase().replace(/\s+/g, "-")}.png`);
                  } catch (e) {
                    console.warn("Story download failed", e);
                  } finally {
                    setStoryLoading(false);
                  }
                }}
                className="px-5 py-3 rounded-xl border border-[#e8e3d9] text-[#2a2a2a] text-sm font-medium hover:bg-[#f8f6f3] transition-colors disabled:opacity-60"
              >
                {storyLoading ? "Preparing…" : `Download ${titleA}`}
              </button>
            )}
            {innerWorldB && (
              <button
                type="button"
                disabled={storyLoading}
                onClick={async () => {
                  setStoryLoading(true);
                  try {
                    const blob = await generateStoryCardBlob({
                      mode: "couple",
                      imageUrl: innerWorldB,
                      nameA: nameA || undefined,
                      nameB: nameB || undefined,
                      cardVariant: "partnerB",
                    });
                    downloadStoryCard(blob, `luma-story-${(nameB || "partner-b").toString().toLowerCase().replace(/\s+/g, "-")}.png`);
                  } catch (e) {
                    console.warn("Story download failed", e);
                  } finally {
                    setStoryLoading(false);
                  }
                }}
                className="px-5 py-3 rounded-xl border border-[#e8e3d9] text-[#2a2a2a] text-sm font-medium hover:bg-[#f8f6f3] transition-colors disabled:opacity-60"
              >
                {storyLoading ? "Preparing…" : `Download ${titleB}`}
              </button>
            )}
          </div>

          {/* Save Your Reflection — email capture */}
          {!savedWithEmail ? (
            <div className="mt-12 rounded-2xl bg-white p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-[#e8e3d9]">
              <h2 className="text-[#2a2a2a] text-xl font-serif mb-2">
                Save Your Reflection
              </h2>
              <p className="text-[#5a5a5a] text-base leading-relaxed mb-6">
                Your inner landscape can evolve over time. Enter your email to save this reflection and return later.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSaveError(null);
                  const email = saveEmail.trim();
                  if (!email) {
                    setSaveError("Please enter your email.");
                    return;
                  }
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setSaveError("Please enter a valid email address.");
                    return;
                  }
                  try {
                    saveCoupleReflectionWithEmail({
                      content: result ?? "",
                      email,
                      nameA: nameA || undefined,
                      nameB: nameB || undefined,
                      innerWorldA: innerWorldA ?? null,
                      innerWorldB: innerWorldB ?? null,
                      spaceBetween: spaceBetween ?? null,
                    });
                    setSavedWithEmail(true);
                  } catch {
                    setSaveError("Could not save. Please try again.");
                  }
                }}
                className="space-y-4"
              >
                <input
                  type="email"
                  value={saveEmail}
                  onChange={(e) => setSaveEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-[#e8e3d9] px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#2a2a2a]/20 focus:border-[#e8e3d9]"
                  aria-label="Email"
                />
                {saveError && (
                  <p className="text-sm text-destructive">{saveError}</p>
                )}
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#2a2a2a] text-white text-base font-medium hover:opacity-90 transition-opacity"
                >
                  Save My Reflection
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-12 rounded-2xl bg-[#f8f6f3] border border-[#e8e3d9] p-6 md:p-8">
              <p className="text-[#2a2a2a] font-medium">
                Your reflection has been saved.
              </p>
              <p className="text-[#5a5a5a] text-base mt-2 leading-relaxed">
                Return in 10 days to explore how your inner landscape evolves.
              </p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/"
              onClick={handleBackToHome}
              className="inline-flex items-center justify-center px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
