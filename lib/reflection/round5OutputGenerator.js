/**
 * Deterministic "Space Between You" (Round 5) copy from `round5_tag`.
 * Sharp, psychologically framed—no model call (instant, consistent).
 */

import {
  extractPsychologicalTagsFromRound5Block,
  mapPsychologicalTagsToVisualR5Key,
} from "@/lib/reflection/round5Psychological";

const BY_TAG = {
  guarded_distance: {
    tldr: "You keep space so you don't have to risk being hurt.",
    meaning: [
      "You don't fully step in. You stay slightly removed, even when things are okay.",
      "It feels safer to hold back than to depend.",
    ],
    shadowInsight:
      "This isn't independence. It's fear of being seen and possibly rejected.",
    dangerousQuestion: "What would happen if you stopped protecting yourself for once?",
  },
  calm_connection: {
    tldr: "You don't want drama. You want something that finally feels safe.",
    meaning: [
      "You're drawn to peace, stability, and emotional clarity.",
      "You don't want to fight—you want to understand.",
    ],
    shadowInsight: "You might be avoiding hard conversations just to keep things calm.",
    dangerousQuestion: "Are you choosing peace… or avoiding conflict?",
  },
  emotional_overload: {
    tldr: "You don't just react. You get overwhelmed and lose control.",
    meaning: [
      "When emotions rise, they take over.",
      "You feel too much, too fast, and it becomes hard to stay grounded.",
    ],
    shadowInsight:
      "You expect others to handle emotions you haven't learned to regulate.",
    dangerousQuestion:
      "When things get intense… are you reacting to them, or to something older?",
  },
  pressure_unmet_needs: {
    tldr: "Something inside you is stretched too far—and close to breaking.",
    meaning: [
      "You've been holding expectations, needs, or frustrations that aren't being met.",
      "The tension is building.",
    ],
    shadowInsight:
      "You're waiting for others to fix what you haven't clearly expressed.",
    dangerousQuestion:
      "What are you silently expecting… that you've never actually said out loud?",
  },
};

/**
 * @param {string | null | undefined} round5Tag - e.g. from selections[5].tag
 * @returns {{ tag: string, tldr: string, meaning: string, meaningLines: string[], shadowInsight: string, dangerousQuestion: string } | null}
 */
export function buildRound5SpaceBetweenOutput(round5Tag) {
  if (typeof round5Tag !== "string" || !round5Tag.trim()) return null;
  const tag = round5Tag.trim();
  const block = BY_TAG[tag];
  if (!block) return null;
  const meaningLines = block.meaning.filter(Boolean);
  return {
    tag,
    tldr: block.tldr,
    meaningLines,
    meaning: meaningLines.join("\n"),
    shadowInsight: block.shadowInsight,
    dangerousQuestion: block.dangerousQuestion,
  };
}

/**
 * Uses psychological tag array + legacy `tag` from answers[5]; maps to internal visual key for BY_TAG.
 * @param {Record<string, unknown> | null | undefined} round5Block
 */
export function buildRound5SpaceBetweenFromAnswersBlock(round5Block) {
  const psych = extractPsychologicalTagsFromRound5Block(round5Block);
  let visualKey = mapPsychologicalTagsToVisualR5Key(psych);
  if (!visualKey && round5Block && typeof round5Block === "object") {
    const t = typeof round5Block.tag === "string" ? round5Block.tag.trim() : "";
    if (t && BY_TAG[t]) visualKey = t;
    else if (t) visualKey = mapPsychologicalTagsToVisualR5Key([t]);
  }
  if (!visualKey) return null;
  return buildRound5SpaceBetweenOutput(visualKey);
}

/**
 * Normalize API JSON for client display (e.g. after /api/generate).
 * @param {unknown} data
 * @returns {{ tag: string, tldr: string, meaning: string, meaningLines?: string[], shadowInsight: string, dangerousQuestion: string } | null}
 */
export function parseRound5SpaceBetweenFromApi(data) {
  const r = data && typeof data === "object" ? data.round5SpaceBetween : null;
  if (!r || typeof r !== "object") return null;
  const tldr = typeof r.tldr === "string" ? r.tldr.trim() : "";
  const shadowInsight = typeof r.shadowInsight === "string" ? r.shadowInsight.trim() : "";
  const dangerousQuestion =
    typeof r.dangerousQuestion === "string" ? r.dangerousQuestion.trim() : "";
  if (!tldr || !shadowInsight || !dangerousQuestion) return null;
  const meaning = typeof r.meaning === "string" ? r.meaning : "";
  const meaningLines = Array.isArray(r.meaningLines)
    ? r.meaningLines.filter((x) => typeof x === "string" && x.trim())
    : undefined;
  return {
    tag: typeof r.tag === "string" ? r.tag : "",
    tldr,
    meaning,
    ...(meaningLines?.length ? { meaningLines } : {}),
    shadowInsight,
    dangerousQuestion,
  };
}
