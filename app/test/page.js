"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { TestRound } from "@/components/TestRound";
import PreTestScreen from "@/components/PreTestScreen";
import { reflectionLines, questions, rounds, roundTags } from "@/lib/testData";
import { INDIVIDUAL_TOTAL_ROUNDS } from "@/lib/reflection/reflectionRounds";
import {
  resolveHowToReadTagsFromSelections,
  resolveRound5PsychologicalSupplementLines,
  parseInSimpleWordsFromApi,
} from "@/lib/resultHelpers";
import { parseRound5SpaceBetweenFromApi } from "@/lib/reflection/round5OutputGenerator";
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
import { StoryCardFrame } from "@/components/StoryCardFrame";
import { StoryShareButtons } from "@/components/StoryShareButtons";
import { getRoundTag } from "@/lib/reflection/roundTagging";
import { deriveUiFromSavedRound, persistCurrentRoundIntoAnswers } from "@/lib/reflection/roundFlowState";
import { buildRelationshipContext, recordFeatureUse } from "@/lib/relationshipContext";
import { updateMemory } from "@/lib/memory";
import { getMemory } from "@/lib/memory";
import { saveMemoryForCurrentUser, signInWithPassword, signUpWithPassword } from "@/lib/memoryCloud";
import { supabase } from "@/lib/supabase";
import { BrutalTruthHeadline } from "@/components/BrutalTruthHeadline";
import { HowToReadThisVisual } from "@/components/HowToReadThisVisual";
import { InSimpleWordsSection } from "@/components/InSimpleWordsSection";
import { RoundFiveInsightCard } from "@/components/RoundFiveInsightCard";
import { ReviewAnswersScreen } from "@/components/ReviewAnswersScreen";
import { DangerousQuestionBlock } from "@/components/DangerousQuestionBlock";
import { ShadowInsightBlock } from "@/components/ShadowInsightBlock";
import { PatternOverTimeSection } from "@/components/PatternOverTimeSection";
import {
  buildEmotionSessionSignature,
  tryRecordEmotionTrackerSession,
} from "@/lib/emotionalTracker";
import { insertEmotionTrackerRowOncePerSession } from "@/lib/emotionalTrackerSupabase";
import { resolveCalendarMood } from "@/lib/calendarOfUs";

const ROUND_TRANSITION_MS = 500;
const GENERATING_PHASE_2_MS = 3500;
const RESULT_REVEAL_DELAY_S1 = 200;
const RESULT_REVEAL_DELAY_S2 = 500;
const RESULT_REVEAL_DELAY_S3 = 900;

const INVITER_REFLECTION_KEY = "luma_connect_inviter_reflection";

