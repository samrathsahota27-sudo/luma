"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Heart, Loader2, MessageSquareHeart, Sparkles, Swords, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type GoalId = "communication" | "intimacy" | "conflict" | "fun";

type GoalOption = {
  id: GoalId;
  title: string;
  subtitle: string;
  Icon: any;
};

const GOALS: GoalOption[] = [
  {
    id: "communication",
    title: "Better Communication",
    subtitle: "Talk clearly without spiraling",
    Icon: MessageSquareHeart,
  },
  {
    id: "intimacy",
    title: "More Intimacy",
    subtitle: "Feel closer emotionally and physically",
    Icon: Heart,
  },
  {
    id: "conflict",
    title: "Resolve Conflict",
    subtitle: "Repair faster after tense moments",
    Icon: Swords,
  },
  {
    id: "fun",
    title: "More Fun",
    subtitle: "Bring lightness back into the relationship",
    Icon: Sparkles,
  },
];

function titleName(raw?: string) {
  const name = String(raw || "").trim();
  if (!name) return "Tell us";
  const first = name.split(/\s+/)[0];
  return `${first}, tell us`;
}

export function SmartOnboardingFlow({
  userName,
  className = "",
  onComplete,
}: {
  userName?: string;
  className?: string;
  onComplete?: (payload: { goals: GoalId[]; mirrorSummary: string }) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<GoalId[]>([]);
  const [improveText, setImproveText] = useState("");
  const [strengthText, setStrengthText] = useState("");
  const [mirrorSummary, setMirrorSummary] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/onboarding/smart", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        const shouldShow = Boolean(data?.shouldShow);
        setVisible(shouldShow);
        setGoals(Array.isArray(data?.goals) ? (data.goals as GoalId[]) : []);
        setImproveText(typeof data?.improveText === "string" ? data.improveText : "");
        setStrengthText(typeof data?.strengthText === "string" ? data.strengthText : "");
        setMirrorSummary(typeof data?.mirrorSummary === "string" ? data.mirrorSummary : "");
        if (!shouldShow && typeof data?.mirrorSummary === "string" && data.mirrorSummary.trim()) {
          setStep(3);
        }
      } catch {
        if (active) {
          setVisible(false);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const improveCount = improveText.length;
  const strengthCount = strengthText.length;

  const canStepOne = goals.length > 0;
  const canSubmit = improveText.trim().length >= 12 && strengthText.trim().length >= 12;

  const progressLabel = useMemo(() => {
    if (step === 1) return "Step 1 of 2";
    if (step === 2) return "Step 2 of 2";
    return "Completed";
  }, [step]);

  function toggleGoal(id: GoalId) {
    setGoals((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    if (saving || !canSubmit || goals.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/smart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals,
          improveText,
          strengthText,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not save onboarding");
      const summary = String(data?.mirrorSummary || "").trim();
      setMirrorSummary(summary);
      setStep(3);
      setVisible(true);
      if (summary) onComplete?.({ goals, mirrorSummary: summary });
    } catch (e: any) {
      setError(e?.message || "Could not save onboarding");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white/60 ${className}`}>
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading smart onboarding...
        </div>
      </div>
    );
  }

  if (!visible && step !== 3) return null;

  return (
    <Card className={`border-white/10 bg-white/[0.03] shadow-[0_20px_80px_rgba(0,0,0,0.45)] ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="font-serif text-[26px] leading-tight [font-family:var(--font-serif-display)] text-white">
            Smart Onboarding
          </CardTitle>
          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] tracking-[0.14em] text-white/50">
            {progressLabel}
          </span>
        </div>
        <CardDescription className="text-white/65">
          We use this to personalize your future questions, insights, and guidance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {step === 1 ? (
          <>
            <div className="space-y-1">
              <p className="text-xl font-medium text-white">What is your main goal?</p>
              <p className="text-sm text-white/60">Select all that apply.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GOALS.map((goal) => {
                const active = goals.includes(goal.id);
                const Icon = goal.Icon;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={[
                      "group rounded-2xl border p-4 text-left transition-all",
                      active
                        ? "border-violet-300/45 bg-violet-300/10 text-white shadow-[0_0_24px_rgba(140,110,220,0.2)]"
                        : "border-white/10 bg-black/20 text-white/80 hover:border-white/20",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <p className="text-sm font-medium">{goal.title}</p>
                      </div>
                      {active ? <Check className="h-4 w-4 text-violet-200" /> : null}
                    </div>
                    <p className="mt-2 text-xs text-white/55">{goal.subtitle}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button type="button" disabled={!canStepOne} className="bg-white text-[#120f18] hover:bg-white/90" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="space-y-1">
              <p className="text-xl font-medium text-white">{titleName(userName)} about your relationship</p>
              <p className="text-sm text-white/60">A little context helps Luma tune your mirror from day one.</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-white">What would you like to improve?</p>
              <Textarea
                value={improveText}
                onChange={(e) => setImproveText(e.target.value)}
                placeholder="Example: We care about each other, but hard conversations turn into distance before we finish them."
                rows={5}
                maxLength={900}
                className="min-h-[120px] border-white/10 bg-black/20 text-white placeholder:text-white/35"
              />
              <p className="text-xs text-white/45">{improveCount}/900</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-white">What&apos;s going really well?</p>
              <Textarea
                value={strengthText}
                onChange={(e) => setStrengthText(e.target.value)}
                placeholder="Example: Even when we disagree, we still check in and try to repair before sleeping."
                rows={5}
                maxLength={900}
                className="min-h-[120px] border-white/10 bg-black/20 text-white placeholder:text-white/35"
              />
              <p className="text-xs text-white/45">{strengthCount}/900</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="ghost" className="text-white/70 hover:text-white" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="button" disabled={!canSubmit || saving} onClick={handleSubmit} className="bg-white text-[#120f18] hover:bg-white/90">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Building mirror summary...
                  </>
                ) : (
                  "Save and continue"
                )}
              </Button>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Mirror Summary</p>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              {mirrorSummary ||
                "Your onboarding context is now active. Future Luma reflections and tools will adapt to your goals and relationship context."}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/60">
              <Users className="h-3.5 w-3.5" />
              Personalization is now active across your cycle
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
