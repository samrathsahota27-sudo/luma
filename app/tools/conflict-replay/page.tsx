"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Mic,
  Sparkles,
  Split,
  Target,
  UserRound,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { appendTranscriptValue, useSpeechToText } from "@/hooks/useSpeechToText";

type ReplayOutput = {
  whatEachFelt: {
    you: string;
    them: string;
  };
  momentOfDivergence: {
    line: string;
    patternTie: string;
  };
  whatWasActuallyNeeded: {
    youNeeded: string;
    themNeeded: string;
    sharedNeed: string;
  };
  nextTimeGuide: {
    step1: string;
    step2: string;
    step3: string;
  };
  telemetry: {
    driftReference: string | null;
    tensionReference: string | null;
    historyAnchors: string[];
  };
};

export default function ConflictReplayPage() {
  const [myVersion, setMyVersion] = useState("");
  const [theirVersion, setTheirVersion] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingRepair, setSavingRepair] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repairSaved, setRepairSaved] = useState(false);
  const [result, setResult] = useState<ReplayOutput | null>(null);

  const myMic = useSpeechToText((transcript) => setMyVersion((prev) => appendTranscriptValue(prev, transcript)));
  const theirMic = useSpeechToText((transcript) => setTheirVersion((prev) => appendTranscriptValue(prev, transcript)));

  useEffect(() => {
    if (!loading) return;
    if (myMic.isListening) myMic.stop();
    if (theirMic.isListening) theirMic.stop();
  }, [loading, myMic, theirMic]);

  async function analyzeReplay() {
    if (!myVersion.trim() || !theirVersion.trim() || loading) return;
    setLoading(true);
    setError(null);
    setRepairSaved(false);
    setResult(null);
    try {
      const res = await fetch("/api/tools/conflict-replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myVersion: myVersion.trim(),
          theirVersion: theirVersion.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "conflict_replay_failed");
      setResult(data as ReplayOutput);
    } catch (e: any) {
      setError(e?.message || "Could not process this conflict replay.");
    } finally {
      setLoading(false);
    }
  }

  async function addToRepairTimeline() {
    if (!result || savingRepair) return;
    setSavingRepair(true);
    setError(null);
    try {
      const note = `Divergence: ${result.momentOfDivergence.line}
Need: ${result.whatWasActuallyNeeded.sharedNeed}
Next: ${result.nextTimeGuide.step1} / ${result.nextTimeGuide.step2} / ${result.nextTimeGuide.step3}`;
      const repairRes = await fetch("/api/tools/repair-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy: "Conflict Replay",
          note,
          patternsJson: {
            divergence: result.momentOfDivergence,
            needs: result.whatWasActuallyNeeded,
            telemetry: result.telemetry,
          },
        }),
      });
      const repairJson = await repairRes.json().catch(() => ({}));
      if (!repairRes.ok) {
        throw new Error(repairJson?.error || "Could not add to repair timeline.");
      }
      setRepairSaved(true);
    } catch (e: any) {
      setError(e?.message || "Could not add to repair timeline.");
    } finally {
      setSavingRepair(false);
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
                Conflict Replay
              </CardTitle>
              <CardDescription className="text-white/65">Process misalignment safely. Learn what was underneath.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">My version</p>
                  <Textarea
                    value={myVersion}
                    onChange={(e) => setMyVersion(e.target.value)}
                    rows={8}
                    disabled={loading}
                    placeholder="What happened from your side? Include what you were trying to communicate."
                    className="min-h-[170px] border-white/10 bg-black/20 text-white placeholder:text-white/35"
                  />
                  <div className="flex items-center gap-2">
                    <SpeechMicButton
                      isListening={myMic.isListening}
                      isSupported={myMic.isSupported}
                      disabled={loading}
                      onToggle={myMic.toggle}
                    />
                    <span className="inline-flex items-center gap-1 text-xs text-white/45">
                      <Mic className="h-3.5 w-3.5" />
                      Voice placeholder enabled
                    </span>
                  </div>
                  {myMic.error ? <p className="text-xs text-amber-200/85">{myMic.error}</p> : null}
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Their version</p>
                  <Textarea
                    value={theirVersion}
                    onChange={(e) => setTheirVersion(e.target.value)}
                    rows={8}
                    disabled={loading}
                    placeholder="How do you think they experienced the same moment?"
                    className="min-h-[170px] border-white/10 bg-black/20 text-white placeholder:text-white/35"
                  />
                  <div className="flex items-center gap-2">
                    <SpeechMicButton
                      isListening={theirMic.isListening}
                      isSupported={theirMic.isSupported}
                      disabled={loading}
                      onToggle={theirMic.toggle}
                    />
                    <span className="inline-flex items-center gap-1 text-xs text-white/45">
                      <Mic className="h-3.5 w-3.5" />
                      Voice placeholder enabled
                    </span>
                  </div>
                  {theirMic.error ? <p className="text-xs text-amber-200/85">{theirMic.error}</p> : null}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={analyzeReplay}
                  disabled={loading || !myVersion.trim() || !theirVersion.trim()}
                  className="bg-white text-[#100e15] hover:bg-white/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Process & learn"
                  )}
                </Button>
                {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
              </div>
            </CardContent>
          </Card>

          {result ? (
            <div className="mt-6 space-y-3">
              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="inline-flex items-center gap-2 text-lg text-white">
                    <UserRound className="h-5 w-5 text-violet-200" />
                    What each felt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-white/85">
                  <p><span className="text-white/55">You:</span> {result.whatEachFelt.you}</p>
                  <p><span className="text-white/55">Them:</span> {result.whatEachFelt.them}</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="inline-flex items-center gap-2 text-lg text-white">
                    <Split className="h-5 w-5 text-violet-200" />
                    Moment of divergence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-white/85">
                  <p>{result.momentOfDivergence.line}</p>
                  <p className="text-white/55">{result.momentOfDivergence.patternTie}</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="inline-flex items-center gap-2 text-lg text-white">
                    <Target className="h-5 w-5 text-violet-200" />
                    What was actually needed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-white/85">
                  <p><span className="text-white/55">You needed:</span> {result.whatWasActuallyNeeded.youNeeded}</p>
                  <p><span className="text-white/55">They needed:</span> {result.whatWasActuallyNeeded.themNeeded}</p>
                  <p><span className="text-white/55">Shared need:</span> {result.whatWasActuallyNeeded.sharedNeed}</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="inline-flex items-center gap-2 text-lg text-white">
                    <Sparkles className="h-5 w-5 text-violet-200" />
                    Next time guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-white/85">
                  <p>1. {result.nextTimeGuide.step1}</p>
                  <p>2. {result.nextTimeGuide.step2}</p>
                  <p>3. {result.nextTimeGuide.step3}</p>
                  <div className="mt-3">
                    <Button
                      type="button"
                      disabled={savingRepair || repairSaved}
                      onClick={() => {
                        void addToRepairTimeline();
                      }}
                      className="bg-white text-[#100e15] hover:bg-white/90"
                    >
                      {savingRepair ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : repairSaved ? (
                        "Added to Repair Timeline"
                      ) : (
                        "Add to Repair Timeline"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
