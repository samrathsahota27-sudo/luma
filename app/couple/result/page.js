"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const COUPLE_RESULT_STORAGE_KEY = "luma_couple_result";

function ImageOrPlaceholder({ src, alt }) {
  if (src) {
    return (
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/50 shadow-inner">
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
      className="w-full aspect-square rounded-xl bg-gradient-to-br from-[#e8e0ef] to-[#f0e8f0] shadow-inner flex items-center justify-center"
      aria-hidden
    >
      <span className="text-xs text-neutral-500/70">Reflection</span>
    </div>
  );
}

export default function CoupleResultPage() {
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);

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

  const handleBackToHome = () => {
    try {
      sessionStorage.removeItem(COUPLE_RESULT_STORAGE_KEY);
    } catch {}
  };

  if (missing && data === null) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fbf7f0]">
        <Navigation />
        <main className="flex-1 pt-24 pb-20 px-6 flex flex-col items-center justify-center">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <h1 className="font-serif text-2xl text-neutral-800">
              No reflection to show
            </h1>
            <p className="text-neutral-600 text-sm leading-relaxed">
              Complete the couple reflection from the start to see your result.
            </p>
            <Link
              href="/couple"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-neutral-800 text-white text-sm font-medium shadow-sm hover:bg-neutral-700 transition"
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

  const formattedResult =
    result != null ? result.replace(/\n/g, "<br>") : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf7f0]">
      <Navigation />

      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Couple Reflection
            </span>
            <h1 className="font-serif text-2xl md:text-3xl mt-4 text-foreground">
              The Space Between You
            </h1>
          </div>

          {/* Top row: Inner World A | Inner World B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
            <div className="rounded-2xl bg-white/80 shadow-sm border border-[#e8e0ef]/60 p-6 flex flex-col">
              <h2 className="font-serif text-lg md:text-xl text-neutral-800 mb-1">
                Inner World A
              </h2>
              <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                A symbolic representation of Partner A&apos;s inner landscape.
              </p>
              <ImageOrPlaceholder
                src={innerWorldA}
                alt="Partner A's inner world"
              />
            </div>
            <div className="rounded-2xl bg-white/80 shadow-sm border border-[#dce8e2]/60 p-6 flex flex-col">
              <h2 className="font-serif text-lg md:text-xl text-neutral-800 mb-1">
                Inner World B
              </h2>
              <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                A symbolic representation of Partner B&apos;s inner landscape.
              </p>
              <ImageOrPlaceholder
                src={innerWorldB}
                alt="Partner B's inner world"
              />
            </div>
          </div>

          {/* Centered: The Space Between */}
          <div className="flex justify-center mb-14">
            <div className="w-full max-w-xl rounded-2xl bg-white/80 shadow-md border border-neutral-200/80 p-6 flex flex-col">
              <h2 className="font-serif text-lg md:text-xl text-neutral-800 mb-1 text-center">
                The Space Between
              </h2>
              <p className="text-sm text-neutral-600 mb-4 leading-relaxed text-center">
                A symbolic reflection of the emotional field created between
                both inner worlds.
              </p>
              <ImageOrPlaceholder
                src={spaceBetween}
                alt="The space between both partners"
              />
            </div>
          </div>

          {/* Reflection text sections */}
          {formattedResult && (
            <div className="mb-10">
              <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-4">
                Your reflection
              </span>
              <div className="p-6 md:p-8 bg-white/70 shadow-sm rounded-2xl">
                <div
                  className="font-serif text-base md:text-lg leading-relaxed text-foreground whitespace-pre-wrap [&>br]:block [&>br]:mb-4"
                  dangerouslySetInnerHTML={{ __html: formattedResult }}
                />
              </div>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/"
              onClick={handleBackToHome}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-neutral-800 text-white text-sm font-medium shadow-sm hover:bg-neutral-700 hover:shadow transition"
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
