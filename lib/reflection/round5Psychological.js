/**
 * Round 5 psychological tag vocabulary → legacy visual keys (How to Read, DALL·E grammar, insight card).
 */

function norm(t) {
  if (typeof t !== "string") return null;
  const x = t.trim().toLowerCase();
  return x || null;
}

/** Human-readable lines for result "How to Read" supplement (no raw slugs in test UI). */
export const ROUND5_PSYCHOLOGICAL_PHRASES = {
  emotional_distance: "There is space, but not closeness.",
  avoidance: "Pulling back shows up as protection—not indifference.",
  silence: "Quiet can hold more than words—sometimes distance, sometimes overwhelm.",
  disconnection: "The thread feels thin; contact doesn’t quite land.",
  comfort: "A pull toward ease and being held emotionally.",
  calm_connection: "Steadiness and shared peace matter more than drama.",
  shared_peace: "You’re oriented toward a softer, mutual rhythm.",
  stability: "You’re reaching for something that won’t constantly tilt.",
  overwhelm: "Too much is happening internally at once.",
  mental_noise: "The inner channel feels crowded and hard to sort.",
  inner_conflict: "Competing pulls inside make a single clear stance hard to find.",
  chaos: "Intensity spikes faster than things can settle.",
  breaking_point: "Something feels close to snapping—not dramatic, but real.",
  tension: "Strain is held in the body of the relationship.",
  fragility: "Things feel delicate; small shifts carry big weight.",
  emotional_strain: "The emotional load has been high for a while.",
  // Legacy aliases (saved reflections)
  guarded_distance: "Protection shows up as distance before closeness.",
  emotional_overload: "When feelings rise, they flood faster than they sort.",
  pressure_unmet_needs: "Needs feel stretched, tight, or unnamed for too long.",
};

/** Map any psychological slug to COLORS_R5 / BY_TAG key. */
const TAG_TO_VISUAL = {
  emotional_distance: "guarded_distance",
  avoidance: "guarded_distance",
  silence: "guarded_distance",
  disconnection: "guarded_distance",
  guarded_distance: "guarded_distance",
  comfort: "calm_connection",
  calm_connection: "calm_connection",
  shared_peace: "calm_connection",
  stability: "calm_connection",
  overwhelm: "emotional_overload",
  mental_noise: "emotional_overload",
  inner_conflict: "emotional_overload",
  chaos: "emotional_overload",
  emotional_overload: "emotional_overload",
  breaking_point: "pressure_unmet_needs",
  tension: "pressure_unmet_needs",
  fragility: "pressure_unmet_needs",
  emotional_strain: "pressure_unmet_needs",
  pressure_unmet_needs: "pressure_unmet_needs",
};

/** When several tags apply, prefer this visual read (distress-first for couple merge). */
const VISUAL_PRIORITY = [
  "guarded_distance",
  "emotional_overload",
  "pressure_unmet_needs",
  "calm_connection",
];

/**
 * @param {string[] | null | undefined} tags
 * @returns {"guarded_distance"|"calm_connection"|"emotional_overload"|"pressure_unmet_needs"|null}
 */
export function mapPsychologicalTagsToVisualR5Key(tags) {
  if (!Array.isArray(tags) || !tags.length) return null;
  const visuals = new Set();
  for (const raw of tags) {
    const n = norm(raw);
    if (!n) continue;
    const v = TAG_TO_VISUAL[n];
    if (v) visuals.add(v);
  }
  for (const p of VISUAL_PRIORITY) {
    if (visuals.has(p)) return p;
  }
  return [...visuals][0] ?? null;
}

/**
 * @param {Record<string, unknown> | null | undefined} round5Block - answers[5]
 * @returns {string[]}
 */
export function extractPsychologicalTagsFromRound5Block(round5Block) {
  if (!round5Block || typeof round5Block !== "object") return [];
  const direct = round5Block.psychologicalTags;
  if (Array.isArray(direct) && direct.length) {
    return direct.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
  }
  const legacy = round5Block.tag;
  if (typeof legacy === "string" && legacy.trim()) return [legacy.trim()];
  return [];
}

/**
 * Plain-language lines for result UI (deduped, stable order).
 * @param {string[] | null | undefined} tags
 * @param {number} [max=6]
 * @returns {string[]}
 */
export function phrasesForPsychologicalTags(tags, max = 6) {
  if (!Array.isArray(tags) || !tags.length) return [];
  const out = [];
  const seen = new Set();
  for (const raw of tags) {
    const n = norm(raw);
    if (!n || seen.has(n)) continue;
    const phrase = ROUND5_PSYCHOLOGICAL_PHRASES[n];
    if (phrase) {
      seen.add(n);
      out.push(phrase);
      if (out.length >= max) break;
    }
  }
  return out;
}
