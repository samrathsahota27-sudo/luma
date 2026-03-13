"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { getReflections, type ReflectionEntry, type CoupleReflectionEntry } from "@/lib/reflectionStorage";
import { ArrowRight } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function ReflectionCard({ entry }: { entry: ReflectionEntry }) {
  const isCouple = entry.mode === "couple";
  const coupleEntry = isCouple ? (entry as CoupleReflectionEntry) : null;
  const imageUrl = coupleEntry?.spaceBetweenImage ?? null;

  return (
    <div className="rounded-2xl bg-white border border-[#E8E3D9] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="aspect-[4/5] bg-gradient-to-br from-[#E6E8F0] via-[#E8E3D9] to-[#D8E3DC] relative">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#5a5a5a]/60 text-sm font-serif">Inner landscape</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-[#5a5a5a] mb-3">{formatDate(entry.date)}</p>
        <Link
          href={`/dashboard/reflection/${entry.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2F2F2F] hover:opacity-80 transition-opacity"
        >
          View Reflection
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);

  useEffect(() => {
    const all = getReflections();
    setEntries([...all].sort((a, b) => (b.date > a.date ? 1 : -1)));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />

      <main className="flex-1 pt-20 pb-20 px-6 max-w-[900px] mx-auto w-full">
        <div className="mb-10">
          <Link href="/dashboard" className="text-sm text-[#5a5a5a] hover:text-[#2F2F2F] transition-colors">
            ← Dashboard
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl text-[#2F2F2F] mt-4 [font-family:var(--font-serif-display)] tracking-wide">
            Your Inner Landscapes
          </h1>
          <p className="text-[#5a5a5a] text-base mt-2">
            A visual history of your reflections.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl bg-[#f8f6f3] border border-[#E8E3D9] p-12 text-center">
            <p className="text-[#5a5a5a]">No reflections yet. Complete and save one to see it here.</p>
            <Link href="/test" className="inline-block mt-6 px-5 py-3 rounded-xl bg-[#2F2F2F] text-white text-sm font-medium hover:opacity-90">
              Begin Reflection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <ReflectionCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
