/**
 * Daily micro-questions for couple hub: one prompt per calendar day (rotating pool),
 * yes/no or simple choices → memory timeline + scores + emotionalTrends.
 */

export const LEGACY_DAILY_ANSWERED_KEY = "luma_daily_question_answered_at";
export const DAILY_MICRO_ANSWERS_KEY = "luma_daily_micro_answers_v1";

export type DailyMicroKind = "yes_no" | "choice";

export type DailyMicroOption = {
  key: string;
  label: string;
};

export type DailyMicroQuestion = {
  id: string;
  kind: DailyMicroKind;
  text: string;
  /** emotionalTrends.type when this answer counts as a “signal” */
  trendTypeOnSignal?: string;
  options?: DailyMicroOption[];
};

/** Pool order is stable; which row shows is derived from local calendar date. */
export const DAILY_MICRO_QUESTIONS: DailyMicroQuestion[] = [
  {
    id: "avoid_conflict_v1",
    kind: "yes_no",
    text: "Did you avoid conflict today?",
    trendTypeOnSignal: "conflict_avoidance_daily",
  },
  {
    id: "unheard_v1",
    kind: "yes_no",
    text: "Did you feel unheard today?",
    trendTypeOnSignal: "feeling_unheard_daily",
  },
  {
    id: "avoid_to_keep_peace_v1",
    kind: "yes_no",
    text: "Did you avoid saying something today to keep the peace?",
    trendTypeOnSignal: "avoidance_to_keep_peace",
  },
  {
    id: "repair_attempt_v1",
    kind: "yes_no",
    text: "Did one of you try to repair after tension today?",
    trendTypeOnSignal: "repair_attempt_daily",
  },
  {
    id: "resentment_linger_v1",
    kind: "yes_no",
    text: "Did something small bother you longer than it “should” have?",
    trendTypeOnSignal: "resentment_linger_daily",
  },
  {
    id: "connection_felt_v1",
    kind: "choice",
    text: "How connected did you feel today?",
    options: [
      { key: "close", label: "Close" },
      { key: "mixed", label: "Mixed" },
      { key: "distant", label: "Distant" },
    ],
  },
  {
    id: "tension_resolution_v1",
    kind: "choice",
    text: "How did tense moments land today?",
    options: [
      { key: "talked", label: "We talked it through" },
      { key: "passed", label: "We let it pass" },
      { key: "stuck", label: "Still tense" },
    ],
  },
  {
    id: "appreciation_v1",
    kind: "yes_no",
    text: "Did you feel genuinely appreciated today?",
    trendTypeOnSignal: "felt_appreciated_daily",
  },
  {
    id: "alone_together_v1",
    kind: "yes_no",
    text: "Did you feel lonely even when you were together?",
    trendTypeOnSignal: "alone_together_daily",
  },
];

const EPOCH_LOCAL = new Date(2024, 0, 1).getTime();
const MAX_STORED_DAYS = 120;

export function todayKeyLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getDailyMicroQuestionForToday(
  pool: DailyMicroQuestion[] = DAILY_MICRO_QUESTIONS,
  d = new Date()
): DailyMicroQuestion {
  const len = pool.length;
  if (len === 0) {
    return {
      id: "fallback",
      kind: "yes_no",
      text: "Did you avoid conflict today?",
      trendTypeOnSignal: "conflict_avoidance_daily",
    };
  }
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.floor((dayStart - EPOCH_LOCAL) / 86400000);
  const idx = ((days % len) + len) % len;
  return pool[idx]!;
}

export type DailyMicroStoredAnswer = {
  questionId: string;
  answer: string;
  answeredAt: string;
};

function parseAnswersMap(raw: string | null): Record<string, DailyMicroStoredAnswer> {
  if (!raw) return {};
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return {};
    return o as Record<string, DailyMicroStoredAnswer>;
  } catch {
    return {};
  }
}

