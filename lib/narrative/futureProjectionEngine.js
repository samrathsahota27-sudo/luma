/**
 * Future Projection Engine — deterministic default vs growth futures from couple tags + optional conflict text.
 * Satin: descriptive, gradual. Steel: compressed, minimal words. Same realism and numbers in both.
 */

import { normalizeDepthMode } from "@/lib/depthMode";
import { extractNarrativeTagsFromSelections, normalizeNarrativeTags } from "./finalNarrativeEngine";

/** @typedef {import("./finalNarrativeEngine").NarrativeInputTags} NarrativeInputTags */

/**
 * @typedef {{
 *   personA?: NarrativeInputTags | null,
 *   personB?: NarrativeInputTags | null,
 *   conflictSummary?: string | null,
 *   usagePatterns?: Record<string, unknown> | null,
 *   depthMode?: unknown,
 * }} FutureProjectionInput
 */

/** @typedef {import("./finalNarrativeEngine").NormalizedNarrativeTags} NTags */

function isReactive(n3) {
  return n3 === "overwhelmed" || n3 === "confrontational";
}

function isWithdrawn(n3) {
  return n3 === "avoidant";
}

function innerIsHighLoad(n2) {
  return n2 === "anxious" || n2 === "heavy";
}

/**
 * @param {NTags} a
 * @param {NTags} b
 */
function computeIntensity(a, b) {
  let i = 0;
  if (a.n1 !== b.n1) i += 1;
  if (a.n2 !== b.n2) i += 1;
  if (a.n3 !== b.n3) i += 1;
  if (a.n4 !== b.n4) i += 1;
  if (a.n5 !== b.n5) i += 1;
  if ((isWithdrawn(a.n3) && isReactive(b.n3)) || (isWithdrawn(b.n3) && isReactive(a.n3))) i += 2;
  if (isReactive(a.n3) && isReactive(b.n3)) i += 1;
  if (isWithdrawn(a.n3) && isWithdrawn(b.n3)) i += 1;
  const innerSplit =
    (a.n2 === "calm" && innerIsHighLoad(b.n2)) || (b.n2 === "calm" && innerIsHighLoad(a.n2));
  if (innerSplit) i += 1;
  if ((a.n5 === "distance" && b.n5 === "calm") || (b.n5 === "distance" && a.n5 === "calm")) i += 1;
  if (a.n5 === "chaos" || b.n5 === "chaos") i += 1;
  if (a.n5 === "pressure" || b.n5 === "pressure") i += 1;
  return i;
}

/**
 * Deterministic 60–85 from mismatch / strain (not random).
 * @param {NTags} a
 * @param {NTags} b
 * @param {'quiet'|'chaos'|'burnout'|'mixed'} archetype
 */
function computeProbabilityPercent(a, b, archetype) {
  const base = archetype === "chaos" ? 66 : archetype === "burnout" ? 64 : archetype === "quiet" ? 62 : 63;
  const intensity = computeIntensity(a, b);
  const bump = Math.min(22, Math.round(intensity * 1.65));
  const raw = base + bump;
  return Math.min(85, Math.max(60, raw));
}

/**
 * Priority: chaos (repeated conflict) → burnout (strain + unmet) → quiet (distance + avoidance) → scored fallback.
 * @param {NTags} a
 * @param {NTags} b
 * @returns {'quiet'|'chaos'|'burnout'|'mixed'}
 */
