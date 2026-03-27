"use client";

import { useEffect, useMemo, useState } from "react";
import { updateMemory } from "@/lib/memory";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "luma_daily_question_answered_at";

type DailyQuestion = {
  id: string;
  text: string;
};

const QUESTION: DailyQuestion = {
  id: "avoid_to_keep_peace_v1",
  text: "Did you avoid saying something today to keep the peace?",
};

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function DailyQuestionCard() {
  const [visible, setVisible] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const last = localStorage.getItem(STORAGE_KEY) ?? "";
      setAnswered(last.slice(0, 10) === todayKey());
    } catch {
      setAnswered(false);
    } finally {
      setVisible(true);
    }
  }, []);

  const show = useMemo(() => visible && !answered, [visible, answered]);

  async function saveAnswer(answer: "yes" | "no") {
    if (loading) return;
    setLoading(true);

    const now = new Date().toISOString();
    const memory = updateMemory((m) => {
      const timeline = Array.isArray(m.timeline) ? m.timeline : [];
      const emotionalTrends = Array.isArray(m.patterns?.emotionalTrends) ? m.patterns.emotionalTrends : [];
      const scores = m.scores ?? { connection: 0, conflict: 0, distance: 0 };

      timeline.push({ type: "daily_question", date: now, questionId: QUESTION.id, answer });

      // STEP: store pattern when YES
      if (answer === "yes") {
        emotionalTrends.push({
          type: "avoidance_to_keep_peace",
          createdAt: now,
          questionId: QUESTION.id,
        });
      }

      // If repeated yes recently -> increase distance score.
      const recentYes = emotionalTrends
        .slice(-20)
        .filter((e: any) => e?.type === "avoidance_to_keep_peace")
        .filter((e: any) => typeof e?.createdAt === "string" && e.createdAt.slice(0, 10) >= todayKey(new Date(Date.now() - 7 * 864e5)));

      const repeated = answer === "yes" && recentYes.length >= 3;
      const nextDistance = Math.max(
        0,
        Math.min(100, (scores.distance ?? 0) + (answer === "yes" ? 2 : 0) + (repeated ? 3 : 0))
      );

      return {
        ...m,
        timeline,
        patterns: { ...m.patterns, emotionalTrends },
        scores: {
          ...scores,
          distance: nextDistance,
        },
      };
    });

    try {
      localStorage.setItem(STORAGE_KEY, now);
    } catch {}

    // Best-effort Supabase sync (if logged in)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("users_memory").upsert({
          user_id: user.id,
          memory,
          updated_at: new Date().toISOString(),
        });
      }
    } catch {}

    setAnswered(true);
    setLoading(false);
  }

  if (!show) return null;

  return (
    <div className="mx-auto mt-8 w-full max-w-[560px] rounded-2xl border border-[#322d3a]/90 bg-[#120f16]/75 px-5 py-5 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-2 duration-700">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#6d6578] font-medium">
        Daily question
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#e8e4df]">
        {QUESTION.text}
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => saveAnswer("yes")}
          className="flex-1 rounded-xl border border-[#3d3848] bg-[#1c191f]/90 px-4 py-3 text-sm font-medium text-[#ddd8d0] transition-all duration-300 hover:border-[#524a60] hover:bg-[#25222b] disabled:opacity-40 disabled:pointer-events-none"
        >
          Yes
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => saveAnswer("no")}
          className="flex-1 rounded-xl border border-[#2e2a35]/90 bg-[#141218]/70 px-4 py-3 text-sm font-medium text-[#b8ae9f] transition-all duration-300 hover:border-[#3f3a4a] hover:bg-[#1a171e] disabled:opacity-40 disabled:pointer-events-none"
        >
          No
        </button>
      </div>
      <p className="mt-3 text-xs text-[#8d849c]">
        Luma adapts to patterns over time — not single moments.
      </p>
    </div>
  );
}

