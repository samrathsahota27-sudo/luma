export type PatternVariantDef = {
  name: string;
  /** Tags that must be present to match (each match adds weight). */
  conditions: string[];
};

export const patternVariants: Record<string, PatternVariantDef[]> = {
  quiet_withdrawal: [
    { name: "soft_avoider", conditions: ["avoidance", "calm"] },
    { name: "overthinking_withdrawer", conditions: ["overthinking", "internal_conflict"] },
    { name: "silent_distance", conditions: ["distance", "disconnection"] },
  ],
  controlled_openness: [
    { name: "careful_sharer", conditions: ["control", "openness"] },
    { name: "edited_truth", conditions: ["control", "overthinking"] },
  ],
  silent_overthinking: [
    { name: "looping_mind", conditions: ["overthinking", "mental_noise"] },
    { name: "unsent_messages", conditions: ["silence", "internal_conflict"] },
  ],
  emotional_avoidance: [
    { name: "numb_and_busy", conditions: ["avoidance", "busy"] },
    { name: "head_over_heart", conditions: ["control", "internal_conflict"] },
  ],
};

function norm(s: unknown): string {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

/**
 * Choose the best matching variant by highest condition match count.
 * Tie-break: earlier in the variant array wins (stable + deterministic).
 */
export function matchPatternVariant(patternId: string, tags: string[]): string | null {
  const variants = patternVariants[String(patternId ?? "").trim()];
  if (!variants || variants.length === 0) return null;
  const pool = Array.isArray(tags) ? tags.map(norm).filter(Boolean) : [];
  if (pool.length === 0) return null;

  let best: { name: string; score: number } | null = null;
  for (const v of variants) {
    const cond = Array.isArray(v.conditions) ? v.conditions.map(norm).filter(Boolean) : [];
    if (cond.length === 0) continue;
    let score = 0;
    for (const c of cond) {
      if (pool.includes(c) || pool.some((t) => t.includes(c))) score += 1;
    }
    if (!best || score > best.score) best = { name: v.name, score };
  }

  if (!best || best.score <= 0) return null;
  return best.name;
}

