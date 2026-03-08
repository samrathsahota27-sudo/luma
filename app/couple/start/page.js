"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { TestRound } from "@/components/TestRound";
import { reflectionLines, questions, rounds } from "@/lib/testData";

const PARTNER_A_STORAGE_KEY = "luma_couple_partner_a";

export default function CoupleStartPage() {
  const router = useRouter();
  const [currentRound, setCurrentRound] = useState(1);
  const [answers, setAnswers] = useState({});
  const [textValue, setTextValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNone, setShowNone] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    setShowNone(false);
    setTextValue("");
    setSelectedIndex(null);

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

  const handleNext = () => {
    if (!canProceed) return;

    if (currentRound < 4) {
      setCurrentRound((prev) => prev + 1);
    } else {
      const finalAnswers = {
        ...answers,
        [currentRound]: { image: selectedIndex, text: textValue },
      };
      try {
        sessionStorage.setItem(
          PARTNER_A_STORAGE_KEY,
          JSON.stringify(finalAnswers)
        );
      } catch (e) {
        console.error("Failed to store Partner A answers", e);
      }
      router.push("/couple/partner-b");
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf7f0] text-foreground">
      <Navigation />
      <main className="pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-6 pb-6 text-center">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Partner A
          </span>
          <h2 className="font-serif text-xl md:text-2xl mt-2 text-foreground">
            Partner A Reflection
          </h2>
        </div>

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
      </main>
    </div>
  );
}
