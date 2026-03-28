/**
 * Client-only: in-app nudges on Couple Hub (no push) — inactivity vs couple actions,
 * and short insights when stored patterns repeat.
 */

import { DAILY_MICRO_ANSWERS_KEY, LEGACY_DAILY_ANSWERED_KEY } from "@/lib/dailyMicroQuestions";
import { COUPLE_CHECKIN_STORAGE_KEY } from "@/lib/coupleCheckInReminder";
import {
  PATTERN_REPEAT_SNOOZE_KEY,
  snoozePatternRepeatReminder,
} from "@/lib/patternRepeatReminder";

export const COUPLE_HUB_INACTIVITY_SNOOZE_KEY = "luma_couple_hub_inactivity_snooze_until";
export const COUPLE_HUB_PATTERN_SNOOZE_KEY = "luma_couple_hub_pattern_snooze_until";

const MS_DAY = 86400000;
/** No daily tap / couple result for this many days → gentle reminder */
const COUPLE_IDLE_DAYS = 4;
const TREND_WINDOW_MS = 40 * MS_DAY;
const DAILY_YES_WINDOW_MS = 21 * MS_DAY;

function parseTs(iso: string | undefined): number {
  if (!iso || typeof iso !== "string") return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

/**
 * Latest meaningful couple engagement (daily check-in, couple result view, legacy daily).
 */
export function getLastCoupleMeaningfulActivityMs(): number {
  if (typeof window === "undefined") return 0;
  let max = 0;
  try {
    const checkIn = localStorage.getItem(COUPLE_CHECKIN_STORAGE_KEY);
    if (checkIn) {
      const n = parseInt(checkIn, 10);
      if (Number.isFinite(n) && n > 0) max = Math.max(max, n);
    }
  } catch {
    /* ignore */
  }
  try {
    const raw = localStorage.getItem(DAILY_MICRO_ANSWERS_KEY);
    if (raw) {
      const map = JSON.parse(raw) as Record<string, { answeredAt?: string }>;
      if (map && typeof map === "object") {
        for (const row of Object.values(map)) {
          const t = parseTs(row?.answeredAt);
          if (t > max) max = t;
        }
      }
    }
  } catch {
    /* ignore */
  }
  try {
    const leg = localStorage.getItem(LEGACY_DAILY_ANSWERED_KEY);
    if (leg) {
      const t = parseTs(leg);
      if (t > max) max = t;
    }
  } catch {
    /* ignore */
  }
  return max;
}

export function hasAnyCoupleEngagementHistory(): boolean {
  return getLastCoupleMeaningfulActivityMs() > 0;
}

export function shouldShowCoupleHubInactivityNudge(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const snooze = localStorage.getItem(COUPLE_HUB_INACTIVITY_SNOOZE_KEY);
    if (snooze && Date.now() < new Date(snooze).getTime()) return false;
  } catch {
    /* ignore */
  }
  const last = getLastCoupleMeaningfulActivityMs();
  if (!last) return false;
  const elapsed = Date.now() - last;
  return elapsed >= COUPLE_IDLE_DAYS * MS_DAY;
}

export function snoozeCoupleHubInactivityNudge(days = 7) {
  if (typeof window === "undefined") return;
  try {
    const until = new Date();
    until.setDate(until.getDate() + days);
    localStorage.setItem(COUPLE_HUB_INACTIVITY_SNOOZE_KEY, until.toISOString());
  } catch {
    /* ignore */
  }
}

function patternNudgeSnoozed(): boolean {
  try {
    const hub = localStorage.getItem(COUPLE_HUB_PATTERN_SNOOZE_KEY);
    if (hub && Date.now() < new Date(hub).getTime()) return true;
    const globalSnooze = localStorage.getItem(PATTERN_REPEAT_SNOOZE_KEY);
    if (globalSnooze && Date.now() < new Date(globalSnooze).getTime()) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function snoozeCoupleHubPatternNudge(days = 7) {
  if (typeof window === "undefined") return;
  try {
    const until = new Date();
    until.setDate(until.getDate() + days);
    localStorage.setItem(COUPLE_HUB_PATTERN_SNOOZE_KEY, until.toISOString());
    snoozePatternRepeatReminder(days);
  } catch {
    /* ignore */
  }
}

type TrendInfo = { type: string; count: number };

function topRepeatedTrend(memory: Record<string, unknown> | null): TrendInfo | null {
  const patterns = memory?.patterns as Record<string, unknown> | undefined;
  const trends = patterns?.emotionalTrends;
  if (!Array.isArray(trends)) return null;
  const cutoff = Date.now() - TREND_WINDOW_MS;
  const counts = new Map<string, number>();
  for (const e of trends) {
    if (!e || typeof e !== "object") continue;
    const o = e as Record<string, unknown>;
    const type = typeof o.type === "string" ? o.type.trim() : "";
    if (!type) continue;
    const ts = parseTs(typeof o.createdAt === "string" ? o.createdAt : undefined);
    if (ts < cutoff) continue;
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  let best: TrendInfo | null = null;
  for (const [type, count] of counts) {
    if (count >= 2 && (!best || count > best.count)) best = { type, count };
  }
  return best;
}

function dailyYesStreakish(memory: Record<string, unknown> | null): boolean {
  const tl = memory?.timeline;
  if (!Array.isArray(tl)) return false;
  const cutoff = Date.now() - DAILY_YES_WINDOW_MS;
  let yes = 0;
  for (const e of tl) {
    if (!e || typeof e !== "object") continue;
    const o = e as Record<string, unknown>;
    if (o.type !== "daily_question" || o.answer !== "yes") continue;
    const ts = parseTs(typeof o.date === "string" ? o.date : undefined);
    if (ts >= cutoff) yes++;
  }
  return yes >= 2;
}

const TREND_INSIGHTS: Record<string, string> = {
  avoidance_to_keep_peace:
    "Keeping the peace quietly has shown up more than once—similar tension may be circling back.",
  conflict_avoidance_daily: "Avoiding conflict is a repeating note in your check-ins.",
  feeling_unheard_daily: "Feeling unheard has surfaced multiple times lately.",
  resentment_linger_daily: "Small things lingering keeps appearing—worth a gentle check-in together.",
  alone_together_daily: "Lonely-together days are clustering in what you’ve logged.",
  daily_choice_distant: "You’ve often landed on “distant” in recent daily choices.",
  daily_choice_tension_stuck: "Tension staying stuck is showing up again in your quick check-ins.",
  repair_attempt_daily: "You’ve been reaching to repair—that’s worth noticing even if it’s uneven.",
  felt_appreciated_daily: "Appreciation keeps showing up as a theme—build on what’s working.",
};

/**
 * One short insight line when memory shows a repeating couple-relevant pattern.
 */
export function getCoupleHubPatternInsight(memory: Record<string, unknown> | null): string | null {
  if (typeof window === "undefined") return null;
  if (patternNudgeSnoozed()) return null;

  const trend = topRepeatedTrend(memory);
  if (trend) {
    const line = TREND_INSIGHTS[trend.type];
    if (line) return line;
    return "A similar signal keeps appearing in your pattern log—it may be worth naming together.";
  }

  if (dailyYesStreakish(memory)) {
    return "Several recent daily answers were “yes” to harder questions—similar stress may be repeating.";
  }

  return null;
}

export function shouldShowCoupleHubPatternNudge(memory: Record<string, unknown> | null): boolean {
  return getCoupleHubPatternInsight(memory) != null;
}
