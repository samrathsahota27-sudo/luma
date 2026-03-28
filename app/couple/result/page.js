"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { saveCoupleReflectionWithEmail } from "@/lib/reflectionStorage";
import { getStoryCardTitle } from "@/lib/storyCard";
import { StoryCardFrame } from "@/components/StoryCardFrame";
import { StoryShareButtons } from "@/components/StoryShareButtons";
import { StructuredResultSections } from "@/components/structured-result-sections";
import { DangerousQuestionBlock } from "@/components/DangerousQuestionBlock";
import { VsCardShare } from "@/components/VsCardShare";
import { ConflictAnalysisPanel } from "@/components/ConflictAnalysisPanel";
import { HowToReadThisVisual } from "@/components/HowToReadThisVisual";
import {
  resolveHowToReadTagsFromCouplePartners,
  resolveRound5PsychologicalSupplementLinesForCouple,
} from "@/lib/reflection/howToReadVisual";
import {
  buildEmotionSessionSignature,
  tryRecordEmotionTrackerSession,
} from "@/lib/emotionalTracker";
import { insertEmotionTrackerRowOncePerSession } from "@/lib/emotionalTrackerSupabase";
import {
  getCheckAgainEncouragement,
  readCoupleLastCheckInMs,
  recordCoupleResultCheckIn,
} from "@/lib/coupleCheckInReminder";
import {
  buildCoupleResultSnapshot,
  heuristicCoupleShiftInsight,
  readCouplePriorSnapshot,
  shouldCompareCoupleResults,
  writeCouplePriorSnapshot,
} from "@/lib/coupleResultHistory";
import { GeneratedCoupleArtImage } from "@/components/GeneratedCoupleArtImage";

const COUPLE_RESULT_STORAGE_KEY = "luma_couple_result";
const COUPLE_PRE_REVEAL_DONE_KEY = "luma_couple_pre_reveal_done";

const REVEAL_DELAY_A = 300;
const REVEAL_DELAY_B = 700;
const REVEAL_DELAY_BETWEEN = 1400;
const REVEAL_DELAY_TEXT = 2100;

/** Hold “Analyzing your pattern…” before peeling overlay (1.5–2s). */
const ANALYZING_HOLD_MS = 1800;
/** Overlay fade-out before blur-to-clear on the result. */
const OVERLAY_FADE_MS = 700;

function getCoupleCoreDynamicText(data) {
  if (!data || typeof data !== "object") return "";
  const tag = typeof data.emotionalTag === "string" ? data.emotionalTag.trim() : "";
  if (tag) return tag;
  const brutal = typeof data.brutalTruth === "string" ? data.brutalTruth.trim() : "";
  if (brutal) return brutal;
  const res = typeof data.result === "string" ? data.result.trim() : "";
  if (!res) return "";
  const first = res.split(/\n\s*\n+/)[0]?.trim() ?? "";
  if (first.length > 220) return `${first.slice(0, 217).trim()}…`;
  return first;
}

function ImageOrPlaceholder({ src, alt, visible }) {
  const show = visible !== false;
  const transition = "transition-all duration-500 ease-out";
  const hidden = "opacity-0 translate-y-4";
  const visibleClass = "opacity-100 translate-y-0";

  if (src) {
    return (
      <div
        className={`relative w-full max-h-[min(92vw,560px)] aspect-square rounded-[16px] overflow-hidden bg-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.05)] ${transition} ${show ? visibleClass : hidden}`}
      >
        <GeneratedCoupleArtImage src={src} alt={alt} className="absolute inset-0 h-full w-full" />
      </div>
    );
  }
  return (
    <div
      className={`w-full aspect-square rounded-[16px] bg-gradient-to-br from-[#1c1830] to-[#141c28] flex items-center justify-center ${transition} ${show ? visibleClass : hidden}`}
      aria-hidden
    >
      <span className="text-xs text-muted-foreground">Reflection</span>
    </div>
  );
}

function ArchetypeCaption({ text }) {
  const t = typeof text === "string" ? text.trim() : "";
  if (!t) return null;
  return (
    <p className="mt-3 text-center text-[13px] leading-snug text-muted-foreground text-balance max-w-md mx-auto line-clamp-4 px-1">
      {t}
    </p>
  );
}

