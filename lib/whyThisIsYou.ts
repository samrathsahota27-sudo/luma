export type WhyThisIsYouInput = {
  selectedImages?: string[];
  tags?: string[];
  primaryPattern: string;
};

export type WhyThisIsYouOutput = {
  observation: string;
  interpretation: string;
  conclusion: string;
};

type TagGroupId =
  | "emotional_distance"
  | "internal_noise"
  | "tension_instability"
  | "calm_openness"
  | "control_guarding"
  | "unknown";

const TAG_TO_GROUP: Record<string, TagGroupId> = {
  distance: "emotional_distance",
  avoidance: "emotional_distance",
  disconnection: "emotional_distance",
  silence: "emotional_distance",

  overthinking: "internal_noise",
  internal_conflict: "internal_noise",
  chaos: "internal_noise",
  mental_noise: "internal_noise",
  overwhelm: "internal_noise",

  tension: "tension_instability",
  instability: "tension_instability",
  break: "tension_instability",
  breaking_point: "tension_instability",
  fragility: "tension_instability",
  emotional_strain: "tension_instability",

  calm: "calm_openness",
  openness: "calm_openness",
  shared_peace: "calm_openness",
  stability: "calm_openness",
  comfort: "calm_openness",
  calm_connection: "calm_openness",

  control: "control_guarding",
  guarded: "control_guarding",
  guarding: "control_guarding",
  edited: "control_guarding",
  measured: "control_guarding",
};

const GROUP_LABEL: Record<TagGroupId, string> = {
  emotional_distance: "emotional distance",
  internal_noise: "internal noise",
  tension_instability: "tension",
  calm_openness: "calm connection",
  control_guarding: "control and guarding",
  unknown: "something hard to name",
};

function norm(s: unknown): string {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

function dedupe<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const x of arr) {
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

function joinHuman(items: string[]): string {
  const xs = items.filter(Boolean);
  if (xs.length === 0) return "";
  if (xs.length === 1) return xs[0];
  if (xs.length === 2) return `${xs[0]} and ${xs[1]}`;
  return `${xs.slice(0, -1).join(", ")}, and ${xs[xs.length - 1]}`;
}

function pickTopGroups(tags: string[]): TagGroupId[] {
  const counts: Record<TagGroupId, number> = {
    emotional_distance: 0,
    internal_noise: 0,
    tension_instability: 0,
    calm_openness: 0,
    control_guarding: 0,
    unknown: 0,
  };

  for (const t of tags) {
    const g = TAG_TO_GROUP[t] ?? "unknown";
    counts[g] += 1;
  }

  return (Object.keys(counts) as TagGroupId[])
    .map((g) => ({ g, n: counts[g] }))
    .sort((a, b) => b.n - a.n)
    .filter((x) => x.n > 0)
    .map((x) => x.g)
    .slice(0, 2);
}

function conclusionForPattern(primaryPattern: string) {
  const p = primaryPattern.trim() || "your pattern";
  const lower = p.toLowerCase();
  if (lower.includes("quiet withdrawal")) {
    return `So when things get close, you withdraw quietly instead of reacting. That’s why your pattern is ${p}.`;
  }
  if (lower.includes("controlled openness")) {
    return `So when things get close, you share—but only in ways you can still manage. That’s why your pattern is ${p}.`;
  }
  if (lower.includes("silent overthinking")) {
    return `So when things get close, you think in loops instead of saying the real thing. That’s why your pattern is ${p}.`;
  }
  if (lower.includes("emotional avoidance")) {
    return `So when things get close, you step away from the feeling before it can touch you. That’s why your pattern is ${p}.`;
  }
  return `So when things get close, this becomes the move you default to. That’s why your pattern is ${p}.`;
}

export function buildWhyThisIsYou(input: WhyThisIsYouInput): WhyThisIsYouOutput {
  const selectedImages = Array.isArray(input.selectedImages)
    ? input.selectedImages.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const tags = Array.isArray(input.tags) ? input.tags.map(norm).filter(Boolean) : [];
  const primaryPattern = String(input.primaryPattern ?? "").trim();

  const topGroups = pickTopGroups(tags);
  const groupLabels = dedupe(topGroups.map((g) => GROUP_LABEL[g])).filter(Boolean);
  const labelLine = groupLabels.length ? joinHuman(groupLabels) : "a familiar kind of tension";

  const observation =
    selectedImages.length > 0 && tags.length > 0
      ? `You consistently chose images that pointed toward ${labelLine}.`
      : tags.length > 0
        ? `Your choices clustered around ${labelLine}.`
        : `Your choices weren’t random—there’s a consistent signal in what you picked.`;

  const interpretationParts: string[] = [];
  if (topGroups.includes("emotional_distance")) {
    interpretationParts.push(
      "You don’t explode outwardly. You create distance—often through silence—so you don’t have to risk conflict."
    );
  }
  if (topGroups.includes("internal_noise")) {
    interpretationParts.push(
      "A lot happens internally: replaying, overthinking, trying to resolve the feeling in your head before you say anything."
    );
  }
  if (topGroups.includes("control_guarding")) {
    interpretationParts.push(
      "You share carefully. Keeping control feels safer than being fully seen in real time."
    );
  }
  if (topGroups.includes("tension_instability")) {
    interpretationParts.push(
      "You can feel the strain early—before it becomes a fight—so you start protecting yourself preemptively."
    );
  }
  if (topGroups.includes("calm_openness")) {
    interpretationParts.push(
      "You’re drawn to steadiness. You want calm, but you may keep the peace by not saying what’s true yet."
    );
  }

  const interpretation =
    interpretationParts.length > 0
      ? interpretationParts.join(" ")
      : "This suggests you process things inwardly first, and you protect yourself before you risk being exposed.";

  const conclusion = conclusionForPattern(primaryPattern);

  return { observation, interpretation, conclusion };
}

