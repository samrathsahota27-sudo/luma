import { TOTAL_ROUNDS } from "./reflectionRounds";

/**
 * Get the next round number, or null if complete.
 * @param {number} currentRound - 1-based current round
 * @returns {number | null}
 */
export function getNextRound(currentRound) {
  if (currentRound >= TOTAL_ROUNDS) return null;
  return currentRound + 1;
}

/**
 * Save a selection for a round into the answers object.
 * @param {Record<number, { image: number; text: string }>} answers
 * @param {number} roundNumber - 1-based round
 * @param {number} imageIndex - selected image index
 * @param {string} text - written response
 * @returns {Record<number, { image: number; text: string }>}
 */
export function saveSelection(answers, roundNumber, imageIndex, text) {
  return {
    ...answers,
    [roundNumber]: {
      image: imageIndex,
      text: text ?? "",
    },
  };
}

/**
 * Check if all rounds have been completed (have image + non-empty text).
 * @param {Record<number, { image: number; text: string }>} answers
 * @returns {boolean}
 */
export function isComplete(answers) {
  if (!answers || typeof answers !== "object") return false;
  for (let r = 1; r <= TOTAL_ROUNDS; r++) {
    const a = answers[r];
    if (!a || typeof a.image !== "number" || !String(a.text ?? "").trim())
      return false;
  }
  return true;
}

/**
 * Build the answers object for the current round (including current unsaved selection).
 * Used when submitting to the API.
 * @param {Record<number, { image: number; text: string }>} answers
 * @param {number} currentRound
 * @param {number | null} selectedIndex
 * @param {string} textValue
 * @returns {Record<number, { image: number; text: string }>}
 */
export function buildReflectionSummary(answers, currentRound, selectedIndex, textValue) {
  const next = { ...answers };
  if (currentRound != null && selectedIndex != null) {
    next[currentRound] = {
      image: selectedIndex,
      text: textValue ?? "",
    };
  }
  return next;
}
