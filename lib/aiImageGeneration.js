import { DALLE_ARCHETYPE_STYLE_SUFFIX } from "@/lib/psychologicalArchetypes";

/**
 * Verbatim strict negative instructions for couple inner-world / space-between art.
 * (DALL·E 3 has no separate `negative_prompt`; this block must live in the main prompt.)
 */
export const DALLE_NO_TEXT_BLOCK =
  "Do not include any text, letters, words, captions, symbols, logos, or typography anywhere in the image. Purely visual composition only. Abstract, painterly, or photographic style with no readable elements.";

export const DALLE_STRUCTURED_ART_BASE =
  "Create a cinematic emotional landscape representing a human inner world. Focus on mood, color, light, texture, and emotional contrast — not literal representation. Purely visual storytelling. Minimal, artistic, gallery-style.";

/** Hard exclusions appended as text (API does not support a dedicated negative field). */
export const DALLE_HARD_NEGATIVE_LINE =
  "Strictly exclude: any text, letters, words, watermark, captions, typography, signage, logos, symbols, icons, user interface, numbers, alphanumeric marks, QR codes, labels, stamps, seals, signatures.";

function joinDallePrompt(parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * @param {string} subjectLine - One short clause: whose inner world / what to express
 * @param {string} [archetypeSuffix]
 */
export function buildDalleCoupleInnerWorldPrompt(
  subjectLine,
  archetypeSuffix = DALLE_ARCHETYPE_STYLE_SUFFIX
) {
  return joinDallePrompt([
    DALLE_STRUCTURED_ART_BASE,
    subjectLine,
    DALLE_NO_TEXT_BLOCK,
    DALLE_HARD_NEGATIVE_LINE,
    archetypeSuffix,
  ]);
}

/**
 * @param {string} relationshipSnippet - Short grounding text (never rendered as text in-image)
 * @param {string} [archetypeSuffix]
 */
export function buildDalleCoupleBetweenPrompt(
  relationshipSnippet,
  archetypeSuffix = DALLE_ARCHETYPE_STYLE_SUFFIX
) {
  const ground = String(relationshipSnippet ?? "").trim().slice(0, 420);
  const context =
    ground.length > 0
      ? `This is the emotional field between two people—express it only through color, form, light, and space. Let the composition echo this relational felt sense; do not paint, write, or render any words or symbols from this description: ${ground}`
      : "This is the emotional field between two people—space, tension, and connection—expressed only through color, form, light, and negative space.";

  return joinDallePrompt([
    DALLE_STRUCTURED_ART_BASE,
    context,
    DALLE_NO_TEXT_BLOCK,
    DALLE_HARD_NEGATIVE_LINE,
    archetypeSuffix,
  ]);
}
