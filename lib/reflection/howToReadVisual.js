import {
  extractPsychologicalTagsFromRound5Block,
  mapPsychologicalTagsToVisualR5Key,
  phrasesForPsychologicalTags,
} from "@/lib/reflection/round5Psychological";

/**
 * Deterministic "How to Read This" copy from reflection tags (no model call).
 * round2: inner strain (ROUND_TAGS) — pressure | confusion | overwhelm | emptiness
 * round3: current stance — clarity | lost | balanced | stuck
 * round5: relational space (round5Images) — calm_connection | guarded_distance | emotional_overload | pressure_unmet_needs
 */

const FOOTER =
  "This isn't random — it reflects how you relate and respond.";

const R2_PRIORITY = ["overwhelm", "confusion", "pressure", "emptiness"];

const COLORS_R5 = {
  calm_connection:
    "Warm, soft saturation reads as openness and room for emotional safety together.",
  guarded_distance:
    "Darker, heavier values read as protection—holding back from full emotional exposure.",
  emotional_overload:
    "High contrast reads as competing internal pulls—harder regulation when intensity spikes.",
  pressure_unmet_needs:
    "Dull, muted color reads as strain from needs that stay tight, unnamed, or unmet.",
};

const COLORS_R2 = {
  overwhelm:
    "Strong light–dark contrast reads as inner conflict—attention fracturing under load.",
  confusion:
    "Clashing temperature and value read as disorientation—you're sorting more than one truth at once.",
  pressure:
    "Flattened, muted color reads as depletion—sustained demand without relief.",
  emptiness:
    "Cool, subdued color reads as withdrawal—less contact, more guarding of inner space.",
};

const SHAPES = {
  guarded_r5:
    "Sharp angles and hard edges read as defensiveness—bracing before contact lands.",
  fragmented_r2:
    "Broken, scattered forms read as confusion—processing that won't settle into one shape.",
  stretched_r2:
    "Stretched, thinning forms read as tension—something pulled close to breaking.",
  sparse_r2:
    "Sparse, dissolving contours read as disconnection and numbing—less shape to hold onto.",
  rigid_r3:
    "Boxed, fixed geometry reads as resistance—control used to avoid shifting position.",
  lost_r3:
    "Overlapping, unclear silhouettes read as uncertainty—hard to name what you are to yourself.",
  smooth_r3:
    "Smooth, continuous contours read as integration—more emotional safety in how you hold experience.",
};

const MOVEMENT = {
  flowing:
    "Flowing, continuous motion reads as adaptability—you can move with change without losing footing.",
  rigid:
    "Locked, tight motion reads as resistance—control that limits how much you let in or revise.",
  chaotic:
    "Scattered, fast marks read as flooding—arousal outpaces regulation.",
  stagnant:
    "Still, heavy composition reads as avoidance—a freeze around what might shift if you moved.",
  mixed:
    "Pacing between marks shows where you regulate and where you pull back from full engagement.",
};

const SPACE = {
  guarded_distance:
    "Wide intervals and blocked middle ground read as an emotional gap—distance kept on purpose.",
  calm_connection:
    "Shared foreground and gentle overlap read as connection—room to meet without collapse.",
  emotional_overload:
    "Uneven density—crowded here, bare there—reads as imbalance in who carries the emotional load.",
  pressure_unmet_needs:
    "Hollow or emptied intervals read as withdrawal when needs feel unseen or unsupported.",
  inferred_close:
    "Gentle overlap and balanced placement read as connection—you're not organizing around a constant gap.",
  inferred_distant:
    "Separation across the frame reads as distance—emotional space that doesn't fully close.",
  inferred_uneven:
    "Lopsided spacing reads as imbalance—one side holds more weight than the other.",
  inferred_empty:
    "Emptiness in the relation zone reads as avoidance—pulling back rather than placing need in the open.",
};

/** When no structured tags are available (e.g. legacy saves). */
const STATIC_BULLETS = [
  {
    title: "Colors",
    text: "Warm tones read as open; dark or heavy as withdrawn; strong contrast as inner conflict.",
  },
  {
    title: "Shapes",
    text: "Sharp edges read as defensive; smooth forms as safe; fragmented shapes as confused or split.",
  },
  {
    title: "Movement",
    text: "Flow suggests adaptability; rigid structure resistance; chaotic motion overwhelm.",
  },
  {
    title: "Space",
    text: "Closeness reads as connection; distance as separation; emptiness as avoidance.",
  },
];

const KNOWN_R5 = new Set(Object.keys(COLORS_R5));
const KNOWN_R2 = new Set(Object.keys(COLORS_R2));
const KNOWN_R3 = new Set(["clarity", "lost", "balanced", "stuck"]);

function norm(tag) {
  if (typeof tag !== "string") return null;
  const t = tag.trim().toLowerCase();
  return t || null;
}

