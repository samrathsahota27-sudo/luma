"use client";

import { useEffect, useMemo, useState } from "react";
import { getMemory, updateMemory } from "@/lib/memory";
import { supabase } from "@/lib/supabase";
import {
  buildDailyMicroMemoryUpdate,
  getDailyMicroQuestionForToday,
  isDailyMicroAnsweredForToday,
  readDailyMicroAnswerForDay,
  todayKeyLocal,
  writeDailyMicroAnswer,
  type DailyMicroQuestion,
} from "@/lib/dailyMicroQuestions";

export function DailyQuestionCard() {
  const [visible, setVisible] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [todayKey, setTodayKey] = useState("");
  const [question, setQuestion] = useState<DailyMicroQuestion | null>(null);

  useEffect(() => {
    const key = todayKeyLocal();
    setTodayKey(key);
    const q = getDailyMicroQuestionForToday();
    setQuestion(q);
    try {
      setAnswered(isDailyMicroAnsweredForToday(key));
    } catch {
      setAnswered(false);
    } finally {
      setVisible(true);
    }
  }, []);

  const showPrompt = useMemo(() => visible && !answered && question !== null, [visible, answered, question]);

  async function saveAnswer(answer: string) {
    if (!question || loading) return;
    setLoading(true);

    const now = new Date().toISOString();
    const key = todayKey || todayKeyLocal();

    updateMemory(buildDailyMicroMemoryUpdate(question, answer, now));

    writeDailyMicroAnswer(key, {
      questionId: question.id,
      answer,
      answeredAt: now,
    });

    try {
      const memory = getMemory();
      if (memory) {
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
      }
    } catch {
      /* best-effort sync */
    }

    setAnswered(true);
    setLoading(false);
  }

  if (!visible || !question) return null;

  if (answered) {
    const row = readDailyMicroAnswerForDay(todayKey || todayKeyLocal());
    return (
      <div className="mx-auto mt-8 w-full max-w-[560px] rounded-2xl border border-[#322d3a]/90 bg-[#120f16]/75 px-5 py-5 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-2 duration-700">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#6d6578] font-medium">Daily check-in</p>
        <p className="mt-3 text-[15px] leading-relaxed text-[#e8e4df]">Thanks — that&apos;s logged for today.</p>
        {row ? (
          <p className="mt-2 text-xs text-[#8d849c]">
            Luma folds these taps into your pattern over time, not one-off judgments.
          </p>
        ) : null}
      </div>
    );
  }

  if (!showPrompt) return null;

  return (
    <div className="mx-auto mt-8 w-full max-w-[560px] rounded-2xl border border-[#322d3a]/90 bg-[#120f16]/75 px-5 py-5 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-2 duration-700">
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#6d6578] font-medium">Daily question</p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#e8e4df]">{question.text}</p>

      {question.kind === "yes_no" ? (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => saveAnswer("yes")}
            className="flex-1 rounded-xl border border-[#3d3848] bg-[#1c191f]/90 px-4 py-3 text-sm font-medium text-[#ddd8d0] transition-all duration-300 hover:border-[#524a60] hover:bg-[#25222b] disabled:opacity-40 disabled:pointer-events-none min-h-[48px]"
          >
            Yes
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => saveAnswer("no")}
            className="flex-1 rounded-xl border border-[#2e2a35]/90 bg-[#141218]/70 px-4 py-3 text-sm font-medium text-[#b8ae9f] transition-all duration-300 hover:border-[#3f3a4a] hover:bg-[#1a171e] disabled:opacity-40 disabled:pointer-events-none min-h-[48px]"
          >
            No
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2.5">
          {(question.options ?? []).map((opt) => (
            <button
              key={opt.key}
              type="button"
              disabled={loading}
              onClick={() => saveAnswer(opt.key)}
              className="w-full rounded-xl border border-[#3d3848] bg-[#1c191f]/90 px-4 py-3 text-left text-sm font-medium text-[#ddd8d0] transition-all duration-300 hover:border-[#524a60] hover:bg-[#25222b] disabled:opacity-40 disabled:pointer-events-none min-h-[48px]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-[#8d849c]">
        One question per day. Luma adapts to patterns over time — not single moments.
      </p>
    </div>
  );
}
