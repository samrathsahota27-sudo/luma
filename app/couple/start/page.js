"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { TestRound } from "@/components/TestRound";
import { coupleReflectionRounds, reflectionLines, questions, rounds, roundTags } from "@/lib/coupleTestData";
import { getRoundTag } from "@/lib/reflection/roundTagging";
import { getRound5SelectionMeta } from "@/lib/reflection/round5Images";
import { CoupleFlowSteps } from "@/components/CoupleFlowSteps";

const PARTNER_A_STORAGE_KEY = "luma_couple_partner_a";

export default function CoupleStartPage() {
  const router = useRouter();
  const [remoteSessionId, setRemoteSessionId] = useState(null);
  const [partnerAName, setPartnerAName] = useState("");
  const [currentRound, setCurrentRound] = useState(1);
  const [answers, setAnswers] = useState({});
  const [selectedTags, setSelectedTags] = useState({});
  const [textValue, setTextValue] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // number | "none" | null
  const [selectedOption, setSelectedOption] = useState(null); // "image" | "none"
  const [noneText, setNoneText] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNone, setShowNone] = useState(false);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const [relationshipTags, setRelationshipTags] = useState([]);
  const [relationshipSummary, setRelationshipSummary] = useState("");
  const [lovePart, setLovePart] = useState("");
  const [missingPart, setMissingPart] = useState("");
  const [changePart, setChangePart] = useState("");
  const [tagAnswers, setTagAnswers] = useState({
    round1: { q1: [], q2: [], q3: [], text: "" },
    round2: { q1: [], q2: [], q3: [], text: "" },
    round3: { q1: [], q2: [], q3: [], text: "" },
    round4: { q1: [], q2: [], q3: [], text: "" },
    round5: { q1: [], q2: [], q3: [], q4: [], text: "" },
  });
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [hasOpenedDisclaimer, setHasOpenedDisclaimer] = useState(false);
  const [disclaimerSecondsLeft, setDisclaimerSecondsLeft] = useState(5);
  const disclaimerBypassRef = useRef(false);

  useEffect(() => {
    try {
      const id = new URLSearchParams(window.location.search).get("sessionId");
      setRemoteSessionId(id && id.trim() ? id.trim() : null);
      sessionStorage.setItem("coupleRole", "partnerA");
      if (id && id.trim()) {
        sessionStorage.setItem("coupleSessionId", id.trim());
      }
    } catch {
      setRemoteSessionId(null);
    }
  }, []);

  useEffect(() => {
    setIsTransitioning(true);
    setShowNone(false);
    setTextValue("");
    setSelectedImage(null);
    setSelectedOption(null);
    setNoneText("");
    setSelectedTags((prev) => ({ ...prev, [currentRound]: [] }));
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
    if (!canProceedRound || isSubmittingSession) return;

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
      return;
    }

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
      setIsSubmittingSession(true);
      try {
        const res = await fetch(`/api/couple-sessions/${encodeURIComponent(remoteSessionId)}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: finalAnswers,
            name: partnerAName.trim() || null,
            role: "partnerA",
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("Couple session submit failed", json);
          return;
        }
        if (json.readyForResult) {
          router.push(`/couple/result?sessionId=${encodeURIComponent(remoteSessionId)}`);
        } else {
          router.push(`/couple/waiting?sessionId=${encodeURIComponent(remoteSessionId)}`);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSubmittingSession(false);
      }
      return;
    }

    try {
      sessionStorage.setItem(
        PARTNER_A_STORAGE_KEY,
        JSON.stringify({
          answers: finalAnswers,
          nameA: partnerAName.trim() || undefined,
        })
      );
    } catch (e) {
      console.error("Failed to store Partner A answers", e);
    }
    router.push("/couple/partner-b");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pt-20 pb-12 max-w-[720px] mx-auto w-full min-w-0">
        <div className="px-6 pb-6">
          <CoupleFlowSteps activeStep={1} className="mb-6" />
          <div className="mb-4">
            <label htmlFor="partner-a-name" className="block text-sm text-muted-foreground mb-1">
              Your name (for your story card)
            </label>
            <input
              id="partner-a-name"
              type="text"
              value={partnerAName}
              onChange={(e) => setPartnerAName(e.target.value)}
              placeholder="Partner A name"
              className="w-full max-w-[280px] rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-2.5 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              aria-label="Your name"
            />
          </div>
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Partner A
            </span>
            <h2 className="font-serif text-[22px] mt-2 text-foreground">
              Partner A Reflection
            </h2>
          </div>
        </div>

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
            canProceed={canProceedRound && !isSubmittingSession}
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
      </main>
    </div>
  );
}
