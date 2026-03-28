/**
 * Couple Narrative Engine — deterministic dyad profile from two five-round tag sets.
 * Satin: balanced, explanatory. Steel: contrast-focused, direct (no blame, sharper mechanics).
 */

import { normalizeDepthMode } from "@/lib/depthMode";
import { extractNarrativeTagsFromSelections, normalizeNarrativeTags } from "./finalNarrativeEngine";

/** @typedef {import("./finalNarrativeEngine").NarrativeInputTags} NarrativeInputTags */

/** @typedef {{ personA?: NarrativeInputTags | null, personB?: NarrativeInputTags | null, depthMode?: unknown }} CoupleNarrativeInput */

/** @typedef {import("./finalNarrativeEngine").NormalizedNarrativeTags} NormalizedNarrativeTags */

function isSteel(mode) {
  return normalizeDepthMode(mode) === "steel";
}

/** @param {boolean} steel @param {string} satin @param {string} st */
function pick(steel, satin, st) {
  return steel ? st : satin;
}

function isReactive(n3) {
  return n3 === "overwhelmed" || n3 === "confrontational";
}

function isWithdrawn(n3) {
  return n3 === "avoidant";
}

function innerIsCalm(n2) {
  return n2 === "calm";
}

function innerIsHighLoad(n2) {
  return n2 === "anxious" || n2 === "heavy";
}

function needsMoreSilent(n4) {
  return n4 === "unmet_needs" || n4 === "independence";
}

function needsMoreExplicit(n4) {
  return n4 === "reassurance";
}

function spaceWantsDistance(n5) {
  return n5 === "distance";
}

function spaceWantsStability(n5) {
  return n5 === "calm";
}

function pickCoreDynamic(a, b, steel) {
  const openGuard = a.n1 !== b.n1;
  const polarConflict =
    (isWithdrawn(a.n3) && isReactive(b.n3)) || (isWithdrawn(b.n3) && isReactive(a.n3));
  const bothReactive = isReactive(a.n3) && isReactive(b.n3);
  const innerSplit =
    (innerIsCalm(a.n2) && innerIsHighLoad(b.n2)) || (innerIsCalm(b.n2) && innerIsHighLoad(a.n2));
  const spaceSplit =
    (spaceWantsDistance(a.n5) && spaceWantsStability(b.n5)) ||
    (spaceWantsDistance(b.n5) && spaceWantsStability(a.n5));
  const needsSplit =
    (needsMoreSilent(a.n4) && needsMoreExplicit(b.n4)) ||
    (needsMoreSilent(b.n4) && needsMoreExplicit(a.n4));

  if (openGuard && polarConflict) {
    return pick(
      steel,
      "One of you moves closer, the other pulls away—and neither feels understood.",
      "Closer meets pullback. Neither reads the other’s move as care—that contrast is the pattern."
    );
  }
  if (polarConflict) {
    return pick(
      steel,
      "One of you escalates when things feel off; the other goes quiet—and both end up alone in the same room.",
      "One escalates; one goes quiet. Same room, no contact—you rerun it."
    );
  }
  if (openGuard) {
    return pick(
      steel,
      "One of you reaches faster than the other can open—and speed gets mistaken for safety, or slowness gets mistaken for rejection.",
      "Different opening speeds. Fast lands as pressure; slow lands as rejection—both misreads, both costly."
    );
  }
  if (bothReactive) {
    return pick(
      steel,
      "When pressure rises, you both react hard—and repair gets lost under the noise.",
      "Two big reactions, no repair lane—volume replaces change."
    );
  }
  if (spaceSplit) {
    return pick(
      steel,
      "One of you is organizing for closeness; the other is organizing for space—and neither names the trade as shared.",
      "One tracks closeness; one tracks space. The trade stays unnamed—so it keeps colliding."
    );
  }
  if (innerSplit) {
    return pick(
      steel,
      "One of you is trying to stay steady while the other is carrying a storm—and the gap between those speeds feels personal.",
      "Steady versus flooded. Each labels the other—too much or too cold—instead of the mismatch."
    );
  }
  if (needsSplit) {
    return pick(
      steel,
      "One of you is holding needs quietly; the other is looking for proof out loud—and you keep missing each other’s signals.",
      "Silent needs versus spoken reassurance—you signal on different channels."
    );
  }
  if (a.n5 === "chaos" || b.n5 === "chaos") {
    return pick(
      steel,
      "The relationship field feels noisy—hard to tell what’s happening now versus what old fear is driving.",
      "Chaos in the space between you—you fight the spike, not the script."
    );
  }
  if (a.n5 === "pressure" && b.n5 === "pressure") {
    return pick(
      steel,
      "You’re both under strain—and it’s easy to treat each other like the source instead of the pressure you’re carrying.",
      "Double strain—you aim it at each other instead of naming the load."
    );
  }
  return pick(
    steel,
    "You keep running the same move—and calling it communication—without naming what the move protects.",
    "Same move, new label: ‘we talked.’ The guardrail stays invisible."
  );
}

