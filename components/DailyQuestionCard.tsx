"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

type TonightQuestionPayload = {
  id?: number;
  questionDate: string;
  cycleWeek?: number;
  questionForYou: string;
  questionForThem: string;
  rationale?: string;
  answerForYou?: string;
  answerForThem?: string;
  mirrorReflection?: string | null;
  microShiftInsight?: string | null;
  savedAsRitual?: boolean;
  answered?: boolean;
};

export function DailyQuestionCard() {
  const [loadingCard, setLoadingCard] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<TonightQuestionPayload | null>(null);
  const [answerForYou, setAnswerForYou] = useState("");
  const [answerForThem, setAnswerForThem] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/tonights-question", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as TonightQuestionPayload & { error?: string };
        if (!active) return;
        if (!res.ok) throw new Error(data?.error || "Could not load tonight's question.");
        setPayload(data);
        setAnswerForYou(data.answerForYou || "");
        setAnswerForThem(data.answerForThem || "");
      } catch (e: any) {
        if (active) setError(e?.message || "Could not load tonight's question.");
      } finally {
        if (active) setLoadingCard(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function saveAnswers(saveAsRitual = false) {
    if (!payload || saving || (!answerForYou.trim() && !answerForThem.trim())) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/tonights-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerForYou: answerForYou.trim(),
          answerForThem: answerForThem.trim(),
          saveAsRitual,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as TonightQuestionPayload & { error?: string };
      if (!res.ok) throw new Error(data?.error || "Could not save tonight's answers.");
      setPayload(data);
      setAnswerForYou(data.answerForYou || answerForYou);
      setAnswerForThem(data.answerForThem || answerForThem);
    } catch (e: any) {
      setError(e?.message || "Could not save tonight's answers.");
    } finally {
      setSaving(false);
    }
  }

  async function refreshQuestion() {
    setLoading(true);
    try {
      const res = await fetch("/api/tonights-question", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as TonightQuestionPayload & { error?: string };
      if (!res.ok) throw new Error(data?.error || "Could not refresh question.");
      setPayload(data);
      setAnswerForYou(data.answerForYou || "");
      setAnswerForThem(data.answerForThem || "");
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Could not refresh tonight's question.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingCard) {
    return (
      <div className="mx-auto mt-8 w-full max-w-[680px] rounded-2xl border border-[#322d3a]/90 bg-[#120f16]/75 px-5 py-5 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2 text-sm text-[#d3ccdf]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparing Tonight&apos;s Mirror Question...
        </div>
      </div>
    );
  }

  if (!payload) return null;

  const answered = Boolean(payload.answered || payload.mirrorReflection || payload.answerForYou || payload.answerForThem);

  return (
    <div className="mx-auto mt-8 w-full max-w-[680px] rounded-2xl border border-[#322d3a]/90 bg-[#120f16]/75 px-5 py-5 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#6d6578] font-medium">Tonight&apos;s Mirror Question</p>
        {typeof payload.cycleWeek === "number" ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/55">
            Week {payload.cycleWeek}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[#3a3444]/90 bg-[#17141d]/90 p-4">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#9d93b0]">Question for you to ask them</p>
          <p className="mt-2 text-[15px] leading-relaxed text-[#ece7f3]">{payload.questionForYou}</p>
          <textarea
            value={answerForYou}
            onChange={(e) => setAnswerForYou(e.target.value)}
            placeholder="How did they respond?"
            className="mt-3 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
            rows={3}
          />
        </div>

        <div className="rounded-xl border border-[#3a3444]/90 bg-[#17141d]/90 p-4">
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#9d93b0]">Question for them to ask you</p>
          <p className="mt-2 text-[15px] leading-relaxed text-[#ece7f3]">{payload.questionForThem}</p>
          <textarea
            value={answerForThem}
            onChange={(e) => setAnswerForThem(e.target.value)}
            placeholder="How did you answer?"
            className="mt-3 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/20"
            rows={3}
          />
        </div>
      </div>

      {!answered ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || (!answerForYou.trim() && !answerForThem.trim())}
            onClick={() => saveAnswers(false)}
            className="rounded-xl border border-[#3d3848] bg-[#1c191f]/90 px-4 py-2.5 text-sm font-medium text-[#ddd8d0] transition-all duration-300 hover:border-[#524a60] hover:bg-[#25222b] disabled:opacity-40 disabled:pointer-events-none min-h-[44px]"
          >
            {saving ? "Saving..." : "See Mirror Reflection"}
          </button>
        </div>
      ) : null}

      {payload.mirrorReflection ? (
        <div className="mt-4 rounded-xl border border-violet-300/20 bg-violet-300/[0.08] px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.15em] text-violet-200/80">Mirror Reflection</p>
          <p className="mt-2 text-sm leading-relaxed text-white/85">{payload.mirrorReflection}</p>
          {payload.microShiftInsight ? (
            <p className="mt-2 text-sm text-violet-100/85">
              <Sparkles className="mr-1 inline h-3.5 w-3.5" />
              {payload.microShiftInsight}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving || Boolean(payload.savedAsRitual)}
              onClick={() => saveAnswers(true)}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#120f18] transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {payload.savedAsRitual ? "Saved as Ritual" : "Save as Ritual"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={refreshQuestion}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/[0.08] disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh card"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-[#8d849c]">Two questions. One gentle mirror. Luma tracks shifts over time, not one-off moments.</p>
      )}

      {error ? <p className="mt-3 text-sm text-red-300/90">{error}</p> : null}
    </div>
  );
}
