import { TOTAL_ROUNDS } from "./reflectionRounds";

/**
 * Get the next round number, or null if complete.
 * @param {number} currentRound - 1-based current round
 * @returns {number | null}
 */
/**
 * @param {number} currentRound - 1-based
 * @param {number} [maxRound=TOTAL_ROUNDS] - last round index (inclusive)
 */
export function getNextRound(currentRound, maxRound = TOTAL_ROUNDS) {
  if (currentRound >= maxRound) return null;
  return currentRound + 1;
}

/**
 * Save a selection for a round into the answers object.
 * @param {Record<number, { selectedType?: "image" | "none"; image?: number | null; selectedImageId?: number; userExplanation?: string; text: string }>} answers
 * @param {number} roundNumber - 1-based round
 * @param {number | null} imageIndex - selected image index
 * @param {string} text - written response (or explanation for "none")
 * @param {boolean} noneSelected
 * @returns {Record<number, any>}
 */
export function saveSelection(answers, roundNumber, imageIndex, text, noneSelected = false) {
  return {
    ...answers,
    [roundNumber]: {
      selectedType: noneSelected ? "none" : "image",
      image: noneSelected ? null : imageIndex,
      selectedImageId: noneSelected ? null : imageIndex,
      tag: undefined,
      userExplanation: noneSelected ? (text ?? "") : "",
      text: text ?? "",
    },
  };
}

/**
 * Check if all rounds have been completed (have image + non-empty text).
 * @param {Record<number, any>} answers
 * @returns {boolean}
 */
export function isComplete(answers, maxRound = TOTAL_ROUNDS) {
  if (!answers || typeof answers !== "object") return false;
  for (let r = 1; r <= maxRound; r++) {
    const a = answers[r];
    if (!a) return false;
    if (a.selectedType === "none") continue;
    // Back-compat: if selectedType missing, expect legacy image+text
    const img = a.selectedImageId ?? a.image;
    if (typeof img !== "number") return false;
    if (!String(a.text ?? "").trim()) return false;
  }
  return true;
}

/**
 * Build the answers object for the current round (including current unsaved selection).
 * Used when submitting to the API.
 * @param {Record<number, any>} answers
 * @param {number} currentRound
 * @param {number | null} selectedIndex
 * @param {string} textValue
 * @param {boolean} noneSelected
 * @param {string} noneExplanation
 * @returns {Record<number, any>}
 */
export function buildReflectionSummary(
  answers,
  currentRound,
  selectedIndex,
  textValue,
  noneSelected = false,
  noneExplanation = ""
) {
  const next = { ...answers };
  if (currentRound != null && noneSelected) {
    next[currentRound] = {
      selectedType: "none",
      image: null,
      selectedImageId: null,
      tag: undefined,
      userExplanation: noneExplanation ?? "",
      text: noneExplanation ?? "",
    };
  } else if (currentRound != null && selectedIndex != null) {
    next[currentRound] = {
      selectedType: "image",
      image: selectedIndex,
      selectedImageId: selectedIndex,
      tag: next?.[currentRound]?.tag ?? undefined,
      userExplanation: "",
      text: textValue ?? "",
    };
  }
  return next;
}
