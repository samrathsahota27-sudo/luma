"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setMemory } from "@/lib/memory";
import { buildRelationshipContext, recordFeatureUse } from "@/lib/relationshipContext";

type Result = { pathA: string; pathB: string };

export default function FuturePathsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        recordFeatureUse("futurePaths");

        // STEP 1: Load memory from Supabase (best effort)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("users_memory")
            .select("memory")
            .eq("user_id", user.id)
            .single();
          const memory = (data as any)?.memory ?? null;
          if (memory) setMemory(memory);
        } else {
          console.log("No user logged in");
        }

        const res = await fetch("/api/future-paths", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context: buildRelationshipContext("futurePaths") }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || typeof data?.pathA !== "string" || typeof data?.pathB !== "string") {
          console.error("future-paths error:", data);
          throw new Error("Future paths failed");
        }

        setResult({ pathA: data.pathA, pathB: data.pathB });
      } catch {
        setError("Couldn't generate paths yet. Try again.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const cta = useMemo(
    () => [
      { href: "/translator", label: "Use Translator" },
      { href: "/date", label: "Change this direction" },
    ],
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0a090c] text-[#e8e4df]">
      <Navigation />
      <TimelineBar />

      <main className={`flex-1 ${COUPLE_MAIN_PADDING_TOP} pb-20 px-6 relative overflow-hidden`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-20%,rgba(95,75,125,0.18),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_85%_95%,rgba(110,85,65,0.11),transparent)]"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[720px]">
          <Link
            href="/couple-hub"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[#8a8278] transition-colors hover:text-[#c9c0b4]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to hub
          </Link>

          <header className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#6d6578] font-medium">
              Future paths
            </p>
            <h1 className="mt-4 font-serif text-2xl md:text-[2.05rem] text-[#f5f1ec] [font-family:var(--font-serif-display)] tracking-tight">
              Two directions from here
            </h1>
            <p className="mt-3 text-[#9a9288] text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto">
              Not predictions. A direction, based on the pattern you’ve been living.
            </p>
          </header>

          {loading && (
            <div className="flex justify-center py-16">
              <div className="flex flex-col items-center gap-4 text-[#6d6578]">
                <Loader2 className="h-8 w-8 animate-spin opacity-60" />
                <p className="text-sm font-light">Tracing the direction…</p>
              </div>
            </div>
          )}

          {error && (
            <p className="text-center text-sm text-[#c49a8c]" role="alert">
              {error}
            </p>
          )}

          {result && (
            <div className="grid gap-5 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <section className="rounded-2xl border border-[#6b2d2d]/35 bg-[#1a0f11]/85 p-7 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ffb6b6]">
                  🔴 If nothing changes
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-[#f0d6d6] font-light whitespace-pre-wrap">
                  {result.pathA}
                </p>
              </section>

              <section className="rounded-2xl border border-[#2f6a58]/35 bg-[#0f1714]/85 p-7 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a7f3d0]">
                  🟢 If you intervene
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-[#d8fff0] font-light whitespace-pre-wrap">
                  {result.pathB}
                </p>
              </section>
            </div>
          )}

          {result && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {cta.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="inline-flex items-center justify-center rounded-xl border border-[#3d3848] bg-[#1c191f]/90 px-6 py-3 text-sm font-medium text-[#ddd8d0] transition-all duration-300 hover:border-[#524a60] hover:bg-[#25222b] hover:scale-[1.02]"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

