/**
 * Round 5 — "Space Between You" cards (individual + couple round 5).
 * Each image: id, src, psychological `tags` (signal layer for AI + results). UI shows name/description only.
 */

export const round5Images = [
  {
    id: "r51",
    src: "/images/r51.jpg",
    tags: ["emotional_distance", "avoidance", "silence", "disconnection"],
    name: "Guarded distance",
    description: "Space and quiet that protect more than they connect.",
  },
  {
    id: "r52",
    src: "/images/r52.jpg",
    tags: ["comfort", "calm_connection", "shared_peace", "stability"],
    name: "Calm connection",
    description: "A pull toward peace, steadiness, and emotional safety together.",
  },
  {
    id: "r53",
    src: "/images/r53.jpg",
    tags: ["overwhelm", "mental_noise", "inner_conflict", "chaos"],
    name: "Inner noise",
    description: "When intensity rises, clarity gets hard to hold.",
  },
  {
    id: "r54",
    src: "/images/r54.jpg",
    tags: ["breaking_point", "tension", "fragility", "emotional_strain"],
    name: "Strain",
    description: "Needs and tension feel stretched close to the edge.",
  },
];

export const ROUND_FIVE_TITLE = "Space Between You";

/** Paths under /public without leading slash (ImageGrid prepends `/`). */
export const round5ImageFilenames = round5Images.map((i) => i.src.replace(/^\//, ""));

/**
 * @param {number} index - 0..3
 * @returns {{ id: string, tag: string | null, psychologicalTags: string[] }}
 */
export function getRound5SelectionMeta(index) {
  const item = round5Images[index];
  if (!item) return { id: "", tag: null, psychologicalTags: [] };
  const psychologicalTags = Array.isArray(item.tags) ? [...item.tags] : [];
  return {
    id: item.id,
    tag: psychologicalTags[0] ?? null,
    psychologicalTags,
  };
}
