"use client";

import { useEffect, useState } from "react";
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

export default function CouplePartnerBPage() {
  const router = useRouter();
  const { depthMode, setDepthMode } = useDepthMode();
  const [remoteSessionId, setRemoteSessionId] = useState(null);
  const [partnerBName, setPartnerBName] = useState("");
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
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const id = new URLSearchParams(window.location.search).get("session");
      setRemoteSessionId(id && id.trim() ? id.trim() : null);
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
  }, [currentRound]);

  const handleSelectImage = (index) => {
    setSelectedImage(index);
    setSelectedOption("image");
    setNoneText("");
    const tag = getRoundTag(currentRound, index);
    const r5 = currentRound === 5 ? getRound5SelectionMeta(index) : null;
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

  const inputText = selectedOption === "none" ? noneText : textValue;
  const canProceed = inputText.trim().length > 0;

  const handleNext = async () => {
    if (!canProceed) return;

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
                tags: selectedTags[currentRound] ?? [],
                userExplanation: "",
                text: textValue,
                ...(currentRound === 5 && typeof selectedImage === "number"
                  ? (() => {
                      const m = getRound5SelectionMeta(selectedImage);
                      return m.id
                        ? { imageId: m.id, psychologicalTags: m.psychologicalTags }
                        : {};
                    })()
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
              role: "b",
              answers: partnerBAnswers,
              name: partnerBName.trim() || null,
            }),
          });
          const submitJson = await submitRes.json().catch(() => ({}));
          if (!submitRes.ok) {
            throw new Error(submitJson.error || "Could not save your answers");
          }

          if (submitJson.readyForResult) {
            const g = await fetch(`/api/couple-sessions/${encodeURIComponent(remoteSessionId)}`);
            const j = await g.json().catch(() => ({}));
            if (!g.ok || !j.partnerA || !j.partnerB) {
              throw new Error("Could not load both partners’ answers");
            }
            const { runCoupleAnalyzeClient } = await import("@/lib/couple/fetchCoupleAnalyzeResult");
            const bundle = await runCoupleAnalyzeClient(j.partnerA, j.partnerB, depthMode, j.nameA, j.nameB);
            try {
              sessionStorage.removeItem(COUPLE_PRE_REVEAL_DONE_KEY);
            } catch {
              /* ignore */
            }
            sessionStorage.setItem(COUPLE_RESULT_STORAGE_KEY, JSON.stringify(bundle));
            sessionStorage.removeItem(PARTNER_A_STORAGE_KEY);
            router.push("/couple/result");
          } else {
            router.push(`/couple/waiting?session=${encodeURIComponent(remoteSessionId)}`);
          }
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
            selectedOption={selectedOption}
            onSelectNone={handleNoneClick}
            noneText={noneText}
            onNoneTextChange={setNoneText}
              textValue={textValue}
              onTextChange={setTextValue}
              canProceed={canProceed}
              onNext={handleNext}
              showNone={showNone}
              totalRounds={5}
              spaceBetweenRound={
                !!coupleReflectionRounds.find((r) => r.roundNumber === currentRound)?.spaceBetweenRound
              }
            />
          </div>
        )}

        {isGenerating && (
          <div className="px-6 py-24 text-center">
            <p className="font-serif text-xl text-foreground">
              Your reflection is forming...
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
              onClick={() => setError(null)}
              className="px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium transition-opacity hover:opacity-90"
            >
              Try again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
