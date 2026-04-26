"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarHeart, Clock3, Flame, Loader2, Sparkles } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type IdeaType = "date_night" | "quick_reset" | "deep_talk_prompt" | "weekly_ritual";
type EnergyLevel = "low" | "medium" | "high";
type TimeAvailable = "15_min" | "1_hour" | "half_day";

type Idea = {
  id: string;
  title: string;
  description: string;
  whyItFits: string;
  duration: string;
  cycleAnchor: string;
};

type IdeaOutput = {
  ideas: Idea[];
  telemetry: {
    driftReference: string | null;
    tensionReference: string | null;
    historyAnchors: string[];
  };
};

const IDEA_TYPES: { id: IdeaType; label: string }[] = [
  { id: "date_night", label: "Date Night" },
  { id: "quick_reset", label: "Quick Reset" },
  { id: "deep_talk_prompt", label: "Deep Talk Prompt" },
  { id: "weekly_ritual", label: "Weekly Ritual" },
];

export default function IdeaGeneratorPage() {
  const [ideaType, setIdeaType] = useState<IdeaType>("date_night");
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>("medium");
  const [timeAvailable, setTimeAvailable] = useState<TimeAvailable>("1_hour");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIdeaId, setSavedIdeaId] = useState<string | null>(null);
  const [result, setResult] = useState<IdeaOutput | null>(null);

  async function handleGenerate() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSavedIdeaId(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools/idea-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generate",
          ideaType,
          energyLevel,
          timeAvailable,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "idea_generation_failed");
      setResult(data as IdeaOutput);
    } catch {
      setError("Could not generate ideas. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function saveIdea(idea: Idea) {
    try {
      const res = await fetch("/api/tools/idea-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "save",
          idea,
        }),
      });
      if (!res.ok) throw new Error("save_failed");
      setSavedIdeaId(idea.id);
    } catch {
      setError("Could not save this idea. Try again.");
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
                Idea Generator
              </CardTitle>
              <CardDescription className="text-white/65">
                Data-driven ideas that actually fit you two.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Idea Type</p>
                <div className="flex flex-wrap gap-2">
                  {IDEA_TYPES.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant={ideaType === item.id ? "default" : "outline"}
                      onClick={() => setIdeaType(item.id)}
                      className={
                        ideaType === item.id
                          ? "bg-white text-[#120f18] hover:bg-white/90"
                          : "border-white/20 bg-black/20 text-white/75 hover:bg-white/10"
                      }
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                    <Flame className="h-3.5 w-3.5" />
                    Energy Level
                  </p>
                  <ToggleGroup
                    type="single"
                    value={energyLevel}
                    onValueChange={(v) => {
                      if (v === "low" || v === "medium" || v === "high") setEnergyLevel(v);
                    }}
                    className="w-full rounded-lg border border-white/10 bg-black/20 p-1"
                  >
                    <ToggleGroupItem value="low" className="text-white/75 data-[state=on]:bg-white/10 data-[state=on]:text-white">
                      Low
                    </ToggleGroupItem>
                    <ToggleGroupItem value="medium" className="text-white/75 data-[state=on]:bg-white/10 data-[state=on]:text-white">
                      Medium
                    </ToggleGroupItem>
                    <ToggleGroupItem value="high" className="text-white/75 data-[state=on]:bg-white/10 data-[state=on]:text-white">
                      High
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="space-y-2">
                  <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                    <Clock3 className="h-3.5 w-3.5" />
                    Time Available
                  </p>
                  <ToggleGroup
                    type="single"
                    value={timeAvailable}
                    onValueChange={(v) => {
                      if (v === "15_min" || v === "1_hour" || v === "half_day") setTimeAvailable(v);
                    }}
                    className="w-full rounded-lg border border-white/10 bg-black/20 p-1"
                  >
                    <ToggleGroupItem value="15_min" className="text-white/75 data-[state=on]:bg-white/10 data-[state=on]:text-white">
                      15 min
                    </ToggleGroupItem>
                    <ToggleGroupItem value="1_hour" className="text-white/75 data-[state=on]:bg-white/10 data-[state=on]:text-white">
                      1 hr
                    </ToggleGroupItem>
                    <ToggleGroupItem value="half_day" className="text-white/75 data-[state=on]:bg-white/10 data-[state=on]:text-white">
                      Half day
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="min-w-[180px] bg-white text-[#100e15] hover:bg-white/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating
                    </>
                  ) : (
                    "Generate Ideas"
                  )}
                </Button>
                {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
              </div>
            </CardContent>
          </Card>

          {result ? (
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {result.ideas.map((idea) => (
                <Card key={idea.id} className="border-white/10 bg-white/[0.03]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white inline-flex items-center gap-2">
                      <CalendarHeart className="h-4 w-4 text-violet-200" />
                      {idea.title}
                    </CardTitle>
                    <CardDescription className="text-white/55">{idea.duration}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-relaxed text-white/85">{idea.description}</p>
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-violet-200/80">Why this fits</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/75">{idea.whyItFits}</p>
                    </div>
                    <p className="text-xs text-white/55">{idea.cycleAnchor}</p>
                    <Button
                      type="button"
                      onClick={() => saveIdea(idea)}
                      className="w-full bg-white text-[#120f18] hover:bg-white/90"
                      variant="default"
                    >
                      {savedIdeaId === idea.id ? (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Saved to Journey
                        </>
                      ) : (
                        "Save to Journey"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
