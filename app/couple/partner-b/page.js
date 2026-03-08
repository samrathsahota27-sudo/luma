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
    }, 240);

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
      try {
        const stored = sessionStorage.getItem(PARTNER_A_STORAGE_KEY);
        if (!stored) {
          setError("Partner A responses not found. Please start from the beginning.");
          return;
        }
        partnerAAnswers = JSON.parse(stored);
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
        sessionStorage.setItem(
          COUPLE_RESULT_STORAGE_KEY,
          JSON.stringify({
            result: data.result,
            innerWorldA: data.innerWorldA ?? null,
            innerWorldB: data.innerWorldB ?? null,
            spaceBetween: data.spaceBetween ?? null,
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
    <div className="min-h-screen bg-[#fbf7f0] text-foreground">
      <Navigation />
      <main className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-6 pb-6 text-center">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Partner B
          </span>
          <h2 className="font-serif text-xl md:text-2xl mt-2 text-foreground">
            Partner B Reflection
          </h2>
        </div>

        {showTest && (
          <div
            key={currentRound}
            className={[
              "transition-all duration-300 ease-out",
              isTransitioning
                ? "opacity-0 translate-y-1"
                : "opacity-100 translate-y-0",
            ].join(" ")}
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
          <div className="max-w-2xl mx-auto px-6 py-24 text-center">
            <p className="font-serif text-xl text-foreground">
              Generating your relationship reflection...
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Weaving together both reflections into one.
            </p>
          </div>
        )}

        {error && !isGenerating && (
          <div className="max-w-xl mx-auto px-6 py-16 text-center">
            <p className="text-sm text-destructive mb-4">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
