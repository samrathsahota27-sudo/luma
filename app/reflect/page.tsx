"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { TestRound } from "@/components/reflection/TestRound";
import { reflectionRounds, INDIVIDUAL_TOTAL_ROUNDS } from "@/lib/reflection/reflectionRounds";
import { parseRound5SpaceBetweenFromApi } from "@/lib/reflection/round5OutputGenerator";
import { getNextRound, buildReflectionSummary } from "@/lib/reflection/reflectionEngine";
import { getRoundTag } from "@/lib/reflection/roundTagging";
import { deriveUiFromSavedRound, persistCurrentRoundIntoAnswers } from "@/lib/reflection/roundFlowState";
import { saveIndividualReflectionWithEmail, getLastIndividualReflection, getIndividualReflectionCount, getCurrentUserName } from "@/lib/reflectionStorage";
import { nameToSlug } from "@/lib/referralSlug";
import { getReflectionMirrorMessage } from "@/lib/reflectionMirror";
import {
  generateStoryCardBlob,
  generateLetterStoryBlob,
  downloadStoryCard,
  shareOrDownloadStoryCard,
  getStoryCardTitle,
} from "@/lib/storyCard";
import { StoryCard } from "@/components/StoryCard";
import { StoryShareButtons } from "@/components/StoryShareButtons";
import { IndividualResultCard, type IndividualStructuredResult } from "@/components/IndividualResultCard";
import { buildWhyThisIsYou } from "@/lib/whyThisIsYou";
import { buildCostAndBrutalTruth } from "@/lib/costBrutalTruth";
import { extractTagSignalsFromSelections } from "@/lib/patternScoring";
import Image from "next/image";
import { normalizePublicImageSrc } from "@/lib/publicImage";
import { buildTension } from "@/lib/tensionEngine";
import { TensionCard } from "@/components/TensionCard";
import { buildActionTrigger } from "@/lib/actionTrigger";
import { ActionTriggerCard } from "@/components/ActionTriggerCard";
import { shareStoryFromElement } from "@/lib/storyCardCapture";
import { DepthModeSelector } from "@/components/DepthModeSelector";
import { useDepthMode } from "@/hooks/useDepthMode";
import { buildRelationshipContext, recordFeatureUse } from "@/lib/relationshipContext";
import { reflectIntroPrimary, reflectIntroSecondary } from "@/lib/depthUiMicrocopy";
import { getMemory } from "@/lib/memory";
import { saveMemoryForCurrentUser, signInWithPassword, signUpWithPassword } from "@/lib/memoryCloud";
import {
  buildEmotionSessionSignature,
  tryRecordEmotionTrackerSession,
} from "@/lib/emotionalTracker";
import { insertEmotionTrackerRowOncePerSession } from "@/lib/emotionalTrackerSupabase";
import { resolveCalendarMood } from "@/lib/calendarOfUs";
import {
  resolveHowToReadTagsFromSelections,
  resolveRound5PsychologicalSupplementLines,
  parseInSimpleWordsFromApi,
} from "@/lib/resultHelpers";
import { PatternOverTimeSection } from "@/components/PatternOverTimeSection";
import { ReviewAnswersScreen } from "@/components/ReviewAnswersScreen";
import { useUserPlan } from "@/hooks/useUserPlan";

type ReflectionPhase = "intro" | "rounds" | "review" | "generating" | "complete";

type RoundAnswer = {
  selectedType?: "image" | "none";
  image?: number | null;
  selectedImageId?: number | null;
  selectedImage?: "none";
  tag?: string;
  tags?: string[];
  userExplanation?: string;
  text?: string;
  noneText?: string;
  answers?: Record<string, unknown>;
  personalNote?: string;
  relationshipTags?: string[];
  relationshipSummary?: string;
  imageId?: string;
};

type Round5SpaceBetweenPayload = NonNullable<ReturnType<typeof parseRound5SpaceBetweenFromApi>>;

type EmotionTrackedSession = {
  tag: string;
  insight: string;
  calendarState: string | null;
};

const AI_STATUS_ROTATE_MS = 1800;
const AI_STATUS_MESSAGES = [
  "Reading emotional signals...",
  "Mapping unspoken patterns...",
  "Identifying friction points...",
  "Understanding your dynamic...",
  "Finalizing your reflection...",
];

function selectedImagesForSave(
  answers: Record<number, RoundAnswer>
): Record<number, { image: number; text: string }> | undefined {
  const out: Record<number, { image: number; text: string }> = {};
  for (const [k, v] of Object.entries(answers)) {
    const round = Number(k);
    if (!Number.isFinite(round) || !v || typeof v !== "object") continue;
    const image =
      typeof v.selectedImageId === "number"
        ? v.selectedImageId
        : typeof v.image === "number"
          ? v.image
          : null;
    if (image == null) continue;
    out[round] = { image, text: typeof v.text === "string" ? v.text : "" };
  }
  return Object.keys(out).length ? out : undefined;
}

const INVITER_REFLECTION_KEY = "luma_connect_inviter_reflection";

