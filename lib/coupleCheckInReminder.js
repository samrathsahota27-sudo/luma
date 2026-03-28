/** localStorage timestamp (ms) of last couple result viewed — habit loop / “check again” copy. */
export const COUPLE_CHECKIN_STORAGE_KEY = "luma_couple_last_checkin_at";

const MS_DAY = 86400000;

export function readCoupleLastCheckInMs() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COUPLE_CHECKIN_STORAGE_KEY);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/** Call once when the user has reached the couple result (builds the retake habit loop). */
export function recordCoupleResultCheckIn() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COUPLE_CHECKIN_STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/**
 * @param {number | null} lastMs
 * @returns {{ hint: string }}
 */
export function getCheckAgainEncouragement(lastMs) {
  const now = Date.now();
  if (lastMs == null || lastMs <= 0) {
    return {
      hint: "Come back tomorrow for a quick pulse—or pick a weekly time together. Each run shows how you’re shifting.",
    };
  }
  const days = (now - lastMs) / MS_DAY;
  if (days < 1) {
    return {
      hint: "You just checked in. Tomorrow works—or hold a weekly date. Retaking is what keeps the loop honest.",
    };
  }
  if (days < 7) {
    return {
      hint: "Daily keeps you close to the live pattern; weekly still catches real movement. Run it again when you’re ready.",
    };
  }
  return {
    hint: "It’s been a week or more. Retake the reflection to see what’s changed between you.",
  };
}
