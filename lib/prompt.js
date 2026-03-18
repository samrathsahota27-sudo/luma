import { ROUND_SIGNAL_LABELS, getRoundTag } from "@/lib/reflection/roundTagging";

function normalizeRoundAnswer(a, roundNumber) {
  if (!a || typeof a !== "object") return { type: "missing" };
  const selectedType = a.selectedType ?? "image";
  if (selectedType === "none") {
    const explanation = String(a.userExplanation ?? a.text ?? "").trim();
    return { type: "none", explanation };
  }
  const idx = a.selectedImageId ?? a.image;
  const tag = a.tag ?? (typeof idx === "number" ? getRoundTag(roundNumber, idx) : null);
  const userTags = Array.isArray(a.tags) ? a.tags.filter(Boolean) : [];
  const text = String(a.text ?? "").trim();
  return { type: "image", tag: tag ?? null, userTags, text };
}

function buildSignals(answers) {
  const signals = [];
  const tags = [];
  const tagObjects = [];

  for (let round = 1; round <= 4; round++) {
    const label = ROUND_SIGNAL_LABELS?.[round] ?? `Round ${round}`;
    const a = normalizeRoundAnswer(answers?.[round], round);

    if (a.type === "none") {
      const extra = a.explanation ? ` (user: "${a.explanation}")` : "";
      signals.push(`- ${label}: none${extra}`);
      continue;
    }

    const tagText = a.tag ? a.tag : "unknown";
    const meta = answers?.[round]?.meta === "unsure" ? "unsure" : null;
    signals.push(`- ${label}: ${tagText}${meta ? " (meta: unsure)" : ""}`);
    if (a.userTags?.length) {
      signals.push(`  - chosen words: ${a.userTags.join(", ")}`);
    }
    if (a.tag) tags.push(a.tag);
    if (a.tag) tagObjects.push({ tag: a.tag, ...(meta ? { meta: "unsure" } : {}) });
  }

  return { signals, tags, tagObjects };
}

export function buildPrompt(answers) {
  const { signals, tags, tagObjects } = buildSignals(answers);

  return `
The user completed a 4-round emotional reflection test.

User emotional signals (round-specific tags):
${signals.join("\n")}

Aggregated tags:
${tags.length ? JSON.stringify(tags) : "[]"}

Aggregated tag objects:
${tagObjects.length ? JSON.stringify(tagObjects) : "[]"}

Important:
- If any round is "none", treat the user's explanation as the primary input for that round.
- Do NOT infer meaning from an image when a round is "none".
- Use the tag contrasts (e.g., Drawn to vs Discomfort vs Current state vs Direction) to generate:
  - core pattern
  - emotional contrast
  - direction insight
- If a tag has meta "unsure", interpret it as an intuitive / subconscious signal:
  - emphasize felt sense over logical explanation
  - avoid over-confident causal claims
  - reflect gently: "this seems felt rather than clearly defined"

Generate a 300–400 word emotional reflection structured into 4 sections:

1. Core Pattern Insight (3–4 lines)
2. Gentle Direction (3–4 lines)
3. Emotional Expansion (3–4 lines)
4. Soft Invitation to unlock deeper analysis using Couple Mode (3–4 lines)

Each section must:
- Start with a clear heading
- Use short paragraphs
- Leave a blank line between sections
- Avoid long unbroken blocks of text

Tone:
Insightful, calm, psychologically precise, elegant.
Speak directly to the user in second person.
`;
}

