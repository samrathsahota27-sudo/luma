import { couplePatterns, individualPatterns, type PatternDef } from "@/lib/patterns";
import { imageTagMap } from "@/lib/imageTags";

type ScoreMap = Record<string, number>;

function bump(scores: ScoreMap, id: string, n: number) {
  scores[id] = (scores[id] ?? 0) + n;
}

function norm(s: unknown): string {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

export function extractTagSignalsFromSelections(selections: any): string[] {
  const out: string[] = [];
  if (!selections || typeof selections !== "object") return out;

  for (const k of Object.keys(selections)) {
    const v = selections[k];
    if (!v || typeof v !== "object") continue;

    // Map selected image → psychological tags (if known).
    const round = Number(k);
    if (Number.isFinite(round)) {
      // Round 1–4 are 0..3 indices; key shape: r{round}{index+1} like "r51".
      const idxRaw = v.selectedImageId ?? v.image;
      const idx = typeof idxRaw === "number" && Number.isFinite(idxRaw) ? idxRaw : null;
      if (idx != null) {
        const key = `r${round}${idx + 1}`;
        const mapped = imageTagMap[key];
        if (Array.isArray(mapped)) {
          for (const t of mapped) {
            const s = norm(t);
            if (s) out.push(s);
          }
        }
      }

      // Round 5 also stores `imageId` like "r51" (preferred).
      const imageId = typeof v.imageId === "string" ? v.imageId.trim() : "";
      if (imageId) {
        const mapped = imageTagMap[imageId];
        if (Array.isArray(mapped)) {
          for (const t of mapped) {
            const s = norm(t);
            if (s) out.push(s);
          }
        }
      }
    }

    const tag = norm(v.tag);
    if (tag) out.push(tag);

    if (Array.isArray(v.tags)) {
      for (const t of v.tags) {
        const s = norm(t);
        if (s) out.push(s);
      }
    }

    if (Array.isArray(v.psychologicalTags)) {
      for (const t of v.psychologicalTags) {
        const s = norm(t);
        if (s) out.push(s);
      }
    }

    const text = norm(v.text);
    if (text) out.push(text);
    const noneText = norm(v.noneText);
    if (noneText) out.push(noneText);
    const userExplanation = norm(v.userExplanation);
    if (userExplanation) out.push(userExplanation);
  }

  // de-dupe, keep stable order
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (const s of out) {
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    deduped.push(s);
  }
  return deduped;
}

function hasAny(sig: string[], needles: string[]) {
  return needles.some((n) => sig.some((s) => s.includes(n)));
}

export function scoreIndividualPatternsTop3(signals: string[]): {
  primary: PatternDef;
  secondary: PatternDef;
  shadow: PatternDef;
  ranked: Array<{ pattern: PatternDef; score: number }>;
} {
  const scores: ScoreMap = {};
  for (const p of individualPatterns) scores[p.id] = 0;

  // Quiet Withdrawal
  if (hasAny(signals, ["avoid", "avoidance", "withdraw", "pull back", "silent", "silence", "numb", "shut down"])) {
    bump(scores, "quiet_withdrawal", 3);
  }
  if (hasAny(signals, ["conflict", "tension", "fight", "argument"]) && hasAny(signals, ["silent", "withdraw", "distance"])) {
    bump(scores, "quiet_withdrawal", 2);
  }

  // Silent Overthinking
  if (hasAny(signals, ["overthink", "replay", "loop", "ruminate", "what if", "should have"])) {
    bump(scores, "silent_overthinking", 3);
  }
  if (hasAny(signals, ["silent", "dont say", "didnt say", "withhold"]) && hasAny(signals, ["overthink", "replay", "ruminate"])) {
    bump(scores, "silent_overthinking", 2);
  }

  // Emotional Avoidance (shadow-leaning)
  if (hasAny(signals, ["numb", "shutdown", "avoid", "avoidance", "busy", "distract"])) {
    bump(scores, "emotional_avoidance", 2);
  }
  if (hasAny(signals, ["intellectual", "analyze", "logic"]) && hasAny(signals, ["feel", "emotion"])) {
    bump(scores, "emotional_avoidance", 2);
  }

  // Controlled Openness
  if (hasAny(signals, ["control", "careful", "measured", "guarded", "managed", "edited"])) {
    bump(scores, "controlled_openness", 3);
  }
  if (hasAny(signals, ["share", "open"]) && hasAny(signals, ["control", "careful", "guarded"])) {
    bump(scores, "controlled_openness", 2);
  }

  // Soft Self‑Erasure
  if (hasAny(signals, ["people please", "please", "keep the peace", "make it easy", "dont need much", "low maintenance"])) {
    bump(scores, "soft_self_erasure", 3);
  }
  if (hasAny(signals, ["need", "ask"]) && hasAny(signals, ["guilt", "too much", "burden"])) {
    bump(scores, "soft_self_erasure", 2);
  }

  // Hypervigilant Overthinking
  if (hasAny(signals, ["overthink", "analysis", "ruminate", "spiral", "anticipate", "predict"])) {
    bump(scores, "hypervigilant_overthinking", 3);
  }
  if (hasAny(signals, ["safe", "security"]) && hasAny(signals, ["overthink", "anticipate", "control"])) {
    bump(scores, "hypervigilant_overthinking", 1);
  }

  // Armored Independence
  if (hasAny(signals, ["independent", "dont need", "self sufficient", "alone", "keep distance", "space"])) {
    bump(scores, "armored_independence", 3);
  }
  if (hasAny(signals, ["depend", "rely", "need"]) && hasAny(signals, ["fear", "avoid"])) {
    bump(scores, "armored_independence", 2);
  }

  const ranked = individualPatterns
    .map((p) => ({ pattern: p, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const primary = ranked[0]?.pattern ?? individualPatterns[0];
  const secondary = (ranked.find((r) => r.pattern.id !== primary.id)?.pattern) ?? primary;

  // Shadow: prefer "shadowEligible" patterns that are not primary/secondary and have non-trivial score.
  const shadowCandidate =
    ranked.find(
      (r) =>
        r.pattern.id !== primary.id &&
        r.pattern.id !== secondary.id &&
        !!r.pattern.shadowEligible &&
        r.score >= 1
    )?.pattern ??
    ranked.find((r) => r.pattern.id !== primary.id && r.pattern.id !== secondary.id)?.pattern ??
    secondary;

  return { primary, secondary, shadow: shadowCandidate, ranked };
}

export function scoreCouplePatternsTop3(signals: string[]): {
  primary: PatternDef;
  secondary: PatternDef;
  shadow: PatternDef;
  ranked: Array<{ pattern: PatternDef; score: number }>;
} {
  const scores: ScoreMap = {};
  for (const p of couplePatterns) scores[p.id] = 0;

  // Soft Pursuit (pursue–withdraw)
  if (hasAny(signals, ["pursue", "reach", "closer", "ask", "seek"]) && hasAny(signals, ["withdraw", "pull away", "silent", "distance"])) {
    bump(scores, "soft_pursuit", 4);
  }
  if (hasAny(signals, ["avoidance", "avoid", "control"]) && hasAny(signals, ["pursue", "reach"])) {
    bump(scores, "soft_pursuit", 2);
  }

  // Hot‑Cold Tension
  if (hasAny(signals, ["hot", "cold", "spike", "swing", "on off", "push pull"])) {
    bump(scores, "hot_cold_tension", 4);
  }
  if (hasAny(signals, ["tension", "friction"]) && hasAny(signals, ["repair", "apolog", "reset"])) {
    bump(scores, "hot_cold_tension", 2);
  }

  // Parallel Loneliness
  if (hasAny(signals, ["alone", "lonely", "side by side", "roommates", "distance"])) {
    bump(scores, "parallel_loneliness", 4);
  }
  if (hasAny(signals, ["silence", "quiet"]) && hasAny(signals, ["together", "relationship"])) {
    bump(scores, "parallel_loneliness", 1);
  }

  // Repair After Impact
  if (hasAny(signals, ["repair", "after", "too late", "only after", "damage", "impact"])) {
    bump(scores, "repair_after_impact", 4);
  }
  if (hasAny(signals, ["truth", "say", "talk"]) && hasAny(signals, ["late", "after"])) {
    bump(scores, "repair_after_impact", 2);
  }

  const ranked = couplePatterns
    .map((p) => ({ pattern: p, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const primary = ranked[0]?.pattern ?? couplePatterns[0];
  const secondary = (ranked.find((r) => r.pattern.id !== primary.id)?.pattern) ?? primary;
  const shadow =
    ranked.find((r) => r.pattern.id !== primary.id && r.pattern.id !== secondary.id)?.pattern ??
    secondary;

  return { primary, secondary, shadow, ranked };
}

