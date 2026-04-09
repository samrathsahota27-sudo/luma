function safeText(v) {
  return typeof v === "string" ? v.trim() : "";
}

function limitWords(text, maxWords) {
  const words = safeText(text).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function selectionLabel(round, item) {
  const imageNumber =
    typeof item?.selectedImageId === "number"
      ? item.selectedImageId + 1
      : typeof item?.image === "number"
        ? item.image + 1
        : null;
  const imageId = safeText(item?.imageId);
  const tag = safeText(item?.tag);
  const optionalText = safeText(item?.text || item?.userExplanation || item?.noneText);

  const parts = [];
  parts.push(`Round ${round}`);
  parts.push(
    imageId
      ? `Selected image: ${imageId}`
      : imageNumber != null
        ? `Selected image: #${imageNumber}`
        : `Selected image: unknown`
  );
  if (tag) parts.push(`Description: ${tag}`);
  if (optionalText) parts.push(`Optional text: ${limitWords(optionalText, 20)}`);
  return `- ${parts.join(" | ")}`;
}

export function buildSoloSelectionContext(selections) {
  const rows = [];
  for (let round = 1; round <= 5; round += 1) {
    const item = selections?.[round];
    if (!item || typeof item !== "object") continue;
    rows.push(selectionLabel(round, item));
  }
  return rows.length ? rows.join("\n") : "- No selection details provided";
}

export function buildSoloReflectionPrompt({
  selections,
  patternLabel,
  depthInstructions = "",
  contextJson = "",
}) {
  const selectionContext = buildSoloSelectionContext(selections);

  return `You are an emotionally intelligent reflection engine.
You do not give generic advice.
You interpret user choices with precision and depth.

Your job:
Turn a user's image selection into a sharp psychological insight.

USER INPUT FORMAT:
${selectionContext}

Optional relationship context:
${contextJson || "—"}

${depthInstructions}

OUTPUT STRUCTURE (MANDATORY):

1. Observation (specific, grounded)
- Directly reference the selected image
- Describe what emotional pattern it suggests

2. Interpretation (deeper meaning)
- What this reveals about how the user processes situations internally

3. Gentle Confrontation
- Point out a subtle truth the user may avoid (without being harsh)

4. Reflection Prompt (short, powerful question)
- Force introspection, not advice

RULES:
- NEVER say generic phrases like:
  "you seem reflective"
  "this suggests calmness"
  "you may be feeling something"
- ALWAYS reference the exact image choice
- Be concrete, not abstract
- Keep tone emotionally sharp but not judgmental
- Max length: 120–180 words total across fields below

BAD EXAMPLE (DO NOT DO):
"You seem to be in a reflective space. Consider what draws you to calm tones."

GOOD EXAMPLE STYLE:
"You chose the image with the isolated figure near the edge. That’s not just calm — it’s controlled distance. You don’t step away because you’re overwhelmed; you step away because it gives you clarity without needing anyone else."

CRITICAL — STRICT JSON OUTPUT ONLY:
Return a single JSON object. No markdown, no code fences, no text before/after.

Required JSON schema:
{
  "pattern": "${patternLabel}",
  "description": "Observation + Interpretation only (specific image references required).",
  "theme": { "title": "short", "subtitle": "short" },
  "tone": { "title": "short", "subtitle": "short" },
  "core_line": "Gentle confrontation (one sharp sentence).",
  "reach": "One concise internal motive line.",
  "shift": "Reflection prompt question ending with ?"
}

Do NOT include any other keys.`;
}