function whereYouAlign(a, b, steel) {
  const lines = [];

  if (a.n1 === b.n1) {
    lines.push(
      pick(
        steel,
        a.n1 === "open"
          ? "You both lean toward connection—you reach, bridge, and try to close gaps before they harden."
          : "You both move carefully—you protect first, then open, and you understand what hesitation costs.",
        a.n1 === "open"
          ? "You both reach first—connection is the default move."
          : "You both guard first—you know what opening costs."
      )
    );
  }

  if (a.n2 === b.n2) {
    if (a.n2 === "calm") {
      lines.push(
        pick(
          steel,
          "You share a pull toward steadiness—you’re not looking for chaos as proof of love.",
          "Shared priority: steadiness—not drama as proof."
        )
      );
    } else if (a.n2 === "anxious") {
      lines.push(
        pick(
          steel,
          "You both run hot in the mind—you scan, predict, and try to stay ahead of pain.",
          "Both minds run ahead—scanning for threat before it lands."
        )
      );
    } else {
      lines.push(
        pick(
          steel,
          "You both carry weight beneath the surface—that can create recognition, even when it’s heavy.",
          "Both carry weight under the surface—that’s real overlap."
        )
      );
    }
  } else if (innerIsHighLoad(a.n2) && innerIsHighLoad(b.n2)) {
    lines.push(
      pick(
        steel,
        "You’re both carrying more than you say out loud—that’s a strange kind of kinship.",
        "Both loaded, both quiet—same hiding shape."
      )
    );
  }

  if (a.n5 === b.n5 && (a.n5 === "calm" || a.n5 === "distance")) {
    lines.push(
      pick(
        steel,
        a.n5 === "calm"
          ? "You both want a calmer field between you—less spike, more room to breathe."
          : "You both sense distance as real—you’re not pretending the gap isn’t there.",
        a.n5 === "calm"
          ? "You both want less spike in the space between you."
          : "You agree the gap is there—no mutual myth of ‘fine.’"
      )
    );
  }

  if (lines.length === 0) {
    lines.push(
      pick(
        steel,
        "You both showed up to name something honest—that’s rarer than it sounds, and it’s why this still matters.",
        "You both showed up to name something—that baseline still counts."
      )
    );
  }

  if (lines.length < 2 && a.n4 === b.n4) {
    lines.push(
      pick(
        steel,
        a.n4 === "reassurance"
          ? "You’re both hungry for emotional safety—you want to feel chosen, not just tolerated."
          : a.n4 === "independence"
            ? "You both value self-sufficiency—and that can be respect, until it becomes a wall."
            : "You both have needs that don’t always get language—yet they still steer choices.",
        a.n4 === "reassurance"
          ? "Both want proof of safety—not tolerance."
          : a.n4 === "independence"
            ? "Both prize handling it alone—until alone becomes a wall."
            : "Both steer from needs you don’t always say out loud."
      )
    );
  }

  if (lines.length > 3) return lines.slice(0, 3).join("\n\n");
  return lines.join("\n\n");
}

