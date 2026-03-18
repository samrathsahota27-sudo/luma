"use client";

import Link from "next/link";
import { useCallback, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ImageGrid } from "@/components/reflection/ImageGrid";
import { ResponseInput } from "@/components/reflection/ResponseInput";

const EMOTIONAL_TAGS = [
  "Calm", "Curious", "Uneasy", "Warm", "Distant", "Safe",
  "Heavy", "Hopeful", "Guarded", "Connected", "Lost", "Open",
];

const SENTENCE_STARTER = "This image makes me feel ";
const SENTENCE_END = " because ";

const ROUND_QUESTIONS = [
  "Which image feels closest to you right now?",
  "Which image creates a sense of discomfort or heaviness for you?",
  "Which image reflects your current state of mind?",
  "What attracts you the most?",
];

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
  tags = [],
  selectedTags = [],
  onToggleTag,
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
}) {
  const reflectionRef = useRef(null);
  const noneSectionRef = useRef(null);

  const effectiveSelectedOption =
    selectedOption ?? (noneSelected ? "none" : selectedIndex != null ? "image" : null);
  const showNoneSection = effectiveSelectedOption === "none";
  const showReflectionUI = effectiveSelectedOption === "image" && selectedIndex != null;

  const trimmed = String(textValue || "").trim();
  const isEmpty = !trimmed;
  const hasTyped = trimmed.length > 0;
  const guidedTags = parseGuidedSentence(textValue);
  const isGuidedMode = isEmpty || guidedTags !== null;

  const [legacySelectedTags, setLegacySelectedTags] = useState([]);
  const [pressedTag, setPressedTag] = useState(null);
  const [reflectionRevealed, setReflectionRevealed] = useState(false);
  const [showIntuition, setShowIntuition] = useState(false);
  const textareaRef = useRef(null);
  const moveCursorToEndRef = useRef(false);

  useEffect(() => {
    if (isEmpty) setLegacySelectedTags([]);
  }, [isEmpty]);

  useEffect(() => {
    setReflectionRevealed(false);
    setShowIntuition(false);
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
    const node = reflectionRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
    if (fullyVisible) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSelectImageWithScroll = useCallback(
    (index) => {
      onSelectImage(index);
      setReflectionRevealed(true);
      if (typeof window === "undefined") return;
      window.setTimeout(scrollToReflection, 180);
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

  const total = totalRounds ?? 4;
  const progressPercent = total > 0 ? (Math.min(round, total) / total) * 100 : 0;

  const roundQuestion = ROUND_QUESTIONS[Math.max(0, (round ?? 1) - 1)] ?? ROUND_QUESTIONS[0];
  const topQuestion = question || roundQuestion;

  return (
    <>
      <div className="max-w-[720px] mx-auto px-6 py-8 md:py-10">
        {/* 1. Header: LUMA, round indicator, thin progress bar */}
        <header className="mb-10 md:mb-12">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-serif text-xl tracking-tight text-[#2F2F2F] hover:opacity-80 transition-opacity duration-200 [font-family:var(--font-serif-display)]"
            >
              LUMA
            </Link>
            <span className="text-xs uppercase tracking-widest text-[#5a5a5a]">
              Round {round} of {total}
            </span>
          </div>
          <div
            className="mt-3 h-0.5 w-full rounded-full bg-[#E8E3D9] overflow-hidden"
            role="progressbar"
            aria-valuenow={round}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-label={`Round ${round} of ${total}`}
          >
            <div
              className="h-full bg-[#2F2F2F] rounded-full transition-all duration-[300ms] ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </header>

        {/* 2. Image selection section */}
        <section className="mb-10">
          <h2 className="text-lg font-medium text-gray-800 mb-4 text-center">
            {topQuestion}
          </h2>
          <div className="rounded-[16px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E8E3D9]/60">
            <ImageGrid
              images={images}
              selectedIndex={selectedIndex}
              onSelectImage={handleSelectImageWithScroll}
            />
          </div>
          {showNone && (
            <button
              type="button"
              onClick={handleSelectNoneWithScroll}
              className="mt-4 text-sm text-gray-500 underline w-full text-center hover:text-gray-700 transition-colors"
            >
              None of these reflect me
            </button>
          )}
        </section>

        {/* None-of-these deeper reflection */}
        {showNoneSection && (
          <div id="none-section" ref={noneSectionRef} className="mt-6">
            <p className="text-sm text-gray-600 mb-2 text-center">
              Why none of these feels right?
            </p>
            <textarea
              value={noneText}
              onChange={(e) => onNoneTextChange?.(e.target.value)}
              placeholder="Write what feels true…"
              className="w-full p-3 rounded-lg border text-sm bg-white"
              rows={4}
            />
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
            <h2 className="font-serif text-[18px] md:text-[20px] text-[#2F2F2F] mb-4 [font-family:var(--font-serif-display)]">
              {((tags ?? []).length ?? 0) > 0 ? "Choose a few words (optional)" : "Write what feels true"}
            </h2>
            {((tags ?? []).length ?? 0) > 0 && (
              <>
                <div className="flex flex-wrap gap-2">
                  {(tags ?? []).map((tag) => {
                    const active = (selectedTags ?? []).includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onToggleTag?.(tag)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-all duration-[200ms] ease-out",
                          active
                            ? "bg-[#2F2F2F] text-white"
                            : "bg-[#E8E3D9]/50 text-[#5a5a5a] hover:bg-[#E8E3D9] border border-[#E8E3D9]"
                        )}
                        aria-pressed={active}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm text-[#5a5a5a]">
                  Or simply write what feels true.
                </p>
              </>
            )}

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              {(reflectionLines ?? ["What's happening here?", "How does it feel?", "Fast or slow?"]).slice(0, 3).map((q) => (
                <p key={q}>• {q}</p>
              ))}
            </div>

            <div className="mt-3">
              <ResponseInput
                ref={textareaRef}
                value={textValue}
                onChange={onTextChange}
                placeholder="Write what feels true…"
                minRows={6}
                className="min-h-[180px] rounded-[12px] py-4 text-[15px] leading-relaxed placeholder:text-[#5a5a5a]/70"
              />
              {showIntuition && (
                <p className="text-xs text-gray-400 mt-3 italic">
                  I&apos;m not sure why this feels right
                </p>
              )}
            </div>
          </div>
        )}

        {/* Continue button — appears only when canProceed */}
        {canProceed && (
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onNext}
              className="px-5 py-3 text-base font-medium rounded-[12px] transition-all duration-[250ms] bg-[#2F2F2F] text-white hover:opacity-90"
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
