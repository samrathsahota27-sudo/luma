"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  ClipboardPaste,
  Flame,
  Loader2,
  Paperclip,
  X,
  ShieldAlert,
  Sparkles,
  Thermometer,
  Waves,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { appendTranscriptValue, useSpeechToText } from "@/hooks/useSpeechToText";

type HeatMode = "casual" | "heated" | "distant";

type CalibratedReply = {
  persona: string;
  label: string;
  response: string;
  whyItWorks: string;
};

type CalibratedResult = {
  pulse: {
    temperature: number;
    sentence: string;
    patternLink: string;
  };
  hiddenLayers: {
    partnerLikelyFeeling: string;
    likelyNeed: string;
    historicalAnchor: string;
  };
  minefield: {
    avoid: string[];
    reason: string;
  };
  calibratedResponses: CalibratedReply[];
  telemetry: {
    driftReference: string | null;
    tensionReference: string | null;
    historyAnchors: string[];
  };
};

function toneFromSlider(value: number): "soften" | "modern" | "direct" {
  if (value <= 33) return "soften";
  if (value >= 67) return "direct";
  return "modern";
}

function toneLabel(value: number) {
  const tone = toneFromSlider(value);
  if (tone === "soften") return "Soften";
  if (tone === "direct") return "Direct";
  return "Modern";
}

function tempLabel(value: number) {
  if (value < 34) return "Cold";
  if (value > 66) return "Hot";
  return "Warm";
}