function pickArchetype(a, b) {
  const chaosSpace = a.n5 === "chaos" || b.n5 === "chaos";
  const bothReactive = isReactive(a.n3) && isReactive(b.n3);
  const whelmA = a.n3 === "overwhelmed";
  const whelmB = b.n3 === "overwhelmed";
  if (chaosSpace || bothReactive || (whelmA && whelmB)) {
    return "chaos";
  }

  const pressureSpace = a.n5 === "pressure" || b.n5 === "pressure";
  const unmet = a.n4 === "unmet_needs" || b.n4 === "unmet_needs";
  if (pressureSpace && unmet) {
    return "burnout";
  }

  const distanceSpace = a.n5 === "distance" || b.n5 === "distance";
  const avoid = isWithdrawn(a.n3) || isWithdrawn(b.n3);
  if (distanceSpace && avoid) {
    return "quiet";
  }

  const quietScore =
    (a.n5 === "distance" ? 2 : 0) +
    (b.n5 === "distance" ? 2 : 0) +
    (isWithdrawn(a.n3) ? 2 : 0) +
    (isWithdrawn(b.n3) ? 2 : 0) +
    (a.n5 === "calm" && b.n5 === "calm" && (isWithdrawn(a.n3) || isWithdrawn(b.n3)) ? 1 : 0);

  const chaosScore =
    (a.n5 === "chaos" ? 3 : 0) +
    (b.n5 === "chaos" ? 3 : 0) +
    (whelmA ? 2 : 0) +
    (whelmB ? 2 : 0) +
    (isReactive(a.n3) || isReactive(b.n3) ? 1 : 0);

  const burnoutScore =
    (a.n5 === "pressure" ? 2 : 0) +
    (b.n5 === "pressure" ? 2 : 0) +
    (a.n4 === "unmet_needs" ? 2 : 0) +
    (b.n4 === "unmet_needs" ? 2 : 0) +
    (innerIsHighLoad(a.n2) && innerIsHighLoad(b.n2) ? 1 : 0);

  const max = Math.max(quietScore, chaosScore, burnoutScore);
  if (max === 0) return "mixed";
  if (burnoutScore === max) return "burnout";
  if (chaosScore === max) return "chaos";
  if (quietScore === max) return "quiet";
  return "mixed";
}

const DEFAULT_SCENES = {
  quiet: `It’s a normal evening. You talk about small things, but avoid anything that might lead to tension. The connection isn’t broken—just quiet. You’ve both learned what not to say.

The silence feels cooperative, not cruel—until you notice you’re bracing without knowing why.`,

  chaos: `A small friction lands harder than the topic deserves. One of you goes sharp; the other shuts down or fires back. You patch it enough to keep the night intact, but nothing feels fully closed.

You tell yourselves it blew over. Underneath, the same pattern is rehearsing—faster next time, with less patience.`,

  burnout: `You’re functional on the outside—schedules, errands, polite check-ins. Inside, you’re running on empty, still holding needs you don’t fully name. Resentment shows up as fatigue, not argument.

You keep waiting for relief to arrive without a conversation that costs something. The gap between “fine” and honest keeps widening.`,

  mixed: `Days pass in a familiar rhythm: enough warmth to stay, not enough risk to shift what hurts. You manage the relationship the way you manage a busy week—triage, avoid spikes, move on.

You’re not falling apart in public. You’re slowly training each other in what’s safe to bring up—and what isn’t.`,
};

const DEFAULT_SCENES_STEEL = {
  quiet: `Normal evening: small talk, nothing that might spike tension. Connection isn’t gone—just muted. You both know what not to say.

Silence feels cooperative until you notice you’re bracing anyway.`,

  chaos: `Small friction, outsized hit. One sharp; one shuts or fires back. You patch the night; nothing fully closes.

Same pattern rehearses—faster next time, thinner patience.`,

  burnout: `Outside: schedules, polite check-ins. Inside: empty, needs unnamed. Resentment shows as fatigue, not fight.

You wait for relief without a costly talk. “Fine” and honest diverge.`,

  mixed: `Familiar rhythm: enough warmth to stay, not enough risk to shift what hurts. Triage spikes, move on.

You train each other on what’s safe to raise—and what isn’t.`,
};

