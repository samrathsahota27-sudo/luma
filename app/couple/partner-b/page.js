"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { TestRound } from "@/components/TestRound";
import { reflectionLines, questions, rounds } from "@/lib/testData";

const PARTNER_A_STORAGE_KEY = "luma_couple_partner_a";
const COUPLE_RESULT_STORAGE_KEY = "luma_couple_result";

export default function CouplePartnerBPage() {
  const router = useRouter();
  const [partnerBName, setPartnerBName] = useState("");
  const [currentRound, setCurrentRound] = useState(1);
  const [answers, setAnswers] = useState({});
  const [textValue, setTextValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNone, setShowNone] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsTransitioning(true);
    setShowNone(false);
    setTextValue("");
    setSelectedIndex(null);
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
    setSelectedIndex(index);
    setAnswers((prev) => ({
      ...prev,
      [currentRound]: {
        image: index,
        text: textValue,
      },
    }));
  };

  const canProceed = selectedIndex !== null && textValue.trim().length > 0;

  const handleNext = async () => {
    if (!canProceed) return;

    if (currentRound < 4) {
      setCurrentRound((prev) => prev + 1);
    } else {
      const partnerBAnswers = {
        ...answers,
        [currentRound]: { image: selectedIndex, text: textValue },
      };

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
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "AI generation failed");
        }

        const data = await response.json();
        const nameB = partnerBName.trim() || undefined;
        sessionStorage.setItem(
          COUPLE_RESULT_STORAGE_KEY,
          JSON.stringify({
            result: data.result,
            innerWorldA: data.innerWorldA ?? null,
            innerWorldB: data.innerWorldB ?? null,
            spaceBetween: data.spaceBetween ?? null,
            nameA: nameA ?? null,
            nameB: nameB ?? null,
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
    !isGenerating && !error && currentRound <= 4;

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />
      <main className="pt-20 pb-12 max-w-[720px] mx-auto">
        <div className="px-6 pb-6">
          <div className="mb-4">
            <label htmlFor="partner-b-name" className="block text-sm text-[#5a5a5a] mb-1">
              Your name (for your story card)
            </label>
            <input
              id="partner-b-name"
              type="text"
              value={partnerBName}
              onChange={(e) => setPartnerBName(e.target.value)}
              placeholder="Partner B name"
              className="w-full max-w-[280px] rounded-[12px] border border-[#E8E3D9] bg-white px-4 py-2.5 text-[#2F2F2F] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-[#2F2F2F]/20"
              aria-label="Your name"
            />
          </div>
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Partner B
            </span>
            <h2 className="font-serif text-[22px] mt-2 text-[#2F2F2F]">
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
              selectedIndex={selectedIndex}
              onSelectImage={handleSelectImage}
              textValue={textValue}
              onTextChange={setTextValue}
              canProceed={canProceed}
              onNext={handleNext}
              showNone={showNone}
            />
          </div>
        )}

        {isGenerating && (
          <div className="px-6 py-24 text-center">
            <p className="font-serif text-xl text-[#2F2F2F]">
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
              className="px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-sm font-medium transition-opacity hover:opacity-90"
            >
              Try again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
