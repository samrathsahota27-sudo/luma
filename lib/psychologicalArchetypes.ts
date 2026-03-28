/**
 * Psychological archetype vocabulary: maps visual language in Luma’s relationship map
 * and generated art direction to emotional meaning (not clinical labels).
 */

export const ARCHETYPE_VISUAL_RULES = {
  jaggedLines: "Jagged or sharp lines → defensiveness and conflict energy.",
  smoothCurves: "Smooth curves and soft gradients → emotional safety and steadier regulation.",
  fadedElements: "Faded, dissolving, or low-opacity links → withdrawal, avoidance, or unfinished repair.",
  shapeDistance: "Wide empty space between shapes → emotional distance or trouble meeting in the middle.",
  overlappingShapes: "Overlapping or fused forms → closeness; can edge into enmeshment when boundaries blur.",
  repeatedPatterns: "Repeated motifs, echoes, or grids → behavioral cycles and familiar triggers.",
} as const;

/** Compact block for LLM prompts (couple analyze, etc.) */
export const ARCHETYPE_RULES_FOR_PROMPT = `
Visual–emotional mapping (use for mapRead* captions only; do not diagnose):
- Jagged / sharp / spiky lines → defensiveness, conflict, guarded reactions
- Smooth curves, gentle arcs → emotional safety, softness, repair capacity
- Faded, dissolving, ghosted elements → withdrawal, avoidance, ambiguity instead of resolution
- Large gaps or empty space between forms → emotional distance, disconnection
- Overlapping, merged, or heavily blended shapes → closeness or dependency / enmeshment when boundaries are unclear
- Repeated patterns, echoes, grids → recurring cycles in how you relate
`.trim();

/** Appended to DALL·E prompts so imagery matches archetype language. */
export const DALLE_ARCHETYPE_STYLE_SUFFIX =
  "Premium abstract fine-art or large-scale installation aesthetic—never a poster, slide deck, infographic, or Canva-style layout. Use abstract symbolic forms only (no text, no faces, no readable symbols). Let visual grammar carry meaning: angular or fractured shapes where there is tension; soft flowing curves where there is safety; faded or dissolving connections where there is withdrawal; generous negative space between forms for emotional distance; overlapping translucent layers for closeness (or enmeshment if boundaries feel fused); subtle repeated motifs where cycles show up.";

export type MapScores = {
  connection: number;
  distance: number;
  conflict: number;
  resolvedCount?: number;
};

function clamp0to100(n: unknown, fallback: number) {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(0, Math.min(100, Math.round(x)));
}

/**
 * 2–3 short lines explaining why the procedural Relationship Map looks the way it does.
 * Copy stays close to on-screen elements: jagged SVG, fog, orb separation, overlap glow, stones.
 */
export function interpretRelationshipMapHeroState(scores: MapScores): string[] {
  const c = clamp0to100(scores.connection, 50);
  const d = clamp0to100(scores.distance, 40);
  const f = clamp0to100(scores.conflict, 45);
  const resolved = Math.max(0, Math.min(10, Math.floor(scores.resolvedCount ?? 0)));

  const lines: string[] = [];

  if (f >= 52) {
    lines.push(
      "Those sharp, jagged accents mirror conflict showing up as defense—guarded reactions more than a calm middle."
    );
  } else if (f >= 36) {
    lines.push("The restless lines hint at friction you can feel before you’ve named it—tension still in motion.");
  } else {
    lines.push("Smoother visual rhythm here matches a quieter conflict line—less spike, more room to breathe.");
  }

  if (d >= 52) {
    lines.push(
      "The fog and wider gap between the orbs read as distance and withdrawal—harder to see each other clearly."
    );
  } else if (d >= 36) {
    lines.push("Soft fade suggests drift or avoidance more than a clean, spoken repair.");
  } else {
    lines.push("Lighter fog and tighter spacing signal you’re not as lost in distance right now.");
  }

  const overlapStrong = c >= 58 && d < 42;
  const bridgeThin = c < 40;

  if (overlapStrong && lines.length < 3) {
    lines.push(
      "The shared glow where you overlap can mean safety—or notice if closeness ever blurs into fusion."
    );
  } else if (bridgeThin && lines.length < 3) {
    lines.push("A thinner bridge between the orbs matches emotional reach that still feels stretched.");
  }

  if (resolved >= 2 && lines.length < 3) {
    lines.push(
      "The small stones are resolved moments—patterns you’ve begun to recognize and metabolize."
    );
  }

  return lines.slice(0, 3);
}
