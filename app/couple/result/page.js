"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Share2 } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { getStoryCardTitle } from "@/lib/storyCard";
import { StoryCardFrame } from "@/components/StoryCardFrame";
import { StoryShareButtons } from "@/components/StoryShareButtons";
import { DangerousQuestionBlock } from "@/components/DangerousQuestionBlock";
import { VsCardShare } from "@/components/VsCardShare";
import { ConflictAnalysisPanel } from "@/components/ConflictAnalysisPanel";
import { cn } from "@/lib/utils";
import { resolveRound5PsychologicalSupplementLinesForCouple } from "@/lib/reflection/howToReadVisual";
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
import { SaveReflectionCta } from "@/components/SaveReflectionCta";
import { ResultClinicalDisclaimer } from "@/components/ResultClinicalDisclaimer";
import { ReflectionRetentionPrompt } from "@/components/ReflectionRetentionPrompt";
import { PrivacyTrustLine } from "@/components/PrivacyTrustLine";
import { WhatToDoWithThis } from "@/components/WhatToDoWithThis";
import { ShareLumaFab } from "@/components/ShareLumaFab";
import AddToHomeScreenCta from "@/components/AddToHomeScreenCta";
import { supabase } from "@/lib/supabase";

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

function clampPercent(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function splitResultSections(raw) {
  const parts = String(raw || "")
    .trim()
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    pattern: parts[0] || "",
    reveals: parts[1] || "",
    deeper: parts[2] || "",
    reflection: parts.slice(3).join("\n\n") || "",
  };
}

