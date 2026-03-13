"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  getReflections,
  daysUntilNextReflection,
  type ReflectionEntry,
} from "@/lib/reflectionStorage";
import { ArrowRight } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function excerpt(text: string, maxLen: number) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= maxLen ? t : t.slice(0, maxLen) + "…";
}

export default function DashboardPage() {
  const [lastReflection, setLastReflection] = useState<ReflectionEntry | null>(null);
  const [recentCount, setRecentCount] = useState(0);
  const [daysUntil, setDaysUntil] = useState<number | null>(null);

  useEffect(() => {
    const all = getReflections();
    const sorted = [...all].sort((a, b) => (b.date > a.date ? 1 : -1));
    if (sorted.length > 0) setLastReflection(sorted[0]);
    setRecentCount(all.length);
    setDaysUntil(daysUntilNextReflection());
  }, []);

  const canReflect = daysUntil === null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />

      <main className="flex-1 pt-20 pb-20 px-6 max-w-[720px] mx-auto w-full">
        <h1 className="font-serif text-3xl md:text-4xl text-[#2F2F2F] [font-family:var(--font-serif-display)] tracking-wide mb-2">
          Welcome back
        </h1>
        <p className="text-[#5a5a5a] text-base mb-10">
          Your reflection journey continues here.
        </p>

        {/* Last reflection */}
        {lastReflection && (
          <section className="mb-12">
            <h2 className="font-serif text-xl text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-3">
              Your last reflection
            </h2>
            <div className="rounded-2xl bg-[#f8f6f3] border border-[#E8E3D9] p-6">
              <p className="text-sm text-[#5a5a5a] mb-2">
                {formatDate(lastReflection.date)}
                {lastReflection.mode === "couple" && " · Couple reflection"}
              </p>
              <p className="text-[#2F2F2F] leading-relaxed">
                {excerpt(lastReflection.content, 180)}
              </p>
              <Link
                href={`/dashboard/reflection/${lastReflection.id}`}
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-[#2F2F2F] hover:opacity-80"
              >
                View full reflection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Gallery preview */}
        <section className="mb-12">
          <h2 className="font-serif text-xl text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-3">
            Your Inner Landscapes
          </h2>
          <p className="text-[#5a5a5a] text-base mb-4">
            {recentCount === 0
              ? "Complete and save a reflection to see it here."
              : `You have ${recentCount} saved reflection${recentCount === 1 ? "" : "s"}.`}
          </p>
          <Link
            href="/dashboard/gallery"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2F2F2F] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Gallery
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Next reflection */}
        <section className="rounded-2xl bg-[#E8E3D9]/40 border border-[#E8E3D9] p-6">
          <h2 className="font-serif text-xl text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-2">
            Next reflection available
          </h2>
          {canReflect ? (
            <>
              <p className="text-[#5a5a5a] text-base mb-4">
                Take a moment to see what your inner landscape looks like today.
              </p>
              <Link
                href="/test"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2F2F2F] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Begin Reflection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <p className="text-[#5a5a5a] text-base">
              You can return for another reflection in {daysUntil} day{daysUntil === 1 ? "" : "s"}.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