const GROWTH_SCENES = {
  quiet: `You still have difficult moments, but they don’t vanish into polite silence the same way. One of you names a worry earlier; the other stays present instead of disappearing into “it’s fine.”

Conversations stay uncomfortable sometimes—that’s the trade—but the room feels less like a minefield. You recognize each other’s pacing without taking it as rejection.`,

  chaos: `Friction still shows up—you’re not pretending you’re cured. The difference is you catch the spiral sooner: less volume, more pause, a clearer sentence about what you’re actually protecting.

Repair becomes part of the same evening, not a week later. You still disagree; you stop using disagreement as proof you’re unsafe together.`,

  burnout: `The load doesn’t disappear, but you stop treating exhaustion as the only honest signal. Needs get shorter names, sooner—small requests before they harden into distance.

You still get tired; you’re less alone inside the tired. The pattern loosens because you’re not carrying everything in silence.`,

  mixed: `Nothing flips overnight. You still default to old moves when you’re stretched. More often, one of you interrupts the habit—a question instead of a retreat, a pause instead of a jab.

The relationship feels less like guessing and more like practice: awkward, real, and easier to scan than it used to be.`,
};

const GROWTH_SCENES_STEEL = {
  quiet: `Hard moments still land—less buried in polite silence. A worry named earlier; the other stays present instead of “fine.”

Still uncomfortable sometimes—that’s the trade. Less minefield; pacing read as pacing, not rejection.`,

  chaos: `Friction remains—you’re not “fixed.” You catch the spiral sooner: less volume, clearer line on what you protect.

Repair lands same evening, not a week later. Disagreement stops doubling as proof you’re unsafe together.`,

  burnout: `Load doesn’t vanish—exhaustion isn’t the only honest signal. Needs get shorter names, sooner.

Still tired; less alone in it. Pattern loosens when silence isn’t the only channel.`,

  mixed: `No overnight flip. Under stress, old defaults still fire. More often: a question instead of retreat, a pause instead of a jab.

Less guessing; more practiced awkward truth.`,
};

const TRIGGERS = {
  quiet: "This pattern continues because withdrawal and caution feel safer than the tension of being fully honest in real time.",
  chaos: "This pattern continues because one of you escalates when uncertain while the other narrows under pressure—so clarity and safety rarely arrive in the same moment.",
  burnout: "This pattern continues because unmet needs keep compounding while you both keep performing okay—until resentment outruns your bandwidth.",
  mixed: "This pattern continues because you’re skilled at staying close without risking the conversations that would actually change the shape of the closeness.",
};

const TRIGGERS_STEEL = {
  quiet: "Withdrawal wins over honest tension in the moment—so distance becomes the default path.",
  chaos: "Pressure pulls escalation and shutdown—clarity and safety rarely arrive together.",
  burnout: "You perform okay while needs stack—resentment outruns bandwidth.",
  mixed: "You stay close without the talks that would reshape the closeness—the habit holds.",
};

const CHOICES = {
  quiet: "You don’t need a new relationship—you need a different pattern around what you’re allowed to say out loud.",
  chaos: "You don’t need to stop caring—you need a different pattern for how you handle pressure before it becomes a fight.",
  burnout: "You don’t need to try harder in silence—you need a different pattern for naming load before it turns into withdrawal.",
  mixed: "You don’t need a perfect match—you need a different pattern for how you both handle discomfort before it becomes distance.",
};

const CHOICES_STEEL = {
  quiet: "Not a new relationship—a new rule for what you’re allowed to say out loud.",
  chaos: "Not less care—a different pre-fight pattern under pressure.",
  burnout: "Not harder in silence—name load before it becomes withdrawal.",
  mixed: "Not a perfect match—interrupt discomfort before it becomes distance.",
};

/** @param {boolean} steel @param {string} satin @param {string} st */
function pick(steel, satin, st) {
  return steel ? st : satin;
}

/**
 * @param {string | null | undefined} conflictSummary
 * @param {'quiet'|'chaos'|'burnout'|'mixed'} archetype
 * @param {boolean} steel
 */
