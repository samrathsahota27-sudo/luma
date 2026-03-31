export type TensionInput = {
  pattern: string;
  themeTitle?: string;
  toneTitle?: string;
  relationshipTags?: string[];
  relationshipSummary?: string;
};

export type TensionOutput = {
  think: string;
  actually: string;
  so: string;
};

function norm(s: unknown): string {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

function hasAny(tags: string[], needles: string[]) {
  return needles.some((n) => tags.some((t) => t.includes(n)));
}

export function buildTension(input: TensionInput): TensionOutput {
  const pattern = String(input.pattern ?? "").trim();
  const p = pattern.toLowerCase();
  const tags = Array.isArray(input.relationshipTags) ? input.relationshipTags.map(norm).filter(Boolean) : [];
  const summary = String(input.relationshipSummary ?? "").trim();

  // Optional bias words from tags/summary.
  const feelsDistant = hasAny(tags, ["distant", "distance"]) || /distant|distance/i.test(summary);
  const feelsCalm = hasAny(tags, ["calm", "safe", "warm"]) || /calm|safe/i.test(summary);
  const feelsUnstable = hasAny(tags, ["unstable", "heavy", "draining"]) || /unstable|heavy|draining/i.test(summary);

  if (p.includes("quiet withdrawal")) {
    return {
      think: feelsCalm
        ? "You think staying quiet keeps things calm."
        : "You think staying quiet keeps you safe.",
      actually: feelsDistant
        ? "But actually, it reads like distance."
        : "But actually, it creates distance.",
      so: "So nothing real ever gets said.",
    };
  }

  if (p.includes("soft pursuit")) {
    return {
      think: "You think you’re being patient.",
      actually: "But actually, you keep reaching to close the gap.",
      so: "So the other person pulls back to breathe.",
    };
  }

  if (p.includes("controlled openness")) {
    return {
      think: "You think you’re being honest.",
      actually: "But actually, you’re managing the truth to stay in control.",
      so: "So closeness never fully lands.",
    };
  }

  if (p.includes("silent overthinking")) {
    return {
      think: "You think you’re being thoughtful.",
      actually: "But actually, you replay instead of speaking.",
      so: "So resentment builds in silence.",
    };
  }

  // Fallback (still sharp, not advice-y).
  return {
    think: feelsUnstable ? "You think this is just a rough patch." : "You think you’re handling it fine.",
    actually: "But actually, a pattern is steering the moment.",
    so: "So the same outcome keeps repeating.",
  };
}