function whereItBreaks(a, b, steel) {
  const parts = [];

  if ((isWithdrawn(a.n3) && isReactive(b.n3)) || (isWithdrawn(b.n3) && isReactive(a.n3))) {
    parts.push(
      pick(
        steel,
        "One of you reaches for clarity through conversation; the other withdraws when overwhelmed—what reads as care to one reads as pressure to the other.",
        "Talk versus shutdown. Care reads as pressure; distance reads as rejection—pure mismatch."
      )
    );
  } else if (isReactive(a.n3) && isReactive(b.n3)) {
    parts.push(
      pick(
        steel,
        "When emotions spike, you both respond fast—defensiveness shows up as volume, silence, or control, and the original hurt rarely gets addressed first.",
        "Double fire: volume or control. First hurt never gets the first word."
      )
    );
  } else if (a.n3 === "avoidant" && b.n3 === "avoidant") {
    parts.push(
      pick(
        steel,
        "You both dodge the hard moment—politeness replaces honesty, and resentment learns to speak in side-comments.",
        "Both dodge. Politeness fronts; resentment leaks sideways."
      )
    );
  }

  if (a.n1 !== b.n1) {
    parts.push(
      pick(
        steel,
        a.n1 === "open" || b.n1 === "open"
          ? "One of you opens quickly; the other needs time—and timing becomes the fight, not intention."
          : "You’re both guarded in different ways—so closeness turns into negotiation instead of ease.",
        a.n1 === "open" || b.n1 === "open"
          ? "Fast open versus slow open—you fight the pace, not the intent."
          : "Two guard styles—closeness turns into dealmaking."
      )
    );
  }

  if (
    (innerIsCalm(a.n2) && innerIsHighLoad(b.n2)) ||
    (innerIsCalm(b.n2) && innerIsHighLoad(a.n2))
  ) {
    parts.push(
      pick(
        steel,
        "One of you is trying to regulate the room; the other is flooded—and “calm down” lands like dismissal, not help.",
        "Regulator versus flooded. ‘Calm down’ lands as dismissal—predictable fracture."
      )
    );
  }

  if (
    (needsMoreSilent(a.n4) && needsMoreExplicit(b.n4)) ||
    (needsMoreSilent(b.n4) && needsMoreExplicit(a.n4))
  ) {
    parts.push(
      pick(
        steel,
        "One of you holds silent expectations; the other asks for reassurance out loud—misunderstanding stacks where naming would thin it.",
        "Silent expectations versus spoken reassurance—you stack noise between you."
      )
    );
  } else if (a.n4 !== b.n4 && parts.length < 2) {
    parts.push(
      pick(
        steel,
        "You want different kinds of care—what soothes one can feel like pressure or absence to the other.",
        "Different care dialects—soothe for one lands as pressure or absence for the other."
      )
    );
  }

  if (
    (spaceWantsDistance(a.n5) && spaceWantsStability(b.n5)) ||
    (spaceWantsDistance(b.n5) && spaceWantsStability(a.n5))
  ) {
    parts.push(
      pick(
        steel,
        "One of you is tracking distance; the other is tracking closeness—same relationship, different threat maps.",
        "Distance map versus closeness map—same data, opposite alarms."
      )
    );
  } else if (a.n5 === "chaos" || b.n5 === "chaos") {
    parts.push(
      pick(
        steel,
        "When the space between you feels chaotic, small moments get huge—and repair needs more precision than either of you has left.",
        "Chaos magnifies small moments—you’re out of precision for repair."
      )
    );
  }

  if (parts.length === 0) {
    parts.push(
      pick(
        steel,
        "The friction isn’t random—it’s where your conflict habits meet your unspoken needs, and neither side feels fully seen.",
        "Friction = habit meets unspoken need. Neither side gets read."
      )
    );
  }

  return parts.slice(0, 3).join("\n\n");
}

