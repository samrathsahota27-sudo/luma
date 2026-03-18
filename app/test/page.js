"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { TestRound } from "@/components/TestRound";
import PreTestScreen from "@/components/PreTestScreen";
import { reflectionLines, questions, rounds, roundTags } from "@/lib/testData";
import { saveIndividualReflectionWithEmail, getLastIndividualReflection, getIndividualReflectionCount, getCurrentUserName } from "@/lib/reflectionStorage";
import { nameToSlug } from "@/lib/referralSlug";
import { getReflectionMirrorMessage } from "@/lib/reflectionMirror";
import { generateStoryCardBlob, generateLetterStoryBlob, downloadStoryCard, shareOrDownloadStoryCard } from "@/lib/storyCard";
import { getRoundTag } from "@/lib/reflection/roundTagging";

const ROUND_TRANSITION_MS = 500;
const GENERATING_PHASE_2_MS = 3500;
const RESULT_REVEAL_DELAY_S1 = 200;
const RESULT_REVEAL_DELAY_S2 = 500;
const RESULT_REVEAL_DELAY_S3 = 900;

const INVITER_REFLECTION_KEY = "luma_connect_inviter_reflection";

export default function TestPage() {
  const router = useRouter();
  const [phase, setPhase] = useState("intro");
  const [started, setStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [answers, setAnswers] = useState({});
  const [selectedTags, setSelectedTags] = useState({});
  const [textValue, setTextValue] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // number | "none" | null
  const [selectedOption, setSelectedOption] = useState(null); // "image" | "none"
  const [noneText, setNoneText] = useState("");
  const [showNoneSection, setShowNoneSection] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNone, setShowNone] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [resultReveal, setResultReveal] = useState({ section1: false, section2: false, section3: false });
  const [saveEmail, setSaveEmail] = useState("");
  const [saveName, setSaveName] = useState("");
  const [savePassword, setSavePassword] = useState("");
  const [reminderEmail, setReminderEmail] = useState("");
  const [savedWithEmail, setSavedWithEmail] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false);
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
    if (phase !== "rounds") return;
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
    setShowNone(false);
    setTextValue("");
    setSelectedImage(null);
    setSelectedOption(null);
    setNoneText("");
    setShowNoneSection(false);
    setSelectedTags((prev) => ({ ...prev, [currentRound]: [] }));
    setError(null);

    const transitionTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, ROUND_TRANSITION_MS);

    const timer = setTimeout(() => {
      setShowNone(true);
    }, 20000);

    return () => {
      clearTimeout(timer);
      clearTimeout(transitionTimer);
    };
  }, [currentRound, phase]);

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
    setShowNoneSection(false);
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
    setShowNoneSection(true);
    setSelectedTags((prev) => ({ ...prev, [currentRound]: [] }));
    setTimeout(() => {
      document.getElementById("none-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const inputText = selectedOption === "none" ? noneText : textValue;
  const canProceed = inputText.trim().length > 0;

  const handleNext = async () => {
    if (!canProceed) return;

    if (currentRound < 4) {
      setCurrentRound((prev) => prev + 1);
    } else {
      await generateResult();
    }
  };

  const generateResult = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const finalAnswers = {
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
                tag: typeof selectedImage === "number" ? getRoundTag(currentRound, selectedImage) ?? undefined : undefined,
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
        body: JSON.stringify({ selections: finalAnswers }),
      });

      if (!response.ok) {
        throw new Error("AI generation failed");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      console.error("AI ERROR:", err);
      setError("AI generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const showRounds = phase === "rounds" && !isGenerating && !error && result == null;
  const generatingMessages = [
    "Your reflection is forming...",
    "Looking for subtle patterns...",
  ];

  const resultParagraphs = result != null ? result.split(/\n\n+/).filter(Boolean) : [];
  const firstParagraph = resultParagraphs[0] ?? "";
  const restParagraphs = resultParagraphs.slice(1);

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />
      {!started ? (
        <PreTestScreen
          email={reminderEmail}
          onEmailChange={(v) => {
            setReminderEmail(v);
            registerReminder(v);
          }}
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
            />
          </div>
        )}

        {/* Generating */}
        {isGenerating && (
          <div className="px-6 py-24 md:py-32 text-center">
            <p
              className="font-serif text-xl text-[#2F2F2F] transition-opacity duration-500"
              key={generatingMessage}
            >
              {generatingMessages[generatingMessage]}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Taking a moment to gather what emerged across the four rounds.
            </p>
          </div>
        )}

        {/* Result — structured sections, premium reading experience */}
        {result && (
          <div className="px-6 py-20 md:py-28 max-w-[720px] mx-auto">
            <h1 className="text-center text-[#2F2F2F] text-3xl md:text-4xl tracking-wide [font-family:var(--font-serif-display)] mb-14">
              Your Reflection
            </h1>

            {/* Section 1: Core Pattern Insight */}
            <div
              className={`transition-all duration-700 ease-out ${resultReveal.section1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="rounded-[16px] bg-[#F5F3EE] border border-[#E8E3D9]/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8 mb-8">
                <h2 className="font-serif text-[22px] text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-4">
                  Core Pattern Insight
                </h2>
                {firstParagraph && (
                  <div
                    className="text-[#5a5a5a] text-base md:text-lg leading-[1.8] [&>br]:block [&>br]:mb-4"
                    style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
                    dangerouslySetInnerHTML={{
                      __html: firstParagraph.replace(/\n/g, "<br>"),
                    }}
                  />
                )}
              </div>
            </div>

            {/* Section 2: A Gentle Direction */}
            <div
              className={`transition-all duration-700 ease-out ${resultReveal.section2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="rounded-[16px] bg-[#F5F3EE] border border-[#E8E3D9]/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8 mb-8">
                <h2 className="font-serif text-[22px] text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-4">
                  A Gentle Direction
                </h2>
                {restParagraphs.length > 0 ? (
                  <div
                    className="text-[#5a5a5a] text-base md:text-lg leading-[1.85] [&>br]:block [&>br]:mb-4"
                    style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
                    dangerouslySetInnerHTML={{
                      __html: restParagraphs.join("<br><br>").replace(/\n/g, "<br>"),
                    }}
                  />
                ) : (
                  <p className="text-[#5a5a5a] text-base leading-[1.85]" style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}>
                    Take what resonates and leave the rest. There is no need to change anything.
                  </p>
                )}
              </div>
            </div>

            {/* Section 3: Explore the Space Between */}
            <div
              className={`transition-all duration-700 ease-out ${resultReveal.section3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div className="rounded-[16px] bg-[#F5F3EE] border border-[#E8E3D9]/60 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-8 mb-8">
                <h2 className="font-serif text-[22px] text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-4">
                  Explore the Space Between
                </h2>
                <p className="text-[#5a5a5a] text-base leading-[1.85] mb-6" style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}>
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
                    className="inline-flex px-5 py-3 rounded-[12px] border border-[#E8E3D9] text-[#2F2F2F] text-sm font-medium hover:bg-[#F7F6F3] transition-colors"
                  >
                    Connect Inner Worlds
                  </button>
                  <Link
                    href="/couple"
                    className="inline-flex px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Explore Couple Mode
                  </Link>
                </div>
              </div>
            </div>

            {/* Your Inner Shift — only when user has a previous reflection */}
            {previousReflection && (
              <div className="mt-16 md:mt-20 max-w-[680px]">
                <h2 className="text-[#2a2a2a] text-xl md:text-2xl [font-family:var(--font-serif-display)] mb-4 border-b border-[#e8e3d9] pb-3">
                  Your Inner Shift
                </h2>
                {innerShiftLoading && (
                  <p className="text-[#5a5a5a] text-base italic">Noting how your reflection has shifted...</p>
                )}
                {!innerShiftLoading && innerShiftText && (
                  <>
                    <p className="text-[#3d3d3d] text-base leading-[1.8] font-sans">
                      {innerShiftText}
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-[#f8f6f3] border border-[#e8e3d9] p-4">
                        <p className="text-xs uppercase tracking-wider text-[#5a5a5a] mb-2">Then</p>
                        <p className="text-sm text-[#3d3d3d] leading-relaxed line-clamp-4">
                          {previousReflection.content.replace(/\n/g, " ").slice(0, 180)}…
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#f8f6f3] border border-[#e8e3d9] p-4">
                        <p className="text-xs uppercase tracking-wider text-[#5a5a5a] mb-2">Now</p>
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
                <h2 className="text-[#2a2a2a] text-xl md:text-2xl [font-family:var(--font-serif-display)] mb-4 border-b border-[#e8e3d9] pb-3">
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
                <h2 className="text-[#2a2a2a] text-xl md:text-2xl [font-family:var(--font-serif-display)] mb-4 border-b border-[#e8e3d9] pb-3">
                  A Letter From Your Inner World
                </h2>
                {letterLoading && (
                  <p className="text-[#5a5a5a] text-base italic">Writing your letter...</p>
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
                        className="px-5 py-3 rounded-xl border border-[#e8e3d9] text-[#2a2a2a] text-sm font-medium hover:bg-[#f8f6f3] transition-colors disabled:opacity-60"
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
                        className="px-5 py-3 rounded-xl bg-[#2a2a2a] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                      >
                        {letterStoryLoading ? "Preparing…" : "Download Story"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Share / Download Story */}
            <div
              className={`mt-10 flex flex-wrap gap-3 justify-center ${resultReveal.section3 ? "opacity-100" : "opacity-0"}`}
            >
              <button
                type="button"
                disabled={storyLoading}
                onClick={async () => {
                  setStoryLoading(true);
                  try {
                    const blob = await generateStoryCardBlob({
                      mode: "individual",
                      userName: getCurrentUserName(),
                    });
                    await shareOrDownloadStoryCard(blob);
                  } catch (e) {
                    console.warn("Story share failed", e);
                  } finally {
                    setStoryLoading(false);
                  }
                }}
                className="px-5 py-3 rounded-xl border border-[#e8e3d9] text-[#2a2a2a] text-sm font-medium hover:bg-[#f8f6f3] transition-colors disabled:opacity-60"
              >
                {storyLoading ? "Preparing…" : "Share Story"}
              </button>
              <button
                type="button"
                disabled={storyLoading}
                onClick={async () => {
                  setStoryLoading(true);
                  try {
                    const blob = await generateStoryCardBlob({
                      mode: "individual",
                      userName: getCurrentUserName(),
                    });
                    downloadStoryCard(blob);
                  } catch (e) {
                    console.warn("Story download failed", e);
                  } finally {
                    setStoryLoading(false);
                  }
                }}
                className="px-5 py-3 rounded-xl bg-[#2a2a2a] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {storyLoading ? "Preparing…" : "Download Story"}
              </button>
            </div>

            {/* Save Your Reflection — account creation (name, email, password) */}
            {!savedWithEmail ? (
              <div className="mt-16 md:mt-20 rounded-2xl bg-white p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-[#e8e3d9]">
                <h2 className="text-[#2a2a2a] text-xl [font-family:var(--font-serif-display)] mb-2">
                  Save Your Reflection
                </h2>
                <p className="text-[#5a5a5a] text-base leading-relaxed mb-6">
                  Create an account to save this reflection. Your name will be used to personalize your shareable story card.
                </p>
                <form
                  onSubmit={(e) => {
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
                        email,
                        name,
                        selectedImages: answers,
                      });
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
                    className="w-full rounded-xl border border-[#e8e3d9] px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#2a2a2a]/20 focus:border-[#e8e3d9]"
                    aria-label="Name"
                  />
                  <input
                    type="email"
                    value={saveEmail}
                    onChange={(e) => setSaveEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-xl border border-[#e8e3d9] px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#2a2a2a]/20 focus:border-[#e8e3d9]"
                    aria-label="Email"
                  />
                  <input
                    type="password"
                    value={savePassword}
                    onChange={(e) => setSavePassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    minLength={6}
                    className="w-full rounded-xl border border-[#e8e3d9] px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#2a2a2a]/20 focus:border-[#e8e3d9]"
                    aria-label="Password"
                  />
                  {saveError && (
                    <p className="text-sm text-destructive">{saveError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#2a2a2a] text-white text-base font-medium hover:opacity-90 transition-opacity"
                  >
                    Save My Reflection
                  </button>
                </form>
              </div>
            ) : (
              <div className="mt-16 md:mt-20 rounded-2xl bg-[#f8f6f3] border border-[#e8e3d9] p-6 md:p-8">
                <p className="text-[#2a2a2a] font-medium">
                  Your reflection has been saved.
                </p>
                <p className="text-[#5a5a5a] text-base mt-2 leading-relaxed">
                  Return in 10 days to explore how your inner landscape evolves.
                </p>
              </div>
            )}

            {/* Referral — invite a friend */}
            <div className="mt-16 md:mt-20 rounded-2xl bg-[#f8f6f3] border border-[#e8e3d9] p-6 md:p-8">
              <p className="text-[#2a2a2a] font-serif text-lg [font-family:var(--font-serif-display)]">
                Reflection often becomes deeper when shared.
              </p>
              <p className="mt-2 text-[#5a5a5a] text-base leading-relaxed">
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
                  className="mt-6 px-5 py-3 rounded-xl bg-[#2a2a2a] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Invite a Friend
                </button>
              ) : (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 min-w-0 rounded-xl border border-[#e8e3d9] bg-white px-4 py-2.5 text-sm text-[#2F2F2F]"
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
                    className="px-5 py-2.5 rounded-xl border border-[#e8e3d9] text-[#2a2a2a] text-sm font-medium hover:bg-white transition-colors"
                  >
                    {referralCopied ? "Copied!" : "Copy link"}
                  </button>
                </div>
              )}
              <p className="mt-4 text-xs text-[#5a5a5a] leading-relaxed">
                When someone you invite completes a reflection, you&apos;ll unlock a bonus reflection insight.
              </p>
            </div>

            <div className="mt-14 md:mt-16 text-center">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setPhase("intro");
                  setCurrentRound(1);
                  setAnswers({});
                  setTextValue("");
                  setSelectedIndex(null);
                  setResultReveal({ title: false, first: false, rest: false });
                  setSaveEmail("");
                  setSavedWithEmail(false);
                  setSaveError(null);
                }}
                className="text-sm text-[#5a5a5a] hover:text-[#2a2a2a] transition-colors underline underline-offset-4"
              >
                Begin again
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isGenerating && !result && (
          <div className="max-w-xl mx-auto px-6 py-16 text-center">
            <p className="text-sm text-destructive mb-6">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsGenerating(false);
              }}
              className="px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-sm font-medium transition-opacity hover:opacity-90"
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
