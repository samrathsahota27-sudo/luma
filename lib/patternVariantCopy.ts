export type IndividualStructuredOutput = {
  pattern: string;
  description: string;
  theme: { title: string; subtitle: string };
  tone: { title: string; subtitle: string };
  core_line: string;
  reach: string;
  shift: string;
};

/**
 * Deterministic per-variant phrasing seeds.
 * These are used as:
 * - prompt anchors (AI must keep the nuance)
 * - safe fallback if AI fails/returns generic placeholders
 */
export const variantCopy: Record<
  string,
  Partial<Omit<IndividualStructuredOutput, "pattern">> & {
    /** Optional extra instruction for nuance. */
    nuance?: string;
  }
> = {
  // Quiet Withdrawal variants
  soft_avoider: {
    nuance: "soft, calm surface; avoidance hides under ‘peace’",
    description: "You stay calm even when something feels off — then quietly pull away from the edge of it.",
    core_line: "You call it ‘keeping the peace’ when it’s actually avoiding the moment.",
    reach: "Quiet. Control. A version of closeness that never asks too much.",
    shift: "Say one small true sentence before you disappear behind calm.",
  },
  overthinking_withdrawer: {
    nuance: "internal replay; silence as protection; mind does the fight for you",
    description: "You don’t react outwardly — you replay it in your head until the feeling goes numb.",
    core_line: "You avoid the conversation by having it privately, over and over.",
    reach: "Less noise. More control. A room where nothing can escalate.",
    shift: "Name the real sentence early — before your mind turns it into a loop.",
  },
  silent_distance: {
    nuance: "distance + disconnection; silence reads as absence",
    description: "When closeness rises, you create distance — not with drama, with absence.",
    core_line: "You withdraw so quietly it looks like nothing happened.",
    reach: "Space. Quiet. A buffer that keeps you from being touched.",
    shift: "Stay in the room for ten more seconds, then say what you’re protecting.",
  },

  // Controlled Openness variants
  careful_sharer: {
    nuance: "measured sharing; safety through control",
    description: "You share — but in measured doses, so you never lose control of the moment.",
    core_line: "You offer honesty only when you can still manage the outcome.",
    reach: "Clarity. Control. Connection with guardrails.",
    shift: "Say the part you usually edit out — once — and let it land.",
  },
  edited_truth: {
    nuance: "overthinking + control; truth filtered into something safe",
    description: "You don’t hide the truth — you refine it until it can’t cause a reaction.",
    core_line: "You edit your feelings into something unthreatening, then wonder why it doesn’t move anyone.",
    reach: "Precision. Control. A version of honesty that can’t be challenged.",
    shift: "Trade one perfect sentence for one real one.",
  },
};

export function buildDeterministicVariantFallback(args: {
  pattern: string;
  variant?: string | null;
  theme?: { title: string; subtitle: string };
  tone?: { title: string; subtitle: string };
}): IndividualStructuredOutput {
  const variant = (args.variant || "").trim();
  const seed = variant ? variantCopy[variant] : undefined;
  const theme = args.theme ?? { title: "Safety", subtitle: "protecting yourself" };
  const tone = args.tone ?? { title: "Soft", subtitle: "not dramatic" };

  return {
    pattern: args.pattern,
    description:
      (seed?.description?.trim() ||
        "When things get close, you go quiet — then blame yourself for feeling too much.") as string,
    theme,
    tone,
    core_line:
      (seed?.core_line?.trim() ||
        "You call it ‘being fine’ when it’s actually avoidance.") as string,
    reach:
      (seed?.reach?.trim() ||
        "Less noise. More control. A room you can breathe in.") as string,
    shift:
      (seed?.shift?.trim() ||
        "A small truth said early — before you disappear.") as string,
  };
}