export default function ChatAssistantPage() {
  const [input, setInput] = useState("");
  const [screenshots, setScreenshots] = useState<{ name: string; dataUrl: string }[]>([]);
  const [heatMode, setHeatMode] = useState<HeatMode>("casual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalibratedResult | null>(null);
  const [toneValue, setToneValue] = useState(50);
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  const lastSubmittedInput = useRef<string>("");
  const lastHeatMode = useRef<HeatMode>("casual");
  const previousTone = useRef<number>(50);
  const recalibrationTimer = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    isSupported: isMicSupported,
    isListening,
    error: micError,
    toggle: toggleMic,
    stop: stopMic,
  } = useSpeechToText((transcript) => {
    setInput((prev) => appendTranscriptValue(prev, transcript));
  });

  useEffect(() => {
    if (!result) return;
    if (!lastSubmittedInput.current.trim()) return;
    if (previousTone.current === toneValue) return;

    if (recalibrationTimer.current) {
      window.clearTimeout(recalibrationTimer.current);
    }

    recalibrationTimer.current = window.setTimeout(async () => {
      setIsRecalibrating(true);
      setError(null);
      try {
        const res = await fetch("/api/tools/calibrated-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "recalibrate",
            conversation: lastSubmittedInput.current,
            heatMode: lastHeatMode.current,
            responseTone: toneFromSlider(toneValue),
            existingAnalysis: {
              pulse: result.pulse,
              hiddenLayers: result.hiddenLayers,
              minefield: result.minefield,
              telemetry: result.telemetry,
              calibratedResponses: result.calibratedResponses,
            },
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !Array.isArray(data.calibratedResponses)) {
          throw new Error("recalibration_failed");
        }
        setResult((prev) =>
          prev
            ? {
                ...prev,
                calibratedResponses: data.calibratedResponses,
              }
            : prev
        );
        previousTone.current = toneValue;
      } catch {
        setError("Could not recalibrate response tone. Try moving the slider again.");
      } finally {
        setIsRecalibrating(false);
      }
    }, 450);

    return () => {
      if (recalibrationTimer.current) {
        window.clearTimeout(recalibrationTimer.current);
      }
    };
  }, [toneValue, result]);

  const analyzing = loading || isRecalibrating;

  useEffect(() => {
    if (analyzing && isListening) {
      stopMic();
    }
  }, [analyzing, isListening, stopMic]);

  const heatHint = useMemo(() => {
    if (heatMode === "heated") return "Prioritize de-escalation and safety wording.";
    if (heatMode === "distant") return "Prioritize re-connection and emotional signal.";
    return "Balanced read with no assumed escalation.";
  }, [heatMode]);

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text?.trim()) setInput(text.trim());
    } catch {
      setError("Clipboard access failed. Paste manually.");
    }
  }

  async function handleAnalyze() {
    if ((!input.trim() && screenshots.length === 0) || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    previousTone.current = toneValue;

    try {
      const res = await fetch("/api/tools/calibrated-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "analyze",
          conversation: input.trim(),
          screenshots: screenshots.map((shot) => shot.dataUrl),
          heatMode,
          responseTone: toneFromSlider(toneValue),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "analyze_failed");
      }
      setResult(data as CalibratedResult);
      lastSubmittedInput.current = input.trim();
      lastHeatMode.current = heatMode;
    } catch {
      setError("Analysis failed. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function handleScreenshotFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const incoming = Array.from(fileList);
    const allowed = incoming.slice(0, 3 - screenshots.length);
    if (allowed.length < incoming.length) {
      setError("You can attach up to 3 screenshots.");
    }
    const next: { name: string; dataUrl: string }[] = [];
    for (const file of allowed) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        setError("Each screenshot must be under 5MB.");
        continue;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("read_failed"));
        reader.readAsDataURL(file);
      }).catch(() => "");
      if (!dataUrl) continue;
      next.push({ name: file.name || "screenshot", dataUrl });
    }
    if (next.length) {
      setScreenshots((prev) => [...prev, ...next].slice(0, 3));
      setError(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a090d] text-white">
      <Navigation />
      <TimelineBar />
      <main className={`flex-1 ${COUPLE_MAIN_PADDING_TOP} px-4 pb-20 md:px-6`}>
        <style jsx>{`
          @keyframes scanLine {
            0% {
              transform: translateX(-120%);
              opacity: 0;
            }
            20% {
              opacity: 0.7;
            }
            100% {
              transform: translateX(120%);
              opacity: 0;
            }
          }
        `}</style>

        <div className="mx-auto w-full max-w-4xl">
          <Link
            href="/couple-hub"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white/85"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Control Panel
          </Link>

          <Card className="border-white/10 bg-white/[0.03] shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <CardHeader>
              <CardTitle className="font-serif text-[30px] leading-tight [font-family:var(--font-serif-display)]">
                Chat Assistant
              </CardTitle>
              <CardDescription className="text-sm text-white/65">
                Decode the subtext. Master the response.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Conversation Input</p>
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  {analyzing ? (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden">
                      <div
                        className="h-full w-1/2 bg-gradient-to-r from-transparent via-violet-300/90 to-transparent"
                        style={{ animation: "scanLine 1.2s linear infinite" }}
                      />
                    </div>
                  ) : null}
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={8}
                    disabled={analyzing}
                    placeholder="Paste your chat snippet here..."
                    className="min-h-[170px] resize-y border-0 bg-transparent text-[15px] text-white placeholder:text-white/35 focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" onClick={handlePaste} disabled={analyzing}>
                    <ClipboardPaste className="h-4 w-4" />
                    Paste from Clipboard
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={analyzing || screenshots.length >= 3}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                    Upload Screenshot
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      void handleScreenshotFiles(e.target.files);
                    }}
                  />
                  <SpeechMicButton
                    isListening={isListening}
                    isSupported={isMicSupported}
                    disabled={analyzing}
                    onToggle={toggleMic}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setInput("");
                      setScreenshots([]);
                    }}
                    disabled={analyzing || (!input.trim() && screenshots.length === 0)}
                  >
                    Clear
                  </Button>
                </div>
                {screenshots.length ? (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {screenshots.map((shot, index) => (
                      <div key={`${shot.name}-${index}`} className="relative overflow-hidden rounded-lg border border-white/15 bg-black/25">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={shot.dataUrl} alt={shot.name} className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          aria-label="Remove screenshot"
                          onClick={() => setScreenshots((prev) => prev.filter((_, i) => i !== index))}
                          className="absolute right-1 top-1 rounded-full bg-black/65 p-1 text-white/80 hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Tone Check</p>
                <ToggleGroup
                  type="single"
                  value={heatMode}
                  onValueChange={(v) => {
                    if (v === "casual" || v === "heated" || v === "distant") setHeatMode(v);
                  }}
                  className="w-full rounded-lg border border-white/10 bg-black/20 p-1"
                >
                  <ToggleGroupItem value="casual" className="text-white/75 data-[state=on]:bg-white/10 data-[state=on]:text-white">
                    Casual
                  </ToggleGroupItem>
                  <ToggleGroupItem value="heated" className="text-white/75 data-[state=on]:bg-white/10 data-[state=on]:text-white">
                    Heated
                  </ToggleGroupItem>
                  <ToggleGroupItem value="distant" className="text-white/75 data-[state=on]:bg-white/10 data-[state=on]:text-white">
                    Distant
                  </ToggleGroupItem>
                </ToggleGroup>
                <p className="text-xs text-white/50">{heatHint}</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing || (!input.trim() && screenshots.length === 0)}
                  className="min-w-[180px] bg-white text-[#0d0b12] hover:bg-white/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
                {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
              </div>
              {micError ? <p className="text-xs text-amber-200/85">{micError}</p> : null}

              <p className="text-xs text-white/45">
                Privacy: your chat snippet is processed ephemerally for insight generation. We only store structured analysis
                signals for your 28-day progress and comparison.
              </p>
            </CardContent>
          </Card>

          {result ? (
            <div className="mt-7 space-y-4">
              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Thermometer className="h-5 w-5 text-violet-200" />
                    The Pulse
                  </CardTitle>
                  <CardDescription className="text-white/55">
                    {result.pulse.patternLink}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>Cold</span>
                      <span className="font-medium text-white/80">
                        {tempLabel(result.pulse.temperature)} ({result.pulse.temperature}%)
                      </span>
                      <span>Hot</span>
                    </div>
                    <Progress value={result.pulse.temperature} className="h-2 bg-white/10" />
                  </div>
                  <p className="text-sm leading-relaxed text-white/85">{result.pulse.sentence}</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Brain className="h-5 w-5 text-violet-200" />
                    Hidden Layers (Empathy Map)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-white/80">
                  <p>
                    <span className="text-white/50">Likely feeling:</span> {result.hiddenLayers.partnerLikelyFeeling}
                  </p>
                  <p>
                    <span className="text-white/50">Likely need:</span> {result.hiddenLayers.likelyNeed}
                  </p>
                  <p className="text-white/55">{result.hiddenLayers.historicalAnchor}</p>
                </CardContent>
              </Card>

              <Card className="border-red-300/25 bg-red-500/[0.06]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-red-100">
                    <ShieldAlert className="h-5 w-5" />
                    The Minefield (Danger Zone)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="space-y-1.5 text-sm text-red-100/90">
                    {result.minefield.avoid.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-red-100/70">{result.minefield.reason}</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Sparkles className="h-5 w-5 text-violet-200" />
                    Chat Assistant Responses
                  </CardTitle>
                  <CardDescription className="text-white/55">
                    Tone mode: {toneLabel(toneValue)}
                    {isRecalibrating ? " (recalibrating...)" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-white/50">
                      <span>Soften</span>
                      <span className="inline-flex items-center gap-1 text-white/75">
                        <Waves className="h-3.5 w-3.5" />
                        {toneLabel(toneValue)}
                      </span>
                      <span>Direct</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[toneValue]}
                      onValueChange={(values) => setToneValue(values[0] ?? 50)}
                    />
                  </div>

                  <div className="grid gap-3">
                    {result.calibratedResponses.map((item) => (
                      <div key={`${item.persona}-${item.label}`} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <p className="text-[11px] uppercase tracking-[0.15em] text-violet-200/85">
                          {item.persona} - {item.label}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-white/90">{item.response}</p>
                        <p className="mt-2 text-xs text-white/55">{item.whyItWorks}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Conflict Replay</CardTitle>
                  <CardDescription className="text-white/55">
                    Process this misalignment with both perspectives and a neutral mirror.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href="/tools/conflict-replay"
                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#100e15] hover:bg-white/90"
                  >
                    Process &amp; learn
                  </Link>
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