function sanitizeRound5(t) {
  const n = norm(t);
  return n && KNOWN_R5.has(n) ? n : null;
}

function sanitizeRound2(t) {
  const n = norm(t);
  return n && KNOWN_R2.has(n) ? n : null;
}

function sanitizeRound3(t) {
  const n = norm(t);
  return n && KNOWN_R3.has(n) ? n : null;
}

function tagFromRound(selections, roundNum) {
  const block = selections?.[roundNum];
  if (!block || typeof block !== "object") return null;
  return norm(block.tag);
}

/** Map answers[5] to a KNOWN_R5 visual key for color/shape/space bullets. */
function round5VisualKeyFromBlock(block) {
  if (!block || typeof block !== "object") return null;
  const psych = extractPsychologicalTagsFromRound5Block(block);
  const key = mapPsychologicalTagsToVisualR5Key(psych);
  if (key) return key;
  const t = norm(block.tag);
  return t && KNOWN_R5.has(t) ? t : null;
}

/**
 * Merge two partners' round-2 tags (distress-first).
 * @param {string | null | undefined} a
 * @param {string | null | undefined} b
 */
export function mergeRound2Tags(a, b) {
  const na = norm(a);
  const nb = norm(b);
  const set = new Set([na, nb].filter(Boolean));
  for (const p of R2_PRIORITY) {
    if (set.has(p)) return p;
  }
  return na || nb;
}

/**
 * Merge two partners' round-3 tags.
 * @param {string | null | undefined} a
 * @param {string | null | undefined} b
 */
export function mergeRound3Tags(a, b) {
  const na = norm(a);
  const nb = norm(b);
  const set = new Set([na, nb].filter(Boolean));
  if (set.has("lost")) return "lost";
  if (set.has("stuck")) return "stuck";
  if (set.has("clarity") || set.has("balanced")) {
    if (set.has("clarity") && set.has("balanced")) return "clarity";
    return na === "clarity" || na === "balanced" ? na : nb === "clarity" || nb === "balanced" ? nb : "clarity";
  }
  return na || nb;
}

/**
 * @param {Record<number, unknown> | null | undefined} selections
 * @returns {{ round2Tag: string | null, round3Tag: string | null, round5Tag: string | null }}
 */
export function resolveHowToReadTagsFromSelections(selections) {
  return {
    round2Tag: tagFromRound(selections, 2),
    round3Tag: tagFromRound(selections, 3),
    round5Tag: round5VisualKeyFromBlock(selections?.[5]),
  };
}

/**
 * @param {Record<number, unknown> | null | undefined} partnerA
 * @param {Record<number, unknown> | null | undefined} partnerB
 * @returns {{ round2Tag: string | null, round3Tag: string | null, round5Tag: null }}
 */
export function resolveHowToReadTagsFromCouplePartners(partnerA, partnerB) {
  const a2 = tagFromRound(partnerA, 2);
  const b2 = tagFromRound(partnerB, 2);
  const a3 = tagFromRound(partnerA, 3);
  const b3 = tagFromRound(partnerB, 3);
  const mergedR5 = [
    ...extractPsychologicalTagsFromRound5Block(partnerA?.[5]),
    ...extractPsychologicalTagsFromRound5Block(partnerB?.[5]),
  ];
  const round5Tag = mapPsychologicalTagsToVisualR5Key(mergedR5);
  return {
    round2Tag: mergeRound2Tags(a2, b2),
    round3Tag: mergeRound3Tags(a3, b3),
    round5Tag,
  };
}

/** Plain-language supplement for result “How to Read” (Round 5 signals only). */
export function resolveRound5PsychologicalSupplementLines(selections) {
  const tags = extractPsychologicalTagsFromRound5Block(selections?.[5]);
  return phrasesForPsychologicalTags(tags, 6);
}

export function resolveRound5PsychologicalSupplementLinesForCouple(partnerA, partnerB) {
  const tags = [
    ...extractPsychologicalTagsFromRound5Block(partnerA?.[5]),
    ...extractPsychologicalTagsFromRound5Block(partnerB?.[5]),
  ];
  return phrasesForPsychologicalTags(tags, 8);
}

function colorBullet(round5, round2, round3) {
  const r5 = norm(round5);
  const r2 = norm(round2);
  const r3 = norm(round3);
  if (r5 && COLORS_R5[r5]) {
    return { title: "Colors", text: COLORS_R5[r5] };
  }
  if (r2 && COLORS_R2[r2]) {
    return { title: "Colors", text: COLORS_R2[r2] };
  }
  if (r3 === "clarity" || r3 === "balanced") {
    return { title: "Colors", text: COLORS_R5.calm_connection };
  }
  if (r3 === "stuck") {
    return { title: "Colors", text: COLORS_R5.guarded_distance };
  }
  if (r3 === "lost") {
    return { title: "Colors", text: COLORS_R5.emotional_overload };
  }
  return null;
}