export default function CoupleResultPage() {
  const [data, setData] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [reveal, setReveal] = useState({
    coreDynamic: false,
    innerA: false,
    innerB: false,
    spaceBetween: false,
    text: false,
  });
  const [saveEmail, setSaveEmail] = useState("");
  const [savedWithEmail, setSavedWithEmail] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const storyRelRef = useRef(null);
  const storyARef = useRef(null);
  const storyBRef = useRef(null);
  const [showPreReveal, setShowPreReveal] = useState(true);
  /** null = waiting for first CTA; analyzing → blur_peel → complete */
  const [sequencePhase, setSequencePhase] = useState(null);
  const [didRunPostRevealAnimation, setDidRunPostRevealAnimation] = useState(false);
  const checkInRecordedRef = useRef(false);
  const shiftResolvedForFingerprintRef = useRef(null);
  const [shiftInsight, setShiftInsight] = useState(null);

  const checkAgainEncouragement = useMemo(
    () => getCheckAgainEncouragement(readCoupleLastCheckInMs()),
    []
  );

  useLayoutEffect(() => {
    if (loadStatus !== "ready" || !data) return;
    try {
      const already = sessionStorage.getItem(COUPLE_PRE_REVEAL_DONE_KEY) === "1";
      setShowPreReveal(!already);
      if (already) {
        setSequencePhase("complete");
        setDidRunPostRevealAnimation(false);
      } else {
        setSequencePhase(null);
      }
    } catch {
      setShowPreReveal(true);
      setSequencePhase(null);
    }
  }, [loadStatus, data]);

  useEffect(() => {
    if (sequencePhase !== "analyzing") return;
    const t = window.setTimeout(() => setSequencePhase("blur_peel"), ANALYZING_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [sequencePhase]);

  useEffect(() => {
    if (sequencePhase !== "blur_peel") return;
    const t = window.setTimeout(() => setSequencePhase("complete"), OVERLAY_FADE_MS);
    return () => window.clearTimeout(t);
  }, [sequencePhase]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let sessionId = null;
      let depthFromQuery = null;
      try {
        const params = new URLSearchParams(window.location.search);
        sessionId = params.get("session")?.trim() || null;
        const dm = params.get("dm");
        if (dm === "steel" || dm === "satin") depthFromQuery = dm;
      } catch {
        sessionId = null;
      }

      if (sessionId) {
        try {
          const r = await fetch(`/api/couple-sessions/${encodeURIComponent(sessionId)}`);
          const j = await r.json().catch(() => ({}));
          if (cancelled) return;
          if (!r.ok || j.error) {
            setLoadStatus("missing");
            return;
          }
          if (!j.readyForResult) {
            window.location.replace(`/couple/waiting?session=${encodeURIComponent(sessionId)}`);
            return;
          }
          let depthMode = depthFromQuery || "satin";
          if (!depthFromQuery) {
            try {
              const stored = localStorage.getItem("luma_depth_mode");
              if (stored === "steel" || stored === "satin") depthMode = stored;
            } catch {
              /* ignore */
            }
          }
          const { runCoupleAnalyzeClient } = await import("@/lib/couple/fetchCoupleAnalyzeResult");
          const bundle = await runCoupleAnalyzeClient(j.partnerA, j.partnerB, depthMode, j.nameA, j.nameB);
          if (cancelled) return;
          try {
            sessionStorage.removeItem(COUPLE_PRE_REVEAL_DONE_KEY);
            sessionStorage.setItem(COUPLE_RESULT_STORAGE_KEY, JSON.stringify(bundle));
          } catch {
            /* ignore */
          }
          setData(bundle);
          setLoadStatus("ready");
        } catch {
          if (!cancelled) setLoadStatus("missing");
        }
        return;
      }

      try {
        const raw = sessionStorage.getItem(COUPLE_RESULT_STORAGE_KEY);
        if (!raw) {
          if (!cancelled) setLoadStatus("missing");
          return;
        }
        setData(JSON.parse(raw));
        if (!cancelled) setLoadStatus("ready");
      } catch {
        if (!cancelled) setLoadStatus("missing");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!data?.result || sequencePhase !== "complete") return;
    const sig = buildEmotionSessionSignature({
      resultPreview: data.result,
      brutalTruth: typeof data.brutalTruth === "string" ? data.brutalTruth : "",
      emotionalTag: typeof data.emotionalTag === "string" ? data.emotionalTag : "",
      sessionType: "couple",
    });
    const tracked = tryRecordEmotionTrackerSession({
      emotionalTag: typeof data.emotionalTag === "string" ? data.emotionalTag : null,
      trackerInsight: typeof data.trackerInsight === "string" ? data.trackerInsight : null,
      brutalTruth: typeof data.brutalTruth === "string" ? data.brutalTruth : null,
      resultPreview: data.result,
      sessionType: "couple",
      sessionSignature: sig,
      calendarState: typeof data.calendarState === "string" ? data.calendarState : null,
    });
    if (tracked) {
      void insertEmotionTrackerRowOncePerSession(sig, {
        emotionalTag: tracked.tag,
        shortInsight: tracked.insight,
        sessionType: "couple",
        calendarState: tracked.calendarState,
      });
    }
  }, [data, sequencePhase]);

  useEffect(() => {
    if (data == null || sequencePhase !== "complete") return;
    setReveal({
      coreDynamic: false,
      innerA: false,
      innerB: false,
      spaceBetween: false,
      text: false,
    });
    const t0 = setTimeout(() => setReveal((r) => ({ ...r, coreDynamic: true })), 0);
    const t1 = setTimeout(() => setReveal((r) => ({ ...r, innerA: true })), REVEAL_DELAY_A);
    const t2 = setTimeout(() => setReveal((r) => ({ ...r, innerB: true })), REVEAL_DELAY_B);
    const t3 = setTimeout(() => setReveal((r) => ({ ...r, spaceBetween: true })), REVEAL_DELAY_BETWEEN);
    const t4 = setTimeout(() => setReveal((r) => ({ ...r, text: true })), REVEAL_DELAY_TEXT);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [data, sequencePhase]);

  useEffect(() => {
    if (sequencePhase !== "complete" || !data || checkInRecordedRef.current) return;
    checkInRecordedRef.current = true;
    recordCoupleResultCheckIn();
  }, [sequencePhase, data]);

  useEffect(() => {
    if (sequencePhase !== "complete" || !data) return;

    const current = buildCoupleResultSnapshot(data);
    const fp = current.fingerprint;

    if (shiftResolvedForFingerprintRef.current === fp) return;

    const prior = readCouplePriorSnapshot();

    if (!prior) {
      writeCouplePriorSnapshot(current);
      shiftResolvedForFingerprintRef.current = fp;
      setShiftInsight(null);
      return;
    }

    if (!shouldCompareCoupleResults(prior, fp)) {
      shiftResolvedForFingerprintRef.current = fp;
      setShiftInsight(null);
      return;
    }

    setShiftInsight(null);
    let cancelled = false;

    (async () => {
      let line = null;
      try {
        const res = await fetch("/api/couple-result-shift", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prior, current }),
        });
        if (res.ok) {
          const j = await res.json().catch(() => ({}));
          if (typeof j.insight === "string" && j.insight.trim()) line = j.insight.trim();
        }
      } catch {
        /* heuristic below */
      }
      if (!line) line = heuristicCoupleShiftInsight(prior, current);
      if (!cancelled) {
        setShiftInsight(line);
        writeCouplePriorSnapshot(current);
        shiftResolvedForFingerprintRef.current = fp;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sequencePhase, data]);

  const handleReveal = () => {
    try {
      sessionStorage.setItem(COUPLE_PRE_REVEAL_DONE_KEY, "1");
    } catch {
      /* ignore */
    }
    setDidRunPostRevealAnimation(true);
    setShowPreReveal(false);
    setSequencePhase("analyzing");
  };

  const handleBackToHome = () => {
    try {
      sessionStorage.removeItem(COUPLE_RESULT_STORAGE_KEY);
      sessionStorage.removeItem(COUPLE_PRE_REVEAL_DONE_KEY);
    } catch {}
  };

  const howToReadTags = useMemo(() => {
    if (!data?.partnerA || !data?.partnerB) return null;
    return resolveHowToReadTagsFromCouplePartners(data.partnerA, data.partnerB);
  }, [data]);

  const round5SupplementLines = useMemo(() => {
    if (!data?.partnerA || !data?.partnerB) return null;
    const lines = resolveRound5PsychologicalSupplementLinesForCouple(
      data.partnerA,
      data.partnerB
    );
    return lines.length ? lines : null;
  }, [data]);

  if (loadStatus === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 pt-24 pb-20 px-6 flex flex-col items-center justify-center">
          <p className="font-serif text-lg text-muted-foreground">Loading your reflection…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadStatus === "missing") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <main className="flex-1 pt-24 pb-20 px-6 flex flex-col items-center justify-center">
          <div className="max-w-[720px] mx-auto text-center space-y-6">
            <h1 className="font-serif text-[22px] text-foreground">
              No reflection to show
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Complete the couple reflection from the start to see your result.
            </p>
            <Link
              href="/couple-hub"
              className="inline-flex items-center justify-center px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-base font-medium transition-opacity hover:opacity-90"
            >
              Back to Couple Reflection
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const result = data?.result ?? null;
  const brutalTruth = data?.brutalTruth ?? null;
  const dangerousQuestion = data?.dangerousQuestion ?? null;
  const emotionalTag = data?.emotionalTag ?? null;
  const shadowInsight = data?.shadowInsight ?? null;
  const mapReadInnerA = data?.mapReadInnerA ?? null;
  const mapReadInnerB = data?.mapReadInnerB ?? null;
  const mapReadBetween = data?.mapReadBetween ?? null;
  const conflictFrictionPoints = data?.conflictFrictionPoints ?? null;
  const innerWorldA = data?.innerWorldA ?? null;
  const innerWorldB = data?.innerWorldB ?? null;
  const spaceBetween = data?.spaceBetween ?? null;
  const nameA = data?.nameA ?? null;
  const nameB = data?.nameB ?? null;
  const titleA = nameA && nameA.trim() ? `${nameA.trim()}'s Inner World` : "Inner World A";
  const titleB = nameB && nameB.trim() ? `${nameB.trim()}'s Inner World` : "Inner World B";
  const titleBetween = nameA?.trim() && nameB?.trim() ? `The Space Between ${nameA.trim()} & ${nameB.trim()}` : "The Space Between Us";
  const frictionLabelA = nameA?.trim() ? nameA.trim() : "Person A";
  const frictionLabelB = nameB?.trim() ? nameB.trim() : "Person B";

  const coreDynamicText = getCoupleCoreDynamicText(data);
  const shiftRevealOpen = coreDynamicText ? reveal.coreDynamic : reveal.innerA;

  const formattedResult =
    result != null ? result.replace(/\n/g, "<br>") : null;

  const transition = "transition-all duration-500 ease-out";
  const hidden = "opacity-0 translate-y-4";
  const visibleClass = "opacity-100 translate-y-0";

  const obscureMain = sequencePhase === "analyzing" || sequencePhase === "blur_peel";
  const mainRevealClass =
    obscureMain
      ? "blur-[12px] opacity-[0.38] scale-[0.998] [transition:none]"
      : didRunPostRevealAnimation && sequencePhase === "complete"
        ? "blur-0 opacity-100 scale-100 transition-[filter,opacity,transform] duration-[800ms] ease-out"
        : "";

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Navigation />

      <div className={`flex flex-col flex-1 min-w-0 ${mainRevealClass}`}>
      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Couple Reflection
            </span>
            {coreDynamicText ? (
              <>
                <div
                  className={`mt-8 md:mt-10 rounded-2xl border border-white/20 bg-white/[0.07] px-5 py-8 md:px-8 md:py-10 shadow-[0_12px_40px_rgba(0,0,0,0.25)] ${transition} ${reveal.coreDynamic ? visibleClass : hidden}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground mb-4 md:mb-5">
                    Core dynamic
                  </p>
                  <p className="font-serif font-semibold text-[1.65rem] sm:text-[1.85rem] md:text-[2.35rem] lg:text-[2.55rem] text-foreground leading-[1.18] tracking-[-0.02em] text-balance max-w-[640px] mx-auto [font-family:var(--font-serif-display)]">
                    {coreDynamicText}
                  </p>
                </div>
                <h1
                  className={`font-serif text-[17px] md:text-lg mt-8 text-muted-foreground font-normal tracking-tight ${transition} ${reveal.coreDynamic ? visibleClass : hidden}`}
                >
                  The Space Between You
                </h1>
              </>
            ) : (
              <h1 className="font-serif text-[22px] md:text-[28px] mt-4 text-foreground">
                The Space Between You
              </h1>
            )}
          </div>

          {shiftInsight ? (
            <div
              className={`mb-10 md:mb-11 max-w-[560px] mx-auto rounded-2xl border border-white/12 bg-white/[0.035] px-5 py-5 md:px-6 md:py-6 text-center ${transition} ${shiftRevealOpen ? visibleClass : hidden}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-2">
                Since last time
              </p>
              <p className="text-sm md:text-[15px] text-foreground font-medium leading-relaxed text-balance">
                {shiftInsight}
              </p>
            </div>
          ) : null}

          {/* Top row: Inner World A | Inner World B */}
          <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 mb-10">
            <div
              className={`luma-glass p-6 flex flex-col ${transition} ${reveal.innerA ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-foreground mb-1">
                {titleA}
              </h2>
              <p className="text-muted-foreground text-base mb-4 leading-relaxed">
                A symbolic representation of Partner A&apos;s inner landscape.
              </p>
              <ImageOrPlaceholder
                src={innerWorldA}
                alt="Partner A's inner world"
                visible={reveal.innerA}
              />
              <ArchetypeCaption text={mapReadInnerA} />
            </div>
            <div
              className={`luma-glass p-6 flex flex-col ${transition} ${reveal.innerB ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-foreground mb-1">
                {titleB}
              </h2>
              <p className="text-muted-foreground text-base mb-4 leading-relaxed">
                A symbolic representation of Partner B&apos;s inner landscape.
              </p>
              <ImageOrPlaceholder
                src={innerWorldB}
                alt="Partner B's inner world"
                visible={reveal.innerB}
              />
              <ArchetypeCaption text={mapReadInnerB} />
            </div>
          </div>

          {/* Centered: The Space Between */}
          <div className="flex justify-center mb-14">
            <div
              className={`w-full max-w-xl luma-glass p-6 flex flex-col ${transition} ${reveal.spaceBetween ? visibleClass : hidden}`}
            >
              <h2 className="font-serif text-[22px] text-foreground mb-1 text-center">
                {titleBetween}
              </h2>
              <p className="text-muted-foreground text-base mb-4 leading-relaxed text-center">
                A symbolic reflection of the emotional field created between
                both inner worlds.
              </p>
              <ImageOrPlaceholder
                src={spaceBetween}
                alt="The space between both partners"
                visible={reveal.spaceBetween}
              />
              <ArchetypeCaption text={mapReadBetween} />
            </div>
          </div>

          <HowToReadThisVisual
            tags={howToReadTags}
            round5SupplementLines={round5SupplementLines}
            className={`max-w-xl mx-auto mb-14 ${transition} ${reveal.spaceBetween ? visibleClass : hidden}`}
          />

          {/* Conflict analysis + reflection text */}
          {(formattedResult || (Array.isArray(conflictFrictionPoints) && conflictFrictionPoints.length > 0)) && (
            <div
              className={`mb-10 ${transition} ${reveal.text ? visibleClass : hidden}`}
            >
              <ConflictAnalysisPanel
                points={conflictFrictionPoints}
                labelA={frictionLabelA}
                labelB={frictionLabelB}
              />
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
                  nameA,
                  nameB,
                  brutalTruth,
                  conflictFrictionPoints,
                  mapReadInnerA,
                  mapReadInnerB,
                  emotionalTag,
                }}
              />
            </div>
          )}

          {/* Share / Download Story — DOM card + html-to-image; partner cards captured off-screen */}
          <div
            className={`mx-auto mb-10 w-full min-w-0 max-w-[680px] ${transition} ${reveal.spaceBetween ? visibleClass : "opacity-0 pointer-events-none"}`}
          >
            <p className="mb-3 text-center text-xs text-muted-foreground">
              Your shareable relationship card
            </p>
            <StoryCardFrame
              ref={storyRelRef}
              title={getStoryCardTitle({
                mode: "couple",
                nameA,
                nameB,
                cardVariant: "relationship",
              })}
              imageUrl={spaceBetween}
            />
            <StoryShareButtons
              targetRef={storyRelRef}
              loading={storyLoading}
              setLoading={setStoryLoading}
              filename="luma-story.png"
              canvasFallback={{
                mode: "couple",
                imageUrl: spaceBetween || undefined,
                nameA: nameA || undefined,
                nameB: nameB || undefined,
                cardVariant: "relationship",
              }}
              className="mt-5"
            />

            <div
              className="pointer-events-none fixed left-[-10000px] top-0 z-0 flex w-[360px] flex-col gap-4"
              aria-hidden
            >
              {innerWorldA ? (
                <StoryCardFrame
                  ref={storyARef}
                  title={getStoryCardTitle({
                    mode: "couple",
                    nameA,
                    nameB,
                    cardVariant: "partnerA",
                  })}
                  imageUrl={innerWorldA}
                />
              ) : null}
              {innerWorldB ? (
                <StoryCardFrame
                  ref={storyBRef}
                  title={getStoryCardTitle({
                    mode: "couple",
                    nameA,
                    nameB,
                    cardVariant: "partnerB",
                  })}
                  imageUrl={innerWorldB}
                />
              ) : null}
            </div>

            {innerWorldA || innerWorldB ? (
              <p className="mb-3 mt-8 text-center text-xs text-muted-foreground">
                Partner inner world cards
              </p>
            ) : null}
            {innerWorldA ? (
              <StoryShareButtons
                targetRef={storyARef}
                loading={storyLoading}
                setLoading={setStoryLoading}
                showShare={false}
                downloadLabel={`Download ${titleA}`}
                filename={`luma-story-${(nameA || "partner-a").toString().toLowerCase().replace(/\s+/g, "-")}.png`}
                canvasFallback={{
                  mode: "couple",
                  imageUrl: innerWorldA,
                  nameA: nameA || undefined,
                  nameB: nameB || undefined,
                  cardVariant: "partnerA",
                }}
                className="mt-3"
              />
            ) : null}
            {innerWorldB ? (
              <StoryShareButtons
                targetRef={storyBRef}
                loading={storyLoading}
                setLoading={setStoryLoading}
                showShare={false}
                downloadLabel={`Download ${titleB}`}
                filename={`luma-story-${(nameB || "partner-b").toString().toLowerCase().replace(/\s+/g, "-")}.png`}
                canvasFallback={{
                  mode: "couple",
                  imageUrl: innerWorldB,
                  nameA: nameA || undefined,
                  nameB: nameB || undefined,
                  cardVariant: "partnerB",
                }}
                className="mt-3"
              />
            ) : null}
          </div>

          {/* Save Your Reflection — email capture */}
          {!savedWithEmail ? (
            <div className="mt-12 luma-glass p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-white/10">
              <h2 className="text-foreground text-xl font-serif mb-2">
                Save Your Reflection
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                Your inner landscape can evolve over time. Enter your email to save this reflection and return later.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSaveError(null);
                  const email = saveEmail.trim();
                  if (!email) {
                    setSaveError("Please enter your email.");
                    return;
                  }
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setSaveError("Please enter a valid email address.");
                    return;
                  }
                  try {
                    const mergedHowToRead =
                      data?.partnerA && data?.partnerB
                        ? resolveHowToReadTagsFromCouplePartners(data.partnerA, data.partnerB)
                        : null;
                    const howToReadTagsForSave =
                      mergedHowToRead &&
                      (mergedHowToRead.round2Tag ||
                        mergedHowToRead.round3Tag ||
                        mergedHowToRead.round5Tag)
                        ? mergedHowToRead
                        : undefined;
                    saveCoupleReflectionWithEmail({
                      content: result ?? "",
                      brutalTruth:
                        typeof brutalTruth === "string" && brutalTruth.trim() ? brutalTruth.trim() : undefined,
                      dangerousQuestion:
                        typeof dangerousQuestion === "string" && dangerousQuestion.trim()
                          ? dangerousQuestion.trim()
                          : undefined,
                      shadowInsight:
                        typeof shadowInsight === "string" && shadowInsight.trim()
                          ? shadowInsight.trim()
                          : undefined,
                      email,
                      nameA: nameA || undefined,
                      nameB: nameB || undefined,
                      innerWorldA: innerWorldA ?? null,
                      innerWorldB: innerWorldB ?? null,
                      spaceBetween: spaceBetween ?? null,
                      conflictFrictionPoints:
                        Array.isArray(conflictFrictionPoints) && conflictFrictionPoints.length > 0
                          ? conflictFrictionPoints
                          : undefined,
                      ...(howToReadTagsForSave ? { howToReadTags: howToReadTagsForSave } : {}),
                    });
                    setSavedWithEmail(true);
                  } catch {
                    setSaveError("Could not save. Please try again.");
                  }
                }}
                className="space-y-4"
              >
                <input
                  type="email"
                  value={saveEmail}
                  onChange={(e) => setSaveEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full rounded-xl border border-white/10 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#2a2a2a]/20 focus:border-white/10"
                  aria-label="Email"
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
            <div className="mt-12 luma-glass border border-white/10 p-6 md:p-8">
              <p className="text-foreground font-medium">
                Your reflection has been saved.
              </p>
              <p className="text-muted-foreground text-base mt-2 leading-relaxed">
                Return in 10 days to explore how your inner landscape evolves.
              </p>
            </div>
          )}

          <section
            className={`mt-14 md:mt-16 ${transition} ${reveal.text ? visibleClass : hidden}`}
            aria-labelledby="what-happens-next-heading"
          >
            <h2
              id="what-happens-next-heading"
              className="font-serif text-center text-[1.25rem] md:text-xl text-foreground tracking-tight mb-8 md:mb-10 [font-family:var(--font-serif-display)]"
            >
              What happens next
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col rounded-2xl border border-white/12 bg-white/[0.04] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] min-h-[200px] md:min-h-[220px]">
                <h3 className="text-base font-semibold text-foreground leading-snug">
                  Check again tomorrow
                </h3>
                <p className="mt-3 font-serif text-[1.05rem] md:text-[1.15rem] text-foreground leading-snug text-balance [font-family:var(--font-serif-display)]">
                  Your pattern isn&apos;t fixed. It shifts.
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                  {checkAgainEncouragement.hint}
                </p>
                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/couple"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_28px_rgba(120,90,180,0.22)] transition hover:opacity-95"
                  >
                    Retake reflection
                    <ArrowRight className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  </Link>
                  <Link
                    href="/couple-hub"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-white/25 hover:bg-white/[0.06]"
                  >
                    Couple Hub
                    <ArrowRight className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                  </Link>
                </div>
              </div>
              <Link
                href="/translator"
                className="group flex flex-col rounded-2xl border border-white/12 bg-white/[0.04] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-colors hover:border-white/20 hover:bg-white/[0.06] min-h-[140px]"
              >
                <h3 className="text-base font-semibold text-foreground leading-snug">
                  Talk about this
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  Put what you felt into words you can share.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:gap-2 transition-all">
                  Open Translator
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                </span>
              </Link>
              <Link
                href="/timeline"
                className="group flex flex-col rounded-2xl border border-white/12 bg-white/[0.04] p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-colors hover:border-white/20 hover:bg-white/[0.06] min-h-[140px]"
              >
                <h3 className="text-base font-semibold text-foreground leading-snug">
                  Track your pattern
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  See how your shared story shifts over time.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:gap-2 transition-all">
                  View timeline
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                </span>
              </Link>
            </div>
          </section>

          <div className="mt-10 text-center">
            <Link
              href="/"
              onClick={handleBackToHome}
              className="inline-flex items-center justify-center px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-base font-medium transition-opacity hover:opacity-90"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      </div>

      {(sequencePhase === "analyzing" || sequencePhase === "blur_peel") && (
        <div
          className={`fixed inset-0 z-[210] flex flex-col items-center justify-center px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] bg-[#030208] transition-opacity duration-700 ease-out ${
            sequencePhase === "blur_peel" ? "opacity-0 pointer-events-none" : "animate-in fade-in duration-500 opacity-100"
          }`}
          aria-live="polite"
          aria-busy={sequencePhase === "analyzing"}
        >
          {sequencePhase === "analyzing" && (
            <p className="max-w-[320px] text-center font-serif text-lg md:text-xl text-white/90 leading-snug animate-in fade-in duration-500">
              Analyzing your pattern…
            </p>
          )}
        </div>
      )}

      {showPreReveal && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] bg-[#050508]/88 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="couple-pre-reveal-title"
          aria-describedby="couple-pre-reveal-desc"
        >
          <div className="w-full max-w-[400px] text-center space-y-6">
            <h1
              id="couple-pre-reveal-title"
              className="font-serif text-[1.5rem] md:text-[1.75rem] text-foreground leading-tight tracking-tight"
            >
              Ready to reveal your dynamic
            </h1>
            <p
              id="couple-pre-reveal-desc"
              className="text-[15px] md:text-base text-muted-foreground leading-relaxed text-balance"
            >
              This combines how both of you see and respond to each other.
            </p>
            <p className="text-sm text-muted-foreground/85 leading-relaxed text-balance max-w-[320px] mx-auto">
              This might show things you haven&apos;t said out loud.
            </p>
            <button
              type="button"
              onClick={handleReveal}
              className="mt-4 w-full min-h-[56px] inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground text-base font-semibold shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.28)] transition hover:opacity-95 active:scale-[0.99]"
            >
              Reveal
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