export function readDailyMicroAnswerForDay(dateKey: string): DailyMicroStoredAnswer | null {
  if (typeof window === "undefined") return null;
  try {
    const map = parseAnswersMap(localStorage.getItem(DAILY_MICRO_ANSWERS_KEY));
    const row = map[dateKey];
    if (row && typeof row.questionId === "string" && typeof row.answer === "string") return row;
  } catch {
    /* ignore */
  }
  return null;
}

export function hasLegacyDailyAnswerForToday(dateKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const leg = localStorage.getItem(LEGACY_DAILY_ANSWERED_KEY) ?? "";
    return leg.slice(0, 10) === dateKey;
  } catch {
    return false;
  }
}

/** True if any micro-question (or legacy daily card) was answered this calendar day. */
export function isDailyMicroAnsweredForToday(dateKey: string): boolean {
  if (readDailyMicroAnswerForDay(dateKey)) return true;
  if (hasLegacyDailyAnswerForToday(dateKey)) return true;
  return false;
}

function pruneAnswersMap(map: Record<string, DailyMicroStoredAnswer>) {
  const keys = Object.keys(map).sort();
  if (keys.length <= MAX_STORED_DAYS) return map;
  const drop = keys.slice(0, keys.length - MAX_STORED_DAYS);
  const next = { ...map };
  for (const k of drop) delete next[k];
  return next;
}

