"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { getReflectionById, type CoupleReflectionEntry } from "@/lib/reflectionStorage";
import { ArrowRight } from "lucide-react";
import { StructuredResultSections } from "@/components/structured-result-sections";

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

        <div className="mt-10 animate-luma-fade-in-slow">
          <StructuredResultSections result={entry.content} />
        </div>

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
