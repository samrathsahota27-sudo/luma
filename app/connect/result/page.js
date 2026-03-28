"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { StructuredResultSections } from "@/components/structured-result-sections";
import { DangerousQuestionBlock } from "@/components/DangerousQuestionBlock";
import { VsCardShare } from "@/components/VsCardShare";
import { ConflictAnalysisPanel } from "@/components/ConflictAnalysisPanel";
import {
  buildEmotionSessionSignature,
  tryRecordEmotionTrackerSession,
} from "@/lib/emotionalTracker";
import { insertEmotionTrackerRowOncePerSession } from "@/lib/emotionalTrackerSupabase";

const CONNECT_RESULT_KEY = "luma_connect_result";

const REVEAL_DELAY_A = 200;
const REVEAL_DELAY_B = 500;
const REVEAL_DELAY_BETWEEN = 900;
const REVEAL_DELAY_TEXT = 1200;

function excerpt(text, maxLen = 200) {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen).trim() + "…";
}

export default function ConnectResultPage() {
  const [data, setData] = useState(null);
  const [missing, setMissing] = useState(false);
  const [reveal, setReveal] = useState({
    innerA: false,
    innerB: false,
    spaceBetween: false,
    text: false,
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CONNECT_RESULT_KEY);
      if (!raw) {
        setMissing(true);
        return;
      }
      setData(JSON.parse(raw));
    } catch {
      setMissing(true);
    }
  }, []);

  useEffect(() => {
    if (!data?.result) return;
    const sig = buildEmotionSessionSignature({
      resultPreview: data.result,
      brutalTruth: typeof data.brutalTruth === "string" ? data.brutalTruth : "",
      emotionalTag: typeof data.emotionalTag === "string" ? data.emotionalTag : "",
      sessionType: "connect",
    });
    const tracked = tryRecordEmotionTrackerSession({
      emotionalTag: typeof data.emotionalTag === "string" ? data.emotionalTag : null,
      trackerInsight: typeof data.trackerInsight === "string" ? data.trackerInsight : null,
      brutalTruth: typeof data.brutalTruth === "string" ? data.brutalTruth : null,
      resultPreview: data.result,
      sessionType: "connect",
      sessionSignature: sig,
      calendarState: typeof data.calendarState === "string" ? data.calendarState : null,
    });
    if (tracked) {
      void insertEmotionTrackerRowOncePerSession(sig, {
        emotionalTag: tracked.tag,
        shortInsight: tracked.insight,
        sessionType: "connect",
        calendarState: tracked.calendarState,
      });
    }
  }, [data]);

  useEffect(() => {
    if (data == null) return;
    const t1 = setTimeout(() => setReveal((r) => ({ ...r, innerA: true })), REVEAL_DELAY_A);
    const t2 = setTimeout(() => setReveal((r) => ({ ...r, innerB: true })), REVEAL_DELAY_B);
    const t3 = setTimeout(() => setReveal((r) => ({ ...r, spaceBetween: true })), REVEAL_DELAY_BETWEEN);
    const t4 = setTimeout(() => setReveal((r) => ({ ...r, text: true })), REVEAL_DELAY_TEXT);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [data]);

  const transition = "transition-all duration-500 ease-out";
  const hidden = "opacity-0 translate-y-4";
  const visibleClass = "opacity-100 translate-y-0";

  if (missing && data === null) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navigation />
        <main className="flex-1 pt-24 pb-20 px-6 flex flex-col items-center justify-center">
          <div className="max-w-[520px] mx-auto text-center space-y-6">
            <h1 className="font-serif text-[22px] text-foreground [font-family:var(--font-serif-display)]">
              No reflection to show
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Generate a &quot;Space Between&quot; from the invite link your partner sent you.
            </p>
            <Link
              href="/connect"
              className="inline-flex items-center justify-center px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-base font-medium transition-opacity hover:opacity-90"
            >
              Connect Inner Worlds
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const result = data?.result ?? "";
  const brutalTruth = data?.brutalTruth ?? null;
  const dangerousQuestion = data?.dangerousQuestion ?? null;
  const emotionalTag = data?.emotionalTag ?? null;
  const shadowInsight = data?.shadowInsight ?? null;
  const conflictFrictionPoints = data?.conflictFrictionPoints ?? null;
  const reflectionA = data?.reflectionA ?? "";
  const reflectionB = data?.reflectionB ?? "";
  const formattedResult = result ? result.replace(/\n/g, "<br>") : "";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Connect Inner Worlds
            </span>
            <h1 className="font-serif text-[22px] md:text-[28px] mt-4 text-foreground [font-family:var(--font-serif-display)]">
              The Space Between Us
            </h1>
          </div>

          {/* Inner World A | Inner World B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div
              className={`luma-glass p-6 border border-white/10 flex flex-col ${transition} ${reveal.innerA ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-foreground mb-2 [font-family:var(--font-serif-display)]">
                Inner World A
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                {excerpt(reflectionA, 220)}
              </p>
            </div>
            <div
              className={`luma-glass p-6 border border-white/10 flex flex-col ${transition} ${reveal.innerB ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-foreground mb-2 [font-family:var(--font-serif-display)]">
                Inner World B
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                {excerpt(reflectionB, 220)}
              </p>
            </div>
          </div>

          {/* The Space Between Us */}
          <div className="flex justify-center mb-10">
            <div
              className={`w-full max-w-xl rounded-[16px] bg-white/[0.06] border border-white/10 p-6 ${transition} ${reveal.spaceBetween ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-foreground text-center [font-family:var(--font-serif-display)]">
                The Space Between Us
              </h2>
              <p className="text-muted-foreground text-sm text-center mt-2 leading-relaxed">
                A reflection woven from both inner worlds.
              </p>
            </div>
          </div>

          {/* Conflict analysis + woven reflection */}
          {(formattedResult || (Array.isArray(conflictFrictionPoints) && conflictFrictionPoints.length > 0)) && (
            <div
              className={`mb-10 ${transition} ${reveal.text ? visibleClass : hidden}`}
            >
              <ConflictAnalysisPanel points={conflictFrictionPoints} />
              {formattedResult ? (
                <StructuredResultSections
                  result={result ?? ""}
                  brutalTruth={brutalTruth}
                  shadowInsight={shadowInsight}
                />
              ) : null}
              <DangerousQuestionBlock
                text={dangerousQuestion}
                brutalTruth={brutalTruth}
                emotionalTag={emotionalTag}
                resultPreview={result ?? ""}
                mode="couple"
              />
              <VsCardShare
                className={`mt-12 ${transition} ${reveal.text ? visibleClass : hidden}`}
                source={{
                  nameA: "You",
                  nameB: "Partner",
                  brutalTruth,
                  conflictFrictionPoints,
                  emotionalTag,
                  reflectionExcerptA: excerpt(reflectionA, 220),
                  reflectionExcerptB: excerpt(reflectionB, 220),
                }}
              />
            </div>
          )}

          {/* Consult a Specialist */}
          <section className="mb-10">
            <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(232,227,217,0.55),rgba(247,246,243,0.9))] shadow-[0_10px_35px_rgba(31,26,23,0.06)] p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div
                  aria-hidden
                  className="mt-0.5 h-10 w-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-[0_6px_20px_rgba(31,26,23,0.06)]"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-foreground/80"
                  >
                    <path
                      d="M12 21s-7-4.35-7-11a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 6.65-7 11-7 11Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.2 11.9 11.6 13.3 14.8 10.1"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="flex-1">
                  <h2 className="font-serif text-[22px] md:text-[24px] text-foreground [font-family:var(--font-serif-display)]">
                    Want a deeper understanding?
                  </h2>
                  <p className="mt-2 text-muted-foreground text-sm md:text-[15px] leading-relaxed">
                    Sometimes a guided perspective can help you see things more clearly.
                  </p>
                  <p className="mt-4 text-muted-foreground text-sm md:text-[15px] leading-relaxed">
                    A specialist can help you explore your patterns, understand your responses, and offer direction based on your reflection.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium transition-all duration-200 hover:opacity-90 hover:brightness-[1.03]"
                    >
                      Consult a Specialist →
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      Private • Thoughtful • No pressure
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/connect"
              className="px-5 py-3 rounded-[12px] border border-white/10 text-foreground text-sm font-medium hover:bg-white/[0.08] transition-colors"
            >
              Connect again
            </Link>
            <Link
              href="/"
              className="px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