export function writeDailyMicroAnswer(dateKey: string, record: DailyMicroStoredAnswer) {
  if (typeof window === "undefined") return;
  try {
    const map = pruneAnswersMap(parseAnswersMap(localStorage.getItem(DAILY_MICRO_ANSWERS_KEY)));
    map[dateKey] = record;
    localStorage.setItem(DAILY_MICRO_ANSWERS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

type MemoryScores = { connection: number; conflict: number; distance: number };

function applyScoreDelta(scores: MemoryScores, delta: Partial<MemoryScores>): MemoryScores {
  return {
    connection: clamp((scores.connection ?? 50) + (delta.connection ?? 0), 0, 100),
    conflict: clamp((scores.conflict ?? 50) + (delta.conflict ?? 0), 0, 100),
    distance: clamp((scores.distance ?? 50) + (delta.distance ?? 0), 0, 100),
  };
}

type TrendPush = { type: string };

function yesNoDeltas(
  questionId: string,
  answer: string,
  emotionalTrends: Array<Record<string, unknown>>
): { delta: Partial<MemoryScores>; trends: TrendPush[] } {
  const trends: TrendPush[] = [];
  const yes = answer === "yes";

  if (questionId === "avoid_conflict_v1") {
    if (yes) {
      trends.push({ type: "conflict_avoidance_daily" });
      return { delta: { distance: 2, conflict: -1 }, trends };
    }
    return { delta: { connection: 2, distance: -2 }, trends };
  }

  if (questionId === "unheard_v1") {
    if (yes) {
      trends.push({ type: "feeling_unheard_daily" });
      return { delta: { distance: 4, connection: -2 }, trends };
    }
    return { delta: { connection: 3, distance: -1 }, trends };
  }

  if (questionId === "avoid_to_keep_peace_v1") {
    if (yes) {
      trends.push({ type: "avoidance_to_keep_peace" });
      const weekAgo = todayKeyLocal(new Date(Date.now() - 7 * 86400000));
      const recentAvoid = emotionalTrends.filter(
        (e) =>
          e?.type === "avoidance_to_keep_peace" &&
          typeof e?.createdAt === "string" &&
          e.createdAt.slice(0, 10) >= weekAgo
      ).length;
      const extra = recentAvoid >= 3 ? 3 : 0;
      return { delta: { distance: 2 + extra }, trends };
    }
    return { delta: { connection: 2, distance: -1 }, trends };
  }

  if (questionId === "repair_attempt_v1") {
    if (yes) {
      trends.push({ type: "repair_attempt_daily" });
      return { delta: { connection: 4, conflict: -2, distance: -3 }, trends };
    }
    return { delta: { distance: 1, conflict: 1 }, trends };
  }

  if (questionId === "resentment_linger_v1") {
    if (yes) {
      trends.push({ type: "resentment_linger_daily" });
      return { delta: { distance: 3, conflict: 2 }, trends };
    }
    return { delta: { connection: 2, conflict: -1 }, trends };
  }

  if (questionId === "appreciation_v1") {
    if (yes) {
      trends.push({ type: "felt_appreciated_daily" });
      return { delta: { connection: 4, distance: -2 }, trends };
    }
    return { delta: { connection: -1 }, trends };
  }

  if (questionId === "alone_together_v1") {
    if (yes) {
      trends.push({ type: "alone_together_daily" });
      return { delta: { distance: 4, connection: -3 }, trends };
    }
    return { delta: { connection: 3, distance: -2 }, trends };
  }

  return { delta: yes ? { distance: 1 } : { connection: 1 }, trends };
}

function choiceDeltas(questionId: string, answer: string): { delta: Partial<MemoryScores>; trends: TrendPush[] } {
  if (questionId === "connection_felt_v1") {
    if (answer === "close") return { delta: { connection: 4, distance: -3 }, trends: [] };
    if (answer === "mixed") return { delta: {}, trends: [] };
    if (answer === "distant") {
      return {
        delta: { distance: 5, connection: -3 },
        trends: [{ type: "daily_choice_distant" }],
      };
    }
  }

  if (questionId === "tension_resolution_v1") {
    if (answer === "talked") return { delta: { connection: 3, conflict: -2, distance: -2 }, trends: [] };
    if (answer === "passed") return { delta: { connection: 1, distance: 1 }, trends: [] };
    if (answer === "stuck") {
      return {
        delta: { conflict: 4, distance: 3, connection: -2 },
        trends: [{ type: "daily_choice_tension_stuck" }],
      };
    }
  }

  return { delta: {}, trends: [] };
}

/**
 * Maps answers → score nudges + emotionalTrends. Timeline uses `daily_question` for pattern-repeat helpers.
 */
export function buildDailyMicroMemoryUpdate(
  question: DailyMicroQuestion,
  answer: string,
  nowIso: string
): (m: Record<string, unknown>) => Record<string, unknown> {
  return (m) => {
    const timeline = Array.isArray(m.timeline) ? [...m.timeline] : [];
    const emotionalTrends = Array.isArray(m.patterns?.emotionalTrends)
      ? [...m.patterns.emotionalTrends]
      : [];
    const scores = (m.scores ?? {}) as MemoryScores;
    const baseScores: MemoryScores = {
      connection: typeof scores.connection === "number" ? scores.connection : 50,
      conflict: typeof scores.conflict === "number" ? scores.conflict : 50,
      distance: typeof scores.distance === "number" ? scores.distance : 50,
    };

    timeline.push({
      type: "daily_question",
      date: nowIso,
      questionId: question.id,
      answer,
      kind: question.kind,
    });

    let delta: Partial<MemoryScores> = {};
    let trendPushes: TrendPush[] = [];

    if (question.kind === "yes_no") {
      const r = yesNoDeltas(question.id, answer, emotionalTrends);
      delta = r.delta;
      trendPushes = r.trends;
    } else {
      const r = choiceDeltas(question.id, answer);
      delta = r.delta;
      trendPushes = r.trends;
    }

    for (const t of trendPushes) {
      emotionalTrends.push({
        type: t.type,
        createdAt: nowIso,
        questionId: question.id,
        answer,
      });
    }

    const nextScores = applyScoreDelta(baseScores, delta);

    return {
      ...m,
      timeline,
      patterns: {
        ...(m.patterns as object),
        emotionalTrends,
      },
      scores: {
        ...scores,
        ...nextScores,
      },
    };
  };
}