function enrichTriggerWithSummary(conflictSummary, archetype, steel) {
  const t = typeof conflictSummary === "string" ? conflictSummary.trim() : "";
  if (t.length < 12) return null;
  const lower = t.slice(0, 280).toLowerCase();
  if (/withdraw|shut|silent|quiet|distance|pull away|avoid/.test(lower) && archetype !== "chaos") {
    return pick(
      steel,
      "Your summary keeps pointing at retreat under pressure—so the future defaults to careful distance unless that move gets interrupted on purpose.",
      "Your read skews retreat under pressure—default futures drift unless you interrupt that move."
    );
  }
  if (/push|press|fight|argue|escalat|loud|intense/.test(lower)) {
    return pick(
      steel,
      "Your summary keeps pointing at intensity when things wobble—so the future defaults to repeated spikes unless the pause becomes as practiced as the reaction.",
      "Your read skews intensity when things wobble—spikes repeat until pause is as trained as reaction."
    );
  }
  return null;
}

/**
 * @param {FutureProjectionInput} input
 */
export function buildFutureProjection(input) {
  const a = normalizeNarrativeTags(input?.personA ?? {});
  const b = normalizeNarrativeTags(input?.personB ?? {});
  const steel = normalizeDepthMode(input?.depthMode) === "steel";
  const archetype = pickArchetype(a, b);
  const probabilityPercent = computeProbabilityPercent(a, b, archetype);
  const probabilityLine = pick(
    steel,
    `Based on your current pattern, there is a ${probabilityPercent}% chance this dynamic continues.`,
    `Same pattern, unchanged: about ${probabilityPercent}% chance this dynamic keeps running.`
  );

  const triggers = steel ? TRIGGERS_STEEL : TRIGGERS;
  const choices = steel ? CHOICES_STEEL : CHOICES;
  const defaultScenes = steel ? DEFAULT_SCENES_STEEL : DEFAULT_SCENES;
  const growthScenes = steel ? GROWTH_SCENES_STEEL : GROWTH_SCENES;

  let trigger = triggers[archetype];
  const summaryNudge = enrichTriggerWithSummary(input?.conflictSummary, archetype, steel);
  if (summaryNudge) {
    trigger = `${trigger} ${summaryNudge}`;
  }

  void input?.usagePatterns;

  return {
    defaultPath: defaultScenes[archetype],
    probabilityScore: probabilityPercent,
    probabilityLine,
    growthPath: growthScenes[archetype],
    trigger,
    theChoice: choices[archetype],
    archetype,
    depthMode: steel ? "steel" : "satin",
  };
}

/**
 * @param {Record<number, unknown> | null | undefined} partnerA
 * @param {Record<number, unknown> | null | undefined} partnerB
 * @param {string | null | undefined} conflictSummary
 * @param {Record<string, unknown> | null | undefined} [usagePatterns]
 * @param {unknown} [depthMode]
 */
export function buildFutureProjectionFromPartners(
  partnerA,
  partnerB,
  conflictSummary,
  usagePatterns,
  depthMode
) {
  return buildFutureProjection({
    personA: extractNarrativeTagsFromSelections(partnerA),
    personB: extractNarrativeTagsFromSelections(partnerB),
    conflictSummary: conflictSummary ?? null,
    usagePatterns: usagePatterns ?? null,
    depthMode,
  });
}

/**
 * Build a single conflict summary string from couple API fields (optional).
 * @param {{ brutalTruth?: string | null, conflictFrictionPoints?: { mismatch?: string }[] | null }} data
 */
export function buildConflictSummaryFromCoupleResult(data) {
  const parts = [];
  const bt = typeof data?.brutalTruth === "string" ? data.brutalTruth.trim() : "";
  if (bt) parts.push(bt);
  const rows = Array.isArray(data?.conflictFrictionPoints) ? data.conflictFrictionPoints : [];
  for (const row of rows) {
    if (row && typeof row.mismatch === "string" && row.mismatch.trim()) {
      parts.push(row.mismatch.trim());
    }
  }
  const s = parts.join(" ");
  return s.length > 0 ? s.slice(0, 1200) : null;
}