export default function ReflectPage() {
  const router = useRouter();
  const { plan, loading: planLoading } = useUserPlan();
  const { depthMode, setDepthMode } = useDepthMode();
  const [phase, setPhase] = useState<ReflectionPhase>("intro");
  const [currentRound, setCurrentRound] = useState(1);
  const [answers, setAnswers] = useState<Record<number, RoundAnswer>>({});
  const [selectedTags, setSelectedTags] = useState<Record<number, string[]>>({});
  const [textValue, setTextValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | "none" | null>(null);
  const [selectedOption, setSelectedOption] = useState<"image" | "none" | null>(null);
  const [noneText, setNoneText] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNone, setShowNone] = useState(false);
  const [structuredResult, setStructuredResult] = useState<IndividualStructuredResult | null>(null);
  const [guidingReflection, setGuidingReflection] = useState<string[] | null>(null);
  const [reflection, setReflection] = useState<string | null>(null);
  const [brutalTruth, setBrutalTruth] = useState<string | null>(null);
  const [inSimpleWords, setInSimpleWords] = useState<string[] | null>(null);
  const [dangerousQuestion, setDangerousQuestion] = useState<string | null>(null);
  const [shadowInsight, setShadowInsight] = useState<string | null>(null);
  const [emotionalTag, setEmotionalTag] = useState<string | null>(null);
  const [trackerInsight, setTrackerInsight] = useState<string | null>(null);
  const [calendarState, setCalendarState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveEmail, setSaveEmail] = useState("");
  const [reminderEmail, setReminderEmail] = useState("");
  const [saveName, setSaveName] = useState("");
  const [savePassword, setSavePassword] = useState("");
  const [tagAnswers, setTagAnswers] = useState({
    round1: { q1: [] as string[], q2: [] as string[], q3: [] as string[], text: "" },
    round2: { q1: [] as string[], q2: [] as string[], q3: [] as string[], text: "" },
    round3: { q1: [] as string[], q2: [] as string[], q3: [] as string[], text: "" },
    round4: { q1: [] as string[], q2: [] as string[], q3: [] as string[], text: "" },
    round5: { q1: [] as string[], q2: [] as string[], q3: [] as string[], q4: [] as string[], text: "" },
  });
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [hasOpenedDisclaimer, setHasOpenedDisclaimer] = useState(false);
  const [disclaimerSecondsLeft, setDisclaimerSecondsLeft] = useState(5);
  const disclaimerBypassRef = useRef(false);
  const [savedWithEmail, setSavedWithEmail] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const storyCardRef = useRef<HTMLDivElement | null>(null);
  const [previousReflection, setPreviousReflection] = useState<{ content: string } | null>(null);
  const [innerShiftText, setInnerShiftText] = useState<string | null>(null);
  const [innerShiftLoading, setInnerShiftLoading] = useState(false);
  const [showLetterSection, setShowLetterSection] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [letterLoading, setLetterLoading] = useState(false);
  const [letterStoryLoading, setLetterStoryLoading] = useState(false);
  const [referralLinkShown, setReferralLinkShown] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [referralCopied, setReferralCopied] = useState(false);
  const [round5SpaceBetween, setRound5SpaceBetween] = useState<Round5SpaceBetweenPayload | null>(null);
  const [generatingMessageIdx, setGeneratingMessageIdx] = useState(0);

  const answersRef = useRef<Record<number, RoundAnswer>>(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (phase !== "generating") return;
    setGeneratingMessageIdx(0);
    const timer = window.setInterval(() => {
      setGeneratingMessageIdx((idx) => (idx + 1) % AI_STATUS_MESSAGES.length);
    }, AI_STATUS_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [phase]);

  const registerReminder = async (email: string) => {
    const value = email.trim();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return;
    try {
      localStorage.setItem("luma_reminder_email", value);
    } catch {}
    try {
      await fetch("/api/reminder-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, lastReflectionAt: new Date().toISOString() }),
        keepalive: true,
      });
    } catch {}
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("luma_reminder_email");
      if (saved && saved.trim()) setReminderEmail(saved.trim());
    } catch {}
  }, []);

  useEffect(() => {
    if (phase !== "rounds" && phase !== "review") return;
    const handler = () => {
      try {
        const email = (reminderEmail || localStorage.getItem("luma_reminder_email") || "").trim();
        if (!email) return;
        const payload = JSON.stringify({ email, lastReflectionAt: new Date().toISOString() });
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/reminder-register", blob);
          return;
        }
        fetch("/api/reminder-register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      } catch {}
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase, reminderEmail]);

  useEffect(() => {
    if (phase !== "rounds") return;
    setIsTransitioning(true);
    setError(null);

    const saved = answersRef.current[currentRound];
    const ui = deriveUiFromSavedRound(saved);

    setSelectedIndex(ui.selectedIndex);
    setSelectedImage(ui.selectedImage as number | "none" | null);
    setSelectedOption(ui.selectedOption as "image" | "none" | null);
    setTextValue(ui.textValue);
    setNoneText(ui.noneText);
    setSelectedTags((prev) => ({
      ...prev,
      [currentRound]: ui.tagsForRound,
    }));

    setShowNone(false);
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);

    const timer = setTimeout(() => {
      setShowNone(true);
    }, 20000);

    return () => {
      clearTimeout(timer);
      clearTimeout(transitionTimer);
    };
  }, [currentRound, phase]);

  const handleBack = () => {
    if (currentRound <= 1) return;
    setAnswers((prev) => {
      const next = persistCurrentRoundIntoAnswers({
        answers: prev,
        currentRound,
        selectedOption: selectedOption ?? undefined,
        selectedImage,
        textValue,
        noneText,
        selectedTagsForRound: selectedTags[currentRound] ?? [],
        getRoundTag,
      });
      answersRef.current = next;
      return next;
    });
    setCurrentRound((r) => r - 1);
  };

  const handleSelectImage = (index: number) => {
    setSelectedIndex(index);
    setSelectedImage(index);
    setSelectedOption("image");
    setNoneText("");
    const tag = getRoundTag(currentRound, index);
    setAnswers((prev) => ({
      ...prev,
      [currentRound]: {
        selectedType: "image",
        image: index,
        selectedImageId: index,
        tag: tag ?? undefined,
        tags: selectedTags[currentRound] ?? [],
        userExplanation: "",
        text: textValue,
      },
    }));
  };

  const toggleTag = (tagValue: string) => {
    setSelectedTags((prev) => {
      const current = prev[currentRound] || [];
      const next = current.includes(tagValue)
        ? current.filter((t) => t !== tagValue)
        : [...current, tagValue];
      setTextValue(next.join(", "));
      setAnswers((aPrev) => ({
        ...aPrev,
        [currentRound]: {
          ...(aPrev?.[currentRound] ?? {}),
          tags: next,
        },
      }));
      return { ...prev, [currentRound]: next };
    });
  };

  const handleNoneClick = () => {
    // treat like a selection
    setSelectedIndex(null);
    setSelectedImage("none");
    setSelectedOption("none");
    setSelectedTags((prev) => ({ ...prev, [currentRound]: [] }));
    setTimeout(() => {
      document.getElementById("none-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const progressive = (answers as any)?.[currentRound]?.answers ?? {};
  const personalNote = (answers as any)?.[currentRound]?.personalNote ?? "";
  const roundKey = `round${currentRound}` as const;
  const roundTagState: any = (tagAnswers as any)?.[roundKey] ?? {};
  const canProceedRound =
    selectedOption === "none"
      ? noneText.trim().length > 0
      : selectedOption === "image" &&
        typeof selectedImage === "number" &&
        (roundTagState?.q1?.length ?? 0) > 0 &&
        (roundTagState?.q2?.length ?? 0) > 0 &&
        (roundTagState?.q3?.length ?? 0) > 0;

  const toggleTagSelection = (rk: string, qk: string, tag: string) => {
    setTagAnswers((prev: any) => {
      const currentTags: string[] = prev?.[rk]?.[qk] ?? [];
      const exists = currentTags.includes(tag);
      let updatedTags: string[];
      if (exists) updatedTags = currentTags.filter((t) => t !== tag);
      else {
        if (currentTags.length >= 2) return prev;
        updatedTags = [...currentTags, tag];
      }
      return {
        ...prev,
        [rk]: {
          ...prev[rk],
          [qk]: updatedTags,
        },
      };
    });

    // Keep existing `answers` payload in sync for API usage.
    setAnswers((prev) => {
      const current: any = (prev as any)?.[currentRound] ?? {};
      const existing: any = current.answers ?? {};
      const nextForQuestion = (() => {
        const base: string[] = Array.isArray((tagAnswers as any)?.[rk]?.[qk])
          ? ((tagAnswers as any)[rk][qk] as string[])
          : [];
        // Note: state updates are async; we only use this for best-effort sync and recompute below in effect-free way.
        return base;
      })();
      const merged = { ...existing, [qk]: nextForQuestion };
      return {
        ...(prev as any),
        [currentRound]: {
          ...current,
          answers: merged,
          tags: [
            ...(Array.isArray(merged.q1) ? merged.q1 : []),
            ...(Array.isArray(merged.q2) ? merged.q2 : []),
            ...(Array.isArray(merged.q3) ? merged.q3 : []),
          ].filter(Boolean),
        },
      };
    });
  };

  const setRoundText = (rk: string, value: string) => {
    setTagAnswers((prev: any) => ({
      ...prev,
      [rk]: { ...prev[rk], text: value },
    }));
    setPersonalNote(value);
  };

  const setProgressiveAnswer = (qKey: "q1" | "q2" | "q3", value: any) => {
    // legacy hook remains, but UI now uses tagAnswers via onToggleTagSelection
    setAnswers((prev) => {
      const current = (prev as any)?.[currentRound] ?? {};
      const nextAnswers = { ...(current.answers ?? {}), [qKey]: value };
      const tags = [
        ...(Array.isArray(nextAnswers.q1) ? nextAnswers.q1 : nextAnswers.q1 ? [nextAnswers.q1] : []),
        ...(Array.isArray(nextAnswers.q2) ? nextAnswers.q2 : nextAnswers.q2 ? [nextAnswers.q2] : []),
        ...(Array.isArray(nextAnswers.q3) ? nextAnswers.q3 : nextAnswers.q3 ? [nextAnswers.q3] : []),
      ].filter(Boolean);
      return {
        ...(prev as any),
        [currentRound]: {
          ...current,
          answers: nextAnswers,
          tags,
        },
      };
    });
  };

  const setPersonalNote = (value: string) => {
    setAnswers((prev) => {
      const current = (prev as any)?.[currentRound] ?? {};
      return {
        ...(prev as any),
        [currentRound]: {
          ...current,
          personalNote: value,
          text: value,
        },
      };
    });
  };

  const handleNext = async () => {
    if (!canProceedRound) return;

    if (currentRound === 1 && !hasOpenedDisclaimer && !disclaimerBypassRef.current) {
      setShowDisclaimer(true);
      setHasOpenedDisclaimer(true);
      setCanProceed(false);
      setDisclaimerSecondsLeft(5);
      const start = Date.now();
      const interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - start) / 1000);
        const left = Math.max(0, 5 - elapsed);
        setDisclaimerSecondsLeft(left);
      }, 250);
      window.setTimeout(() => {
        window.clearInterval(interval);
        setDisclaimerSecondsLeft(0);
        setCanProceed(true);
      }, 5000);
      return;
    }
    disclaimerBypassRef.current = false;

    const nextRound = getNextRound(currentRound, INDIVIDUAL_TOTAL_ROUNDS);

    setAnswers((prev) => {
      const next = persistCurrentRoundIntoAnswers({
        answers: prev,
        currentRound,
        selectedOption: selectedOption ?? undefined,
        selectedImage,
        textValue,
        noneText,
        selectedTagsForRound: selectedTags[currentRound] ?? [],
        getRoundTag,
      });
      answersRef.current = next;
      return next;
    });

    if (nextRound !== null) {
      setCurrentRound(nextRound);
    } else {
      setPhase("review");
    }
  };

  const handleReviewEdit = (roundNumber: number) => {
    setError(null);
    setPhase("rounds");
    setCurrentRound(roundNumber);
  };

  const handleReviewContinue = () => {
    void generateReflection(answersRef.current);
  };

  const generateReflection = async (selectionsOverride?: Record<number, RoundAnswer> | null) => {
    setPhase("generating");
    setError(null);

    type AnswerMap = Record<number, RoundAnswer>;

    let finalAnswers: AnswerMap;

    if (selectionsOverride && typeof selectionsOverride === "object") {
      finalAnswers = selectionsOverride;
    } else {
      finalAnswers = buildReflectionSummary(
        answers as Record<
          number,
          {
            selectedType?: "image" | "none";
            image?: number | null;
            selectedImageId?: number | null;
            tag?: string;
            tags?: string[];
            userExplanation?: string;
            text: string;
            noneText?: string;
          }
        >,
        currentRound,
        selectedIndex,
        textValue,
        selectedOption === "none",
        noneText
      ) as AnswerMap;

      // Ensure last-round tag is present when an image is selected.
      if (selectedImage !== "none" && selectedIndex != null) {
        const tag =
          getRoundTag(currentRound, selectedIndex) ?? finalAnswers[currentRound]?.tag;
        finalAnswers[currentRound] = {
          ...(finalAnswers[currentRound] ?? {}),
          selectedType: "image",
          image: selectedIndex,
          selectedImageId: selectedIndex,
          tag: tag ?? finalAnswers[currentRound]?.tag,
          tags: selectedTags[currentRound] ?? finalAnswers[currentRound]?.tags ?? [],
        };
      }
      if (selectedImage === "none") {
        finalAnswers[currentRound] = {
          ...(finalAnswers[currentRound] ?? {}),
          selectedType: "none",
          selectedImage: "none",
          image: null,
          selectedImageId: null,
          tag: undefined,
          tags: [],
          userExplanation: noneText,
          noneText,
          text: noneText,
        };
      }
    }

    try {
      recordFeatureUse("generate");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selections: finalAnswers,
          depthMode,
          context: buildRelationshipContext("generate"),
        }),
      });

      if (!response.ok) {
        throw new Error("AI generation failed");
      }

      const data = await response.json();
      setReflection(data.result);
      setStructuredResult(data.structured ?? null);
      setGuidingReflection(Array.isArray(data.guidingReflection) ? data.guidingReflection.filter(Boolean) : null);
      setRound5SpaceBetween(parseRound5SpaceBetweenFromApi(data));
      setBrutalTruth(typeof data.brutalTruth === "string" ? data.brutalTruth.trim() || null : null);
      const simpleLines = parseInSimpleWordsFromApi(data);
      setInSimpleWords(simpleLines.length > 0 ? simpleLines : null);
      setEmotionalTag(typeof data.emotionalTag === "string" ? data.emotionalTag.trim() || null : null);
      setTrackerInsight(typeof data.trackerInsight === "string" ? data.trackerInsight.trim() || null : null);
      setCalendarState(
        typeof data.calendarState === "string" ? data.calendarState.trim().toLowerCase() || null : null
      );
      setDangerousQuestion(
        typeof data.dangerousQuestion === "string" ? data.dangerousQuestion.trim() || null : null
      );
      setShadowInsight(
        typeof data.shadowInsight === "string" ? data.shadowInsight.trim() || null : null
      );
      const sig = buildEmotionSessionSignature({
        resultPreview: data.result,
        brutalTruth: typeof data.brutalTruth === "string" ? data.brutalTruth : "",
        emotionalTag: typeof data.emotionalTag === "string" ? data.emotionalTag : "",
        sessionType: "individual",
      });
      const tracked = tryRecordEmotionTrackerSession({
        emotionalTag: typeof data.emotionalTag === "string" ? data.emotionalTag : null,
        trackerInsight: typeof data.trackerInsight === "string" ? data.trackerInsight : null,
        brutalTruth: typeof data.brutalTruth === "string" ? data.brutalTruth : null,
        resultPreview: data.result,
        sessionType: "individual",
        sessionSignature: sig,
        calendarState: typeof data.calendarState === "string" ? data.calendarState : null,
      }) as EmotionTrackedSession | null;
      if (tracked) {
        void insertEmotionTrackerRowOncePerSession(sig, {
          emotionalTag: tracked.tag,
          shortInsight: tracked.insight,
          sessionType: "individual",
          calendarState: tracked.calendarState,
        });
      }
      setPhase("complete");
    } catch (err) {
      console.error("Reflect page error:", err);
      setError("Unable to generate your reflection. Please try again.");
      setPhase("review");
    }
  };

  // Record referral completion when a referred user reaches the result (once)
  useEffect(() => {
    if (!reflection || phase !== "complete") return;
    try {
      const referrerSlug = sessionStorage.getItem("luma_referrer");
      if (referrerSlug) {
        sessionStorage.removeItem("luma_referrer");
        fetch("/api/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referrerSlug }),
        }).catch(() => {});
      }
    } catch {}
  }, [reflection, phase]);

  // Your Inner Shift: only when user has a previous saved reflection
  useEffect(() => {
    if (!reflection || phase !== "complete") return;
    const prev = getLastIndividualReflection();
    if (!prev?.content) {
      setPreviousReflection(null);
      setInnerShiftText(null);
      return;
    }
    setPreviousReflection(prev);
    setInnerShiftLoading(true);
    setInnerShiftText(null);
    fetch("/api/compare-reflections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        previousContent: prev.content,
        currentContent: reflection,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Compare failed"))))
      .then((data) => setInnerShiftText(data.comparison))
      .catch(() => setInnerShiftText(null))
      .finally(() => setInnerShiftLoading(false));
  }, [reflection, phase]);

  // A Letter From Your Inner World: only when user has >= 3 reflections (2+ saved when viewing this result)
  useEffect(() => {
    if (!reflection || phase !== "complete") return;
    const count = getIndividualReflectionCount();
    if (count < 2) {
      setShowLetterSection(false);
      setLetter(null);
      return;
    }
    setShowLetterSection(true);
    setLetterLoading(true);
    setLetter(null);
    fetch("/api/letter-from-inner-world", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reflectionContent: reflection }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Letter failed"))))
      .then((data) => setLetter(data.letter))
      .catch(() => setLetter(null))
      .finally(() => setLetterLoading(false));
  }, [reflection, phase]);

  const resetExperience = () => {
    setPhase("intro");
    setCurrentRound(1);
    setAnswers({});
    setTextValue("");
    setSelectedIndex(null);
    setReflection(null);
    setStructuredResult(null);
    setGuidingReflection(null);
    setRound5SpaceBetween(null);
    setBrutalTruth(null);
    setInSimpleWords(null);
    setDangerousQuestion(null);
    setShadowInsight(null);
    setEmotionalTag(null);
    setTrackerInsight(null);
    setError(null);
    setSaveEmail("");
    setSavedWithEmail(false);
    setSaveError(null);
    setPreviousReflection(null);
    setInnerShiftText(null);
    setShowLetterSection(false);
    setLetter(null);
  };

  const showRounds = phase === "rounds" && !reflection && !error;
  const showReview = phase === "review" && !reflection;
  const roundData = reflectionRounds.find((r) => r.roundNumber === currentRound);
  const mode = "individual" as const;

  const evidence = (() => {
    // 2–4 selected image thumbnails from rounds 1–4.
    const selectedThumbs: Array<{ src: string; alt: string }> = [];
    for (const r of [1, 2, 3, 4]) {
      const a: any = (answers as any)?.[r];
      const idxRaw = a?.selectedImageId ?? a?.image;
      const idx = typeof idxRaw === "number" && Number.isFinite(idxRaw) ? idxRaw : null;
      if (idx == null) continue;
      const roundCfg = reflectionRounds.find((x) => x.roundNumber === r);
      const img = Array.isArray(roundCfg?.images) ? roundCfg.images[idx] : null;
      if (typeof img === "string" && img.trim()) {
        selectedThumbs.push({ src: img.trim(), alt: `Round ${r} selection` });
      }
    }
    const thumbs = selectedThumbs.slice(0, 4);

    // Top tags (short, proofy).
    const localTagsForWhy = extractTagSignalsFromSelections(answers);
    const tagCandidates = (localTagsForWhy ?? [])
      .map((t) => String(t).trim().toLowerCase())
      .filter((t) => t && t.length <= 18 && !t.includes(".") && !t.includes(",") && t.split(/\s+/).length <= 2);
    const uniqueTags: string[] = [];
    for (const t of tagCandidates) {
      if (uniqueTags.includes(t)) continue;
      uniqueTags.push(t);
      if (uniqueTags.length >= 6) break;
    }

    // Optional user words (Round 5 relationship reflection if present).
    const r5: any = (answers as any)?.[5];
    const relationshipTags: string[] = Array.isArray(r5?.relationshipTags)
      ? r5.relationshipTags
          .filter((x: unknown): x is string => typeof x === "string" && Boolean(x.trim()))
          .slice(0, 4)
      : [];
    const relationshipSummary =
      typeof r5?.relationshipSummary === "string" ? r5.relationshipSummary.trim() : "";

    const label =
      uniqueTags.includes("calm") || uniqueTags.includes("quiet") || uniqueTags.includes("avoidance")
        ? "You leaned toward quieter, low‑intensity scenes"
        : uniqueTags.includes("tension") || uniqueTags.includes("instability")
          ? "You leaned toward strain and instability"
          : "Your choices kept returning to the same emotional flavor";

    const explanation =
      uniqueTags.includes("avoidance") || uniqueTags.includes("distance") || uniqueTags.includes("disconnection")
        ? "Your choices consistently avoided intensity and leaned toward emotional safety."
        : uniqueTags.includes("overthinking") || uniqueTags.includes("internal_conflict")
          ? "Your choices clustered around internal noise and tension."
          : "Your choices clustered around safety, distance, and control.";

    return { thumbs, uniqueTags, relationshipTags, relationshipSummary, label, explanation };
  })();

  const selectedImagesForWhy = (() => {
    const out: string[] = [];
    for (const k of Object.keys(answers)) {
      const round = Number(k);
      const v: any = (answers as any)[k];
      if (!Number.isFinite(round) || !v || typeof v !== "object") continue;
      const idxRaw = v.selectedImageId ?? v.image;
      const idx = typeof idxRaw === "number" && Number.isFinite(idxRaw) ? idxRaw : null;
      if (idx != null) out.push(`r${round}${idx + 1}`);
      const imageId = typeof v.imageId === "string" ? v.imageId.trim() : "";
      if (imageId) out.push(imageId);
    }
    return out;
  })();

  const tagsForWhy = extractTagSignalsFromSelections(answers);
  const why = structuredResult
    ? buildWhyThisIsYou({
        selectedImages: selectedImagesForWhy,
        tags: tagsForWhy,
        primaryPattern: structuredResult.pattern,
      })
    : null;
  const costTruth =
    structuredResult && why
      ? buildCostAndBrutalTruth({
          primaryPattern: structuredResult.pattern,
          tags: tagsForWhy,
          interpretation: why.interpretation,
        })
      : null;

  const tension =
    structuredResult
      ? buildTension({
          pattern: structuredResult.pattern,
          themeTitle: structuredResult.theme?.title,
          toneTitle: structuredResult.tone?.title,
          signals: tagsForWhy,
          relationshipTags: (answers as any)?.[5]?.relationshipTags,
          relationshipSummary: (answers as any)?.[5]?.relationshipSummary,
        })
      : null;

  const actionTrigger =
    structuredResult
      ? buildActionTrigger({
          pattern: structuredResult.pattern,
          toneTitle: structuredResult.tone?.title,
          emotionalTags: tagsForWhy,
          userText: String((answers as any)?.[5]?.relationshipSummary ?? ""),
          shiftSeed: structuredResult.shift,
        })
      : null;
  const handleJourneyCta = () => {
    if (planLoading) return;
    if (plan === "premium") {
      router.push("/timeline?journey=1");
      return;
    }
    router.push("/couples/checkout?source=individual-result");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
      <Navigation />

      <main className="pt-20 pb-12">
        {/* Intro Phase */}
        {phase === "intro" && (
          <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 text-center">
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">
              Individual Reflection
            </h1>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {reflectIntroPrimary(depthMode)}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {reflectIntroSecondary(depthMode)}
            </p>

            <div className="mt-8 max-w-md mx-auto">
              <DepthModeSelector
                value={depthMode}
                onChange={setDepthMode}
                variant="light"
                className="mb-8 text-left"
              />
            </div>

            <div className="mt-2 max-w-md mx-auto text-left">
              <label className="block text-sm text-muted-foreground mb-2">
                Email me a reminder (optional)
              </label>
              <input
                type="email"
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                If you leave before finishing, we can remind you to come back.
              </p>
            </div>

            <button
              onClick={async () => {
                await registerReminder(reminderEmail);
                setPhase("rounds");
              }}
              className="mt-10 px-8 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors"
            >
              Begin
            </button>
          </div>
        )}

        {/* Rounds: use TestRound with existing test data */}
        {showRounds && (
          <div
            key={currentRound}
            className="transition-all duration-500 ease-out"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? "translateY(12px)" : "translateY(0)",
            }}
          >
            {error && (
              <div className="max-w-[720px] mx-auto px-6 mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-sm text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            {roundData && (
              <TestRound
                round={roundData.roundNumber}
                question={roundData.question}
                reflectionLines={roundData.reflectionLines}
                images={roundData.images}
                selectedIndex={typeof selectedImage === "number" ? selectedImage : null}
                onSelectImage={handleSelectImage}
                tags={(roundData.tags ?? []) as string[]}
                selectedTags={(selectedTags[currentRound] ?? []) as string[]}
                onToggleTag={toggleTag}
                progressiveAnswers={progressive}
                onSetProgressiveAnswer={setProgressiveAnswer}
                personalNote={personalNote}
                onPersonalNoteChange={setPersonalNote}
                tagAnswers={tagAnswers}
                onToggleTagSelection={toggleTagSelection}
                onTagTextChange={setRoundText}
                selectedOption={selectedOption}
                onSelectNone={handleNoneClick}
                noneText={noneText}
                onNoneTextChange={setNoneText}
                textValue={textValue}
                onTextChange={setTextValue}
                canProceed={canProceedRound}
                onNext={handleNext}
                showNone={showNone}
                totalRounds={INDIVIDUAL_TOTAL_ROUNDS}
                showProgressBar
                roundTitles={reflectionRounds
                  .filter((r) => r.roundNumber <= INDIVIDUAL_TOTAL_ROUNDS)
                  .map((r) => r.question)}
                spaceBetweenRound={false}
                onBack={handleBack}
              />
            )}
          </div>
        )}

        {showDisclaimer ? (
          <div className="fixed inset-0 z-[300] flex items-center justify-center px-6 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-[420px] luma-glass border border-white/10 p-6 animate-in fade-in zoom-in-95 duration-300">
              <h2 className="font-serif text-[22px] text-foreground [font-family:var(--font-serif-display)]">
                Before you continue
              </h2>
              <p className="mt-3 text-sm text-white/75 leading-relaxed">
                Answers in your own words help Luma understand you better — and create a sharper, more personal reflection.
              </p>
              <p className="mt-2 text-xs text-white/45">
                You can skip this, but your results may feel more generic.
              </p>
              <button
                type="button"
                disabled={!canProceed}
                onClick={() => {
                  if (!canProceed) return;
                  setShowDisclaimer(false);
                  disclaimerBypassRef.current = true;
                  void handleNext();
                }}
                className="mt-6 w-full min-h-[44px] rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.2)] transition-opacity disabled:opacity-60"
              >
                {canProceed ? "Continue" : `Continue (${disclaimerSecondsLeft}s)`}
              </button>
            </div>
          </div>
        ) : null}

        {showReview && (
          <ReviewAnswersScreen
            answers={answers}
            maxRound={INDIVIDUAL_TOTAL_ROUNDS}
            onEdit={handleReviewEdit}
            onContinue={handleReviewContinue}
            errorMessage={error}
          />
        )}

        {/* Generating Phase */}
        {phase === "generating" && (
          <div className="max-w-2xl mx-auto px-6 py-24 text-center">
            <p
              key={generatingMessageIdx}
              className="font-serif text-xl text-foreground transition-all duration-500 animate-luma-fade-only"
            >
              {AI_STATUS_MESSAGES[generatingMessageIdx]}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Taking a moment to notice the patterns that emerged
            </p>
          </div>
        )}

        {/* Complete Phase — premium reading experience */}
        {phase === "complete" && reflection && (
          <div className="max-w-[680px] mx-auto px-6 py-16 md:py-20">
            <div className="animate-luma-fade-in space-y-4 md:space-y-5" style={{ animationDelay: "120ms" }}>
              {mode === "individual" && structuredResult ? (
                <>
                  {/* 1) Pattern */}
                  <IndividualResultCard badge="YOUR REFLECTION" data={structuredResult} variant="minimal" />

                  {/* Evidence layer */}
                  <section className="mx-auto w-full max-w-[420px] rounded-3xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/20">
                    <p className="text-sm text-white/70">What shaped this</p>

                    {evidence.thumbs.length > 0 ? (
                      <>
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {evidence.thumbs.map((t) => (
                            <div
                              key={t.alt}
                              className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
                            >
                              <Image
                                src={normalizePublicImageSrc(t.src)}
                                alt={t.alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 420px) 25vw, 110px"
                              />
                              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-xs text-white/60">{evidence.label}</p>
                      </>
                    ) : null}

                    {evidence.uniqueTags.length > 0 ? (
                      <div className="mt-3">
                        <p className="text-xs text-white/60">You chose:</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {evidence.uniqueTags.map((t) => (
                            <span
                              key={t}
                              className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/[0.04] text-white/70"
                            >
                              {t}
                            </span>
                          ))}
                          {evidence.relationshipTags.map((t) => (
                            <span
                              key={`rt-${t}`}
                              className="px-3 py-1 rounded-full text-xs border border-white/20 bg-white/[0.07] text-white/80"
                            >
                              {String(t).toLowerCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <p className="mt-3 text-sm text-white/70 leading-relaxed line-clamp-2">
                      {evidence.explanation}
                    </p>

                    {evidence.relationshipSummary ? (
                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                        <p className="text-xs text-white/60">You described it as:</p>
                        <p className="mt-1 text-sm text-white/80 leading-relaxed line-clamp-2">
                          “{evidence.relationshipSummary}”
                        </p>
                      </div>
                    ) : null}
                  </section>

                  {/* The tension */}
                  {tension ? <TensionCard tension={tension} /> : null}

                  {/* 2) Why this fits you */}
                  {why ? (
                    <section className="mx-auto w-full max-w-[420px] rounded-3xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/20">
                      <h3 className="text-white text-base font-medium">Why this fits you</h3>
                      <p className="mt-3 text-sm text-white/70 leading-relaxed">{why.observation}</p>
                      <p className="mt-3 text-sm text-white/70 leading-relaxed">{why.interpretation}</p>
                      <p className="mt-3 text-sm text-white/70 leading-relaxed">{why.conclusion}</p>
                    </section>
                  ) : null}

                  {/* 3) What this is costing you */}
                  {costTruth?.cost ? (
                    <section className="mx-auto w-full max-w-[420px] rounded-3xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/20">
                      <h3 className="text-white text-base font-medium">What this is costing you</h3>
                      <p className="mt-3 text-sm text-white/70 leading-relaxed line-clamp-2">{costTruth.cost}</p>
                    </section>
                  ) : null}

                  {/* 4) The truth you avoid */}
                  {costTruth?.brutal_truth ? (
                    <section className="mx-auto w-full max-w-[420px] rounded-3xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/20">
                      <h3 className="text-white text-base font-medium">The truth you avoid</h3>
                      <p className="mt-3 text-sm text-white/70 leading-relaxed line-clamp-2">{costTruth.brutal_truth}</p>
                    </section>
                  ) : null}

                  {/* 5) Action trigger */}
                  {actionTrigger ? <ActionTriggerCard text={actionTrigger} /> : null}

                  {/* 6) Sit with this (guiding reflection) */}
                  {Array.isArray(guidingReflection) && guidingReflection.length > 0 ? (
                    <section className="mx-auto w-full max-w-[420px] rounded-3xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-white/20">
                      <h3 className="text-white text-base font-medium">Sit with this</h3>
                      <div className="mt-3 space-y-3">
                        {guidingReflection.slice(0, 3).map((q) => (
                          <p key={q} className="text-sm text-white/70 leading-relaxed">
                            {q}
                          </p>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {/* Share trigger */}
                  <div className="mx-auto w-full max-w-[420px] pt-1 text-center">
                    <p className="text-sm text-white/60">This felt accurate?</p>
                    <button
                      type="button"
                      onClick={async () => {
                        const el = storyCardRef.current;
                        if (!el || storyLoading) return;
                        setStoryLoading(true);
                        try {
                          await shareStoryFromElement(el, {
                            filename: "luma-story.png",
                            title: "My Luma pattern",
                            text: "This felt accurate.",
                          });
                        } finally {
                          setStoryLoading(false);
                        }
                      }}
                      className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/80 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-60"
                      disabled={storyLoading}
                    >
                      {storyLoading ? "Preparing…" : "Share your pattern"}
                    </button>
                  </div>

                  {/* Retention messaging */}
                  <section className="mx-auto w-full max-w-[420px] rounded-3xl p-5 border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.02)] text-center">
                    <p className="text-sm text-white/80">Your pattern changes over time.</p>
                    <p className="mt-2 text-sm text-white/60">Come back in a few days and see what shifts.</p>
                  </section>

                  {/* Conversion hook: individual → couple */}
                  <section className="mx-auto w-full max-w-[420px] rounded-3xl p-5 border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.03)] transition-all duration-300 hover:border-white/20 text-center">
                    <p className="text-sm text-white/80">
                      This is your pattern alone.
                      <span className="block h-2" aria-hidden />
                      But what happens between you and them is different.
                    </p>
                    <Link
                      href="/couple-hub"
                      className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.2)] transition-opacity hover:opacity-90"
                    >
                      See your dynamic together
                    </Link>
                  </section>
                </>
              ) : null}
            </div>

            {/* Your Inner Shift — only when user has a previous reflection */}
            {previousReflection && (
              <div className="mt-16 md:mt-20 max-w-[680px] animate-luma-fade-in" style={{ animationDelay: "250ms" }}>
                <h2 className="text-foreground text-xl md:text-2xl [font-family:var(--font-serif-display)] mb-4 border-b border-white/10 pb-3">
                  Your Inner Shift
                </h2>
                {innerShiftLoading && (
                  <p className="text-muted-foreground text-base italic">Noting how your reflection has shifted...</p>
                )}
                {!innerShiftLoading && innerShiftText && (
                  <>
                    <p className="text-foreground/90 text-base leading-[1.8] font-sans">
                      {innerShiftText}
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="luma-glass border border-white/10 p-4">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Then</p>
                        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4">
                          {previousReflection.content.replace(/\n/g, " ").slice(0, 180)}…
                        </p>
                      </div>
                      <div className="luma-glass border border-white/10 p-4">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Now</p>
                        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4">
                          {reflection.replace(/\n/g, " ").slice(0, 180)}…
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* A Letter From Your Inner World — only when reflectionCount >= 3 (2+ saved) */}
            {showLetterSection && (
              <div className="mt-16 md:mt-20 max-w-[680px] animate-luma-fade-in" style={{ animationDelay: "300ms" }}>
                <h2 className="text-foreground text-xl md:text-2xl [font-family:var(--font-serif-display)] mb-4 border-b border-white/10 pb-3">
                  A Letter From Your Inner World
                </h2>
                {letterLoading && (
                  <p className="text-muted-foreground text-base italic">Writing your letter...</p>
                )}
                {!letterLoading && letter && (
                  <>
                    <p className="text-foreground/90 text-base leading-[1.9] font-sans whitespace-pre-wrap [font-family:var(--font-serif-display)]">
                      {letter}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={letterStoryLoading}
                        onClick={async () => {
                          setLetterStoryLoading(true);
                          try {
                            const blob = await generateLetterStoryBlob(letter);
                            await shareOrDownloadStoryCard(blob, "luma-letter-story.png");
                          } catch (e) {
                            console.warn("Letter story share failed", e);
                          } finally {
                            setLetterStoryLoading(false);
                          }
                        }}
                        className="px-5 py-3 rounded-xl border border-white/10 text-foreground text-sm font-medium hover:bg-white/[0.08] transition-colors disabled:opacity-60"
                      >
                        {letterStoryLoading ? "Preparing…" : "Share Letter"}
                      </button>
                      <button
                        type="button"
                        disabled={letterStoryLoading}
                        onClick={async () => {
                          setLetterStoryLoading(true);
                          try {
                            const blob = await generateLetterStoryBlob(letter);
                            downloadStoryCard(blob, "luma-letter-story.png");
                          } catch (e) {
                            console.warn("Letter story download failed", e);
                          } finally {
                            setLetterStoryLoading(false);
                          }
                        }}
                        className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.2)] transition-opacity hover:opacity-90 disabled:opacity-60"
                      >
                        {letterStoryLoading ? "Preparing…" : "Download Story"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Reflection Mirror — compare with previous reflection (no AI, saved data only) */}
            {previousReflection?.content && (
              <div className="mt-16 md:mt-20 max-w-[680px] animate-luma-fade-in" style={{ animationDelay: "300ms" }}>
                <h2 className="text-foreground text-xl md:text-2xl [font-family:var(--font-serif-display)] mb-4 border-b border-white/10 pb-3">
                  Reflection Mirror
                </h2>
                <p className="text-foreground/90 text-base leading-[1.8] font-sans">
                  {getReflectionMirrorMessage(previousReflection.content, reflection)}
                </p>
              </div>
            )}

            {/* Explore the Space Between — couple mode + Connect Inner Worlds */}
            <div className="mt-16 md:mt-20 animate-luma-fade-in" style={{ animationDelay: "400ms" }}>
              <div className="luma-glass border border-white/10 p-6 md:p-8 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-shadow duration-300">
                <h2 className="text-foreground text-xl md:text-2xl font-medium border-b border-white/10 pb-3 mb-4 [font-family:var(--font-serif-display)]">
                  Explore the Space Between
                </h2>
                <p className="text-muted-foreground text-base leading-[1.8] mb-6">
                  Some patterns only reveal themselves between two inner worlds. Invite someone to connect your inner worlds.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        if (reflection) sessionStorage.setItem(INVITER_REFLECTION_KEY, reflection);
                        router.push("/connect");
                      } catch (e) {
                        console.warn("SessionStorage failed", e);
                        router.push("/connect");
                      }
                    }}
                    className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.2)] transition-opacity hover:opacity-90"
                  >
                    Connect Inner Worlds
                  </button>
                  <Link
                    href="/couple-hub"
                    className="inline-flex px-5 py-3 rounded-xl border border-white/10 text-foreground text-sm font-medium hover:bg-white/[0.08] transition-colors"
                  >
                    Explore Couple Mode
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-16 md:mt-20 max-w-[680px] mx-auto w-full animate-luma-fade-in luma-glass border border-white/10 p-6 md:p-8">
              <PatternOverTimeSection variant="light" />
            </div>

            {/* Share / Download Story — DOM card + html-to-image */}
            <div className="mx-auto mt-10 w-full min-w-0 max-w-[680px]">
              <p className="mb-3 text-center text-xs text-muted-foreground">Your shareable story card</p>
              <StoryCard
                ref={storyCardRef}
                pattern={structuredResult?.pattern || "Your inner pattern"}
                description={structuredResult?.description || "When things get close, you go quiet — then blame yourself for it."}
                theme={structuredResult?.theme || { title: "Safety", subtitle: "protecting yourself" }}
                tone={structuredResult?.tone || { title: "Soft", subtitle: "not dramatic" }}
                coreLine={structuredResult?.core_line || costTruth?.brutal_truth || "You call it ‘peace’ when it’s actually avoidance."}
              />
              <StoryShareButtons
                targetRef={storyCardRef}
                loading={storyLoading}
                setLoading={setStoryLoading}
                filename="luma-story.png"
                canvasFallback={{
                  mode: "individual",
                  userName: getCurrentUserName(),
                }}
                className="mt-5"
                downloadLabel="Save Story"
              />
            </div>

            {/* Save Your Reflection — account creation (name, email, password) */}
            {!savedWithEmail ? (
              <div className="mt-16 md:mt-20 luma-glass p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-white/10">
                <h2 className="text-foreground text-xl [font-family:var(--font-serif-display)] mb-2">
                  Save Your Reflection
                </h2>
                <p className="text-muted-foreground text-base leading-relaxed mb-6">
                  Create an account to save this reflection. Your name will be used to personalize your shareable story card.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaveError(null);
                    const name = saveName.trim();
                    const email = saveEmail.trim();
                    const password = savePassword;
                    if (!name) {
                      setSaveError("Please enter your name.");
                      return;
                    }
                    if (!email) {
                      setSaveError("Please enter your email.");
                      return;
                    }
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      setSaveError("Please enter a valid email address.");
                      return;
                    }
                    if (!password || password.length < 6) {
                      setSaveError("Please enter a password (at least 6 characters).");
                      return;
                    }
                    try {
                      saveIndividualReflectionWithEmail({
                        content: reflection,
                        brutalTruth,
                        dangerousQuestion,
                        shadowInsight,
                        inSimpleWords,
                        howToReadTags: resolveHowToReadTagsFromSelections(answers),
                        email,
                        name,
                        selectedImages: selectedImagesForSave(answers),
                      });
                      // Supabase auth + cloud memory sync (best effort)
                      const signInRes = await signInWithPassword(email, password);
                      if (signInRes.error) {
                        const signUpRes = await signUpWithPassword(email, password);
                        if (!signUpRes.error) {
                          await signInWithPassword(email, password);
                        }
                      }
                      const saveSig = buildEmotionSessionSignature({
                        resultPreview: reflection,
                        brutalTruth: brutalTruth ?? "",
                        emotionalTag: emotionalTag ?? "",
                        sessionType: "individual",
                      });
                      void insertEmotionTrackerRowOncePerSession(saveSig, {
                        emotionalTag:
                          (emotionalTag && emotionalTag.trim()) ||
                          (brutalTruth && brutalTruth.trim().split(/\s+/).slice(0, 4).join(" ")) ||
                          "Reflection",
                        shortInsight:
                          (trackerInsight && trackerInsight.trim()) ||
                          (brutalTruth && brutalTruth.trim()) ||
                          (reflection && reflection.replace(/\s+/g, " ").trim().slice(0, 220)) ||
                          "—",
                        sessionType: "individual",
                        calendarState: resolveCalendarMood(
                          (emotionalTag && emotionalTag.trim()) ||
                            (brutalTruth && brutalTruth.trim().split(/\s+/).slice(0, 4).join(" ")) ||
                            "Reflection",
                          (trackerInsight && trackerInsight.trim()) ||
                            (brutalTruth && brutalTruth.trim()) ||
                            (reflection && reflection.replace(/\s+/g, " ").trim().slice(0, 220)) ||
                            "—",
                          calendarState
                        ),
                      });
                      await saveMemoryForCurrentUser(getMemory());
                      setSavedWithEmail(true);
                      fetch("/api/reminder-register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email,
                          lastReflectionAt: new Date().toISOString(),
                        }),
                      }).catch(() => {});
                    } catch {
                      setSaveError("Could not save. Please try again.");
                    }
                  }}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-foreground outline-none backdrop-blur-sm focus:border-white/10 focus:ring-2 focus:ring-ring/35"
                    aria-label="Name"
                  />
                  <input
                    type="email"
                    value={saveEmail}
                    onChange={(e) => setSaveEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-foreground outline-none backdrop-blur-sm focus:border-white/10 focus:ring-2 focus:ring-ring/35"
                    aria-label="Email"
                  />
                  <input
                    type="password"
                    value={savePassword}
                    onChange={(e) => setSavePassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    minLength={6}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-foreground outline-none backdrop-blur-sm focus:border-white/10 focus:ring-2 focus:ring-ring/35"
                    aria-label="Password"
                  />
                  {saveError && (
                    <p className="text-sm text-destructive">{saveError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-primary px-5 py-3 text-base font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.2)] transition-opacity hover:opacity-90 sm:w-auto"
                  >
                    Save My Reflection
                  </button>
                </form>
              </div>
            ) : (
              <div className="mt-16 md:mt-20 luma-glass border border-white/10 p-6 md:p-8">
                <p className="text-foreground font-medium">
                  Your reflection has been saved.
                </p>
                <p className="text-muted-foreground text-base mt-2 leading-relaxed">
                  Return in 10 days to explore how your inner landscape evolves.
                </p>
              </div>
            )}

            {/* Referral — invite a friend */}
            <div className="mt-16 md:mt-20 luma-glass border border-white/10 p-6 md:p-8">
              <p className="text-foreground font-serif text-lg [font-family:var(--font-serif-display)]">
                Reflection often becomes deeper when shared.
              </p>
              <p className="mt-2 text-muted-foreground text-base leading-relaxed">
                Invite someone to explore their inner world too.
              </p>
              {!referralLinkShown ? (
                <button
                  type="button"
                  onClick={() => {
                    const slug = nameToSlug(getCurrentUserName());
                    const url = typeof window !== "undefined" ? `${window.location.origin}/invite/${slug}` : "";
                    setReferralLink(url);
                    setReferralLinkShown(true);
                  }}
                  className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-opacity hover:opacity-90"
                >
                  Invite a Friend
                </button>
              ) : (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-foreground backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (referralLink && navigator.clipboard) {
                        navigator.clipboard.writeText(referralLink);
                        setReferralCopied(true);
                        setTimeout(() => setReferralCopied(false), 2000);
                      }
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-foreground shadow-[0_0_20px_rgba(0,0,0,0.15)] transition-colors hover:bg-white/[0.1]"
                  >
                    {referralCopied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              )}
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                When someone you invite completes a reflection, you&apos;ll unlock a bonus reflection insight.
              </p>
            </div>

            <div className="mt-10 md:mt-12">
              <div className="luma-glass border border-white/10 p-6 md:p-8 text-center">
                <p className="text-sm text-muted-foreground">This doesn&apos;t change on its own.</p>
                <button
                  type="button"
                  onClick={handleJourneyCta}
                  disabled={planLoading}
                  className="mt-4 w-full rounded-xl bg-[linear-gradient(135deg,rgba(140,110,200,0.95),rgba(105,85,170,0.95))] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.35)] transition-opacity hover:opacity-95 disabled:opacity-60"
                >
                  {planLoading ? "Checking access…" : "Start 28-Day Journey"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/timeline")}
                  className="mt-3 w-full rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.08]"
                >
                  Save to Timeline
                </button>
              </div>
            </div>

            <div className="mt-14 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={resetExperience}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Begin Again
              </button>
              <p className="text-xs text-muted-foreground max-w-sm text-center">
                This reflection is not diagnosis or advice. It is a mirror for your own awareness.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
