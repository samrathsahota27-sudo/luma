"use client";

import Link from "next/link";
import { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageGrid } from "@/components/reflection/ImageGrid";
import { RoundFiveImageGrid } from "@/components/reflection/RoundFiveImageGrid";
import { ResponseInput } from "@/components/reflection/ResponseInput";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { questionTagConfig } from "@/lib/questionTagConfig";
import { QUESTIONS } from "@/lib/testConfig";
import { appendTranscriptValue, useSpeechToText } from "@/hooks/useSpeechToText";

const EMOTIONAL_TAGS = [
  "Calm", "Curious", "Uneasy", "Warm", "Distant", "Safe",
  "Heavy", "Hopeful", "Guarded", "Connected", "Lost", "Open",
];

const SENTENCE_STARTER = "This image makes me feel ";
const SENTENCE_END = " because ";

function buildGuidedSentence(tags) {
  if (tags.length === 0) return "";
  const words = tags.map((w) => w.toLowerCase()).join(" and ");
  return SENTENCE_STARTER + words + SENTENCE_END;
}

function parseGuidedSentence(text) {
  const t = (text || "").trim();
  if (!t) return null;
  const prefix = "This image makes me feel ";
  const suffix = " because";
  const lower = t.toLowerCase();
  if (!t.startsWith(prefix) || !lower.includes(suffix)) return null;
  const suffixIdx = lower.indexOf(suffix);
  const afterBecause = t.slice(suffixIdx + suffix.length).trim();
  if (afterBecause.length > 0) return null;
  const middle = t.slice(prefix.length, suffixIdx).trim();
  if (!middle) return [];
  const parts = middle.split(/\s+and\s+/i).map((s) => s.trim()).filter(Boolean);
  const tags = [];
  for (const p of parts) {
    const found = EMOTIONAL_TAGS.find((w) => w.toLowerCase() === p.toLowerCase());
    if (found) tags.push(found);
  }
  return parts.length === tags.length ? tags : null;
}

/**
 * Controls the round state and orchestrates a single reflection test round.
 * Composes ImageGrid and ResponseInput for a consistent reflection UI.
 */
