"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Brain, Loader2, Sparkles } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TheoryOutput = {
  selectedPattern: string;
  dominantPatterns: string[];
  sections: {
    theory: string;
    whyForYouTwo: string;
    journeyShift: string;
  };
  progression: {
    from: string;
    toward: string;
  };
  telemetry: {
    driftReference: string | null;
    tensionReference: string | null;
    historyAnchors: string[];
  };
};

export default function TheoryModePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TheoryOutput | null>(null);

  useEffect(() => {
    loadTheory("bootstrap");
  }, []);

  async function loadTheory(mode: "bootstrap" | "explain", pattern?: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/theory-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, pattern }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "theory_failed");
      setData(json as TheoryOutput);
    } catch {
      setError("Could not load Theory Mode right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09080d] text-white">
      <Navigation />
      <TimelineBar />
      <main className={`flex-1 ${COUPLE_MAIN_PADDING_TOP} px-4 pb-20 md:px-6`}>
        <div className="mx-auto w-full max-w-4xl">
          <Link href="/couple-hub" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/85">
            <ArrowLeft className="h-4 w-4" />
            Back to Control Panel
          </Link>

          <Card className="border-white/10 bg-white/[0.03] shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <CardHeader>
              <CardTitle className="font-serif text-[30px] leading-tight [font-family:var(--font-serif-display)]">
                Theory Mode
              </CardTitle>
              <CardDescription className="text-white/65">
                Understand why your patterns exist.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Explain Pattern</p>
              <div className="flex flex-wrap gap-2">
                {(data?.dominantPatterns || []).map((pattern) => (
                  <Button
                    key={pattern}
                    type="button"
                    variant={pattern === data?.selectedPattern ? "default" : "outline"}
                    className={
                      pattern === data?.selectedPattern
                        ? "bg-white text-[#0f0d14] hover:bg-white/90"
                        : "border-white/20 bg-black/20 text-white/75 hover:bg-white/10"
                    }
                    onClick={() => loadTheory("explain", pattern)}
                    disabled={loading}
                  >
                    Explain my {pattern}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-white/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading theory...
            </div>
          ) : null}

          {error ? <p className="mt-6 text-sm text-red-300/90">{error}</p> : null}

          {data && !loading ? (
            <Card className="mt-6 border-white/10 bg-white/[0.03]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-violet-300/20 text-violet-100 border-violet-200/30">
                    {data.selectedPattern}
                  </Badge>
                  {data.telemetry.driftReference ? <span className="text-xs text-white/55">{data.telemetry.driftReference}</span> : null}
                </div>
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Brain className="h-5 w-5 text-violet-200" />
                  The Theory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-relaxed text-white/85">{data.sections.theory}</p>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-violet-200/80">Why It Shows Up for You Two</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">{data.sections.whyForYouTwo}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-violet-200/80">
                    How the 28-Day Journey Changes It
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">{data.sections.journeyShift}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Progression</p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/80">
                      {data.progression.from}
                    </span>
                    <ArrowRight className="h-4 w-4 text-violet-200/85" />
                    <span className="rounded-full border border-violet-200/30 bg-violet-300/15 px-3 py-1 text-violet-100">
                      {data.progression.toward}
                    </span>
                  </div>
                </div>

                {data.telemetry.tensionReference ? (
                  <p className="text-xs text-white/55 inline-flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-200/85" />
                    {data.telemetry.tensionReference}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
