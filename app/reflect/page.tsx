"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { TestRound } from "@/components/reflection/TestRound";
import { reflectionRounds } from "@/lib/reflection/reflectionRounds";
import { getNextRound, buildReflectionSummary } from "@/lib/reflection/reflectionEngine";
import { getRoundTag } from "@/lib/reflection/roundTagging";
import { saveIndividualReflectionWithEmail, getLastIndividualReflection, getIndividualReflectionCount, getCurrentUserName } from "@/lib/reflectionStorage";
import { nameToSlug } from "@/lib/referralSlug";
import { getReflectionMirrorMessage } from "@/lib/reflectionMirror";
import { generateStoryCardBlob, generateLetterStoryBlob, downloadStoryCard, shareOrDownloadStoryCard } from "@/lib/storyCard";
import { StructuredResultSections } from "@/components/structured-result-sections";
import { Loader2 } from "lucide-react";

type ReflectionPhase = "intro" | "rounds" | "generating" | "complete";

const INVITER_REFLECTION_KEY = "luma_connect_inviter_reflection";

export default function ReflectPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<ReflectionPhase>("intro");
  const [currentRound, setCurrentRound] = useState(1);
  const [answers, setAnswers] = useState<
    Record<
      number,
      {
        selectedType?: "image" | "none";
        image?: number | null;
        selectedImageId?: number | null;
        userExplanation?: string;
        text: string;
      }
    >
  >({});
  const [selectedTags, setSelectedTags] = useState<Record<number, string[]>>({});
  const [textValue, setTextValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | "none" | null>(null);
  const [selectedOption, setSelectedOption] = useState<"image" | "none" | null>(null);
  const [noneText, setNoneText] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNone, setShowNone] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveEmail, setSaveEmail] = useState("");
  const [reminderEmail, setReminderEmail] = useState("");
  const [saveName, setSaveName] = useState("");
  const [savePassword, setSavePassword] = useState("");
  const [savedWithEmail, setSavedWithEmail] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [storyLoading, setStoryLoading] = useState(false);
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
    setSelectedIndex(null);
    setSelectedImage(null);
    setSelectedOption(null);
    setNoneText("");
    setSelectedTags((prev) => ({ ...prev, [currentRound]: [] }));
    setError(null);

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

  const inputText = selectedOption === "none" ? noneText : textValue;
  const canProceed = inputText.trim().length > 0;

  const handleNext = async () => {
    if (!canProceed) return;

    const next = getNextRound(currentRound);
    if (next !== null) {
      setCurrentRound(next);
    } else {
      await generateReflection();
    }
  };

  const generateReflection = async () => {
    setPhase("generating");
    setError(null);

    const finalAnswers = buildReflectionSummary(
      answers,
      currentRound,
      selectedIndex,
      textValue,
      selectedOption === "none",
      noneText
    );

    // Ensure last-round tag is present when an image is selected.
    if (selectedImage !== "none" && selectedIndex != null) {
      const tag = getRoundTag(currentRound, selectedIndex);
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

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections: finalAnswers }),
      });

      if (!response.ok) {
        throw new Error("AI generation failed");
      }

      const data = await response.json();
      setReflection(data.result);
      setPhase("complete");
    } catch (err) {
      console.error("Reflect page error:", err);
      setError("Unable to generate your reflection. Please try again.");
      setPhase("rounds");
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
  const roundData = reflectionRounds.find((r) => r.roundNumber === currentRound);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-20 pb-12">
        {/* Intro Phase */}
        {phase === "intro" && (
          <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 text-center">
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">
              Individual Reflection
            </h1>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              You will move through four rounds of visual selection. Each round
              presents a grid of symbolic images. Choose the one that feels most
              resonant, then respond to a brief reflective prompt.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Take your time. There are no right or wrong choices.
            </p>

            <div className="mt-8 max-w-md mx-auto text-left">
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
                tags={roundData.tags ?? []}
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
                totalRounds={reflectionRounds.length}
                showProgressBar
                roundTitles={reflectionRounds.map((r) => r.question)}
              />
            )}
          </div>
        )}

        {/* Generating Phase */}
        {phase === "generating" && (
          <div className="max-w-2xl mx-auto px-6 py-24 text-center">
            <Loader2 className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
            <p className="mt-6 font-serif text-xl text-foreground">
              Gathering your reflection...
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Taking a moment to notice the patterns that emerged
            </p>
          </div>
        )}

        {/* Complete Phase — premium reading experience */}
        {phase === "complete" && reflection && (
          <div className="max-w-[680px] mx-auto px-6 py-16 md:py-20">
            <div className="text-center animate-luma-fade-in-slow">
              <h1
                className="text-[#2a2a2a] text-3xl md:text-4xl tracking-wide [font-family:var(--font-serif-display)]"
                style={{ letterSpacing: "0.02em" }}
              >
                Your Reflection
              </h1>
            </div>

            <div className="animate-luma-fade-in" style={{ animationDelay: "200ms" }}>
              <StructuredResultSections result={reflection} />
            </div>

            {/* Your Inner Shift — only when user has a previous reflection */}
            {previousReflection && (
              <div className="mt-16 md:mt-20 max-w-[680px] animate-luma-fade-in" style={{ animationDelay: "250ms" }}>
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

            {/* Reflection Mirror — compare with previous reflection (no AI, saved data only) */}
            {previousReflection?.content && (
              <div className="mt-16 md:mt-20 max-w-[680px] animate-luma-fade-in" style={{ animationDelay: "300ms" }}>
                <h2 className="text-[#2a2a2a] text-xl md:text-2xl [font-family:var(--font-serif-display)] mb-4 border-b border-[#e8e3d9] pb-3">
                  Reflection Mirror
                </h2>
                <p className="text-[#3d3d3d] text-base leading-[1.8] font-sans">
                  {getReflectionMirrorMessage(previousReflection.content, reflection)}
                </p>
              </div>
            )}

            {/* Explore the Space Between — couple mode + Connect Inner Worlds */}
            <div className="mt-16 md:mt-20 animate-luma-fade-in" style={{ animationDelay: "400ms" }}>
              <div className="rounded-2xl bg-[#f8f6f3] border border-[#e8e3d9] p-6 md:p-8 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-shadow duration-300">
                <h2 className="text-[#2a2a2a] text-xl md:text-2xl font-medium border-b border-[#e8e3d9] pb-3 mb-4 [font-family:var(--font-serif-display)]">
                  Explore the Space Between
                </h2>
                <p className="text-[#5a5a5a] text-base leading-[1.8] mb-6">
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
                    className="inline-flex px-5 py-3 rounded-xl bg-[#2a2a2a] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Connect Inner Worlds
                  </button>
                  <Link
                    href="/couple"
                    className="inline-flex px-5 py-3 rounded-xl border border-[#e8e3d9] text-[#2a2a2a] text-sm font-medium hover:bg-[#f8f6f3] transition-colors"
                  >
                    Explore Couple Mode
                  </Link>
                </div>
              </div>
            </div>

            {/* Share / Download Story */}
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
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
                        content: reflection,
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

            <div className="mt-14 md:mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={resetExperience}
                className="text-sm text-[#5a5a5a] hover:text-[#2a2a2a] transition-colors underline underline-offset-4"
              >
                Begin Again
              </button>
              <p className="text-xs text-[#5a5a5a] max-w-sm text-center">
                This reflection is not diagnosis or advice. It is a mirror for your own awareness.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