export default function TestPage() {
  const router = useRouter();
  const [depthMode, setDepthMode] = useState("satin");
  const [phase, setPhase] = useState("intro");
  const [started, setStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [answers, setAnswers] = useState({});
  const [selectedTags, setSelectedTags] = useState({});
  const [textValue, setTextValue] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // number | "none" | null
  const [selectedOption, setSelectedOption] = useState(null); // "image" | "none"
  const [noneText, setNoneText] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNone, setShowNone] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState(0);
  const [result, setResult] = useState(null);
  const [brutalTruth, setBrutalTruth] = useState(null);
  const [inSimpleWords, setInSimpleWords] = useState(null);
  const [dangerousQuestion, setDangerousQuestion] = useState(null);
  const [shadowInsight, setShadowInsight] = useState(null);
  const [emotionalTag, setEmotionalTag] = useState(null);
  const [trackerInsight, setTrackerInsight] = useState(null);
  const [calendarState, setCalendarState] = useState(null);
  const [error, setError] = useState(null);
  const [resultReveal, setResultReveal] = useState({ section1: false, section2: false, section3: false });
  const [saveEmail, setSaveEmail] = useState("");
  const [saveName, setSaveName] = useState("");
  const [savePassword, setSavePassword] = useState("");
  const [reminderEmail, setReminderEmail] = useState("");
  const [savedWithEmail, setSavedWithEmail] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const storyCardRef = useRef(null);
  const [previousReflection, setPreviousReflection] = useState(null);
  const [innerShiftText, setInnerShiftText] = useState(null);
  const [innerShiftLoading, setInnerShiftLoading] = useState(false);
  const [showLetterSection, setShowLetterSection] = useState(false);
  const [letter, setLetter] = useState(null);
  const [letterLoading, setLetterLoading] = useState(false);
  const [letterStoryLoading, setLetterStoryLoading] = useState(false);
  const [referralLinkShown, setReferralLinkShown] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [referralCopied, setReferralCopied] = useState(false);
  const [round5SpaceBetween, setRound5SpaceBetween] = useState(null);

  const answersRef = useRef(answers);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    console.log("Current depthMode:", depthMode);
  }, [depthMode]);

  useEffect(() => {
    const loadMemory = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.log("No user logged in");
          return;
        }

        const { data, error } = await supabase
          .from("users_memory")
          .select("memory")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.log("No memory found yet");
          return;
        }

        console.log("Loaded memory:", data?.memory);
      } catch (e) {
        console.log("No memory found yet");
      }
    };

    loadMemory();
  }, []);

  const registerReminder = async (email) => {
    const value = (email || "").trim();
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

    setSelectedImage(ui.selectedImage);
    setSelectedOption(ui.selectedOption);
    setTextValue(ui.textValue);
    setNoneText(ui.noneText);
    setSelectedTags((prev) => ({
      ...prev,
      [currentRound]: ui.tagsForRound,
    }));

    setShowNone(false);
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, ROUND_TRANSITION_MS);

    const timer = setTimeout(() => {
      setShowNone(true);
    }, 20000);

    return () => {
      if (timer) clearTimeout(timer);
      clearTimeout(transitionTimer);
    };
  }, [currentRound, phase]);

  const handleBack = () => {
    if (currentRound <= 1) return;
    setAnswers((prev) => {
      const next = persistCurrentRoundIntoAnswers({
        answers: prev,
        currentRound,
        selectedOption,
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

  useEffect(() => {
    if (!isGenerating) return;
    setGeneratingMessage(0);
    const t = setTimeout(() => setGeneratingMessage(1), GENERATING_PHASE_2_MS);
    return () => clearTimeout(t);
  }, [isGenerating]);

  useEffect(() => {
    if (result == null) return;
    const t1 = setTimeout(() => setResultReveal((r) => ({ ...r, section1: true })), RESULT_REVEAL_DELAY_S1);
    const t2 = setTimeout(() => setResultReveal((r) => ({ ...r, section2: true })), RESULT_REVEAL_DELAY_S2);
    const t3 = setTimeout(() => setResultReveal((r) => ({ ...r, section3: true })), RESULT_REVEAL_DELAY_S3);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [result]);

  // Your Inner Shift: only when user has a previous saved reflection
  useEffect(() => {
    if (!result) return;
    const prev = getLastIndividualReflection();
    if (!prev || !prev.content) {
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
        currentContent: result,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Compare failed"))))
      .then((data) => setInnerShiftText(data.comparison))
      .catch(() => setInnerShiftText(null))
      .finally(() => setInnerShiftLoading(false));
  }, [result]);

  // Record referral completion when a referred user reaches the result (once)
  useEffect(() => {
    if (!result) return;
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
  }, [result]);

  // A Letter From Your Inner World: only when user has >= 3 reflections (i.e. 2+ saved when viewing this result)
  useEffect(() => {
    if (!result) return;
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
      body: JSON.stringify({ reflectionContent: result }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Letter failed"))))
      .then((data) => setLetter(data.letter))
      .catch(() => setLetter(null))
      .finally(() => setLetterLoading(false));
  }, [result]);

  const handleImageSelect = (id) => {
    setSelectedImage(id);
    setSelectedOption("image");
    setNoneText("");
    const tag = getRoundTag(currentRound, id);
    setAnswers((prev) => ({
      ...prev,
      [currentRound]: {
        selectedType: "image",
        image: id,
        selectedImageId: id,
        tag: tag ?? undefined,
        tags: selectedTags[currentRound] ?? [],
        userExplanation: "",
        text: textValue,
      },
    }));
  };

  const toggleTag = (tagValue) => {
    setSelectedTags((prev) => {
      const current = prev[currentRound] || [];
      const next = current.includes(tagValue)
        ? current.filter((t) => t !== tagValue)
        : [...current, tagValue];
      // Auto-fill input text from selected tags (comma-separated)
      setTextValue(next.join(", "));
      // keep answers in sync for AI payload
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
    setSelectedImage("none"); // IMPORTANT: treat like image
    setSelectedOption("none");
    setSelectedTags((prev) => ({ ...prev, [currentRound]: [] }));
    setTimeout(() => {
      document.getElementById("none-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const inputText = selectedOption === "none" ? noneText : textValue;
  const canProceed = inputText.trim().length > 0;

  const handleNext = async () => {
    if (!canProceed) return;

    setAnswers((prev) => {
      const next = persistCurrentRoundIntoAnswers({
        answers: prev,
        currentRound,
        selectedOption,
        selectedImage,
        textValue,
        noneText,
        selectedTagsForRound: selectedTags[currentRound] ?? [],
        getRoundTag,
      });
      answersRef.current = next;
      return next;
    });

    if (currentRound < INDIVIDUAL_TOTAL_ROUNDS) {
      setCurrentRound((prev) => prev + 1);
    } else {
      setPhase("review");
    }
  };

  const handleReviewEdit = (roundNumber) => {
    setError(null);
    setPhase("rounds");
    setCurrentRound(roundNumber);
  };

  const handleReviewContinue = () => {
    void generateResult(answersRef.current);
  };

  const generateResult = async (selectionsOverride = null) => {
    try {
      setIsGenerating(true);
      setError(null);
      recordFeatureUse("generate");

      const finalAnswers =
        selectionsOverride && typeof selectionsOverride === "object"
          ? selectionsOverride
          : {
              ...answers,
              [currentRound]:
                selectedOption === "none"
                  ? {
                      selectedType: "none",
                      selectedImage: "none",
                      image: null,
                      selectedImageId: null,
                      tag: undefined,
                      tags: [],
                      userExplanation: noneText,
                      noneText,
                      text: noneText,
                    }
                  : {
                      selectedType: "image",
                      image: selectedImage,
                      selectedImageId: selectedImage,
                      tag:
                        typeof selectedImage === "number"
                          ? getRoundTag(currentRound, selectedImage) ??
                            answers[currentRound]?.tag ??
                            undefined
                          : undefined,
                      tags: selectedTags[currentRound] ?? [],
                      userExplanation: "",
                      text: textValue,
                    },
            };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selections: finalAnswers,
          depthMode,
          context: buildRelationshipContext("generate"),
        }),
      });
      console.log("API status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API ERROR:", errorText);
        throw new Error("AI generation failed");
      }

      const data = await response.json();
      if (!data?.result || typeof data.result !== "string") {
        console.error("API ERROR: invalid payload", data);
        throw new Error("AI generation failed");
      }

      console.log("Saving memory:", data);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.log("No user logged in");
        } else {
          console.log("User ID:", user.id);
          // Store a unified memory object; include the latest AI result.
          const nextMemory = updateMemory((m) => {
            const now = new Date().toISOString();
            const reflections = Array.isArray(m.reflections) ? m.reflections : [];
            const timeline = Array.isArray(m.timeline) ? m.timeline : [];
            const scores = m.scores ?? { connection: 0, conflict: 0 };

            reflections.push({ result: data, createdAt: now });
            timeline.push({ type: "reflection", date: now });

            return {
              ...m,
              reflections,
              timeline,
              scores: {
                connection: (scores.connection ?? 0) + 1,
                conflict: scores.conflict ?? 0,
              },
              patterns: {
                ...m.patterns,
                emotionalTrends: [
                  ...(Array.isArray(m.patterns?.emotionalTrends) ? m.patterns.emotionalTrends : []),
                  { type: "reflection_completed", at: now },
                ],
              },
            };
          });

          await supabase.from("users_memory").upsert({
            user_id: user.id,
            memory: nextMemory ?? data,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error("API ERROR:", e);
      }

      try {
        const profileData = { user: finalAnswers, partner: null, connection: 60, conflict: 40 };
        localStorage.setItem("luma_profile", JSON.stringify(profileData)); // legacy key (kept)
        updateMemory((m) => {
          const now = new Date().toISOString();
          return {
            ...m,
            profile: { ...(m.profile || {}), updatedAt: now },
            scores: { ...(m.scores || { connection: 0, conflict: 0 }), connection: 60, conflict: 40 },
          };
        });
      } catch {}
      setResult(data.result);
      setRound5SpaceBetween(parseRound5SpaceBetweenFromApi(data));
      setBrutalTruth(typeof data.brutalTruth === "string" ? data.brutalTruth.trim() || null : null);
      const simpleLines = parseInSimpleWordsFromApi(data);
      setInSimpleWords(simpleLines.length > 0 ? simpleLines : null);
      setDangerousQuestion(
        typeof data.dangerousQuestion === "string" ? data.dangerousQuestion.trim() || null : null
      );
      setShadowInsight(
        typeof data.shadowInsight === "string" ? data.shadowInsight.trim() || null : null
      );
      setEmotionalTag(typeof data.emotionalTag === "string" ? data.emotionalTag.trim() || null : null);
      setTrackerInsight(typeof data.trackerInsight === "string" ? data.trackerInsight.trim() || null : null);
      setCalendarState(
        typeof data.calendarState === "string" ? data.calendarState.trim().toLowerCase() || null : null
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
      });
      if (tracked) {
        void insertEmotionTrackerRowOncePerSession(sig, {
          emotionalTag: tracked.tag,
          shortInsight: tracked.insight,
          sessionType: "individual",
          calendarState: tracked.calendarState,
        });
      }
    } catch (err) {
      console.error("AI ERROR:", err);
      setError("AI generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const showRounds = phase === "rounds" && !isGenerating && !error && result == null;
  const showReview = phase === "review" && !isGenerating && !result;
  const generatingMessages = [
    "Your reflection is forming...",
    "Looking for subtle patterns...",
  ];

  const resultParagraphs = result != null ? result.split(/\n\n+/).filter(Boolean) : [];
  const firstParagraph = resultParagraphs[0] ?? "";
  const restParagraphs = resultParagraphs.slice(1);
  const restSplitMid = Math.ceil(restParagraphs.length / 2);
  const deepExplanationParas = restParagraphs.slice(0, restSplitMid);
  const patternBreakdownParas = restParagraphs.slice(restSplitMid);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      {!started ? (
        <PreTestScreen
          email={reminderEmail}
          onEmailChange={(v) => {
            setReminderEmail(v);
            registerReminder(v);
          }}
          depthMode={depthMode}
          onDepthModeChange={setDepthMode}
          onContinue={() => {
            setStarted(true);
            setPhase("rounds");
          }}
        />
      ) : (
        <main className="pt-20 pb-12 max-w-[720px] mx-auto">
        {/* Intro is handled by PreTestScreen (see started state) */}

        {/* Rounds */}
        {showRounds && (
          <div
            key={currentRound}
            className="transition-all duration-500 ease-out"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? "translateY(12px)" : "translateY(0)",
            }}
          >
            <TestRound
              round={currentRound}
              question={questions[currentRound]}
              reflectionLines={reflectionLines[currentRound]}
              images={rounds[currentRound]}
              selectedIndex={typeof selectedImage === "number" ? selectedImage : null}
              onSelectImage={handleImageSelect}
              tags={roundTags[currentRound] ?? []}
              selectedTags={selectedTags[currentRound] ?? []}
              onToggleTag={toggleTag}
              selectedOption={selectedOption}
              onSelectNone={handleNoneClick}
              noneText={noneText}
              onNoneTextChange={setNoneText}
              textValue={textValue}
              onTextChange={setTextValue}
              canProceed={canProceed}
              onNext={handleNext}
              showNone={showNone}
              totalRounds={INDIVIDUAL_TOTAL_ROUNDS}
              spaceBetweenRound={false}
              onBack={handleBack}
            />
          </div>
        )}

        {showReview && (
          <ReviewAnswersScreen
            answers={answers}
            maxRound={INDIVIDUAL_TOTAL_ROUNDS}
            onEdit={handleReviewEdit}
            onContinue={handleReviewContinue}
            errorMessage={error}
          />
        )}

        {/* Generating */}
        {isGenerating && (
          <div className="px-6 py-24 md:py-32 text-center">
            <p
              className="font-serif text-xl text-foreground transition-opacity duration-500"
              key={generatingMessage}
            >
              {generatingMessages[generatingMessage]}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Taking a moment to gather what emerged across your rounds.
            </p>
          </div>
        )}

        {/* Result — structured sections, premium reading experience */}
        {result && (
          <div className="px-6 py-20 md:py-28 max-w-[720px] mx-auto">
            {typeof resolveHowToReadTagsFromSelections === "function" ? (
              <HowToReadThisVisual
                tags={resolveHowToReadTagsFromSelections(answers)}
                round5SupplementLines={(() => {
                  const lines = resolveRound5PsychologicalSupplementLines(answers);
                  return lines.length ? lines : null;
                })()}
                className="mb-8 md:mb-10"
              />
            ) : null}
            {inSimpleWords?.length > 0 ? (
              <InSimpleWordsSection lines={inSimpleWords} className="mb-8 md:mb-10" />
            ) : null}
            <BrutalTruthHeadline text={brutalTruth} />
            <RoundFiveInsightCard payload={round5SpaceBetween} className="mt-8" />
            <h1 className="text-center text-foreground text-3xl md:text-4xl tracking-wide [font-family:var(--font-serif-display)] mb-14">
              Your Reflection
            </h1>

            {/* Section 1: Main insight (full clarity) */}
            <div
              className={`transition-all duration-700 ease-out ${resultReveal.section1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="luma-glass border border-white/10 p-8 mb-8">
                <h2 className="font-serif text-[22px] text-foreground [font-family:var(--font-serif-display)] mb-4">
                  Main insight
                </h2>
                {firstParagraph && (
                  <div
                    className="text-muted-foreground text-base md:text-lg leading-[1.8] [&>br]:block [&>br]:mb-4"
                    style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
                    dangerouslySetInnerHTML={{
                      __html: firstParagraph.replace(/\n/g, "<br>"),
                    }}
                  />
                )}
              </div>
              <div className="px-0">
                <ShadowInsightBlock text={shadowInsight} />
              </div>
            </div>

            {/* Section 2: Gated depth — blur deeper read + pattern breakdown */}
            <div
              className={`transition-all duration-700 ease-out ${resultReveal.section2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="luma-glass border border-white/10 p-8 mb-8 overflow-hidden">
                <div className="relative max-h-[min(340px,52vh)] overflow-hidden rounded-[12px]">
                  <div className="pointer-events-none select-none pr-1">
                    {restParagraphs.length > 0 ? (
                      <>
                        <h3 className="font-serif text-lg text-foreground/90 [font-family:var(--font-serif-display)] mb-3">
                          Deep explanation
                        </h3>
                        <div
                          className="blur-[7px] opacity-[0.88] text-muted-foreground text-base md:text-lg leading-[1.85] [&>br]:block [&>br]:mb-4"
                          style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
                          dangerouslySetInnerHTML={{
                            __html:
                              (deepExplanationParas.length > 0
                                ? deepExplanationParas.join("<br><br>")
                                : ""
                              ).replace(/\n/g, "<br>"),
                          }}
                        />
                        {(patternBreakdownParas.length > 0 || restParagraphs.length > 1) && (
                          <>
                            <h3 className="font-serif text-lg text-foreground/90 [font-family:var(--font-serif-display)] mt-8 mb-3">
                              Emotional pattern breakdown
                            </h3>
                            <div
                              className="blur-[7px] opacity-[0.88] text-muted-foreground text-base md:text-lg leading-[1.85] [&>br]:block [&>br]:mb-4"
                              style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
                              dangerouslySetInnerHTML={{
                                __html:
                                  (patternBreakdownParas.length > 0
                                    ? patternBreakdownParas.join("<br><br>")
                                    : deepExplanationParas[0] ?? ""
                                  ).replace(/\n/g, "<br>"),
                              }}
                            />
                          </>
                        )}
                      </>
                    ) : (
                      <div className="space-y-4 blur-[6px] opacity-70" aria-hidden>
                        <div className="h-3 rounded-full bg-white/10 w-full" />
                        <div className="h-3 w-[92%] rounded-full bg-white/[0.08]" />
                        <div className="h-3 rounded-full bg-white/[0.06] w-[88%]" />
                        <div className="mt-8 h-3 w-[95%] rounded-full bg-white/[0.12]" />
                        <div className="h-3 w-[85%] rounded-full bg-white/[0.08]" />
                      </div>
                    )}
                  </div>
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background"
                    aria-hidden
                  />
                </div>
                <p className="mt-5 px-2 text-center font-sans text-sm italic leading-relaxed text-muted-foreground md:text-[15px]">
                  There&apos;s more beneath this — how the pattern holds, where it tightens, and what
                  usually triggers it next.
                </p>
              </div>

              <div className="mb-8 rounded-[16px] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-md md:p-10">
                <p className="font-serif text-[1.15rem] md:text-xl text-foreground [font-family:var(--font-serif-display)] leading-snug max-w-md mx-auto">
                  See the full pattern in your relationships
                </p>
                <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  The free read stops at the surface. The rest is for when you&apos;re ready to see the
                  whole map.
                </p>
                <Link
                  href="/couple-hub"
                  className="mt-6 inline-flex items-center justify-center rounded-[12px] bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-opacity hover:opacity-90"
                >
                  Go to Couple Mode
                </Link>
              </div>
            </div>

            {/* Section 3: Explore the Space Between */}
            <div
              className={`transition-all duration-700 ease-out ${resultReveal.section3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="luma-glass border border-white/10 p-8 mb-8">
                <h2 className="font-serif text-[22px] text-foreground [font-family:var(--font-serif-display)] mb-4">
                  Explore the Space Between
                </h2>
                <p className="text-muted-foreground text-base leading-[1.85] mb-6" style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}>
                  Some patterns only reveal themselves between two inner worlds.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        if (result) sessionStorage.setItem(INVITER_REFLECTION_KEY, result);
                        router.push("/connect");
                      } catch (e) {
                        console.warn("SessionStorage failed", e);
                        router.push("/connect");
                      }
                    }}
                    className="inline-flex px-5 py-3 rounded-[12px] border border-white/10 text-foreground text-sm font-medium hover:bg-background transition-colors"
                  >
                    Connect Inner Worlds
                  </button>
                  <Link
                    href="/couple-hub"
                    className="inline-flex px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Explore Couple Mode
                  </Link>
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-700 ease-out ${resultReveal.section3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="luma-glass border border-white/10 p-6 md:p-8 mb-8">
                <PatternOverTimeSection variant="light" />
              </div>
            </div>

            {/* Your Inner Shift — only when user has a previous reflection */}
            {previousReflection && (
              <div className="mt-16 md:mt-20 max-w-[680px]">
                <h2 className="text-foreground text-xl md:text-2xl [font-family:var(--font-serif-display)] mb-4 border-b border-white/10 pb-3">
                  Your Inner Shift
                </h2>
                {innerShiftLoading && (
                  <p className="text-muted-foreground text-base italic">Noting how your reflection has shifted...</p>
                )}
                {!innerShiftLoading && innerShiftText && (
                  <>
                    <p className="text-[#3d3d3d] text-base leading-[1.8] font-sans">
                      {innerShiftText}
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="luma-glass border border-white/10 p-4">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Then</p>
                        <p className="text-sm text-[#3d3d3d] leading-relaxed line-clamp-4">
                          {previousReflection.content.replace(/\n/g, " ").slice(0, 180)}…
                        </p>
                      </div>
                      <div className="luma-glass border border-white/10 p-4">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Now</p>
                        <p className="text-sm text-[#3d3d3d] leading-relaxed line-clamp-4">
                          {result.replace(/\n/g, " ").slice(0, 180)}…
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Reflection Mirror — compare with previous reflection (no AI, saved data only) */}
            {previousReflection && previousReflection.content && (
              <div className="mt-16 md:mt-20 max-w-[680px]">
                <h2 className="text-foreground text-xl md:text-2xl [font-family:var(--font-serif-display)] mb-4 border-b border-white/10 pb-3">
                  Reflection Mirror
                </h2>
                <p className="text-[#3d3d3d] text-base leading-[1.8] font-sans">
                  {getReflectionMirrorMessage(previousReflection.content, result)}
                </p>
              </div>
            )}

            {/* A Letter From Your Inner World — only when reflectionCount >= 3 (2+ saved) */}
            {showLetterSection && (
              <div className="mt-16 md:mt-20 max-w-[680px]">
                <h2 className="text-foreground text-xl md:text-2xl [font-family:var(--font-serif-display)] mb-4 border-b border-white/10 pb-3">
                  A Letter From Your Inner World
                </h2>
                {letterLoading && (
                  <p className="text-muted-foreground text-base italic">Writing your letter...</p>
                )}
                {!letterLoading && letter && (
                  <>
                    <p className="text-[#3d3d3d] text-base leading-[1.9] font-sans whitespace-pre-wrap [font-family:var(--font-serif-display)]">
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
                        className="px-5 py-3 rounded-xl bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.2)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                      >
                        {letterStoryLoading ? "Preparing…" : "Download Story"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div
              className={`transition-all duration-700 ease-out ${resultReveal.section3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <DangerousQuestionBlock
                text={dangerousQuestion}
                brutalTruth={brutalTruth}
                emotionalTag={emotionalTag}
                resultPreview={result}
                mode="individual"
              />
            </div>

            {/* Share / Download Story — DOM card + html-to-image (canvas fallback) */}
            <div
              className={`mt-10 w-full min-w-0 max-w-[720px] mx-auto px-0 ${resultReveal.section3 ? "opacity-100" : "opacity-0"}`}
            >
              <p className="mb-3 text-center text-xs text-muted-foreground">
                Your shareable story card
              </p>
              <StoryCardFrame
                ref={storyCardRef}
                title={getStoryCardTitle({
                  mode: "individual",
                  userName: getCurrentUserName(),
                })}
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
                        content: result,
                        brutalTruth,
                        dangerousQuestion,
                        shadowInsight,
                        inSimpleWords,
                        howToReadTags: resolveHowToReadTagsFromSelections(answers),
                        email,
                        name,
                        selectedImages: answers,
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
                        resultPreview: result,
                        brutalTruth: brutalTruth || "",
                        emotionalTag: emotionalTag || "",
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
                          (result && result.replace(/\s+/g, " ").trim().slice(0, 220)) ||
                          "—",
                        sessionType: "individual",
                        calendarState: resolveCalendarMood(
                          (emotionalTag && emotionalTag.trim()) ||
                            (brutalTruth && brutalTruth.trim().split(/\s+/).slice(0, 4).join(" ")) ||
                            "Reflection",
                          (trackerInsight && trackerInsight.trim()) ||
                            (brutalTruth && brutalTruth.trim()) ||
                            (result && result.replace(/\s+/g, " ").trim().slice(0, 220)) ||
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
                    } catch (err) {
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
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.2)] text-base font-medium hover:opacity-90 transition-opacity"
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
                  className="mt-6 px-5 py-3 rounded-xl bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.2)] text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Invite a Friend
                </button>
              ) : (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 backdrop-blur-sm text-sm text-foreground"
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
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-foreground text-sm font-medium hover:bg-white/[0.08] transition-colors"
                  >
                    {referralCopied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              )}
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                When someone you invite completes a reflection, you&apos;ll unlock a bonus reflection insight.
              </p>
            </div>

            <div className="mt-14 md:mt-16 text-center">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setRound5SpaceBetween(null);
                  setBrutalTruth(null);
                  setInSimpleWords(null);
                  setDangerousQuestion(null);
                  setShadowInsight(null);
                  setEmotionalTag(null);
                  setTrackerInsight(null);
                  setPhase("intro");
                  setCurrentRound(1);
                  setAnswers({});
                  setTextValue("");
                  setSelectedImage(null);
                  setSelectedOption(null);
                  setNoneText("");
                  setResultReveal({ section1: false, section2: false, section3: false });
                  setSaveEmail("");
                  setSavedWithEmail(false);
                  setSaveError(null);
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Begin again
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isGenerating && !result && phase !== "review" && (
          <div className="max-w-xl mx-auto px-6 py-16 text-center">
            <p className="text-sm text-destructive mb-6">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsGenerating(false);
              }}
              className="px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium transition-opacity hover:opacity-90"
            >
              Try again
            </button>
          </div>
        )}
      </main>
      )}
    </div>
  );
}
