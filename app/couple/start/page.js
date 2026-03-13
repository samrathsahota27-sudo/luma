"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { TestRound } from "@/components/TestRound";
import { reflectionLines, questions, rounds } from "@/lib/testData";

const PARTNER_A_STORAGE_KEY = "luma_couple_partner_a";

export default function CoupleStartPage() {
  const router = useRouter();
  const [partnerAName, setPartnerAName] = useState("");
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
          JSON.stringify({
            answers: finalAnswers,
            nameA: partnerAName.trim() || undefined,
          })
        );
      } catch (e) {
        console.error("Failed to store Partner A answers", e);
      }
      router.push("/couple/partner-b");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />
      <main className="pt-20 pb-12 max-w-[720px] mx-auto">
        <div className="px-6 pb-6">
          <div className="mb-4">
            <label htmlFor="partner-a-name" className="block text-sm text-[#5a5a5a] mb-1">
              Your name (for your story card)
            </label>
            <input
              id="partner-a-name"
              type="text"
              value={partnerAName}
              onChange={(e) => setPartnerAName(e.target.value)}
              placeholder="Partner A name"
              className="w-full max-w-[280px] rounded-[12px] border border-[#E8E3D9] bg-white px-4 py-2.5 text-[#2F2F2F] placeholder:text-[#5a5a5a] focus:outline-none focus:ring-2 focus:ring-[#2F2F2F]/20"
              aria-label="Your name"
            />
          </div>
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Partner A
            </span>
            <h2 className="font-serif text-[22px] mt-2 text-[#2F2F2F]">
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
