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
    <div className="rounded-2xl bg-white border border-white/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="aspect-[4/5] bg-gradient-to-br from-[#1a1528] via-[#121a28] to-[#0f1814] relative">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-muted-foreground/60 text-sm font-serif">Inner landscape</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-3">{formatDate(entry.date)}</p>
        <Link
          href={`/dashboard/reflection/${entry.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20 pb-20 px-6 max-w-[900px] mx-auto w-full">
        <div className="mb-10">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Dashboard
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground mt-4 [font-family:var(--font-serif-display)] tracking-wide">
            Your Inner Landscapes
          </h1>
          <p className="text-muted-foreground text-base mt-2">
            A visual history of your reflections.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="luma-glass border border-white/10 p-12 text-center">
            <p className="text-muted-foreground">No reflections yet. Complete and save one to see it here.</p>
            <Link href="/test" className="inline-block mt-6 px-5 py-3 rounded-xl bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium hover:opacity-90">
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
