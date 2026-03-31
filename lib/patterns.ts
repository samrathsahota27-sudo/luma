export type PatternDef = {
  id: string;
  name: string;
  core: string;
  /** Prefer as "shadow" (less obvious, slightly deniable). */
  shadowEligible?: boolean;
};

export const individualPatterns: PatternDef[] = [
  {
    id: "quiet_withdrawal",
    name: "Quiet Withdrawal",
    core: "Avoids conflict by going silent",
  },
  {
    id: "silent_overthinking",
    name: "Silent Overthinking",
    core: "Replays conversations internally instead of saying what’s true",
    shadowEligible: true,
  },
  {
    id: "emotional_avoidance",
    name: "Emotional Avoidance",
    core: "Evades uncomfortable feelings by numbing, intellectualizing, or staying busy",
    shadowEligible: true,
  },
  {
    id: "controlled_openness",
    name: "Controlled Openness",
    core: "Shares carefully while maintaining control",
  },
  {
    id: "soft_self_erasure",
    name: "Soft Self‑Erasure",
    core: "Downplays needs to keep closeness stable",
    shadowEligible: true,
  },
  {
    id: "hypervigilant_overthinking",
    name: "Hypervigilant Overthinking",
    core: "Tries to prevent pain by predicting everything",
  },
  {
    id: "armored_independence",
    name: "Armored Independence",
    core: "Keeps distance to avoid needing anyone",
  },
];

export const couplePatterns: PatternDef[] = [
  {
    id: "soft_pursuit",
    name: "Soft Pursuit",
    core: "One moves closer while the other pulls away",
  },
  {
    id: "hot_cold_tension",
    name: "Hot‑Cold Tension",
    core: "Closeness spikes, then drops—repair never fully lands",
  },
  {
    id: "parallel_loneliness",
    name: "Parallel Loneliness",
    core: "You stay together while feeling alone beside each other",
  },
  {
    id: "repair_after_impact",
    name: "Repair After Impact",
    core: "You reconnect only after damage—truth arrives late",
  },
];

