/**
 * Client-only: soft nudge when stored signals suggest a recurring pattern.
 */

export const PATTERN_REPEAT_SNOOZE_KEY = "luma_pattern_repeat_snooze_until";

const MS_DAY = 864e5;

function parseTs(iso: string | undefined): number {
  if (!iso || typeof iso !== "string") return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function emotionalTrendRepeatsRecently(memory: Record<string, unknown> | null): boolean {
  const patterns = memory?.patterns as Record<string, unknown> | undefined;
  const trends = patterns?.emotionalTrends;
  if (!Array.isArray(trends)) return false;
  const cutoff = Date.now() - 40 * MS_DAY;
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
  return [...counts.values()].some((n) => n >= 2);
}

function dailyQuestionYesRepeatsRecently(memory: Record<string, unknown> | null): boolean {
  const tl = memory?.timeline;
  if (!Array.isArray(tl)) return false;
  const cutoff = Date.now() - 21 * MS_DAY;
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

type SelImg = Record<number, { image: number; text: string }> | undefined;

/** Same round-1 image choice in two different reflections within ~90 days. */
function roundOneImageRepeats(
  reflections: Array<{ date: string; selectedImages?: SelImg }>
): boolean {
  const windowMs = 90 * MS_DAY;
  const now = Date.now();
  const recent = reflections
    .filter((r) => {
      const ts = parseTs(r.date);
      return ts > 0 && now - ts <= windowMs;
    })
    .slice(0, 8);

  const seen = new Set<number>();
  for (const r of recent) {
    const img = r.selectedImages?.[1]?.image;
    if (typeof img !== "number") continue;
    if (seen.has(img)) return true;
    seen.add(img);
  }
  return false;
}

/**
 * True when we have enough history and at least one grounded repeat signal.
 */
export function shouldShowPatternRepeatReminderNow(
  memory: Record<string, unknown> | null,
  individualReflections: Array<{ date: string; selectedImages?: SelImg }>
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const snoozeUntil = localStorage.getItem(PATTERN_REPEAT_SNOOZE_KEY);
    if (snoozeUntil && Date.now() < new Date(snoozeUntil).getTime()) {
      return false;
    }
  } catch {
    /* ignore */
  }

  const hasHistory =
    individualReflections.length >= 2 ||
    (Array.isArray(memory?.timeline) && (memory!.timeline as unknown[]).length > 1);

  if (!hasHistory) return false;

  if (emotionalTrendRepeatsRecently(memory)) return true;
  if (dailyQuestionYesRepeatsRecently(memory)) return true;
  if (roundOneImageRepeats(individualReflections)) return true;

  return false;
}

export function snoozePatternRepeatReminder(days = 7) {
  if (typeof window === "undefined") return;
  try {
    const until = new Date();
    until.setDate(until.getDate() + days);
    localStorage.setItem(PATTERN_REPEAT_SNOOZE_KEY, until.toISOString());
  } catch {
    /* ignore */
  }
}
