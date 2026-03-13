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

  const trimmed = (textValue || "").trim();
  const isEmpty = !trimmed;
  const hasTyped = trimmed.length > 0;
  const guidedTags = parseGuidedSentence(textValue);
  const isGuidedMode = isEmpty || guidedTags !== null;

  const [selectedTags, setSelectedTags] = useState([]);
  const [pressedTag, setPressedTag] = useState(null);
  const [reflectionRevealed, setReflectionRevealed] = useState(false);
  const textareaRef = useRef(null);
  const moveCursorToEndRef = useRef(false);

  useEffect(() => {
    if (isEmpty) setSelectedTags([]);
  }, [isEmpty]);

  useEffect(() => {
    setReflectionRevealed(false);
  }, [round]);

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

  const handleTagClick = useCallback(
    (word) => {
      setPressedTag(word);
      setTimeout(() => setPressedTag(null), 150);

      const scheduleCursorToEnd = () => {
        moveCursorToEndRef.current = true;
      };

      if (isEmpty) {
        const selected = selectedTags.includes(word);
        const nextTags = selected
          ? selectedTags.filter((w) => w !== word)
          : [...selectedTags, word];
        setSelectedTags(nextTags);
        const next = buildGuidedSentence(nextTags);
        onTextChange(next);
        scheduleCursorToEnd();
        return;
      }

      if (isGuidedMode && guidedTags !== null) {
        const selected = guidedTags.some((w) => w.toLowerCase() === word.toLowerCase());
        const nextTags = selected
          ? guidedTags.filter((w) => w.toLowerCase() !== word.toLowerCase())
          : [...guidedTags, word];
        const next = buildGuidedSentence(nextTags);
        onTextChange(next);
        scheduleCursorToEnd();
        return;
      }

      if (isTagInText(word, textValue)) {
        const regex = new RegExp("\\b" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
        const next = trimmed.replace(regex, "").replace(/\s+/g, " ").trim();
        onTextChange(next);
      } else {
        const next = trimmed ? trimmed + " " + word : word;
        onTextChange(next);
        scheduleCursorToEnd();
      }
    },
    [textValue, onTextChange, isTagInText, isEmpty, isGuidedMode, guidedTags, selectedTags]
  );

  const tagSelected = (word) => {
    if (isEmpty) return selectedTags.includes(word);
    if (guidedTags) return guidedTags.some((w) => w.toLowerCase() === word.toLowerCase());
    return isTagInText(word, textValue);
  };

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

  const total = totalRounds ?? 4;
  const progressPercent = total > 0 ? (Math.min(round, total) / total) * 100 : 0;

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
          <p className="text-center text-[#2F2F2F] text-base md:text-lg mb-6 font-medium">
            Choose the image that draws your attention.
          </p>
          <div className="rounded-[16px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E8E3D9]/60">
            <ImageGrid
              images={images}
              selectedIndex={selectedIndex}
              onSelectImage={handleSelectImageWithScroll}
            />
            {showNone && (
              <div className="mt-5 text-center text-xs text-[#5a5a5a]">
                None of these reflect me
              </div>
            )}
          </div>
        </section>

        {/* 3 & 4. Reflection section — fades in after image selection */}
        <div
          ref={reflectionRef}
          className={cn(
            "transition-opacity transition-transform duration-[300ms] ease-out",
            reflectionRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]"
          )}
        >
          <h2 className="font-serif text-[18px] md:text-[20px] text-[#2F2F2F] mb-4 [font-family:var(--font-serif-display)]">
            Tap words that resonate
          </h2>
          <div className="flex flex-wrap gap-2">
            {EMOTIONAL_TAGS.map((word) => {
              const selected = tagSelected(word);
              const isPressed = pressedTag === word;
              return (
                <button
                  key={word}
                  type="button"
                  onClick={() => handleTagClick(word)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-[200ms] ease-out",
                    selected
                      ? "bg-[#2F2F2F] text-white"
                      : "bg-[#E8E3D9]/50 text-[#5a5a5a] hover:bg-[#E8E3D9] border border-[#E8E3D9]"
                  )}
                  style={{ transform: isPressed ? "scale(1.08)" : "scale(1)" }}
                  aria-pressed={selected}
                >
                  {word}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-[#5a5a5a]">
            Tap words that resonate — or write your own.
          </p>

          {/* 5. Reflection writing box — journal style */}
          <div className="mt-6">
            <ResponseInput
              ref={textareaRef}
              value={textValue}
              onChange={onTextChange}
              placeholder="This image makes me feel..."
              minRows={6}
              className="min-h-[180px] rounded-[12px] py-4 text-[15px] leading-relaxed placeholder:text-[#5a5a5a]/70"
            />
          </div>
        </div>

        {/* 6. Continue button — appears when user starts typing */}
        <div className="mt-8 flex justify-end">
          <div
            className={cn(
              "transition-opacity transition-transform duration-[300ms] ease-out",
              hasTyped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[6px] pointer-events-none"
            )}
          >
            <button
              type="button"
              onClick={onNext}
              disabled={!canProceed}
              className={cn(
                "px-5 py-3 text-base font-medium rounded-[12px] transition-all duration-[250ms]",
                canProceed
                  ? "bg-[#2F2F2F] text-white hover:opacity-90"
                  : "bg-[#E6E8F0] text-[#5a5a5a] cursor-not-allowed"
              )}
            >
              {round < total ? "Continue" : "See reflection"}
            </button>
          </div>
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        Round {round} of {total}
      </div>
    </>
  );
}
