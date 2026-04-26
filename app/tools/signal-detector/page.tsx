"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { appendTranscriptValue, useSpeechToText } from "@/hooks/useSpeechToText";

type SignalOutput = {
  signalStrength: {
    polarity: "positive" | "risk";
    score: number;
    impactLabel: string;
  };
  positiveSignal: {
    detected: boolean;
    title: string;
    alignmentPotentialDelta: number;
    line: string;
  };
  riskSignal: {
    detected: boolean;
    title: string;
    tensionRiskDelta: number;
    line: string;
  };
  calibratedMicroResponse: {
    response: string;
    whyItFits: string;
  };
};

export default function SignalDetectorPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<SignalOutput | null>(null);
  const {
    isSupported: isMicSupported,
    isListening,
    error: micError,
    toggle: toggleMic,
    stop: stopMic,
  } = useSpeechToText((transcript) => {
    setText((prev) => appendTranscriptValue(prev, transcript));
  });

  useEffect(() => {
    if (loading && isListening) {
      stopMic();
    }
  }, [loading, isListening, stopMic]);

  async function detectSignal() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/tools/signal-detector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "signal_detector_failed");
      setOutput(data as SignalOutput);
    } catch {
      setError("Could not detect this signal right now.");
    } finally {
      setLoading(false);
    }
  }

  const isPositive = output?.signalStrength.polarity === "positive";

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
                Signal Detector
              </CardTitle>
              <CardDescription className="text-white/65">
                Detect subtle positive and risk signals before they become pattern loops.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={7}
                disabled={loading}
                placeholder="Paste a short message or describe a behavior..."
                className="min-h-[150px] border-white/10 bg-black/20 text-white placeholder:text-white/35"
              />
              <div className="flex flex-wrap items-center gap-2">
                <SpeechMicButton
                  isListening={isListening}
                  isSupported={isMicSupported}
                  disabled={loading}
                  onToggle={toggleMic}
                />
                <Button type="button" variant="ghost" onClick={() => setText("")} disabled={loading || !text.trim()}>
                  Clear
                </Button>
              </div>
              <Button
                type="button"
                onClick={detectSignal}
                disabled={loading || !text.trim()}
                className="bg-white text-[#100e15] hover:bg-white/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Detecting
                  </>
                ) : (
                  "Detect Signal"
                )}
              </Button>
              {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
              {micError ? <p className="text-xs text-amber-200/85">{micError}</p> : null}
            </CardContent>
          </Card>

          {output ? (
            <div className="mt-6 space-y-3">
              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Signal Strength</CardTitle>
                  <CardDescription className={isPositive ? "text-emerald-200/85" : "text-red-200/85"}>
                    {output.signalStrength.impactLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Progress
                    value={output.signalStrength.score}
                    className={isPositive ? "bg-emerald-500/20 [&_[data-slot=progress-indicator]]:bg-emerald-400" : "bg-red-500/20 [&_[data-slot=progress-indicator]]:bg-red-400"}
                  />
                  <p className="text-xs text-white/55">{output.signalStrength.score}% confidence</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">
                    Positive Signal Detected ({output.positiveSignal.alignmentPotentialDelta >= 0 ? "+" : ""}
                    {output.positiveSignal.alignmentPotentialDelta}% alignment potential)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/85">{output.positiveSignal.line}</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">
                    Risk Signal Detected ({output.riskSignal.tensionRiskDelta >= 0 ? "+" : ""}
                    {output.riskSignal.tensionRiskDelta}% tension risk)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/85">{output.riskSignal.line}</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-200" />
                    Calibrated Micro-Response
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-white/85">{output.calibratedMicroResponse.response}</p>
                  <p className="text-xs text-white/55">{output.calibratedMicroResponse.whyItFits}</p>
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