function signalLinesFromText(primary, supplement = []) {
  const fromPrimary = String(primary || "")
    .split(/[.\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const all = [...fromPrimary, ...(Array.isArray(supplement) ? supplement : [])]
    .map((s) => String(s || "").trim())
    .filter(Boolean);
  const unique = [];
  for (const line of all) {
    if (unique.includes(line)) continue;
    unique.push(line);
    if (unique.length >= 3) break;
  }
  return unique;
}

function normalizePatternName(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const strippedPrefix = raw.replace(/^shared pattern:\s*/i, "").trim();
  const quoted = strippedPrefix.match(/[“"]([^”"]+)[”"]/);
  if (quoted?.[1]) return quoted[1].trim();
  return strippedPrefix;
}

function extractMetricValue(raw, label) {
  const s = String(raw || "");
  const re = new RegExp(`${label}:\\s*(\\d+)%`, "i");
  const m = s.match(re);
  if (!m?.[1]) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

function extractMetricLabel(raw, label) {
  const s = String(raw || "");
  const re = new RegExp(`${label}:\\s*\\d+%\\s*\\(([^)]+)\\)`, "i");
  const m = s.match(re);
  return typeof m?.[1] === "string" && m[1].trim() ? m[1].trim() : null;
}

function extractDistanceSignal(raw) {
  const s = String(raw || "");
  const m = s.match(/Distance signal:\s*(.+?)(?:\.|$)/i);
  if (!m?.[1]) return "";
  return String(m[1]).trim();
}

function extractOneSharedInsight(raw) {
  const s = String(raw || "");
  // Prefer explicit "One shared insight:" line if present.
  const m = s.match(/One shared insight:\s*(.+?)(?:\n|$)/i);
  if (m?.[1]) return String(m[1]).trim();
  // Otherwise, take the sentence chunk before "Alignment:" if present.
  const beforeAlignment = s.split(/Alignment:\s*\d+%/i)[0] || "";
  const m2 = beforeAlignment.match(/:\s*(.+?)\s*$/);
  return m2?.[1] ? String(m2[1]).trim() : "";
}

function parsePartnerDecoderFromText(raw) {
  const text = String(raw || "").trim();
  if (!text) return { partnerA: "", partnerB: "", whenTogether: "" };
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  let partnerA = "";
  let partnerB = "";
  let whenTogether = "";
  for (const line of lines) {
    if (!partnerA) {
      const m = line.match(/^partner\s*a\s*:\s*(.+)$/i);
      if (m?.[1]) {
        partnerA = m[1].trim();
        continue;
      }
    }
    if (!partnerB) {
      const m = line.match(/^partner\s*b\s*:\s*(.+)$/i);
      if (m?.[1]) {
        partnerB = m[1].trim();
        continue;
      }
    }
    if (!whenTogether) {
      const m = line.match(/^(when (?:you(?:'re| are)? together|you meet|they meet))\s*:\s*(.+)$/i);
      if (m?.[2]) {
        whenTogether = m[2].trim();
      }
    }
  }
  return { partnerA, partnerB, whenTogether };
}

function toUiMicroCommand(raw) {
  const source = String(raw || "").trim();
  if (!source) return "";
  const first = source.split(/[\n.!?]+/)[0].trim();
  const words = first.split(/\s+/).filter(Boolean).slice(0, 8);
  if (!words.length) return "";
  const line = words.join(" ");
  const cap = line.charAt(0).toUpperCase() + line.slice(1);
  return /[.!?]$/.test(cap) ? cap : `${cap}.`;
}

function getRecommendedTool(pattern) {
  const p = String(pattern || "").trim();
  if (p === "Soft Pursuit") return "Emotional Translator";
  if (p === "Parallel Loneliness") return "AI Chat";
  if (p === "Quiet Withdrawal") return "Silent Signal";
  if (p === "Anxious Orbit") return "Emotional Translator";
  return "Emotional Translator";
}

function getDriftStatus(value) {
  if (value <= 30) return { text: "Low — stable", className: "text-green-400/70" };
  if (value <= 50) return { text: "Moderate — watch this", className: "text-yellow-400/70" };
  if (value <= 70) return { text: "High — needs attention", className: "text-orange-400/70" };
  return { text: "Critical — act now", className: "text-red-400/70" };
}

function getTensionStatus(value) {
  if (value <= 30) return { text: "Low — calm", className: "text-green-400/70" };
  if (value <= 50) return { text: "Moderate — friction present", className: "text-yellow-400/70" };
  if (value <= 70) return { text: "High — repair needed", className: "text-orange-400/70" };
  return { text: "Critical — high friction", className: "text-red-400/70" };
}

function decodeDeep(value) {
  let out = String(value ?? "");
  for (let i = 0; i < 3; i += 1) {
    try {
      const next = decodeURIComponent(out);
      if (next === out) break;
      out = next;
    } catch {
      break;
    }
  }
  return out;
}

function isExpiredBlobSignedUrl(raw) {
  if (!raw || typeof raw !== "string") return false;
  try {
    const target = new URL(raw);
    if (!target.hostname.includes(".blob.core.windows.net")) return false;
    const seRaw = target.searchParams.get("se");
    if (!seRaw) return false;
    const se = new Date(decodeDeep(seRaw));
    if (!Number.isFinite(se.getTime())) return false;
    return se.getTime() <= Date.now();
  } catch {
    return false;
  }
}

function deriveRelationshipPersona({ tension, drift, alignment }) {
  const t = Number.isFinite(Number(tension)) ? Number(tension) : 0;
  const d = Number.isFinite(Number(drift)) ? Number(drift) : 0;
  const a = Number.isFinite(Number(alignment)) ? Number(alignment) : 0;

  if (t >= 65 && a >= 50) {
    return {
      name: "The High-Frequency Loopers",
      description:
        "You stay highly engaged, but intensity keeps pulling you into repeat conflict loops.",
    };
  }
  if (d >= 60 || a <= 45) {
    return {
      name: "The Parallel Voyagers",
      description:
        "You move side by side with too little overlap, so distance grows without loud conflict.",
    };
  }
  if (a >= 62 && t <= 52 && d <= 52) {
    return {
      name: "The Silent Guardians",
      description:
        "You protect the bond by holding things in — until it quietly builds pressure.",
    };
  }
  if (t >= 55 && a >= 56) {
    return {
      name: "The Friction Pair",
      description:
        "There is heat and loyalty here; you clash hard, then pull each other back in.",
    };
  }
  return {
    name: "The Silent Guardians",
    description:
      "You keep the relationship stable by containing discomfort, which can turn honesty into delay.",
  };
}

function useInViewOnce(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries?.[0];
        if (e?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px", ...(options || {}) }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView, options]);
  return { ref, inView };
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
  const [showImageReadGuide, setShowImageReadGuide] = useState(false);
  const [reveal, setReveal] = useState({
    coreDynamic: false,
    innerA: false,
    innerB: false,
    spaceBetween: false,
    text: false,
  });
  const [storyLoading, setStoryLoading] = useState(false);
  const storyRelRef = useRef(null);
  const storyARef = useRef(null);
  const storyBRef = useRef(null);
  const [showPreReveal, setShowPreReveal] = useState(true);
  /** null = waiting for first CTA; analyzing → blur_peel → complete */
  const [sequencePhase, setSequencePhase] = useState(null);
  const [didRunPostRevealAnimation, setDidRunPostRevealAnimation] = useState(false);
  const [resultLinkCopied, setResultLinkCopied] = useState(false);
  const [sharePartnerBusy, setSharePartnerBusy] = useState(false);
  const [personaCopied, setPersonaCopied] = useState(false);
  const checkInRecordedRef = useRef(false);
  const shiftResolvedForFingerprintRef = useRef(null);
  const revealRunRef = useRef(null);
  const resultRequestStartedRef = useRef(false);
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
    if (resultRequestStartedRef.current) return;
    resultRequestStartedRef.current = true;

    let cancelled = false;

    async function load() {
      let sessionId = null;
      let depthFromQuery = null;
      try {
        const params = new URLSearchParams(window.location.search);
        sessionId = params.get("sessionId")?.trim() || null;
        const dm = params.get("dm");
        if (dm === "steel" || dm === "satin") depthFromQuery = dm;
      } catch {
        sessionId = null;
      }

      if (sessionId) {
        try {
          let depthMode = depthFromQuery || "satin";
          if (!depthFromQuery) {
            try {
              const stored = localStorage.getItem("luma_depth_mode");
              if (stored === "steel" || stored === "satin") depthMode = stored;
            } catch {
              /* ignore */
            }
          }
          let r = null;
          let j = null;
          for (let i = 0; i < 8; i += 1) {
            r = await fetch(
              `/api/couple-sessions/${encodeURIComponent(sessionId)}/result?dm=${encodeURIComponent(depthMode)}`
            );
            j = await r.json().catch(() => ({}));
            if (r.status !== 202) break;
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          if (cancelled) return;
          if (j?.status === "waiting") {
            window.location.replace(`/couple/waiting?sessionId=${encodeURIComponent(sessionId)}`);
            return;
          }
          if (!r.ok || j.error) {
            setLoadStatus("missing");
            return;
          }
          const bundle = j;
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
    if (!tracked) return;
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      void insertEmotionTrackerRowOncePerSession(sig, {
        emotionalTag: tracked.tag,
        shortInsight: tracked.insight,
        sessionType: "couple",
        calendarState: tracked.calendarState,
      });
    })();
  }, [data, sequencePhase]);

  useEffect(() => {
    if (data == null || sequencePhase !== "complete") return;
    const fingerprint = JSON.stringify({
      spaceBetween: data?.spaceBetween || "",
      brutalTruth: data?.brutalTruth || "",
    });
    if (revealRunRef.current === fingerprint) return;
    revealRunRef.current = fingerprint;
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

  const handleShareResultWithPartner = async () => {
    if (typeof window === "undefined" || !data) return;
    setSharePartnerBusy(true);
    try {
      const res = await fetch("/api/shared-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultJson: data }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(j.error || "Could not create share link");
      }
      const path = j.path || (j.id ? `/shared/${j.id}` : "");
      const fullUrl =
        typeof j.url === "string" && j.url.startsWith("http")
          ? j.url
          : `${window.location.origin}${path}`;
      try {
        if (navigator.share) {
          await navigator.share({
            title: "Our Luma couple reflection",
            text: "Open our shared reflection",
            url: fullUrl,
          });
        } else {
          await navigator.clipboard.writeText(fullUrl);
          setResultLinkCopied(true);
          window.setTimeout(() => setResultLinkCopied(false), 2500);
        }
      } catch (shareErr) {
        if (String(shareErr?.name || "") !== "AbortError") {
          await navigator.clipboard.writeText(fullUrl);
          setResultLinkCopied(true);
          window.setTimeout(() => setResultLinkCopied(false), 2500);
        }
      }
    } catch (e) {
      console.warn("Share link failed", e);
      window.alert(e?.message || "Could not create a share link. Try again later.");
    } finally {
      setSharePartnerBusy(false);
    }
  };

  const handleSharePersona = async () => {
    if (!relationshipPersona?.name) return;
    const payload = `[Relationship Persona]\n"${relationshipPersona.name}"\n\n${relationshipPersona.description}`;
    try {
      await navigator.clipboard.writeText(payload);
      setPersonaCopied(true);
      window.setTimeout(() => setPersonaCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const round5SupplementLines = useMemo(() => {
    if (!data?.partnerA || !data?.partnerB) return null;
    const lines = resolveRound5PsychologicalSupplementLinesForCouple(
      data.partnerA,
      data.partnerB
    );
    return lines.length ? lines : null;
  }, [data]);

  // Deep-insight reveal hooks MUST be top-level (before any early returns).
  const deepIntro = useInViewOnce();
  const deepFriction = useInViewOnce();
  const deepRisks = useInViewOnce();
  const deepBridge = useInViewOnce();
  const deepDecoder = useInViewOnce();

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
  const innerWorldARaw =
    typeof data?.innerWorldA === "string" && data.innerWorldA.trim() ? data.innerWorldA.trim() : "";
  const innerWorldBRaw =
    typeof data?.innerWorldB === "string" && data.innerWorldB.trim() ? data.innerWorldB.trim() : "";
  /** Thumbnails: skip expired signed URLs to avoid broken/502 tiles. */
  const innerWorldA =
    innerWorldARaw && !isExpiredBlobSignedUrl(innerWorldARaw)
      ? `/api/image-proxy?url=${encodeURIComponent(innerWorldARaw)}`
      : null;
  const innerWorldB =
    innerWorldBRaw && !isExpiredBlobSignedUrl(innerWorldBRaw)
      ? `/api/image-proxy?url=${encodeURIComponent(innerWorldBRaw)}`
      : null;
  /** Story export: keep download targets whenever we still have a URL (canvas/text fallback if image fails). */
  const innerWorldAExport = innerWorldARaw
    ? `/api/image-proxy?url=${encodeURIComponent(innerWorldARaw)}`
    : null;
  const innerWorldBExport = innerWorldBRaw
    ? `/api/image-proxy?url=${encodeURIComponent(innerWorldBRaw)}`
    : null;
  const spaceBetween =
    typeof data?.spaceBetween === "string" &&
    data.spaceBetween.trim() &&
    !isExpiredBlobSignedUrl(data.spaceBetween)
      ? `/api/image-proxy?url=${encodeURIComponent(data.spaceBetween)}`
      : null;
  const imageInterpretA = data?.imageInterpretA ?? null;
  const imageInterpretB = data?.imageInterpretB ?? null;
  const imageInterpretBetween = data?.imageInterpretBetween ?? null;
  const nameA = data?.nameA ?? null;
  const nameB = data?.nameB ?? null;
  const titleA = nameA && nameA.trim() ? `${nameA.trim()}'s Inner World` : "Inner World A";
  const titleB = nameB && nameB.trim() ? `${nameB.trim()}'s Inner World` : "Inner World B";
  const titleBetween = nameA?.trim() && nameB?.trim() ? `The Space Between ${nameA.trim()} & ${nameB.trim()}` : "The Space Between Us";
  const frictionLabelA = nameA?.trim() ? nameA.trim() : "Person A";
  const frictionLabelB = nameB?.trim() ? nameB.trim() : "Person B";
  const structured = data?.structured && typeof data.structured === "object" ? data.structured : null;
  const splitSections = splitResultSections(result);
  const reflectionBody = splitSections.reflection && splitSections.reflection !== "-" ? splitSections.reflection : "";
  const patternName = normalizePatternName(
    structured?.pattern ?? data?.pattern ?? data?.sharedPattern ?? splitSections.pattern
  );
  const punchline =
    structured?.summary ??
    data?.patternDescription ??
    data?.description ??
    data?.subline ??
    "";
  const driftValue = clampPercent(
    structured?.drift?.value ??
      data?.drift ??
      extractMetricValue(result, "Drift") ??
      0,
    0
  );
  const driftLabel =
    structured?.drift?.label ??
    data?.driftLabel ??
    data?.drift_label ??
    extractMetricLabel(result, "Drift") ??
    "—";
  const tensionValue = clampPercent(
    structured?.tension?.value ??
      data?.tension ??
      extractMetricValue(result, "Tension") ??
      0,
    0
  );
  const tensionLabel =
    structured?.tension?.label ??
    data?.tensionLabel ??
    data?.tension_label ??
    extractMetricLabel(result, "Tension") ??
    "—";
  const driftStatus = getDriftStatus(driftValue);
  const tensionStatus = getTensionStatus(tensionValue);
  const alignmentValue = clampPercent(
    structured?.alignment ??
      data?.alignment ??
      extractMetricValue(result, "Alignment") ??
      0,
    0
  );
  const distanceSignal =
    structured?.distance_signal ??
    data?.distanceSignal ??
    data?.distance_signal ??
    extractDistanceSignal(result) ??
    "";
  const sharedInsight =
    structured?.insight ??
    data?.sharedInsight ??
    data?.oneSharedInsight ??
    data?.insight ??
    extractOneSharedInsight(result) ??
    "";
  const relationshipPersona = (() => {
    const apiPersona =
      data?.relationshipPersona && typeof data.relationshipPersona === "object"
        ? data.relationshipPersona
        : null;
    if (
      apiPersona &&
      typeof apiPersona.name === "string" &&
      apiPersona.name.trim() &&
      typeof apiPersona.description === "string" &&
      apiPersona.description.trim()
    ) {
      return {
        name: apiPersona.name.trim(),
        description: apiPersona.description.trim(),
      };
    }
    return deriveRelationshipPersona({
      tension: tensionValue,
      drift: driftValue,
      alignment: alignmentValue,
    });
  })();
  const betweenSignals = signalLinesFromText(mapReadBetween, round5SupplementLines);
  const differencesSource = Array.isArray(structured?.differences) && structured.differences.length > 0
    ? "differences"
    : Array.isArray(structured?.frictionMap) && structured.frictionMap.length > 0
      ? "frictionMap"
      : "none";
  const differencesList = (() => {
    const diffs = Array.isArray(structured?.differences) ? structured.differences : [];
    const mappedDiffs = diffs
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        label: String(x.label || x.title || "").trim(),
        description: String(x.description || x.text || "").trim(),
      }))
      .filter((x) => x.label && x.description);
    if (mappedDiffs.length > 0) return mappedDiffs;

    const fm = Array.isArray(structured?.frictionMap) ? structured.frictionMap : [];
    return fm
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        label: String(x.title || x.label || "").trim(),
        description: String(x.text || x.description || "").trim(),
      }))
      .filter((x) => x.label && x.description);
  })();
  const differencesRenderList =
    differencesList.length > 0
      ? differencesList.slice(0, 3)
      : [
          {
            label: "How you signal stress",
            description:
              "One tends to go quiet to regulate while the other seeks contact to feel secure.",
          },
          {
            label: "How repair starts",
            description:
              "One needs space before talking; the other needs reassurance before settling.",
          },
          {
            label: "How silence is interpreted",
            description:
              "The same silence can feel calming to one and rejecting to the other.",
          },
        ];

  const whatHelpsSource = Array.isArray(structured?.whatHelps) && structured.whatHelps.length > 0
    ? "whatHelps"
    : Array.isArray(structured?.bridge) && structured.bridge.length > 0
      ? "bridge"
      : "none";
  const whatHelpsList = (() => {
    const helps = Array.isArray(structured?.whatHelps)
      ? structured.whatHelps
          .filter((x) => typeof x === "string" && x.trim())
          .map((x) => toUiMicroCommand(x))
          .filter(Boolean)
      : [];
    if (helps.length > 0) return helps;

    const bridge = Array.isArray(structured?.bridge) ? structured.bridge : [];
    const fromBridge = bridge
      .filter((x) => x && typeof x === "object")
      .map((x) => toUiMicroCommand(x.text || x.description || x.title || x.label || ""))
      .filter(Boolean);
    const defaults =
      tensionValue >= 65
        ? ["Name the tension directly tonight.", "Ask what felt missed.", "Respond before withdrawing."]
        : driftValue >= 60 || alignmentValue <= 45
          ? ["Interrupt distance with one check-in.", "Say one unmet need clearly.", "Schedule repair within 24 hours."]
          : ["Protect this with weekly honesty.", "Name silence before it spreads.", "Repair small misses early."];
    const normalizedDefaults = defaults.map((x) => toUiMicroCommand(x)).filter(Boolean).slice(0, 3);
    const merged = [...helps, ...fromBridge]
      .map((x) => String(x || "").trim())
      .filter(Boolean);
    const unique = [];
    for (const item of merged) {
      if (unique.includes(item)) continue;
      unique.push(item);
      if (unique.length >= 3) break;
    }
    if (unique.length < 3) {
      for (const item of normalizedDefaults) {
        if (unique.includes(item)) continue;
        unique.push(item);
        if (unique.length >= 3) break;
      }
    }
    return unique.slice(0, 3);
  })();

  const parsedDecoder = parsePartnerDecoderFromText(structured?.decoder);
  const hasPartnerDecoderObject =
    structured?.partnerDecoder &&
    typeof structured.partnerDecoder === "object" &&
    (typeof structured.partnerDecoder.partnerA === "string" ||
      typeof structured.partnerDecoder.partnerB === "string" ||
      typeof structured.partnerDecoder.whenTheyMeet === "string");
  const decoderSource = hasPartnerDecoderObject
    ? "partnerDecoder"
    : typeof structured?.decoder === "string" && structured.decoder.trim()
      ? "decoder"
      : "none";
  const decoderPartnerA =
    typeof structured?.partnerDecoder?.partnerA === "string"
      ? structured.partnerDecoder.partnerA.trim()
      : parsedDecoder.partnerA;
  const decoderPartnerB =
    typeof structured?.partnerDecoder?.partnerB === "string"
      ? structured.partnerDecoder.partnerB.trim()
      : parsedDecoder.partnerB;
  const decoderWhenTogether =
    typeof structured?.partnerDecoder?.whenTheyMeet === "string"
      ? structured.partnerDecoder.whenTheyMeet.trim()
      : parsedDecoder.whenTogether;
  const decoderPartnerAResolved =
    decoderPartnerA ||
    "Partner A tends to process inward first, then reconnect after pressure drops.";
  const decoderPartnerBResolved =
    decoderPartnerB ||
    "Partner B tends to seek signal quickly, so reassurance timing matters more.";
  const decoderWhenTogetherResolved =
    decoderWhenTogether ||
    sharedInsight ||
    distanceSignal ||
    "Your interpretations diverge fastest in silence; name what each silence means before assuming intent.";
  const hasPartnerDecoder = Boolean(decoderPartnerAResolved || decoderPartnerBResolved || decoderWhenTogetherResolved);
  const decoderData = { partnerA: decoderPartnerA, partnerB: decoderPartnerB, whenTogether: decoderWhenTogether };

  const frictionCards = (() => {
    const fm = structured?.frictionMap;
    if (Array.isArray(fm) && fm.length) {
      const cards = fm
        .map((x) => {
          if (!x || typeof x !== "object") return null;
          const title = String(x.title || x.label || "").trim();
          const text = String(x.text || x.description || "").trim();
          return title && text ? { title, text } : null;
        })
        .filter(Boolean)
        .slice(0, 3);
      if (cards.length) return cards;
      // fall through if all items failed normalisation
    }
    const diffs = structured?.differences;
    if (Array.isArray(diffs) && diffs.length) {
      return diffs
        .map((x) => {
          if (!x || typeof x !== "object") return null;
          const title = String(x.label || x.title || "").trim();
          const text = String(x.description || x.text || "").trim();
          return title && text ? { title, text } : null;
        })
        .filter(Boolean)
        .slice(0, 3);
    }
    return [];
  })();

  const riskCards = (() => {
    const risks = structured?.riskPatterns;
    if (!Array.isArray(risks) || !risks.length) return [];
    return risks
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const title =
          typeof x.title === "string"
            ? x.title
            : typeof x.label === "string"
              ? x.label
              : "";
        const text =
          typeof x.text === "string"
            ? x.text
            : typeof x.description === "string"
              ? x.description
              : "";
        return { title: String(title || "").trim(), text: String(text || "").trim() };
      })
      .filter((x) => x && x.title && x.text)
      .slice(0, 3);
  })();

  /** “What may be asking for attention” — risk patterns first, then signals / fallbacks. */
  const attentionList = (() => {
    if (riskCards.length > 0) {
      return riskCards.map((c) => ({ title: c.title, text: c.text }));
    }
    const items = [];
    const ds = String(distanceSignal || "").trim();
    if (ds) items.push({ title: "Distance signal", text: ds });
    const shadow = typeof shadowInsight === "string" ? shadowInsight.trim() : "";
    if (shadow) items.push({ title: "What stays in the shadows", text: shadow });
    const bt = typeof brutalTruth === "string" ? brutalTruth.trim() : "";
    if (bt && items.length < 3) {
      items.push({
        title: "The blunt read",
        text: bt.length > 200 ? `${bt.slice(0, 197)}…` : bt,
      });
    }
    if (items.length >= 2) return items.slice(0, 3);
    const fill = [];
    if (tensionValue >= 55) {
      fill.push({
        title: "Tension on the line",
        text: `Tension is ${tensionValue}% (${tensionLabel}). What you sidestep often returns as heat or shutdown.`,
      });
    }
    if (driftValue >= 50 && items.length + fill.length < 3) {
      fill.push({
        title: "Drift to watch",
        text: `Drift is ${driftValue}% (${driftLabel}). Parallel coping can feel calm until you realize you’ve stopped overlapping.`,
      });
    }
    if (items.length + fill.length < 2) {
      fill.push({
        title: "Repair rhythm",
        text: "Notice if you’re both waiting for the other to reopen—timing often matters more than content.",
      });
    }
    if (items.length + fill.length < 2) {
      const tag = typeof emotionalTag === "string" ? emotionalTag.trim() : "";
      fill.push({
        title: "Emotional signal",
        text: tag
          ? `Your read landed on “${tag}”—notice where that shows up between you this week.`
          : "Ask what felt unnamed in the last hard moment—not to fix it, just to map it.",
      });
    }
    return [...items, ...fill].slice(0, 3);
  })();

  const bridgeCards = (() => {
    const bridge = structured?.bridge;
    if (Array.isArray(bridge) && bridge.length) {
      const cards = bridge
        .map((x) => {
          if (!x || typeof x !== "object") return null;
          const title = String(x.title || x.label || "").trim();
          const text = String(x.text || x.description || "").trim();
          return title && text ? { title, text } : null;
        })
        .filter(Boolean)
        .slice(0, 3);
      if (cards.length) return cards;
      // fall through if all items failed normalisation
    }
    const helps = structured?.whatHelps;
    if (Array.isArray(helps) && helps.length) {
      return helps
        .filter((x) => typeof x === "string" && x.trim())
        .map((x, i) => ({ title: `Move ${i + 1}`, text: String(x).trim() }))
        .slice(0, 3);
    }
    return [];
  })();

  const decoderText = (() => {
    const s = typeof structured?.decoder === "string" ? structured.decoder.trim() : "";
    if (s) return s;
    const pd = structured?.partnerDecoder;
    const a = typeof pd?.partnerA === "string" ? pd.partnerA.trim() : "";
    const b = typeof pd?.partnerB === "string" ? pd.partnerB.trim() : "";
    const m = typeof pd?.whenTheyMeet === "string" ? pd.whenTheyMeet.trim() : "";
    const parts = [];
    if (a) parts.push(`Partner A: ${a}`);
    if (b) parts.push(`Partner B: ${b}`);
    if (m) parts.push(`When you meet: ${m}`);
    return parts.join("\n\n").trim();
  })();

  const coreDynamicText = getCoupleCoreDynamicText(data);
  const shiftRevealOpen = coreDynamicText ? reveal.coreDynamic : reveal.innerA;
  const recommendedTool = getRecommendedTool(patternName);
  const weeklyShiftInsightText =
    shiftInsight ||
    (typeof data?.weeklyShiftInsight === "string" ? data.weeklyShiftInsight.trim() : "") ||
    null;
  const recommendedToolLine =
    recommendedTool === "AI Chat"
      ? "You're both stuck in the same loop. Talk it through with a neutral voice."
      : recommendedTool === "Silent Signal"
        ? "Words aren't landing. Try saying it a different way."
        : "Paste your last argument. See where the drift actually started.";
  const resultType =
    tensionValue >= 65
      ? "high_tension"
      : driftValue >= 60 || alignmentValue <= 45
        ? "high_distance"
        : "balanced";
  const prescription = (() => {
    if (resultType === "high_tension") {
      return {
        title: "You’re not stuck. You’re misaligned.",
        action: "The next step is clarity, not guessing.",
        cta: "Use Emotional Translator",
        subtext: "Paste a recent message that felt 'off'. We’ll decode what was really meant.",
        href: "/translator",
      };
    }
    if (resultType === "high_distance") {
      return {
        title: "You’re drifting, not disconnected.",
        action: "This doesn’t fix itself. It fades unless interrupted.",
        cta: "Generate a Reconnection Plan",
        subtext: "A simple, specific action you can take in the next 24 hours.",
        href: "/future-paths",
      };
    }
    return {
      title: "This works — but it’s fragile.",
      action: "Strong dynamics are maintained, not assumed.",
      cta: "Strengthen Your Pattern",
      subtext: "See what could quietly break this over time.",
      href: "/couple-hub",
    };
  })();

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
      <main className="relative z-10 flex-1 pt-24 pb-24 px-6">
        <div className="max-w-[720px] mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Couple Reflection
            </span>
            {coreDynamicText ? (
              <>
                <div
                  className={`mt-8 md:mt-10 rounded-2xl border border-[rgba(140,110,200,0.28)] bg-white/[0.07] px-6 py-8 md:px-8 md:py-10 shadow-[0_0_0_1px_rgba(140,110,200,0.14),0_20px_60px_rgba(0,0,0,0.35)] ${transition} ${reveal.coreDynamic ? visibleClass : hidden}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground mb-4 md:mb-5">
                    Core dynamic
                  </p>
                  <p className="font-serif font-semibold text-[1.9rem] sm:text-[2.15rem] md:text-[2.55rem] lg:text-[2.75rem] text-foreground leading-[1.14] tracking-[-0.02em] text-balance max-w-[640px] mx-auto [font-family:var(--font-serif-display)] line-clamp-1">
                    {patternName || coreDynamicText}
                  </p>
                  <p className="mt-3 text-sm md:text-base text-white/75 max-w-[620px] mx-auto line-clamp-2">
                    {punchline || coreDynamicText}
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

          <section className={`mb-10 ${transition} ${reveal.spaceBetween ? visibleClass : hidden}`}>
            {relationshipPersona?.name ? (
              <div className="mb-6 rounded-2xl border border-white/12 bg-white/[0.04] p-5 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Relationship Persona</p>
                <h2 className="mt-2 font-serif text-[28px] sm:text-[32px] leading-tight text-white [font-family:var(--font-serif-display)]">
                  &quot;{relationshipPersona.name}&quot;
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/75 max-w-[560px] mx-auto">
                  {relationshipPersona.description}
                </p>
                <button
                  type="button"
                  onClick={handleSharePersona}
                  className="mt-4 w-full sm:w-auto max-w-sm mx-auto sm:mx-0 inline-flex min-h-[48px] sm:min-h-[44px] items-center justify-center rounded-xl bg-white text-[#0b0a0d] px-4 py-2.5 text-sm font-semibold transition hover:opacity-95"
                >
                  {personaCopied ? "Copied" : "Share this"}
                </button>
              </div>
            ) : null}
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_26px_120px_rgba(0,0,0,0.65)] backdrop-blur-xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(140,110,200,0.16),transparent_70%),radial-gradient(ellipse_55%_45%_at_100%_100%,rgba(90,130,200,0.08),transparent_70%)]"
              />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/25" aria-hidden />
                  Couple Reflection
                </div>

                <div className="mt-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3 px-1 justify-items-center sm:justify-items-stretch">
                  {[
                    { src: innerWorldA, label: "Inner World A" },
                    { src: spaceBetween, label: "Space Between" },
                    { src: innerWorldB, label: "Inner World B" },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center w-full max-w-[200px] sm:max-w-none sm:flex-1">
                      <div className="relative w-full max-w-[120px] aspect-square sm:max-w-none sm:w-[104px] sm:h-[104px] sm:aspect-auto rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
                        {item.src ? (
                          <GeneratedCoupleArtImage src={item.src} alt={item.label} className="absolute inset-0 h-full w-full" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1c1830] to-[#141c28]" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-white/55 text-center">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 mb-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowImageReadGuide((v) => !v)}
                    className="border border-white/20 text-white/60 text-xs px-4 py-2 rounded-full hover:border-white/40 transition"
                  >
                    {showImageReadGuide ? "Close ↑" : "How to read these images ↓"}
                  </button>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    showImageReadGuide ? "max-h-[520px] opacity-100 mb-4" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="rounded-xl bg-[#0f0b14] p-4 text-sm text-white/70 text-left">
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/55 mb-1">Inner World A</p>
                      <p>
                        {imageInterpretA ||
                          "The colors, shapes and movement in this image reflect Partner A's emotional state — what feels dominant, what feels suppressed, and what they're reaching toward."}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/55 mb-1">The Space Between</p>
                      <p>
                        {imageInterpretBetween ||
                          "This image shows what exists in the emotional field between both of you — not one person's world, but the texture of your connection itself."}
                      </p>
                    </div>
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/55 mb-1">Inner World B</p>
                      <p>
                        {imageInterpretB ||
                          "Partner B's inner world rendered visually — notice whether it feels open or closed, sharp or soft, still or in motion."}
                      </p>
                    </div>
                  </div>
                </div>

                <h2 className="font-serif text-[24px] sm:text-[28px] text-white [font-family:var(--font-serif-display)] tracking-tight leading-tight">
                  {patternName || "Shared Pattern"}
                </h2>
                {punchline ? (
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    {punchline}
                  </p>
                ) : null}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-widest text-white/60">Drift</p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-white">{driftValue}%</p>
                    <p className="mt-1 text-xs text-white/50">{driftLabel}</p>
                    <p className={`mt-1 text-xs ${driftStatus.className}`}>{driftStatus.text}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-widest text-white/60">Tension</p>
                    <p className="mt-2 text-2xl font-bold tabular-nums text-white">{tensionValue}%</p>
                    <p className="mt-1 text-xs text-white/50">{tensionLabel}</p>
                    <p className={`mt-1 text-xs ${tensionStatus.className}`}>{tensionStatus.text}</p>
                  </div>
                </div>

                {sharedInsight ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-widest text-white/60">One shared insight</p>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-white">{sharedInsight}</p>
                  </div>
                ) : null}

                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60">Alignment</p>
                  <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={transition}
                      style={{
                        width: `${alignmentValue}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, rgba(140,110,200,0.9), rgba(230,230,235,0.8))",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/55 tabular-nums">{alignmentValue}% aligned</p>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-widest text-white/60">Distance signal</p>
                  <p className="mt-2 text-base font-semibold leading-relaxed text-white">{distanceSignal || "—"}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <h3 className="font-serif text-[22px] text-foreground [font-family:var(--font-serif-display)]">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-200/85 not-italic">
                  Friction Map
                </span>
                <span className="mt-1 block">Where you diverge.</span>
              </h3>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">
                A plain-language map of topics or habits where your two styles pull in different directions — not to
                pick sides, but to see the pattern.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {differencesRenderList.map((item, idx) => (
                  <div
                    key={`${item.label}-${idx}`}
                    className="rounded-xl border border-white/10 border-l-2 border-l-orange-400/30 bg-[#0f0b14] p-4"
                  >
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/70">{item.description}</p>
                  </div>
                ))}
              </div>
            </section>

          <section className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <h3 className="font-serif text-[22px] text-foreground [font-family:var(--font-serif-display)]">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/90 not-italic">
                Attention
              </span>
              <span className="mt-1 block">What may be asking for attention.</span>
            </h3>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">
              Soft signals Luma noticed in your choices — areas that might need a little air or a clearer conversation.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {attentionList.map((item, idx) => (
                <div
                  key={`${item.title}-${idx}`}
                  className="rounded-xl border border-white/10 border-l-2 border-l-amber-400/35 bg-[#0f0b14] p-4"
                >
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10 w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <h3 className="font-serif text-[22px] text-foreground [font-family:var(--font-serif-display)]">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-200/90 not-italic">
                Three Things
              </span>
              <span className="mt-1 block">What could shift this.</span>
            </h3>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">
              Small, concrete angles to try — not homework, just starting points if you want movement.
            </p>
            <div className="mt-4 space-y-2.5">
              {whatHelpsList.map((item, idx) => (
                <div
                  key={`${item}-${idx}`}
                  className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-300/90" aria-hidden />
                  <p className="text-sm font-medium text-white/85">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {hasPartnerDecoder || decoderText ? (
            <section className="mb-10 w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <h3 className="font-serif text-[22px] text-foreground [font-family:var(--font-serif-display)]">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200/90 not-italic">
                  The Decoder
                </span>
                <span className="mt-1 block">How you each work.</span>
              </h3>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">
                Short reads of how each of you tends to process closeness, stress, or repair — so the same moment can
                mean two different things.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {decoderPartnerAResolved ? (
                  <div className="rounded-xl border border-white/10 bg-[#0f0b14] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Partner A</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">{decoderPartnerAResolved}</p>
                  </div>
                ) : null}
                {decoderPartnerBResolved ? (
                  <div className="rounded-xl border border-white/10 bg-[#0f0b14] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Partner B</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">{decoderPartnerBResolved}</p>
                  </div>
                ) : null}
                {decoderWhenTogetherResolved ? (
                  <div className="rounded-xl border border-violet-400/20 bg-[linear-gradient(135deg,rgba(124,58,237,0.14),rgba(59,130,246,0.1))] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-100/90">When you&apos;re together</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">{decoderWhenTogetherResolved}</p>
                  </div>
                ) : null}
                {!decoderPartnerA && !decoderPartnerB && decoderText ? (
                  <div className="rounded-xl border border-white/10 bg-[#0f0b14] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Pattern read</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/75 whitespace-pre-line">{decoderText}</p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {weeklyShiftInsightText ? (
            <div
              className={`mb-10 max-w-[560px] mx-auto rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 ${transition} ${shiftRevealOpen ? visibleClass : hidden}`}
            >
              <p className="text-xs uppercase tracking-widest text-white/60 mb-1">Since last time</p>
              <p className="text-sm text-white/70 leading-relaxed">{weeklyShiftInsightText}</p>
            </div>
          ) : null}

          {/* Conflict analysis + supporting text */}
          <div
            className={`mb-10 w-full flex flex-col gap-4 ${transition} ${reveal.text ? visibleClass : hidden}`}
          >
              {Array.isArray(conflictFrictionPoints) && conflictFrictionPoints.length > 0 ? (
                <ConflictAnalysisPanel
                  points={conflictFrictionPoints}
                  labelA={frictionLabelA}
                  labelB={frictionLabelB}
                />
              ) : null}
              <div className="mt-6 space-y-6">
                {reflectionBody ? (
                  <section className="luma-glass border border-white/10 p-4">
                    <h3 className="font-serif text-[18px] text-foreground [font-family:var(--font-serif-display)]">
                      Reflection
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70 whitespace-pre-line">
                      {reflectionBody}
                    </p>
                  </section>
                ) : (
                  <section className="luma-glass border border-white/10 p-4">
                    <h3 className="font-serif text-[18px] text-foreground [font-family:var(--font-serif-display)]">
                      Reflection
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      You both care about this bond, but your repair rhythm needs clearer naming.
                    </p>
                  </section>
                )}
              </div>
              <div className="mt-6 mb-6 border-t border-white/10" />
              <DangerousQuestionBlock
                text={dangerousQuestion}
                brutalTruth={brutalTruth}
                emotionalTag={emotionalTag}
                resultPreview={result ?? ""}
                mode="couple"
              />
              <section className="mt-6 rounded-xl border border-violet-400/25 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(59,130,246,0.14))] p-5">
                <div className="inline-flex items-center rounded-full border border-violet-300/30 bg-violet-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-100/90">
                  Based on your map
                </div>
                <h3 className="mt-3 font-serif text-[22px] text-white [font-family:var(--font-serif-display)]">
                  Where to go next.
                </h3>
                <p className="mt-3 text-xl font-bold text-white">{recommendedTool}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{recommendedToolLine}</p>
                <Link
                  href="/couple-hub"
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white text-[#0b0a0d] px-4 py-2.5 text-sm font-semibold transition hover:opacity-95"
                >
                  Open Couple Hub →
                </Link>
              </section>
              <div className="mt-6 mb-6 border-t border-white/10" />
          </div>

          <div className="mb-6 border-t border-white/10" />

          <div className={`mb-8 flex justify-center ${transition} ${reveal.text ? visibleClass : hidden}`}>
            <button
              type="button"
              onClick={handleShareResultWithPartner}
              disabled={sharePartnerBusy || !data}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              {resultLinkCopied ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Share2 className="h-4 w-4" aria-hidden />
              )}
              {sharePartnerBusy
                ? "Creating link…"
                : resultLinkCopied
                  ? "Link copied"
                  : "Share with partner"}
            </button>
          </div>

          {/* Partner story cards for export — always mounted off-screen (not inside opacity-gated wrappers) */}
          <div
            className="pointer-events-none fixed left-[-10000px] top-0 z-0 flex w-[360px] flex-col gap-4"
            aria-hidden
          >
            {innerWorldAExport ? (
              <StoryCardFrame
                ref={storyARef}
                title={getStoryCardTitle({
                  mode: "couple",
                  nameA,
                  nameB,
                  cardVariant: "partnerA",
                })}
                imageUrl={innerWorldAExport}
              />
            ) : null}
            {innerWorldBExport ? (
              <StoryCardFrame
                ref={storyBRef}
                title={getStoryCardTitle({
                  mode: "couple",
                  nameA,
                  nameB,
                  cardVariant: "partnerB",
                })}
                imageUrl={innerWorldBExport}
              />
            ) : null}
          </div>

          {/* Share / Download Story — relationship card */}
          <div
            className={`mx-auto mb-10 w-full min-w-0 max-w-[680px] ${transition} ${reveal.spaceBetween ? visibleClass : hidden}`}
          >
            <p className="mb-3 text-center text-xs text-muted-foreground">
              Your shareable relationship card
            </p>
            <StoryCardFrame
              ref={storyRelRef}
              title={
                structured?.pattern ||
                getStoryCardTitle({
                  mode: "couple",
                  nameA,
                  nameB,
                  cardVariant: "relationship",
                })
              }
              imageUrl={spaceBetween}
              insight={sharedInsight || coreDynamicText}
              drift={driftValue}
              tension={tensionValue}
              className="bg-[#050508] border border-white/10"
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
          </div>

          {/* Partner inner world story downloads — same reveal as relationship story card */}
          <div
            className={`mx-auto mb-10 w-full min-w-0 max-w-[680px] ${transition} ${reveal.spaceBetween ? visibleClass : hidden}`}
          >
            {innerWorldAExport || innerWorldBExport ? (
              <p className="mb-3 text-center text-xs text-muted-foreground">
                Partner inner world cards
              </p>
            ) : null}
            {innerWorldAExport ? (
              <StoryShareButtons
                targetRef={storyARef}
                loading={storyLoading}
                setLoading={setStoryLoading}
                showShare={false}
                downloadLabel={`Download ${titleA} story`}
                filename={`luma-story-${(nameA || "partner-a").toString().toLowerCase().replace(/\s+/g, "-")}.png`}
                canvasFallback={{
                  mode: "couple",
                  imageUrl: innerWorldAExport,
                  nameA: nameA || undefined,
                  nameB: nameB || undefined,
                  cardVariant: "partnerA",
                }}
                className="mt-3"
              />
            ) : null}
            {innerWorldBExport ? (
              <StoryShareButtons
                targetRef={storyBRef}
                loading={storyLoading}
                setLoading={setStoryLoading}
                showShare={false}
                downloadLabel={`Download ${titleB} story`}
                filename={`luma-story-${(nameB || "partner-b").toString().toLowerCase().replace(/\s+/g, "-")}.png`}
                canvasFallback={{
                  mode: "couple",
                  imageUrl: innerWorldBExport,
                  nameA: nameA || undefined,
                  nameB: nameB || undefined,
                  cardVariant: "partnerB",
                }}
                className="mt-3"
              />
            ) : null}
          </div>

          <div
            className={`mx-auto mb-10 w-full min-w-0 max-w-[680px] ${transition} ${reveal.text ? visibleClass : hidden}`}
          >
            <VsCardShare
              className="mt-2"
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

          {/* Deep insights — appended below existing result UI */}
          {(frictionCards.length > 0 || riskCards.length > 0 || bridgeCards.length > 0 || decoderText) ? (
            <div className="mx-auto mt-10 mb-12 max-w-[680px]">
              <div
                ref={deepIntro.ref}
                className={cn(
                  "text-center transition-all duration-700 ease-out",
                  deepIntro.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                )}
              >
                <p className="text-sm text-white/55 leading-relaxed">
                  There’s more beneath this.
                </p>
              </div>

              {frictionCards.length > 0 ? (
                <section
                  ref={deepFriction.ref}
                  className={cn(
                    "mt-8 transition-all duration-700 ease-out",
                    deepFriction.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  )}
                >
                  <p className="text-xs uppercase tracking-widest text-white/55">Where you’re different</p>
                  <h2 className="mt-2 font-serif text-[22px] text-white [font-family:var(--font-serif-display)]">
                    The Friction Map
                  </h2>
                  <p className="mt-2 text-sm text-white/55 leading-relaxed">
                    Deeper differences in how you each move through stress, repair, and closeness — written as paired
                    observations.
                  </p>
                  <div className="mt-4 grid gap-3">
                    {frictionCards.map((c) => (
                      <div key={c.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-sm font-semibold text-white">{c.title}</p>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {riskCards.length > 0 ? (
                <section
                  ref={deepRisks.ref}
                  className={cn(
                    "mt-10 transition-all duration-700 ease-out",
                    deepRisks.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  )}
                >
                  <p className="text-xs uppercase tracking-widest text-white/55">What could break this</p>
                  <h2 className="mt-2 font-serif text-[22px] text-white [font-family:var(--font-serif-display)]">
                    The Risk Patterns
                  </h2>
                  <p className="mt-2 text-sm text-white/55 leading-relaxed">
                    Where this dynamic could wear thin if left unnamed — not predictions, just gentle risk awareness.
                  </p>
                  <div className="mt-4 grid gap-3">
                    {riskCards.map((c) => (
                      <div key={c.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-sm font-semibold text-white">{c.title}</p>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {bridgeCards.length > 0 ? (
                <section
                  ref={deepBridge.ref}
                  className={cn(
                    "mt-10 transition-all duration-700 ease-out",
                    deepBridge.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  )}
                >
                  <p className="text-xs uppercase tracking-widest text-white/55">What would actually help</p>
                  <h2 className="mt-2 font-serif text-[22px] text-white [font-family:var(--font-serif-display)]">
                    The Bridge
                  </h2>
                  <p className="mt-2 text-sm text-white/55 leading-relaxed">
                    Ideas that meet both of you halfway — ways to translate one inner language into the other.
                  </p>
                  <div className="mt-4 grid gap-3">
                    {bridgeCards.map((c) => (
                      <div key={c.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-sm font-semibold text-white">{c.title}</p>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {decoderText ? (
                <section
                  ref={deepDecoder.ref}
                  className={cn(
                    "mt-10 transition-all duration-700 ease-out",
                    deepDecoder.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  )}
                >
                  <p className="text-xs uppercase tracking-widest text-white/55">How to understand each other</p>
                  <h2 className="mt-2 font-serif text-[22px] text-white [font-family:var(--font-serif-display)]">
                    The Decoder
                  </h2>
                  <p className="mt-2 text-sm text-white/55 leading-relaxed">
                    A longer narrative read of your two inner worlds and what happens when they meet.
                  </p>
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm leading-relaxed text-white/75 whitespace-pre-line">{decoderText}</p>
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}

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
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
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

          <section className="mt-12 mb-4">
            <h2 className="font-serif text-center text-[1.25rem] text-foreground tracking-tight [font-family:var(--font-serif-display)]">
              What happens next.
            </h2>

            <div className="mt-6 rounded-2xl border border-white/12 bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-base font-semibold text-foreground leading-snug">
                Go deeper together
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Your shared tools, timeline and emotional translator are waiting.
              </p>
              <Link
                href="/couple-hub"
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                Open Couple Hub →
              </Link>
            </div>

            <div className="mb-6 mt-6 rounded-2xl border border-white/12 bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-base font-semibold text-foreground leading-snug">
                Track how this shifts
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Your pattern isn&apos;t fixed. Come back tomorrow and see what moved.
              </p>
              <Link
                href="/timeline"
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                View timeline →
              </Link>
            </div>
          </section>

          <section className="mt-10 mb-6" aria-labelledby="your-next-step-heading">
            <h2
              id="your-next-step-heading"
              className="font-serif text-center text-[1.3rem] text-foreground tracking-tight [font-family:var(--font-serif-display)]"
            >
              Your Next Step
            </h2>
            <div className="mt-5 rounded-2xl border border-white/12 bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <p className="text-base font-semibold text-foreground leading-snug">{prescription.title}</p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{prescription.action}</p>
              <div className="mt-5 rounded-xl border border-violet-300/20 bg-[linear-gradient(135deg,rgba(124,58,237,0.16),rgba(59,130,246,0.12))] p-4">
                <p className="text-sm text-white/85 leading-relaxed">{prescription.subtext}</p>
                <Link
                  href={prescription.href}
                  className="mt-4 inline-flex w-full min-h-[46px] items-center justify-center rounded-xl bg-white text-[#0b0a0d] px-4 py-2.5 text-sm font-semibold transition hover:opacity-95"
                >
                  {prescription.cta}
                </Link>
              </div>
            </div>
          </section>

          {sequencePhase === "complete" ? (
            <div className="mt-12 max-w-[720px] mx-auto px-4 md:px-0">
              <SaveReflectionCta />
              <AddToHomeScreenCta />
            </div>
          ) : null}
        </div>
      </main>
      </div>

      {loadStatus === "ready" ? (
        <div className="border-t border-white/10 bg-background px-4 py-6 space-y-6 max-w-[720px] mx-auto w-full">
          <WhatToDoWithThis variant="dark" />
          <PrivacyTrustLine size="wide" />
          <ReflectionRetentionPrompt variant="couple" />
          <ResultClinicalDisclaimer />
        </div>
      ) : null}

      <Footer />

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

      {loadStatus === "ready" ? (
        <ShareLumaFab
          insightSnippet={
            patternName ||
            punchline ||
            (typeof result === "string" ? result.replace(/\s+/g, " ").trim().slice(0, 120) : null)
          }
        />
      ) : null}
    </div>
  );
}
