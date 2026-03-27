export type DepthMode = "gentle" | "balanced" | "direct";

export const DEPTH_MODE_STORAGE_KEY = "luma_depth_mode";

export function normalizeDepthMode(v: unknown): DepthMode {
  const s = typeof v === "string" ? v.toLowerCase().trim() : "";
  if (s === "gentle" || s === "direct") return s;
  return "balanced";
}

/** Appended to system prompts so the model adjusts tone. */
export function depthModeInstructions(mode: DepthMode): string {
  switch (mode) {
    case "gentle":
      return `

Depth mode — Gentle:
- Softer, warmer tone throughout.
- Offer more reassurance and validation before sharper observations.
- Frame insights as possibilities and invitations, not verdicts.
- Prioritize emotional safety; ease into difficulty gently.`;
    case "direct":
      return `

Depth mode — Direct:
- More blunt and concise; less padding and softening language.
- Still fully respectful — no contempt, insults, or attacking either person.
- Reduce hedging where clarity would help; name dynamics plainly.
- Do not confuse "direct" with cruel or dismissive.`;
    default:
      return `

Depth mode — Balanced:
- Default tone: clear, insightful, human — neither overly soft nor harsh.
- Mix honesty with care; calibrated, precise language.`;
  }
}

export function readDepthModeFromBody(body: Record<string, unknown> | null | undefined): DepthMode {
  return normalizeDepthMode(body?.depthMode);
}