export function TestRound({
  round,
  question,
  reflectionLines,
  images,
  selectedIndex,
  onSelectImage,
  tagAnswers,
  onToggleTagSelection,
  onTagTextChange,
  tags = [],
  selectedTags = [],
  onToggleTag,
  progressiveAnswers,
  onSetProgressiveAnswer,
  personalNote = "",
  onPersonalNoteChange,
  relationshipTags = [],
  onToggleRelationshipTag,
  relationshipSummary = "",
  onRelationshipSummaryChange,
  lovePart = "",
  onLovePartChange,
  missingPart = "",
  onMissingPartChange,
  changePart = "",
  onChangePartChange,
  selectedOption,
  noneText = "",
  onNoneTextChange,
  noneSelected = false, // backward compat
  onSelectNone,
  textValue,
  onTextChange,
  canProceed,
  onNext,
  showNone,
  totalRounds = 4,
  showProgressBar = false,
  roundTitles,
  spaceBetweenRound = false,
  onBack,
}) {
  const reflectionRef = useRef(null);
  const questionRef = useRef(null);
  const noneSectionRef = useRef(null);
  const q1Ref = useRef(null);
  const q2Ref = useRef(null);
  const q3Ref = useRef(null);
  const q4Ref = useRef(null);
  const noteRef = useRef(null);
  const continueRef = useRef(null);

  const effectiveSelectedOption =
    selectedOption ?? (noneSelected ? "none" : selectedIndex != null ? "image" : null);
  const showNoneSection = effectiveSelectedOption === "none";
  const showReflectionUI =
    !spaceBetweenRound && effectiveSelectedOption === "image" && selectedIndex != null;
  const showSpaceBetweenReflectionUI =
    spaceBetweenRound && effectiveSelectedOption === "image" && selectedIndex != null;

  const trimmed = String(textValue || "").trim();
  const isEmpty = !trimmed;
  const hasTyped = trimmed.length > 0;
  const guidedTags = parseGuidedSentence(textValue);
  const isGuidedMode = isEmpty || guidedTags !== null;

  const [legacySelectedTags, setLegacySelectedTags] = useState([]);
  const [pressedTag, setPressedTag] = useState(null);
  const [reflectionRevealed, setReflectionRevealed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showIntuition, setShowIntuition] = useState(false);
  const textareaRef = useRef(null);
  const moveCursorToEndRef = useRef(false);

  useEffect(() => {
    if (isEmpty) setLegacySelectedTags([]);
  }, [isEmpty]);

  useEffect(() => {
    setReflectionRevealed(false);
    setShowIntuition(false);
    setCurrentStep(0);
  }, [round]);

  useEffect(() => {
    // Delay the intuition line until the user has committed to an image.
    // Also reset whenever selection changes.
    setShowIntuition(false);
    if (selectedIndex == null || effectiveSelectedOption !== "image") return;
    const t = window.setTimeout(() => setShowIntuition(true), 20000);
    return () => window.clearTimeout(t);
  }, [selectedIndex, effectiveSelectedOption]);

  useEffect(() => {
    if (!moveCursorToEndRef.current || !textareaRef.current) return;
    moveCursorToEndRef.current = false;
    const el = textareaRef.current;
    el.focus();
    const len = (el.value ?? "").length;
    el.setSelectionRange(len, len);
  }, [textValue]);

  const isTagInText = useCallback((word, text) => {
    if (!text || !text.trim()) return false;
    const regex = new RegExp("\\b" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
    return regex.test(text.trim());
  }, []);

  // Legacy guided writing helpers remain, but round tags now come from config (props).

  const scrollToReflection = useCallback(() => {
    if (typeof window === "undefined") return;
    const node = questionRef.current || reflectionRef.current;
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSelectImageWithScroll = useCallback(
    (index) => {
      onSelectImage(index);
      setReflectionRevealed(true);
      if (typeof window === "undefined") return;
      setCurrentStep(1);
      window.setTimeout(scrollToReflection, 100);
    },
    [onSelectImage, scrollToReflection]
  );

  const handleSpaceBetweenSelect = useCallback(
    (index) => {
      onSelectImage(index);
      setReflectionRevealed(true);
      setCurrentStep(1);
      if (typeof window === "undefined") return;
      window.setTimeout(scrollToReflection, 100);
    },
    [onSelectImage, scrollToReflection]
  );

  const handleSelectNoneWithScroll = useCallback(() => {
    if (!onSelectNone) return;
    onSelectNone();
    setReflectionRevealed(false);
    if (typeof window === "undefined") return;
    window.setTimeout(() => {
      noneSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [onSelectNone]);

  const questions = useMemo(() => {
    const key = `round${Number(round)}`; // "round1".."round5"
    const roundData = questionTagConfig?.[key];
    const fallbackQs = (reflectionLines ?? []).slice(0, 3);

    const q1 = roundData?.q1 ?? (fallbackQs[0] ? { text: fallbackQs[0], tags: [] } : null);
    const q2 = roundData?.q2 ?? (fallbackQs[1] ? { text: fallbackQs[1], tags: [] } : null);
    const q3 = roundData?.q3 ?? (fallbackQs[2] ? { text: fallbackQs[2], tags: [] } : null);
    const q4 = roundData?.q4 ?? null; // only present for round 5

    return [
      q1 ? { id: "q1", text: q1.text, tags: q1.tags } : null,
      q2 ? { id: "q2", text: q2.text, tags: q2.tags } : null,
      q3 ? { id: "q3", text: q3.text, tags: q3.tags } : null,
      q4 ? { id: "q4", text: q4.text, tags: q4.tags } : null,
    ].filter(Boolean);
  }, [round, reflectionLines]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!showReflectionUI && !showSpaceBetweenReflectionUI) return;
    if (currentStep <= 0) return;

    const t = window.setTimeout(() => {
      const hasQ4 = Boolean(questions?.[3]);
      const target =
        currentStep <= 1
          ? q1Ref.current
          : currentStep === 2
            ? q2Ref.current
            : currentStep === 3
              ? q3Ref.current
              : currentStep === 4
                ? hasQ4
                  ? q4Ref.current
                  : noteRef.current || continueRef.current
                : noteRef.current || continueRef.current;

      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 140);

    return () => window.clearTimeout(t);
  }, [currentStep, showReflectionUI, showSpaceBetweenReflectionUI, questions]);

  const total = totalRounds ?? 4;
  const progressPercent = total > 0 ? (Math.min(round, total) / total) * 100 : 0;

  const roundQuestion = QUESTIONS[Math.max(0, (round ?? 1) - 1)] ?? QUESTIONS[0];
  const topQuestion = question || roundQuestion;
  const headQuestion = spaceBetweenRound
    ? "What best describes your relationship right now?"
    : topQuestion;

  const showBack = typeof onBack === "function" && round > 1;

  const roundKey = `round${Number(round)}`;
  const roundTagState = tagAnswers?.[roundKey] ?? null;
  const q1Selected = Array.isArray(roundTagState?.q1) ? roundTagState.q1 : [];
  const q2Selected = Array.isArray(roundTagState?.q2) ? roundTagState.q2 : [];
  const q3Selected = Array.isArray(roundTagState?.q3) ? roundTagState.q3 : [];
  const q4Selected = Array.isArray(roundTagState?.q4) ? roundTagState.q4 : [];
  const roundText = typeof roundTagState?.text === "string" ? roundTagState.text : "";

  const noteMic = useSpeechToText((transcript) => {
    if (typeof onToggleTagSelection === "function") {
      onTagTextChange?.(roundKey, appendTranscriptValue(roundText, transcript));
      return;
    }
    onPersonalNoteChange?.(appendTranscriptValue(personalNote, transcript));
  });
  const noneMic = useSpeechToText((transcript) => {
    onNoneTextChange?.(appendTranscriptValue(noneText, transcript));
  });

  useEffect(() => {
    const useNew = !!roundTagState && typeof onToggleTagSelection === "function";
    if (!useNew) {
      const a1 = progressiveAnswers?.q1;
      const a2 = progressiveAnswers?.q2;
      const a3 = progressiveAnswers?.q3;
      const a4 = progressiveAnswers?.q4;
      const hasA1 = Array.isArray(a1) ? a1.length > 0 : !!a1;
      const hasA2 = Array.isArray(a2) ? a2.length > 0 : !!a2;
      const hasA3 = Array.isArray(a3) ? a3.length > 0 : !!a3;
      const hasA4 = Array.isArray(a4) ? a4.length > 0 : !!a4;
      const derived = hasA1 ? (hasA2 ? (hasA3 ? (hasA4 ? 5 : 4) : 3) : 2) : 0;
      setCurrentStep((prev) => Math.max(prev, derived));
      return;
    }

    const hasA1 = q1Selected.length > 0;
    const hasA2 = q2Selected.length > 0;
    const hasA3 = q3Selected.length > 0;
    const hasA4 = q4Selected.length > 0;
    const needsQ4 = !!questions?.[3];
    const derived = hasA1 ? (hasA2 ? (hasA3 ? (needsQ4 ? (hasA4 ? 5 : 4) : 4) : 3) : 2) : 0;
    setCurrentStep((prev) => Math.max(prev, derived));
  }, [
    questions?.length,
    onToggleTagSelection,
    progressiveAnswers?.q1,
    progressiveAnswers?.q2,
    progressiveAnswers?.q3,
    progressiveAnswers?.q4,
    q1Selected.length,
    q2Selected.length,
    q3Selected.length,
    q4Selected.length,
    roundTagState,
  ]);

  const handleAnswer = useCallback(
    (questionKey, value) => {
      // Back-compat (single select)
      onSetProgressiveAnswer?.(questionKey, value);
      setCurrentStep((prev) => prev + 1);
    },
    [onSetProgressiveAnswer]
  );

  const toggleTag = useCallback(
    (questionKey, tag) => {
      if (typeof onToggleTagSelection !== "function") return;
      onToggleTagSelection(roundKey, questionKey, tag);
    },
    [onToggleTagSelection, roundKey]
  );

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    // Debug checks (dev only)
    // eslint-disable-next-line no-console
    console.log("Selected Image:", selectedIndex);
    // eslint-disable-next-line no-console
    console.log("Current Step:", currentStep);
    // eslint-disable-next-line no-console
    console.log("Answers:", progressiveAnswers);
    // eslint-disable-next-line no-console
    console.log("Using tags:", questionTagConfig?.[`round${Number(round)}`]);
  }, [round, selectedIndex, currentStep, progressiveAnswers]);

  return (
    <>
      <div className="max-w-[720px] mx-auto px-6 py-8 md:py-10">
        {/* 1. Header: LUMA, round indicator, thin progress bar */}
        <header className="mb-10 md:mb-12">
          {showBack ? (
            <div className="mb-4 flex justify-start">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-foreground shadow-[0_1px_0_rgba(255,255,255,0.06)] transition-[transform,background-color] motion-safe:active:scale-[0.98] hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/45 -ml-1"
                aria-label="Back to previous round"
              >
                <ChevronLeft className="h-5 w-5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                Back
              </button>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-serif text-xl tracking-tight text-foreground hover:opacity-80 transition-opacity duration-200 [font-family:var(--font-serif-display)]"
            >
              LUMA
            </Link>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Round {round} of {total}
            </span>
          </div>
          <div
            className="mt-3 h-0.5 w-full rounded-full bg-white/10 overflow-hidden"
            role="progressbar"
            aria-valuenow={round}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-label={`Round ${round} of ${total}`}
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-[300ms] ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </header>

        {/* 2. Image selection section */}
        <section id={`round-${round}-question-1`} className="mb-10">
          <h2 className="mx-auto mb-4 max-w-[32ch] text-balance text-center text-lg font-medium text-foreground">
            {headQuestion}
          </h2>
          <div
            className={cn(
              "rounded-[16px] luma-glass border border-white/10",
              spaceBetweenRound ? "p-4 sm:p-5" : "p-6"
            )}
          >
            {spaceBetweenRound ? (
              <RoundFiveImageGrid
                selectedIndex={selectedIndex}
                onSelectImage={handleSpaceBetweenSelect}
              />
            ) : (
              <ImageGrid
                images={images}
                selectedIndex={selectedIndex}
                onSelectImage={handleSelectImageWithScroll}
              />
            )}
          </div>
          {showNone && !spaceBetweenRound && (
            <button
              type="button"
              onClick={handleSelectNoneWithScroll}
              className="mt-4 text-sm text-muted-foreground underline w-full text-center hover:text-foreground transition-colors"
            >
              None of these reflect me
            </button>
          )}
        </section>

        {/* Round 5 relationship reflection (optional, saved) */}
        {showSpaceBetweenReflectionUI && (
          <section className="mt-2">
            <div ref={questionRef} className="space-y-6">
              {questions?.[0] && currentStep >= 1 ? (
                <div
                  ref={q1Ref}
                  id={`round-${round}-question-2`}
                  className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                >
                  <p className="text-sm text-muted-foreground">{questions[0].text}</p>
                  <p className="text-xs text-white/50 mt-1 mb-2">Select up to 2</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {questions[0].tags?.slice(0, 5).map((tag) => {
                      const current =
                        typeof onToggleTagSelection === "function"
                          ? q1Selected
                          : Array.isArray(progressiveAnswers?.q1)
                            ? progressiveAnswers.q1
                            : [];
                      const active = current.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (typeof onToggleTagSelection === "function") {
                              toggleTag("q1", tag);
                              const nextLen = active ? current.length - 1 : Math.min(2, current.length + 1);
                              if (nextLen > 0) setCurrentStep((s) => Math.max(s, 2));
                              return;
                            }
                            const next = active ? current.filter((t) => t !== tag) : [...current, tag].slice(0, 2);
                            onSetProgressiveAnswer?.("q1", next);
                            if (next.length > 0) setCurrentStep((s) => Math.max(s, 2));
                          }}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out border",
                            active
                              ? "bg-white/10 border-white/20 text-foreground"
                              : "bg-white/[0.04] border-white/10 text-muted-foreground hover:bg-white/[0.07]"
                          )}
                          aria-pressed={active}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {questions?.[1] && currentStep >= 2 ? (
                <div
                  ref={q2Ref}
                  id={`round-${round}-question-3`}
                  className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                >
                  <p className="text-sm text-muted-foreground">{questions[1].text}</p>
                  <p className="text-xs text-white/50 mt-1 mb-2">Select up to 2</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {questions[1].tags?.slice(0, 5).map((tag) => {
                      const current =
                        typeof onToggleTagSelection === "function"
                          ? q2Selected
                          : Array.isArray(progressiveAnswers?.q2)
                            ? progressiveAnswers.q2
                            : [];
                      const active = current.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (typeof onToggleTagSelection === "function") {
                              toggleTag("q2", tag);
                              const nextLen = active ? current.length - 1 : Math.min(2, current.length + 1);
                              if (nextLen > 0) setCurrentStep((s) => Math.max(s, 3));
                              return;
                            }
                            const next = active ? current.filter((t) => t !== tag) : [...current, tag].slice(0, 2);
                            onSetProgressiveAnswer?.("q2", next);
                            if (next.length > 0) setCurrentStep((s) => Math.max(s, 3));
                          }}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out border",
                            active
                              ? "bg-white/10 border-white/20 text-foreground"
                              : "bg-white/[0.04] border-white/10 text-muted-foreground hover:bg-white/[0.07]"
                          )}
                          aria-pressed={active}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {questions?.[2] && currentStep >= 3 ? (
                <div
                  ref={q3Ref}
                  id={`round-${round}-question-4`}
                  className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                >
                  <p className="text-sm text-muted-foreground">{questions[2].text}</p>
                  <p className="text-xs text-white/50 mt-1 mb-2">Select up to 2</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {questions[2].tags?.slice(0, 5).map((tag) => {
                      const current =
                        typeof onToggleTagSelection === "function"
                          ? q3Selected
                          : Array.isArray(progressiveAnswers?.q3)
                            ? progressiveAnswers.q3
                            : progressiveAnswers?.q3
                              ? [progressiveAnswers.q3]
                              : [];
                      const active = current.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (typeof onToggleTagSelection === "function") {
                              toggleTag("q3", tag);
                              const nextLen = active ? current.length - 1 : Math.min(2, current.length + 1);
                              if (nextLen > 0) setCurrentStep((s) => Math.max(s, 4));
                              return;
                            }
                            handleAnswer("q3", tag);
                            setCurrentStep((s) => Math.max(s, 4));
                          }}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out border",
                            active
                              ? "bg-white/10 border-white/20 text-foreground"
                              : "bg-white/[0.04] border-white/10 text-muted-foreground hover:bg-white/[0.07]"
                          )}
                          aria-pressed={active}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {questions?.[3] && currentStep >= 4 ? (
                <div
                  ref={q4Ref}
                  id={`round-${round}-question-5`}
                  className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                >
                  <p className="text-sm text-muted-foreground">{questions[3].text}</p>
                  <p className="text-xs text-white/50 mt-1 mb-2">Select up to 2</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {questions[3].tags?.slice(0, 5).map((tag) => {
                      const current =
                        typeof onToggleTagSelection === "function"
                          ? q4Selected
                          : Array.isArray(progressiveAnswers?.q4)
                            ? progressiveAnswers.q4
                            : [];
                      const active = current.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (typeof onToggleTagSelection === "function") {
                              toggleTag("q4", tag);
                              const nextLen = active ? current.length - 1 : Math.min(2, current.length + 1);
                              if (nextLen > 0) setCurrentStep((s) => Math.max(s, 5));
                              return;
                            }
                            const next = active ? current.filter((t) => t !== tag) : [...current, tag].slice(0, 2);
                            onSetProgressiveAnswer?.("q4", next);
                            if (next.length > 0) setCurrentStep((s) => Math.max(s, 5));
                          }}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out border",
                            active
                              ? "bg-white/10 border-white/20 text-foreground"
                              : "bg-white/[0.04] border-white/10 text-muted-foreground hover:bg-white/[0.07]"
                          )}
                          aria-pressed={active}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {currentStep >= (questions?.[3] ? 5 : 4) ? (
                <div
                  ref={noteRef}
                  id={`round-${round}-result-section`}
                  className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                >
                  <label className="block text-sm font-medium text-foreground">
                    Anything in your own words?
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Personalized answers create a deeper reflection.
                  </p>
                  <div className="relative mt-3">
                    <textarea
                      value={typeof onToggleTagSelection === "function" ? roundText : personalNote}
                      onChange={(e) =>
                        typeof onToggleTagSelection === "function"
                          ? onTagTextChange?.(roundKey, e.target.value)
                          : onPersonalNoteChange?.(e.target.value)
                      }
                      placeholder="(optional)"
                      className="w-full rounded-xl bg-white/5 border border-white/10 p-3 pr-24 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-white/10"
                      rows={4}
                    />
                    <SpeechMicButton
                      isListening={noteMic.isListening}
                      isSupported={noteMic.isSupported}
                      onToggle={noteMic.toggle}
                      className="absolute right-3 top-3"
                    />
                  </div>
                  {noteMic.error ? <p className="mt-2 text-xs text-[#c49a8c]">{noteMic.error}</p> : null}
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* None-of-these deeper reflection */}
        {showNoneSection && (
          <div id="none-section" ref={noneSectionRef} className="mt-6">
            <p className="text-sm text-muted-foreground mb-2 text-center">
              Why none of these feels right?
            </p>
            <div className="relative">
              <textarea
                value={noneText}
                onChange={(e) => onNoneTextChange?.(e.target.value)}
                placeholder="Write what feels true…"
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] p-3 pr-24 text-sm text-foreground placeholder:text-muted-foreground"
                rows={4}
              />
              <SpeechMicButton
                isListening={noneMic.isListening}
                isSupported={noneMic.isSupported}
                onToggle={noneMic.toggle}
                className="absolute right-3 top-3"
              />
            </div>
            {noneMic.error ? <p className="mt-2 text-xs text-[#c49a8c]">{noneMic.error}</p> : null}
          </div>
        )}

        {/* 3 & 4. Reflection section — only after selection */}
        {showReflectionUI && (
          <div
            ref={reflectionRef}
            className={cn(
              "transition-opacity transition-transform duration-[300ms] ease-out",
              reflectionRevealed ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
            )}
          >
            <div ref={questionRef} className="space-y-6">
              {questions?.[0] && currentStep >= 1 ? (
                <div
                  ref={q1Ref}
                  id={`round-${round}-question-2`}
                  className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                >
                  <p className="text-sm text-muted-foreground">{questions[0].text}</p>
                  {true && (
                    <p className="text-xs text-white/50 mt-1 mb-2">Select up to 2</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {questions[0].tags?.slice(0, 5).map((tag) => {
                      const current =
                        typeof onToggleTagSelection === "function"
                          ? q1Selected
                          : Array.isArray(progressiveAnswers?.q1)
                            ? progressiveAnswers.q1
                            : progressiveAnswers?.q1
                              ? [progressiveAnswers.q1]
                              : [];
                      const active = current.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (typeof onToggleTagSelection === "function") {
                              toggleTag("q1", tag);
                              const nextLen = active ? current.length - 1 : Math.min(2, current.length + 1);
                              if (nextLen > 0) setCurrentStep((s) => Math.max(s, 2));
                              return;
                            }
                            handleAnswer("q1", tag);
                          }}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out border",
                            active
                              ? "bg-white/10 border-white/20 text-foreground"
                              : "bg-white/[0.04] border-white/10 text-muted-foreground hover:bg-white/[0.07]"
                          )}
                          aria-pressed={active}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {questions?.[1] && currentStep >= 2 ? (
                <div
                  ref={q2Ref}
                  id={`round-${round}-question-3`}
                  className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                >
                  <p className="text-sm text-muted-foreground">{questions[1].text}</p>
                  {true && (
                    <p className="text-xs text-white/50 mt-1 mb-2">Select up to 2</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {questions[1].tags?.slice(0, 5).map((tag) => {
                      const current =
                        typeof onToggleTagSelection === "function"
                          ? q2Selected
                          : Array.isArray(progressiveAnswers?.q2)
                            ? progressiveAnswers.q2
                            : progressiveAnswers?.q2
                              ? [progressiveAnswers.q2]
                              : [];
                      const active = current.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (typeof onToggleTagSelection === "function") {
                              toggleTag("q2", tag);
                              const nextLen = active ? current.length - 1 : Math.min(2, current.length + 1);
                              if (nextLen > 0) setCurrentStep((s) => Math.max(s, 3));
                              return;
                            }
                            handleAnswer("q2", tag);
                          }}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out border",
                            active
                              ? "bg-white/10 border-white/20 text-foreground"
                              : "bg-white/[0.04] border-white/10 text-muted-foreground hover:bg-white/[0.07]"
                          )}
                          aria-pressed={active}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {questions?.[2] && currentStep >= 3 ? (
                <div
                  ref={q3Ref}
                  id={`round-${round}-question-4`}
                  className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                >
                  <p className="text-sm text-muted-foreground">{questions[2].text}</p>
                  {true && (
                    <p className="text-xs text-white/50 mt-1 mb-2">Select up to 2</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {questions[2].tags?.slice(0, 5).map((tag) => {
                      const current =
                        typeof onToggleTagSelection === "function"
                          ? q3Selected
                          : Array.isArray(progressiveAnswers?.q3)
                            ? progressiveAnswers.q3
                            : progressiveAnswers?.q3
                              ? [progressiveAnswers.q3]
                              : [];
                      const active = current.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (typeof onToggleTagSelection === "function") {
                              toggleTag("q3", tag);
                              const nextLen = active ? current.length - 1 : Math.min(2, current.length + 1);
                              if (nextLen > 0) setCurrentStep((s) => Math.max(s, 4));
                              return;
                            }
                            handleAnswer("q3", tag);
                          }}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out border",
                            active
                              ? "bg-white/10 border-white/20 text-foreground"
                              : "bg-white/[0.04] border-white/10 text-muted-foreground hover:bg-white/[0.07]"
                          )}
                          aria-pressed={active}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {currentStep >= 4 ? (
                <div
                  ref={noteRef}
                  id={`round-${round}-result-section`}
                  className="animate-in fade-in slide-in-from-bottom-1 duration-300"
                >
                  <label className="block text-sm font-medium text-foreground">
                    Anything in your own words?
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Personalized answers create a deeper reflection.
                  </p>
                  <div className="relative mt-3">
                    <textarea
                      value={typeof onToggleTagSelection === "function" ? roundText : personalNote}
                      onChange={(e) =>
                        typeof onToggleTagSelection === "function"
                          ? onTagTextChange?.(roundKey, e.target.value)
                          : onPersonalNoteChange?.(e.target.value)
                      }
                      placeholder="(optional)"
                      className="w-full rounded-xl bg-white/5 border border-white/10 p-3 pr-24 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-white/10"
                      rows={4}
                    />
                    <SpeechMicButton
                      isListening={noteMic.isListening}
                      isSupported={noteMic.isSupported}
                      onToggle={noteMic.toggle}
                      className="absolute right-3 top-3"
                    />
                  </div>
                  {noteMic.error ? <p className="mt-2 text-xs text-[#c49a8c]">{noteMic.error}</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Continue button — appears only when canProceed */}
        {canProceed && (
          <div
            ref={continueRef}
            id={`round-${round}-next-section`}
            className="mt-8 flex w-full justify-stretch sm:justify-end"
          >
            <button
              type="button"
              onClick={onNext}
              className="w-full min-h-[48px] sm:min-h-0 sm:w-auto px-5 py-3 text-base font-medium rounded-[12px] transition-all duration-[250ms] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] hover:opacity-90"
            >
              {round < total ? "Continue" : "See reflection"}
            </button>
          </div>
        )}
      </div>

      <div className="sr-only" aria-live="polite">
        Round {round} of {total}
      </div>
    </>
  );
}
