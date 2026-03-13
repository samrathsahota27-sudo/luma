"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { getReflectionById, type CoupleReflectionEntry } from "@/lib/reflectionStorage";
import { ArrowRight } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ViewReflectionPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [entry, setEntry] = useState<Awaited<ReturnType<typeof getReflectionById>> | "loading">("loading");

  useEffect(() => {
    if (!id) {
      setEntry(null);
      return;
    }
    setEntry(getReflectionById(id) ?? null);
  }, [id]);

  if (entry === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F6F3]">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16 text-center">
          <p className="text-[#5a5a5a]">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (id && entry === null) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F6F3]">
        <Navigation />
        <main className="flex-1 pt-20 px-6 py-16 text-center">
          <p className="text-[#5a5a5a]">Reflection not found.</p>
          <Link href="/dashboard" className="inline-block mt-6 text-sm text-[#2F2F2F] underline">
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isCouple = entry.mode === "couple";
  const coupleEntry = isCouple ? (entry as CoupleReflectionEntry) : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />

      <main className="flex-1 pt-20 pb-20 px-6 max-w-[720px] mx-auto w-full">
        <Link href="/dashboard/gallery" className="text-sm text-[#5a5a5a] hover:text-[#2F2F2F] transition-colors">
          ← Gallery
        </Link>
        <p className="text-sm text-[#5a5a5a] mt-2">{formatDate(entry.date)}</p>
        <h1 className="font-serif text-2xl md:text-3xl text-[#2F2F2F] mt-4 [font-family:var(--font-serif-display)]">
          {isCouple ? "Couple Reflection" : "Your Reflection"}
        </h1>

        {coupleEntry?.spaceBetweenImage && (
          <div className="mt-6 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coupleEntry.spaceBetweenImage}
              alt="The space between"
              className="w-full aspect-square object-cover"
            />
          </div>
        )}

        {/* Structured reflection sections — same as result page */}
        {(() => {
          const paragraphs = entry.content.split(/\n\n+/).filter(Boolean);
          const firstParagraph = paragraphs[0] ?? "";
          const restParagraphs = paragraphs.slice(1);
          const restHtml = restParagraphs.length > 0
            ? restParagraphs.join("<br><br>").replace(/\n/g, "<br>")
            : null;
          return (
            <div className="mt-10 space-y-8 animate-luma-fade-in-slow">
              <div className="rounded-[16px] bg-[#F5F3EE] border border-[#E8E3D9]/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8">
                <h2 className="font-serif text-[22px] text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-4">
                  Core Pattern Insight
                </h2>
                <div
                  className="text-[#5a5a5a] text-base md:text-lg leading-[1.8] [&>br]:block [&>br]:mb-4"
                  style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
                  dangerouslySetInnerHTML={{ __html: firstParagraph.replace(/\n/g, "<br>") }}
                />
              </div>
              <div className="rounded-[16px] bg-[#F5F3EE] border border-[#E8E3D9]/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8">
                <h2 className="font-serif text-[22px] text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-4">
                  A Gentle Direction
                </h2>
                {restHtml ? (
                  <div
                    className="text-[#5a5a5a] text-base md:text-lg leading-[1.85] [&>br]:block [&>br]:mb-4"
                    style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
                    dangerouslySetInnerHTML={{ __html: restHtml }}
                  />
                ) : (
                  <p className="text-[#5a5a5a] text-base leading-[1.85]" style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}>
                    Take what resonates and leave the rest. There is no need to change anything.
                  </p>
                )}
              </div>
              {!isCouple && (
                <div className="rounded-[16px] bg-[#F5F3EE] border border-[#E8E3D9]/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8">
                  <h2 className="font-serif text-[22px] text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-4">
                    Explore the Space Between
                  </h2>
                  <p className="text-[#5a5a5a] text-base leading-[1.85] mb-6" style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}>
                    Some patterns only reveal themselves between two inner worlds.
                  </p>
                  <Link
                    href="/couple"
                    className="inline-flex px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Explore Couple Mode
                  </Link>
                </div>
              )}
            </div>
          );
        })()}

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/dashboard/gallery"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2F2F2F] hover:opacity-80"
          >
            Back to Gallery
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/test" className="inline-flex items-center gap-2 text-sm font-medium text-[#5a5a5a] hover:text-[#2F2F2F]">
            New reflection
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
