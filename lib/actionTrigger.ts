export type ActionTriggerInput = {
  pattern: string;
  toneTitle?: string;
  emotionalTags?: string[];
  /** Optional: user-written text for extra grounding (kept subtle). */
  userText?: string;
  /** Existing shift line from structured output (if present). */
  shiftSeed?: string | null;
};

export function buildActionTrigger(input: ActionTriggerInput): string {
  const pattern = String(input.pattern ?? "").trim();
  const p = pattern.toLowerCase();
  const tone = String(input.toneTitle ?? "").trim().toLowerCase();
  const tags = Array.isArray(input.emotionalTags)
    ? input.emotionalTags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
    : [];
  const userText = String(input.userText ?? "").trim();
  const seed = String(input.shiftSeed ?? "").trim();

  // If we already have a strong micro-action seed, keep it.
  if (seed && seed.length <= 120 && !/this suggests|you tend to|vibes|energy|spiritual/i.test(seed)) {
    return seed;
  }

  const has = (needle: string) => tags.some((t) => t.includes(needle));

  if (p.includes("quiet withdrawal")) {
    return "Say one small true sentence early—before you disappear.";
  }
  if (p.includes("emotional avoidance")) {
    return "Pause. Name the feeling in one word—without explaining it away.";
  }
  if (p.includes("soft pursuit")) {
    return "Let them come to you once—don’t fill the silence.";
  }
  if (p.includes("controlled openness")) {
    return "Say the unedited sentence once—no clarifying, no softening.";
  }
  if (p.includes("silent overthinking")) {
    return "Send the one sentence you keep rewriting—before it becomes a loop.";
  }

  // Tag-biased fallback (still small + doable).
  if (has("avoidance") || has("distance") || has("disconnection")) {
    return "Stay in the room for ten more seconds—then name what you’re avoiding.";
  }
  if (has("overthinking") || has("internal_conflict") || has("chaos")) {
    return "Pick one sentence and say it out loud—don’t rehearse it first.";
  }
  if (has("calm") && tone.includes("soft")) {
    return "Trade calm for clarity once—say what you actually want.";
  }

  // Last fallback; lightly ground in user text if present.
  if (userText && userText.length >= 8) {
    return "Name the smallest change you want—then ask for it directly.";
  }
  return "Do one small honest thing early—before the pattern takes over.";
}

