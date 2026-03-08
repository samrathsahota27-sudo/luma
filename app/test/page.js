"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { TestRound } from "@/components/TestRound";
import { reflectionLines, questions, rounds } from "@/lib/testData";

export default function TestPage() {
  const [currentRound, setCurrentRound] = useState(1);
  const [answers, setAnswers] = useState({});
  const [textValue, setTextValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNone, setShowNone] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
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
      await generateResult();
    }
  };

  const generateResult = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
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

  const hasFinishedRounds = currentRound > 4 || result !== null;

  const formattedResult =
    result != null ? result.replace(/\n/g, "<br>") : null;

  return (
    <div className="min-h-screen bg-[#fbf7f0] text-foreground">
      <Navigation />
      <main className="pt-20 pb-12">
        {!hasFinishedRounds && !isGenerating && !error && (
          <div
            key={currentRound}
            className={[
              "transition-all duration-300 ease-out",
              isTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0",
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
              Generating your reflection...
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Taking a moment to gather what emerged across the four rounds.
            </p>
          </div>
        )}

        {result && (
          <div className="max-w-2xl mx-auto px-6 py-16">
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Your Reflection
              </span>
              <h2 className="font-serif text-2xl md:text-3xl mt-4 text-foreground">
                What emerged
              </h2>
            </div>

            <div className="p-6 md:p-8 bg-white/70 shadow-sm rounded-xl">
              <div
                className="font-serif text-base md:text-lg leading-relaxed text-foreground whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formattedResult }}
              />
            </div>
          </div>
        )}

        {error && !isGenerating && !result && (
          <div className="max-w-xl mx-auto px-6 py-16 text-center">
            <p className="text-sm text-destructive mb-4">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsGenerating(false);
              }}
              className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

