/**
 * Client-only: gentle re-engagement when someone hasn't opened the app for several days.
 */

export const LAST_ACTIVE_KEY = "luma_last_active_at";
export const SNOOZE_KEY = "luma_inactivity_reminder_snooze_until";
export const STABLE_THRESHOLD_DAYS_KEY = "luma_inactivity_threshold_days";

/** @returns {number} ms — stable 3, 4, or 5 days per browser, picked once */
function getThresholdMs() {
  if (typeof window === "undefined") return 4 * 24 * 60 * 60 * 1000;
  try {
    let d = localStorage.getItem(STABLE_THRESHOLD_DAYS_KEY);
    if (d == null || d === "") {
      const days = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
      d = String(days);
      localStorage.setItem(STABLE_THRESHOLD_DAYS_KEY, d);
    }
    const n = Number(d);
    const days = n >= 3 && n <= 5 ? n : 4;
    return days * 24 * 60 * 60 * 1000;
  } catch {
    return 4 * 24 * 60 * 60 * 1000;
  }
}

/**
 * Call with the *previous* last-active timestamp still in storage (before overwriting).
 * @returns {boolean}
 */
export function shouldShowInactivityReminderNow() {
  if (typeof window === "undefined") return false;
  try {
    const snoozeUntil = localStorage.getItem(SNOOZE_KEY);
    if (snoozeUntil && Date.now() < new Date(snoozeUntil).getTime()) {
      return false;
    }
    const last = localStorage.getItem(LAST_ACTIVE_KEY);
    if (!last) return false;
    const elapsed = Date.now() - new Date(last).getTime();
    return elapsed >= getThresholdMs();
  } catch {
    return false;
  }
}

export function recordAppVisit() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

/** Hide reminder for this many days (default 7). */
export function snoozeInactivityReminder(days = 7) {
  if (typeof window === "undefined") return;
  try {
    const until = new Date();
    until.setDate(until.getDate() + days);
    localStorage.setItem(SNOOZE_KEY, until.toISOString());
  } catch {
    /* ignore */
  }
}
