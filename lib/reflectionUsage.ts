/** Free tier: individual reflections per calendar month (soft gate). */
export const FREE_INDIVIDUAL_REFLECTIONS_PER_MONTH = 2;

export type MonthlyReflectionBump = {
  reflection_count: number;
  reflection_count_month: string;
};

/** Current UTC calendar month as YYYY-MM (matches server increment). */
export function currentReflectionMonthUTC(d = new Date()): string {
  return d.toISOString().slice(0, 7);
}

/**
 * Increment monthly reflection count. Resets count when the calendar month changes.
 */
export function bumpMonthlyReflectionCount(
  prevCount: number | null | undefined,
  prevMonth: string | null | undefined,
  now = new Date()
): MonthlyReflectionBump {
  const ym = currentReflectionMonthUTC(now);
  let count = typeof prevCount === "number" && Number.isFinite(prevCount) ? Math.max(0, prevCount) : 0;
  if (prevMonth !== ym) {
    count = 0;
  }
  return { reflection_count: count + 1, reflection_count_month: ym };
}

/** Effective count for the current month (for client display from profile row). */
export function effectiveReflectionsThisMonth(
  reflection_count: number | null | undefined,
  reflection_count_month: string | null | undefined,
  now = new Date()
): number {
  const ym = currentReflectionMonthUTC(now);
  if (reflection_count_month !== ym) return 0;
  return typeof reflection_count === "number" && Number.isFinite(reflection_count)
    ? Math.max(0, reflection_count)
    : 0;
}
