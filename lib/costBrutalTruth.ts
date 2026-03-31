export type CostBrutalTruthInput = {
  primaryPattern: string;
  tags?: string[];
  interpretation?: string;
};

export type CostBrutalTruthOutput = {
  cost: string;
  brutal_truth: string;
};

function norm(s: unknown): string {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

function hasAny(tags: string[], needles: string[]) {
  return needles.some((n) => tags.some((t) => t.includes(n)));
}

function pickCost(primaryPattern: string, tags: string[], interpretation: string) {
  const p = primaryPattern.trim();
  const lower = p.toLowerCase();
  const dist = hasAny(tags, ["distance", "disconnection", "silence", "avoidance", "withdraw"]);
  const noise = hasAny(tags, ["overthinking", "internal_conflict", "chaos", "mental_noise", "overwhelm"]);
  const control = hasAny(tags, ["control", "guard", "guarded", "edited", "measured"]);
  const tension = hasAny(tags, ["tension", "instability", "break", "breaking_point", "fragility", "strain"]);

  if (lower.includes("quiet withdrawal")) {
    if (dist && noise) {
      return "People stop bringing you the real thing because they can feel you disappear the moment it gets tense.";
    }
    if (dist) {
      return "People stop opening up to you because it feels like you’re not really there when it matters.";
    }
    return "Your closeness plateaus because you leave right before anything honest can land.";
  }

  if (lower.includes("silent overthinking")) {
    return "You build entire arguments alone—then act distant like they should’ve read your mind.";
  }

  if (lower.includes("controlled openness")) {
    if (control) {
      return "People feel you holding the steering wheel, so they stop trusting that there’s room for their truth too.";
    }
    return "You share just enough to look open, but not enough to be met.";
  }

  if (lower.includes("emotional avoidance")) {
    return "You dodge the feeling so fast that your life looks calm on the outside—and lonely on the inside.";
  }

  if (lower.includes("soft self")) {
    return "You train people to expect less from you, then resent them for taking you at your word.";
  }

  if (tension) {
    return "You keep things from breaking by not touching the real issue—so the same fracture keeps coming back.";
  }

  // fallback, grounded in interpretation
  if (interpretation) {
    return "The cost is that people feel the gap between what you feel and what you’ll actually say—so connection stays shallow.";
  }
  return "The cost is that the people closest to you feel you half‑present—so intimacy never fully builds.";
}

function pickBrutalTruth(primaryPattern: string, tags: string[], interpretation: string) {
  const p = primaryPattern.trim();
  const lower = p.toLowerCase();
  const dist = hasAny(tags, ["distance", "disconnection", "silence", "avoidance", "withdraw"]);
  const noise = hasAny(tags, ["overthinking", "internal_conflict", "chaos", "mental_noise", "overwhelm"]);
  const control = hasAny(tags, ["control", "guard", "guarded", "edited", "measured"]);

  if (lower.includes("quiet withdrawal")) {
    if (dist && noise) {
      return "You avoid conflict so well that you disappear—then call it “peace.”";
    }
    return "You go quiet to stay safe, and then act surprised when distance grows.";
  }

  if (lower.includes("silent overthinking")) {
    return "You overthink in private, then punish them with silence like they caused it.";
  }

  if (lower.includes("controlled openness")) {
    if (control) return "You share, but only on your terms—so nothing real can reach you.";
    return "You call it openness, but it’s still control.";
  }

  if (lower.includes("emotional avoidance")) {
    return "You’d rather feel nothing than risk feeling too much.";
  }

  if (lower.includes("soft self")) {
    return "You keep the peace by shrinking yourself—then wonder why you feel unseen.";
  }

  if (interpretation && (dist || noise || control)) {
    return "You keep it inside until it hardens—then call it “being fine.”";
  }
  return "You keep protecting yourself from the moment—and it’s costing you the relationship you say you want.";
}

export function buildCostAndBrutalTruth(input: CostBrutalTruthInput): CostBrutalTruthOutput {
  const primaryPattern = String(input.primaryPattern ?? "").trim();
  const tags = Array.isArray(input.tags) ? input.tags.map(norm).filter(Boolean) : [];
  const interpretation = String(input.interpretation ?? "").trim();

  const cost = pickCost(primaryPattern, tags, interpretation);
  const brutal_truth = pickBrutalTruth(primaryPattern, tags, interpretation);

  return { cost, brutal_truth };
}

