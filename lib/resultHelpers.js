export {
  resolveHowToReadTagsFromSelections,
  resolveRound5PsychologicalSupplementLines,
} from "@/lib/reflection/howToReadVisual";

function normalizeStringLines(arr, max = 8) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
}

/**
 * Normalize plain-language lines from /api/generate (or similar) payloads.
 * Supports `inSimpleWords` / `simpleWords` as arrays or newline-separated strings.
 */
export function parseInSimpleWordsFromApi(data) {
  if (!data || typeof data !== "object") return [];

  if (Array.isArray(data.inSimpleWords)) {
    return normalizeStringLines(data.inSimpleWords, 8);
  }
  if (Array.isArray(data.simpleWords)) {
    return normalizeStringLines(data.simpleWords, 8);
  }
  if (typeof data.inSimpleWords === "string") {
    return data.inSimpleWords
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  if (typeof data.simpleWords === "string") {
    return data.simpleWords
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}
