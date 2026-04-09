"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/client";

type Narrative = {
  brutalTruth?: string;
  yourPattern?: string;
  theTension?: string;
  theCost?: string;
  theShift?: string;
};

type ReflectionPayload = {
  fullInsight?: string;
  full_text_response?: string;
  result?: {
    structured?: { pattern?: string; description?: string };
    finalNarrative?: Narrative;
    result?: string;
    fullInsight?: string;
    full_text_response?: string;
    createdAt?: string;
  };
  createdAt?: string;
};

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function splitParas(value: string) {
  return value
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function SectionCard({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  const paras = splitParas(text);
  return (
    <section className="luma-glass rounded-2xl border border-white/10 p-5 md:p-7">
      <h2 className="font-serif text-xl text-foreground [font-family:var(--font-serif-display)]">{title}</h2>
      <div className="mt-3 space-y-3">
        {(paras.length > 0 ? paras : [text]).map((p, idx) => (
          <p key={`${title}-${idx}`} className="text-sm md:text-base leading-relaxed text-[#bfb6a8]">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

export default function LatestResultPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entry, setEntry] = useState<ReflectionPayload | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadLatest() {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) setEntry(null);
          return;
        }

        const { data, error: readError } = await supabase
          .from("users_memory")
          .select("memory")
          .eq("user_id", user.id)
          .single();

        if (readError) throw readError;
        const reflections = Array.isArray(data?.memory?.reflections)
          ? (data.memory.reflections as ReflectionPayload[])
          : [];
        const sorted = [...reflections].sort(
          (a, b) =>
            new Date(String(b?.createdAt || b?.result?.createdAt || 0)).getTime() -
            new Date(String(a?.createdAt || a?.result?.createdAt || 0)).getTime()
        );
        if (mounted) setEntry(sorted[0] ?? null);
      } catch {
        if (mounted) setError("Could not load your latest reflection.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void loadLatest();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const view = useMemo(() => {
    const payload = entry?.result ?? {};
    const narrative = payload.finalNarrative ?? {};
    const fullInsight =
      asText(entry?.fullInsight) ||
      asText(payload.fullInsight) ||
      asText(payload.full_text_response) ||
      asText(entry?.full_text_response);
    const pattern = asText(payload.structured?.pattern);
    const patternDescription = asText(payload.structured?.description);
    const whyFits = asText(narrative.yourPattern) || patternDescription || fullInsight || asText(payload.result);
    const tension = asText(narrative.theTension);
    const cost = asText(narrative.theCost);
    const truth = asText(narrative.brutalTruth);
    const shift = asText(narrative.theShift);
    return { fullInsight, pattern, patternDescription, whyFits, tension, cost, truth, shift };
  }, [entry]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />
      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="mx-auto w-full max-w-[760px]">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Dashboard
          </Link>

          <header className="mt-5 mb-8">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Your Last Reflection</p>
            <h1 className="mt-2 font-serif text-2xl md:text-3xl text-foreground [font-family:var(--font-serif-display)]">
              Full Insight
            </h1>
          </header>

          {loading ? (
            <p className="text-muted-foreground">Loading your latest reflection…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : !entry ? (
            <div className="luma-glass rounded-2xl border border-white/10 p-6">
              <p className="text-muted-foreground">No reflection found yet. Complete one to unlock your full insight.</p>
              <Link
                href="/test?start=1"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Start Reflection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {view.fullInsight ? (
                <SectionCard title="Full Insight" text={view.fullInsight} />
              ) : (
                <>
                  <SectionCard
                    title="Pattern"
                    text={[view.pattern, view.patternDescription].filter(Boolean).join("\n\n")}
                  />
                  <SectionCard title="Tension" text={view.tension} />
                  <SectionCard title="Why this fits you" text={view.whyFits} />
                  <SectionCard title="What this costs you" text={view.cost} />
                  <SectionCard title="The truth you avoid" text={view.truth} />
                  <SectionCard title="What shifts this" text={view.shift} />
                </>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