function theLoop(a, b, steel) {
  if ((isWithdrawn(a.n3) && isReactive(b.n3)) || (isWithdrawn(b.n3) && isReactive(a.n3))) {
    return pick(
      steel,
      "The more one pushes, the more the other pulls away—then the pull becomes proof, and the push becomes panic.\n\nYou rehearse the same frustration until it feels like truth about who you are together.",
      "Push meets pull. Pull proves ‘they don’t care’; push proves ‘they won’t stay.’ You rehearse it until it feels like identity."
    );
  }
  if (a.n1 !== b.n1 && (isWithdrawn(a.n3) || isWithdrawn(b.n3))) {
    return pick(
      steel,
      "One of you steps forward; the other steps back—then forward feels needy, and back feels cold.\n\nThe loop tightens because neither move gets translated without blame.",
      "Step in, step back. Needy versus cold—labels replace curiosity. Loop tightens."
    );
  }
  if (a.n5 === "pressure" || b.n5 === "pressure") {
    return pick(
      steel,
      "Pressure builds; you both tighten.\n\nYou stop risking softness, call it maturity, and watch distance grow while you insist you’re fine.",
      "Pressure up, softness down. You call it maturity; distance grows anyway."
    );
  }
  if (a.n3 === "avoidant" && b.n3 === "avoidant") {
    return pick(
      steel,
      "You both wait for the other to go first.\n\nSilence feels safer than risk—until silence becomes its own kind of distance.",
      "Both wait. Silence wins—then silence becomes distance."
    );
  }
  if (isReactive(a.n3) && isReactive(b.n3)) {
    return pick(
      steel,
      "You spike, pull back, apologize, repeat.\n\nThe cycle looks like passion from the outside; from the inside it feels like you can’t stop hurting the same spot.",
      "Spike, retreat, sorry, repeat. Same wound, new week."
    );
  }
  return pick(
    steel,
    "You keep solving the moment—and skipping the pattern.\n\nSo the next fight arrives wearing a new topic and the same old guardrails.",
    "You fix the moment; the pattern ships untouched. Next fight, new title, same guardrail."
  );
}

function theFuture(a, b, steel) {
  if (spaceWantsDistance(a.n5) && spaceWantsDistance(b.n5)) {
    return pick(
      steel,
      "If nothing shifts, distance becomes the default—and you’ll call it peace while something important goes untended.",
      "Default becomes distance. You’ll call it peace; the cost stays unspoken."
    );
  }
  if (a.n5 === "calm" && b.n5 === "calm" && (isWithdrawn(a.n3) || isWithdrawn(b.n3))) {
    return pick(
      steel,
      "If nothing shifts, calm turns into avoidance—things look steady while what’s unsaid quietly steers you.",
      "Calm becomes cover. Steady surface; silent steering below."
    );
  }
  if (a.n5 === "chaos" || b.n5 === "chaos") {
    return pick(
      steel,
      "If nothing shifts, confusion becomes the third partner—you react to noise more than to each other.",
      "Noise becomes the third partner—you react to it, not each other."
    );
  }
  if (a.n5 === "pressure" && b.n5 === "pressure") {
    return pick(
      steel,
      "If nothing shifts, tension becomes your background music—and tenderness feels risky, not natural.",
      "Tension becomes wallpaper. Tenderness feels dangerous."
    );
  }
  return pick(
    steel,
    "If nothing shifts, this turns into distance disguised as peace—you both keep trying, still missing the same thread.",
    "Distance dressed as peace. You keep trying; you keep missing the same thread."
  );
}

