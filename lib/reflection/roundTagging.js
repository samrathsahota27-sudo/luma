/**
 * Round-specific psychological tagging for image selections.
 * These tags are intentionally simple and human-readable.
 */

import { round5Images } from "./round5Images";

export const ROUND_TAGS = {
  // Round 1 — Attraction (Natural Pull)
  1: {
    0: "calm",
    1: "chaos",
    2: "connection",
    3: "isolation",
  },
  // Round 2 — Discomfort (Resistance)
  2: {
    0: "pressure",
    1: "confusion",
    2: "overwhelm",
    3: "emptiness",
  },
  // Round 3 — Current State
  3: {
    0: "clarity",
    1: "lost",
    2: "balanced",
    3: "stuck",
  },
  // Round 4 — Desire / Direction
  4: {
    0: "growth",
    1: "peace",
    2: "change",
    3: "understanding",
  },
};

export function getRoundTag(roundNumber, imageIndex) {
  if (roundNumber === 5 && typeof imageIndex === "number") {
    const tags = round5Images[imageIndex]?.tags;
    return Array.isArray(tags) && tags.length ? tags[0] : null;
  }
  const r = ROUND_TAGS?.[roundNumber];
  if (!r) return null;
  return r?.[imageIndex] ?? null;
}

export const ROUND_SIGNAL_LABELS = {
  1: "Drawn to",
  2: "Discomfort",
  3: "Current state",
  4: "Direction",
  5: "Space between",
};

