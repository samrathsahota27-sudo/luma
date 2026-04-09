"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { DepthModeSelector } from "@/components/DepthModeSelector";
import { TestRound } from "@/components/TestRound";
import { useDepthMode } from "@/hooks/useDepthMode";
import { coupleReflectionRounds, reflectionLines, questions, rounds, roundTags } from "@/lib/coupleTestData";
import { getRoundTag } from "@/lib/reflection/roundTagging";
import { getRound5SelectionMeta } from "@/lib/reflection/round5Images";

const PARTNER_A_STORAGE_KEY = "luma_couple_partner_a";
const COUPLE_RESULT_STORAGE_KEY = "luma_couple_result";
const COUPLE_PRE_REVEAL_DONE_KEY = "luma_couple_pre_reveal_done";
const AI_STATUS_ROTATE_MS = 1800;
const AI_STATUS_MESSAGES = [
  "Reading emotional signals...",
  "Mapping unspoken patterns...",
  "Identifying friction points...",
  "Understanding your dynamic...",
  "Finalizing your reflection...",
];

export default function CouplePartnerBPage() {
  const router = useRouter();
  const { depthMode, setDepthMode } = useDepthMode();
  const [remoteSessionId, setRemoteSessionId] = useState(null);
  const [submitRole, setSubmitRole] = useState("partnerB");
  const [partnerBName, setPartnerBName] = useState("");
  const [currentRound, setCurrentRound] = useState(1);
  const [answers, setAnswers] = useState({});
  const [selectedTags, setSelectedTags] = useState({});
  const [textValue, setTextValue] = useState("");
  const [tagAnswers, setTagAnswers] = useState({
    round1: { q1: [], q2: [], q3: [], text: "" },
    round2: { q1: [], q2: [], q3: [], text: "" },
    round3: { q1: [], q2: [], q3: [], text: "" },
    round4: { q1: [], q2: [], q3: [], text: "" },
    round5: { q1: [], q2: [], q3: [], q4: [], text: "" },
  });
  const [selectedImage, setSelectedImage] = useState(null); // number | "none" | null
  const [selectedOption, setSelectedOption] = useState(null); // "image" | "none"
  const [noneText, setNoneText] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNone, setShowNone] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingMessageIdx, setGeneratingMessageIdx] = useState(0);
  const [error, setError] = useState(null);
  const [relationshipTags, setRelationshipTags] = useState([]);
  const [relationshipSummary, setRelationshipSummary] = useState("");
  const [lovePart, setLovePart] = useState("");
  const [missingPart, setMissingPart] = useState("");
  const [changePart, setChangePart] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [hasOpenedDisclaimer, setHasOpenedDisclaimer] = useState(false);
  const [disclaimerSecondsLeft, setDisclaimerSecondsLeft] = useState(5);
  const disclaimerBypassRef = useRef(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("sessionId");
      const roleParam = params.get("partnerRole");
      const role =
        roleParam === "partnerA" || roleParam === "partnerB"
          ? roleParam
          : sessionStorage.getItem("coupleRole") || "partnerB";
      setRemoteSessionId(id && id.trim() ? id.trim() : null);
      setSubmitRole(role);
      if (id && id.trim()) {
        sessionStorage.setItem("coupleSessionId", id.trim());
      }
      sessionStorage.setItem("coupleRole", role);
    } catch {
      setRemoteSessionId(null);
      setSubmitRole("partnerB");
    }
  }, []);

  useEffect(() => {
    if (!remoteSessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/couple-sessions/${encodeURIComponent(remoteSessionId)}`);
        if (cancelled) return;
        if (!res.ok) {
          setError("Invalid session");
          return;
        }
      } catch {
        if (!cancelled) setError("Invalid session");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [remoteSessionId]);

  useEffect(() => {
    if (!isGenerating) return;
    setGeneratingMessageIdx(0);
    const timer = window.setInterval(() => {
      setGeneratingMessageIdx((idx) => (idx + 1) % AI_STATUS_MESSAGES.length);
    }, AI_STATUS_ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  useEffect(() => {
    setIsTransitioning(true);
    setShowNone(false);
    setTextValue("");
    setSelectedImage(null);
    setSelectedOption(null);
    setNoneText("");
    setSelectedTags((prev) => ({ ...prev, [currentRound]: [] }));
    setTagAnswers((prev) => {
      const rk = `round${currentRound}`;
      return { ...prev, [rk]: { ...(prev?.[rk] ?? {}), q1: [], q2: [], q3: [], ...(currentRound === 5 ? { q4: [] } : {}), text: "" } };
    });
    setError(null);
    setRelationshipTags([]);
    setRelationshipSummary("");
    setLovePart("");
    setMissingPart("");
    setChangePart("");

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
  }, [currentRound]);

  const handleSelectImage = (index) => {
    setSelectedImage(index);
    setSelectedOption("image");
    setNoneText("");
    const tag = getRoundTag(currentRound, index);
    const r5 = currentRound === 5 ? getRound5SelectionMeta(index) : null;
    const existing = answers?.[currentRound] ?? {};
    setAnswers((prev) => ({
      ...prev,
      [currentRound]: {
        selectedType: "image",
        image: index,
        selectedImageId: index,
        tag: tag ?? undefined,
        tags: existing.tags ?? [],
        userExplanation: "",
        text: existing.text ?? "",
        ...(r5?.id ? { imageId: r5.id, psychologicalTags: r5.psychologicalTags } : {}),
      },
    }));
  };

  const toggleTag = (tagValue) => {
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
    setSelectedImage("none");
    setSelectedOption("none");
    setSelectedTags((prev) => ({ ...prev, [currentRound]: [] }));
    setTagAnswers((prev) => {
      const rk = `round${currentRound}`;
      return { ...prev, [rk]: { ...(prev?.[rk] ?? {}), q1: [], q2: [], q3: [], ...(currentRound === 5 ? { q4: [] } : {}), text: "" } };
    });
    setTimeout(() => {
      document.getElementById("none-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const progressive = answers?.[currentRound]?.answers ?? {};
  const personalNote = answers?.[currentRound]?.personalNote ?? "";
  const roundKey = `round${currentRound}`;
  const roundTagState = tagAnswers?.[roundKey] ?? {};
  const canProceedRound =
    currentRound === 5
      ? selectedOption === "image" &&
        typeof selectedImage === "number" &&
        (roundTagState?.q1?.length ?? 0) > 0 &&
        (roundTagState?.q2?.length ?? 0) > 0 &&
        (roundTagState?.q3?.length ?? 0) > 0 &&
        (roundTagState?.q4?.length ?? 0) > 0
      : selectedOption === "none"
        ? noneText.trim().length > 0
        : selectedOption === "image" &&
          typeof selectedImage === "number" &&
          (roundTagState?.q1?.length ?? 0) > 0 &&
          (roundTagState?.q2?.length ?? 0) > 0 &&
          (roundTagState?.q3?.length ?? 0) > 0;

  function toggleTagSelection(rk, qk, tag) {
    setTagAnswers((prev) => {
      const currentTags = prev?.[rk]?.[qk] ?? [];
      if (currentTags.includes(tag)) {
        return { ...prev, [rk]: { ...prev[rk], [qk]: currentTags.filter((t) => t !== tag) } };
      }
      if (currentTags.length >= 2) return prev;
      return { ...prev, [rk]: { ...prev[rk], [qk]: [...currentTags, tag] } };
    });
  }

  function setRoundText(rk, value) {
    setTagAnswers((prev) => ({ ...prev, [rk]: { ...prev[rk], text: value } }));
    setPersonalNote(value);
  }

  const setProgressiveAnswer = (qKey, value) => {
    setAnswers((prev) => {
      const current = prev?.[currentRound] ?? {};
      const nextAnswers = { ...(current.answers ?? {}), [qKey]: value };
      const tags = [
        ...(Array.isArray(nextAnswers.q1) ? nextAnswers.q1 : nextAnswers.q1 ? [nextAnswers.q1] : []),
        ...(Array.isArray(nextAnswers.q2) ? nextAnswers.q2 : nextAnswers.q2 ? [nextAnswers.q2] : []),
        ...(Array.isArray(nextAnswers.q3) ? nextAnswers.q3 : nextAnswers.q3 ? [nextAnswers.q3] : []),
        ...(Array.isArray(nextAnswers.q4) ? nextAnswers.q4 : nextAnswers.q4 ? [nextAnswers.q4] : []),
      ].filter(Boolean);
      return {
        ...prev,
        [currentRound]: {
          ...current,
          answers: nextAnswers,
          tags,
        },
      };
    });
  };

  const setPersonalNote = (value) => {
    setAnswers((prev) => {
      const current = prev?.[currentRound] ?? {};
      return {
        ...prev,
        [currentRound]: {
          ...current,
          personalNote: value,
          text: value,
        },
      };
    });
  };

  const toggleRelationshipTag = (t) => {
    setRelationshipTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
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

    if (currentRound < 5) {
      setCurrentRound((prev) => prev + 1);
    } else {
      const partnerBAnswers = {
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
                tags: answers?.[currentRound]?.tags ?? [],
                userExplanation: "",
                text: answers?.[currentRound]?.text ?? "",
                ...(currentRound === 5 && typeof selectedImage === "number"
                  ? (() => {
                      const m = getRound5SelectionMeta(selectedImage);
                      return m.id
                        ? { imageId: m.id, psychologicalTags: m.psychologicalTags }
                        : {};
                    })()
                  : {}),
                ...(currentRound === 5
                  ? {
                      relationshipTags,
                      relationshipSummary,
                      lovePart,
                      missingPart,
                      changePart,
                    }
                  : {}),
              },
      };

      if (remoteSessionId) {
        try {
          setIsGenerating(true);
          setError(null);
          const submitRes = await fetch(`/api/couple-sessions/${encodeURIComponent(remoteSessionId)}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              answers: partnerBAnswers,
              name: partnerBName.trim() || null,
              role: submitRole,
            }),
          });
          const submitJson = await submitRes.json().catch(() => ({}));
          if (!submitRes.ok) {
            throw new Error(submitJson.error || "Could not save your answers");
          }

          const partnerAData = submitJson.partnerA?.answers;
          const partnerBData = submitJson.partnerB?.answers;
          if (!submitJson.readyForResult || !partnerAData || !partnerBData) {
            router.push(`/couple/waiting?sessionId=${encodeURIComponent(remoteSessionId)}`);
            return;
          }
          sessionStorage.removeItem(PARTNER_A_STORAGE_KEY);
          router.push(
            `/couple/result?sessionId=${encodeURIComponent(remoteSessionId)}&dm=${encodeURIComponent(depthMode)}`
          );
        } catch (err) {
          console.error("Couple remote submit error:", err);
          setError(err.message || "Unable to continue. Please try again.");
        } finally {
          setIsGenerating(false);
        }
        return;
      }

      let partnerAAnswers = null;
      let nameA = undefined;
      try {
        const stored = sessionStorage.getItem(PARTNER_A_STORAGE_KEY);
        if (!stored) {
          setError("Partner A responses not found. Please start from the beginning.");
          return;
        }
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.answers === "object") {
          partnerAAnswers = parsed.answers;
          nameA = parsed.nameA;
        } else {
          partnerAAnswers = parsed;
        }
      } catch (e) {
        setError("Could not load Partner A responses. Please start over.");
        return;
      }

      try {
        setIsGenerating(true);
        setError(null);

        const response = await fetch("/api/couple-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerA: partnerAAnswers,
            partnerB: partnerBAnswers,
            depthMode,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "AI generation failed");
        }

        const data = await response.json();
        const nameB = partnerBName.trim() || undefined;
        try {
          sessionStorage.removeItem(COUPLE_PRE_REVEAL_DONE_KEY);
        } catch {
          /* ignore */
        }
        sessionStorage.setItem(
          COUPLE_RESULT_STORAGE_KEY,
          JSON.stringify({
            result: data.result,
            brutalTruth: data.brutalTruth ?? null,
            emotionalTag: data.emotionalTag ?? null,
            trackerInsight: data.trackerInsight ?? null,
            dangerousQuestion: data.dangerousQuestion ?? null,
            shadowInsight: data.shadowInsight ?? null,
            mapReadInnerA: data.mapReadInnerA ?? null,
            mapReadInnerB: data.mapReadInnerB ?? null,
            mapReadBetween: data.mapReadBetween ?? null,
            conflictFrictionPoints: data.conflictFrictionPoints ?? null,
            innerWorldA: data.innerWorldA ?? null,
            innerWorldB: data.innerWorldB ?? null,
            spaceBetween: data.spaceBetween ?? null,
            imageInterpretA: data.imageInterpretA ?? null,
            imageInterpretB: data.imageInterpretB ?? null,
            imageInterpretBetween: data.imageInterpretBetween ?? null,
            calendarState: data.calendarState ?? null,
            nameA: nameA ?? null,
            nameB: nameB ?? null,
            partnerA: partnerAAnswers,
            partnerB: partnerBAnswers,
          })
        );
        sessionStorage.removeItem(PARTNER_A_STORAGE_KEY);
        router.push("/couple/result");
      } catch (err) {
        console.error("Couple analyze error:", err);
        setError(err.message || "Unable to generate reflection. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const showTest =
    !isGenerating && !error && currentRound <= 5;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-20 pb-12 max-w-[720px] mx-auto">
        <div className="px-6 pb-6">
          <div className="mb-4">
            <label htmlFor="partner-b-name" className="block text-sm text-muted-foreground mb-1">
              Your name (for your story card)
            </label>
            <input
              id="partner-b-name"
              type="text"
              value={partnerBName}
              onChange={(e) => setPartnerBName(e.target.value)}
              placeholder="Partner B name"
              className="w-full max-w-[280px] rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-2.5 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              aria-label="Your name"
            />
          </div>
          <DepthModeSelector
            value={depthMode}
            onChange={setDepthMode}
            disabled={isGenerating}
            className="mb-6 max-w-md mx-auto"
          />
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Partner B
            </span>
            <h2 className="font-serif text-[22px] mt-2 text-foreground">
              Partner B Reflection
            </h2>
          </div>
        </div>

        {showTest && (
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
              onSelectImage={handleSelectImage}
            tags={roundTags[currentRound] ?? []}
            selectedTags={selectedTags[currentRound] ?? []}
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
              relationshipTags={relationshipTags}
              onToggleRelationshipTag={toggleRelationshipTag}
              relationshipSummary={relationshipSummary}
              onRelationshipSummaryChange={setRelationshipSummary}
              lovePart={lovePart}
              onLovePartChange={setLovePart}
              missingPart={missingPart}
              onMissingPartChange={setMissingPart}
              changePart={changePart}
              onChangePartChange={setChangePart}
              canProceed={canProceedRound}
              onNext={handleNext}
              showNone={showNone}
              totalRounds={5}
              spaceBetweenRound={
                !!coupleReflectionRounds.find((r) => r.roundNumber === currentRound)?.spaceBetweenRound
              }
            />
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
          </div>
        )}

        {isGenerating && (
          <div className="px-6 py-24 text-center">
            <p
              key={generatingMessageIdx}
              className="font-serif text-xl text-foreground transition-all duration-500 animate-luma-fade-only"
            >
              {AI_STATUS_MESSAGES[generatingMessageIdx]}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Weaving together both reflections into one.
            </p>
          </div>
        )}

        {error && !isGenerating && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-destructive mb-6">{error}</p>
            <button
              type="button"
              onClick={() => {
                if (remoteSessionId) {
                  router.push("/couple");
                  return;
                }
                setError(null);
              }}
              className="px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium transition-opacity hover:opacity-90"
            >
              {remoteSessionId ? "Back to Couple Mode" : "Try again"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
