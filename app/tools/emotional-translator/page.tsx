"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardPaste,
  Loader2,
  Paperclip,
  Sparkles,
  Target,
  UserRound,
  Wand2,
  X,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { appendTranscriptValue, useSpeechToText } from "@/hooks/useSpeechToText";

type SourceKind = "text_message" | "voice_note" | "in_person";

type TranslatorOutput = {
  patternMatch: {
    name: string;
    matchPercent: number;
    line: string;
  };
  translatedMeaning: {
    sentence: string;
    baselineTieIn: string;
  };
  partnerLens: {
    likelyFeeling: string;
    patternReference: string;
  };
  actionImpulse: {
    suggestion: string;
    cycleAnchor: string;
  };
  telemetry: {
    driftReference: string | null;
    tensionReference: string | null;
    historyAnchors: string[];
  };
};

const SOURCE_OPTIONS: { value: SourceKind; label: string }[] = [
  { value: "text_message", label: "Text message" },
  { value: "voice_note", label: "Voice note" },
  { value: "in_person", label: "In-person moment" },
];

export default function EmotionalTranslatorPage() {
  const [sourceKind, setSourceKind] = useState<SourceKind>("text_message");
  const [input, setInput] = useState("");
  const [screenshots, setScreenshots] = useState<{ name: string; dataUrl: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<TranslatorOutput | null>(null);
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
    if (loading && isListening) {
      stopMic();
    }
  }, [loading, isListening, stopMic]);

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text?.trim()) setInput(text.trim());
    } catch {
      setError("Clipboard permission blocked. Paste manually.");
    }
  }

  async function handleTranslate() {
    if ((!input.trim() && screenshots.length === 0) || loading) return;
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/tools/emotional-translator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKind,
          text: input.trim(),
          screenshots: screenshots.map((shot) => shot.dataUrl),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "translate_failed");
      setOutput(data as TranslatorOutput);
    } catch {
      setError("Translator failed. Try again in a moment.");
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
    <div className="min-h-screen flex flex-col bg-[#09080d] text-white">
      <Navigation />
      <TimelineBar />
      <main className={`flex-1 ${COUPLE_MAIN_PADDING_TOP} px-4 pb-20 md:px-6`}>
        <style jsx>{`
          @keyframes scanline {
            0% {
              transform: translateX(-120%);
              opacity: 0;
            }
            25% {
              opacity: 0.8;
            }
            100% {
              transform: translateX(120%);
              opacity: 0;
            }
          }
        `}</style>

        <div className="mx-auto w-full max-w-4xl">
          <Link href="/couple-hub" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/85">
            <ArrowLeft className="h-4 w-4" />
            Back to Control Panel
          </Link>

          <Card className="border-white/10 bg-white/[0.03] shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <CardHeader>
              <CardTitle className="font-serif text-[30px] leading-tight [font-family:var(--font-serif-display)]">
                Emotional Translator
              </CardTitle>
              <CardDescription className="text-white/65">
                Turn words into patterns. See what&apos;s really happening.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Source</p>
                <ToggleGroup
                  type="single"
                  value={sourceKind}
                  onValueChange={(v) => {
                    if (v === "text_message" || v === "voice_note" || v === "in_person") setSourceKind(v);
                  }}
                  className="w-full rounded-lg border border-white/10 bg-black/20 p-1"
                >
                  {SOURCE_OPTIONS.map((opt) => (
                    <ToggleGroupItem
                      key={opt.value}
                      value={opt.value}
                      className="text-white/75 data-[state=on]:bg-white/10 data-[state=on]:text-white"
                    >
                      {opt.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Message or Situation</p>
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  {loading ? (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden">
                      <div
                        className="h-full w-1/2 bg-gradient-to-r from-transparent via-violet-300/90 to-transparent"
                        style={{ animation: "scanline 1.1s linear infinite" }}
                      />
                    </div>
                  ) : null}
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={8}
                    disabled={loading}
                    placeholder="Paste the message, summarize the voice note, or describe the moment..."
                    className="min-h-[170px] resize-y border-0 bg-transparent text-[15px] text-white placeholder:text-white/35 focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" onClick={handlePaste} disabled={loading}>
                    <ClipboardPaste className="h-4 w-4" />
                    Paste from Clipboard
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading || screenshots.length >= 3}
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
                    disabled={loading}
                    onToggle={toggleMic}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setInput("");
                      setScreenshots([]);
                    }}
                    disabled={loading || (!input.trim() && screenshots.length === 0)}
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

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={handleTranslate}
                  disabled={loading || (!input.trim() && screenshots.length === 0)}
                  className="min-w-[170px] bg-white text-[#100e15] hover:bg-white/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Translating
                    </>
                  ) : (
                    "Translate"
                  )}
                </Button>
                {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
              </div>
              {micError ? <p className="text-xs text-amber-200/85">{micError}</p> : null}
            </CardContent>
          </Card>

          {output ? (
            <div className="mt-7 grid gap-4">
              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Sparkles className="h-5 w-5 text-violet-200" />
                    Pattern Match
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="secondary" className="bg-violet-300/20 text-violet-100 border-violet-200/30">
                    {output.patternMatch.name} detected - {output.patternMatch.matchPercent}% match
                  </Badge>
                  <p className="text-sm text-white/80">{output.patternMatch.line}</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Wand2 className="h-5 w-5 text-violet-200" />
                    Translated Meaning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-white/85">
                  <p>{output.translatedMeaning.sentence}</p>
                  <p className="text-white/55">{output.translatedMeaning.baselineTieIn}</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <UserRound className="h-5 w-5 text-violet-200" />
                    Partner Lens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-white/85">
                  <p>{output.partnerLens.likelyFeeling}</p>
                  <p className="text-white/55">{output.partnerLens.patternReference}</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Target className="h-5 w-5 text-violet-200" />
                    Action Impulse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-white/85">
                  <p>{output.actionImpulse.suggestion}</p>
                  <p className="text-white/55">{output.actionImpulse.cycleAnchor}</p>
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