function theShift(a, b, steel) {
  if ((isWithdrawn(a.n3) && isReactive(b.n3)) || (isWithdrawn(b.n3) && isReactive(a.n3))) {
    return pick(
      steel,
      "You don’t need to agree—you need to recognize how your moves land on each other’s nervous system.",
      "Agreement isn’t the lever—naming how your moves land is."
    );
  }
  if (a.n1 !== b.n1) {
    return pick(
      steel,
      "You don’t need matching speeds—you need one honest sentence about what opening actually requires from each of you.",
      "Skip matching speeds—say what opening actually requires from each of you."
    );
  }
  if (
    (needsMoreSilent(a.n4) && needsMoreExplicit(b.n4)) ||
    (needsMoreSilent(b.n4) && needsMoreExplicit(a.n4))
  ) {
    return pick(
      steel,
      "You don’t need fewer needs—you need clearer language before resentment picks the vocabulary for you.",
      "Same needs, sharper words—or resentment writes the script."
    );
  }
  return pick(
    steel,
    "You don’t need to fix each other—you need to stop mistaking protection for emotional safety.",
    "Stop mistaking protection for safety—that’s the shift."
  );
}

function theQuestion(a, b, steel) {
  if (isReactive(a.n3) || isReactive(b.n3)) {
    return pick(
      steel,
      "Are you reacting to each other—or to what you carry from before?",
      "Is this about them—or about what you brought in?"
    );
  }
  if (a.n4 === "unmet_needs" || b.n4 === "unmet_needs") {
    return pick(
      steel,
      "What are you each expecting that you still haven’t said in plain words?",
      "What expectation is still unspoken—in plain language?"
    );
  }
  if (spaceWantsDistance(a.n5) || spaceWantsDistance(b.n5)) {
    return pick(
      steel,
      "What would change if you stopped treating distance like the only safe outcome?",
      "What if distance weren’t the only safe outcome—what would you try?"
    );
  }
  if (a.n5 === "chaos" || b.n5 === "chaos") {
    return pick(
      steel,
      "When it gets loud, what are you actually afraid will happen if you slow down together?",
      "When it’s loud, what are you afraid slow-down would prove?"
    );
  }
  return pick(
    steel,
    "What would you stop defending for one week if you trusted you wouldn’t lose yourself?",
    "What defense would you drop for one week without losing yourself?"
  );
}

/**
 * @param {CoupleNarrativeInput} input
 * @returns {{
 *   coreDynamic: string,
 *   whereYouAlign: string,
 *   whereItBreaks: string,
 *   theLoop: string,
 *   future: string,
 *   theShift: string,
 *   theQuestion: string,
 *   depthMode: "satin" | "steel",
 *   tags: { a: NormalizedNarrativeTags, b: NormalizedNarrativeTags },
 * }}
 */
export function buildCoupleNarrative(input) {
  const a = normalizeNarrativeTags(input?.personA ?? {});
  const b = normalizeNarrativeTags(input?.personB ?? {});
  const steel = isSteel(input?.depthMode);

  return {
    coreDynamic: pickCoreDynamic(a, b, steel),
    whereYouAlign: whereYouAlign(a, b, steel),
    whereItBreaks: whereItBreaks(a, b, steel),
    theLoop: theLoop(a, b, steel),
    future: theFuture(a, b, steel),
    theShift: theShift(a, b, steel),
    theQuestion: theQuestion(a, b, steel),
    depthMode: steel ? "steel" : "satin",
    tags: { a, b },
  };
}

/**
 * @param {Record<number, unknown> | null | undefined} partnerA
 * @param {Record<number, unknown> | null | undefined} partnerB
 * @param {unknown} [depthMode]
 */
export function buildCoupleNarrativeFromPartners(partnerA, partnerB, depthMode) {
  return buildCoupleNarrative({
    personA: extractNarrativeTagsFromSelections(partnerA),
    personB: extractNarrativeTagsFromSelections(partnerB),
    depthMode,
  });
}