function shapeBullet(round5, round2, round3) {
  const r5 = norm(round5);
  const r2 = norm(round2);
  const r3 = norm(round3);
  if (r5 === "guarded_distance") {
    return { title: "Shapes", text: SHAPES.guarded_r5 };
  }
  if (r2 === "overwhelm" || r2 === "confusion") {
    return { title: "Shapes", text: SHAPES.fragmented_r2 };
  }
  if (r2 === "pressure") {
    return { title: "Shapes", text: SHAPES.stretched_r2 };
  }
  if (r2 === "emptiness") {
    return { title: "Shapes", text: SHAPES.sparse_r2 };
  }
  if (r3 === "stuck") {
    return { title: "Shapes", text: SHAPES.rigid_r3 };
  }
  if (r3 === "lost") {
    return { title: "Shapes", text: SHAPES.lost_r3 };
  }
  if (r3 === "clarity" || r3 === "balanced") {
    return { title: "Shapes", text: SHAPES.smooth_r3 };
  }
  if (r5 === "emotional_overload") {
    return { title: "Shapes", text: SHAPES.fragmented_r2 };
  }
  if (r5 === "pressure_unmet_needs") {
    return { title: "Shapes", text: SHAPES.stretched_r2 };
  }
  if (r5 === "calm_connection") {
    return { title: "Shapes", text: SHAPES.smooth_r3 };
  }
  return {
    title: "Shapes",
    text: "Contour and edge track defensiveness versus regulation—sharp breaks versus smooth continuity.",
  };
}

function movementBullet(round5, round2, round3) {
  const r5 = norm(round5);
  const r3 = norm(round3);
  const r2 = norm(round2);
  if (r3 === "clarity" || r3 === "balanced") {
    return { title: "Movement", text: MOVEMENT.flowing };
  }
  if (r3 === "stuck") {
    return { title: "Movement", text: MOVEMENT.stagnant };
  }
  if (r3 === "lost") {
    return { title: "Movement", text: MOVEMENT.chaotic };
  }
  if (r2 === "overwhelm" || r2 === "confusion") {
    return { title: "Movement", text: MOVEMENT.chaotic };
  }
  if (r2 === "pressure") {
    return { title: "Movement", text: MOVEMENT.rigid };
  }
  if (r2 === "emptiness") {
    return { title: "Movement", text: MOVEMENT.stagnant };
  }
  if (r5 === "emotional_overload") {
    return { title: "Movement", text: MOVEMENT.chaotic };
  }
  if (r5 === "guarded_distance") {
    return { title: "Movement", text: MOVEMENT.rigid };
  }
  if (r5 === "calm_connection") {
    return { title: "Movement", text: MOVEMENT.flowing };
  }
  if (r5 === "pressure_unmet_needs") {
    return { title: "Movement", text: MOVEMENT.rigid };
  }
  return { title: "Movement", text: MOVEMENT.mixed };
}

function spaceBullet(round5, round2, round3) {
  const r5 = norm(round5);
  const r2 = norm(round2);
  const r3 = norm(round3);
  if (r5 && SPACE[r5]) {
    return { title: "Space", text: SPACE[r5] };
  }
  if (r3 === "clarity" || r3 === "balanced") {
    return { title: "Space", text: SPACE.inferred_close };
  }
  if (r3 === "stuck") {
    return { title: "Space", text: SPACE.inferred_distant };
  }
  if (r3 === "lost") {
    return { title: "Space", text: SPACE.inferred_uneven };
  }
  if (r2 === "emptiness") {
    return { title: "Space", text: SPACE.inferred_empty };
  }
  return { title: "Space", text: SPACE.inferred_uneven };
}

/**
 * @param {{ round2Tag?: string | null, round3Tag?: string | null, round5Tag?: string | null }} tags
 * @returns {{ bullets: { title: string, text: string }[], footer: string, hasSignal: boolean }}
 */
export function buildHowToReadVisual(tags) {
  const round2Tag = sanitizeRound2(tags?.round2Tag ?? null);
  const round3Tag = sanitizeRound3(tags?.round3Tag ?? null);
  const round5Tag = sanitizeRound5(tags?.round5Tag ?? null);

  const hasSignal = Boolean(round2Tag || round3Tag || round5Tag);

  if (!hasSignal) {
    return { bullets: STATIC_BULLETS, footer: FOOTER, hasSignal: false };
  }

  const color =
    colorBullet(round5Tag, round2Tag, round3Tag) ?? {
      title: "Colors",
      text: COLORS_R5.calm_connection,
    };
  const shapes = shapeBullet(round5Tag, round2Tag, round3Tag);
  const movement = movementBullet(round5Tag, round2Tag, round3Tag);
  const space = spaceBullet(round5Tag, round2Tag, round3Tag);

  return {
    bullets: [color, shapes, movement, space],
    footer: FOOTER,
    hasSignal: true,
  };
}
