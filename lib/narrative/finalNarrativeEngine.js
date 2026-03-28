/**
 * Final Narrative Engine — deterministic profile from round tags (no LLM).
 * Accepts Luma ROUND_TAGS + round5 image tags, maps to narrative vocabulary, composes one voice.
 */

/** @typedef {{ round1Tag?: string | null, round2Tag?: string | null, round3Tag?: string | null, round4Tag?: string | null, round5Tag?: string | null }} NarrativeInputTags */

/** @typedef {{ n1: string, n2: string, n3: string, n4: string, n5: string }} NormalizedNarrativeTags */

const N1 = new Set(["guarded", "open"]);
const N2 = new Set(["calm", "anxious", "heavy"]);
const N3 = new Set(["overwhelmed", "avoidant", "confrontational"]);
const N4 = new Set(["unmet_needs", "reassurance", "independence"]);
const N5 = new Set(["distance", "calm", "chaos", "pressure"]);

/** Luma round 1 → narrative opening */
const LUMA_R1 = {
  calm: "open",
  chaos: "guarded",
  connection: "open",
  isolation: "guarded",
};

/** Luma round 2 → inner register */
const LUMA_R2 = {
  pressure: "anxious",
  confusion: "anxious",
  overwhelm: "heavy",
  emptiness: "heavy",
};

/** Luma round 3 → conflict stance */
const LUMA_R3 = {
  lost: "overwhelmed",
  stuck: "avoidant",
  clarity: "confrontational",
  balanced: "avoidant",
};

/** Luma round 4 → need layer */
const LUMA_R4 = {
  growth: "independence",
  peace: "reassurance",
  change: "unmet_needs",
  understanding: "reassurance",
};

/** Luma round 5 (space-between cards + psychological tags) → relational field */
const LUMA_R5 = {
  guarded_distance: "distance",
  calm_connection: "calm",
  emotional_overload: "chaos",
  pressure_unmet_needs: "pressure",
  emotional_distance: "distance",
  avoidance: "distance",
  silence: "distance",
  disconnection: "distance",
  comfort: "calm",
  shared_peace: "calm",
  stability: "calm",
  overwhelm: "chaos",
  mental_noise: "chaos",
  inner_conflict: "chaos",
  chaos: "chaos",
  breaking_point: "pressure",
  tension: "pressure",
  fragility: "pressure",
  emotional_strain: "pressure",
};

function norm(tag) {
  if (typeof tag !== "string") return null;
  const t = tag.trim().toLowerCase();
  return t || null;
}

function tagFromRound(selections, roundNum) {
  const block = selections?.[roundNum];
  if (!block || typeof block !== "object") return null;
  if (roundNum === 5 && Array.isArray(block.psychologicalTags) && block.psychologicalTags.length) {
    return norm(block.psychologicalTags[0]);
  }
  return norm(block.tag);
}

/**
 * Map a single round tag from Luma or narrative vocabulary to narrative bucket.
 * @param {1|2|3|4|5} roundNum
 * @param {string | null | undefined} tag
 * @returns {string | null}
 */
export function mapRoundTagToNarrative(roundNum, tag) {
  const t = norm(tag);
  if (!t) return null;
  if (roundNum === 1) {
    if (N1.has(t)) return t;
    return LUMA_R1[t] ?? null;
  }
  if (roundNum === 2) {
    if (N2.has(t)) return t;
    return LUMA_R2[t] ?? null;
  }
  if (roundNum === 3) {
    if (N3.has(t)) return t;
    return LUMA_R3[t] ?? null;
  }
  if (roundNum === 4) {
    if (N4.has(t)) return t;
    return LUMA_R4[t] ?? null;
  }
  if (roundNum === 5) {
    if (N5.has(t)) return t;
    return LUMA_R5[t] ?? null;
  }
  return null;
}

/**
 * @param {Record<number, unknown> | null | undefined} selections
 * @returns {NarrativeInputTags}
 */
export function extractNarrativeTagsFromSelections(selections) {
  return {
    round1Tag: tagFromRound(selections, 1),
    round2Tag: tagFromRound(selections, 2),
    round3Tag: tagFromRound(selections, 3),
    round4Tag: tagFromRound(selections, 4),
    round5Tag: tagFromRound(selections, 5),
  };
}

/**
 * @param {NarrativeInputTags} raw
 * @returns {NormalizedNarrativeTags}
 */
export function normalizeNarrativeTags(raw) {
  const n1 = mapRoundTagToNarrative(1, raw?.round1Tag) ?? "guarded";
  const n2 = mapRoundTagToNarrative(2, raw?.round2Tag) ?? "anxious";
  const n3 = mapRoundTagToNarrative(3, raw?.round3Tag) ?? "avoidant";
  const n4 = mapRoundTagToNarrative(4, raw?.round4Tag) ?? "unmet_needs";
  const n5 = mapRoundTagToNarrative(5, raw?.round5Tag) ?? "distance";
  return { n1, n2, n3, n4, n5 };
}

function pickBrutalTruth(n) {
  const key = `${n.n2}|${n.n5}`;
  const table = {
    "anxious|distance":
      "You protect yourself so tightly that almost no one gets a clean shot at the real you.",
    "anxious|calm":
      "You crave steadiness, but you keep scanning for the moment it falls apart.",
    "anxious|chaos":
      "You brace for the next swing so hard that you rarely feel steady even when things are fine.",
    "anxious|pressure":
      "You run a quiet tally of what you owe and what you’re not getting—and it eats you alive.",
    "heavy|distance":
      "You carry too much alone, and distance starts to feel like the only honest shape your life can take.",
    "heavy|calm":
      "You want peace, but part of you doesn’t believe you’re allowed to rest into it.",
    "heavy|chaos":
      "The weight you hold and the noise around you keep feeding each other—and you’re stuck in the middle.",
    "heavy|pressure":
      "You’re stretched past what you can name, and you still act like that’s normal.",
    "calm|distance":
      "You keep things smooth on the surface while the gap between you and someone who matters quietly widens.",
    "calm|calm":
      "You prize calm so much you sometimes mistake silence for emotional safety.",
    "calm|chaos":
      "You reach for order, but closeness keeps pulling you into what feels messy and unsafe.",
    "calm|pressure":
      "You try to hold the line, but the pressure doesn’t disappear—it just goes underground.",
  };
  if (table[key]) return table[key];
  if (n.n2 === "anxious")
    return "You read every interaction for threat before you read it for care.";
  if (n.n2 === "heavy")
    return "You act functional while something heavy sits on your chest and never fully moves.";
  if (n.n5 === "distance")
    return "You let people be near you without letting them fully land.";
  if (n.n5 === "chaos")
    return "You keep reacting to intensity instead of naming what it keeps costing you.";
  if (n.n5 === "pressure")
    return "You swallow what you need until resentment shows up dressed as fatigue.";
  return "You manage the outside so carefully that the inside barely gets a hearing.";
}

function openingLine(n1) {
  if (n1 === "open") {
    return "You move toward people quickly—you bridge gaps before awkwardness can settle.";
  }
  return "You hesitate before you open; you test the air before you show what’s underneath.";
}

function innerLine(n2) {
  if (n2 === "calm") {
    return "Underneath, you want stability more than drama—you’re trying to keep your inner world level.";
  }
  if (n2 === "heavy") {
    return "Underneath, you’re carrying emotional weight you don’t always know how to put down.";
  }
  return "Underneath, you overthink and run scenarios—you’re trying to stay ahead of pain that hasn’t happened yet.";
}

function patternBridge(n1, n2) {
  if (n1 === "open" && n2 === "anxious") {
    return "In relationships that shows up as warmth up front and vigilance right behind it—you connect, then watch.";
  }
  if (n1 === "open" && n2 === "heavy") {
    return "In relationships that shows up as you showing up for others while quietly sinking under what you don’t say.";
  }
  if (n1 === "open" && n2 === "calm") {
    return "In relationships that shows up as you offering ease while quietly needing the same steadiness back.";
  }
  if (n1 === "guarded" && n2 === "anxious") {
    return "In relationships that shows up as slow trust, quick defensiveness, and a habit of reading distance as rejection.";
  }
  if (n1 === "guarded" && n2 === "heavy") {
    return "In relationships that shows up as you holding back and carrying too much at the same time—close, but not quite exposed.";
  }
  if (n1 === "guarded" && n2 === "calm") {
    return "In relationships that shows up as careful pacing—you let closeness grow, but you keep one hand on the door.";
  }
  return "In relationships that shows up as you managing how much of you is visible while still wanting to be chosen.";
}

function tensionBlock(n3, n4) {
  const conflict =
    n3 === "overwhelmed"
      ? "When conflict hits, you get flooded—you feel first, explain later, and sometimes regret the shape it took."
      : n3 === "confrontational"
        ? "When conflict hits, you push—you name what’s wrong and you don’t let it slide, even when it costs softness."
        : "When conflict hits, you withdraw—you go quiet, busy, or distant, and hope the tension dissolves without a full conversation.";

  const need =
    n4 === "unmet_needs"
      ? "Meanwhile you’re holding silent expectations—needs you haven’t fully owned out loud."
      : n4 === "reassurance"
        ? "Meanwhile you’re hungry for reassurance—you want proof you’re safe before you risk more vulnerability."
        : "Meanwhile you protect independence—you handle things alone and hide how much you actually need backup.";

  const friction =
    n3 === "avoidant" && n4 === "unmet_needs"
      ? "The friction is simple: you pull back while your unspoken needs still want to be met."
      : n3 === "overwhelmed" && n4 === "reassurance"
        ? "The friction is you flooding while also needing steady validation—hard for you, confusing for them."
        : n3 === "confrontational" && n4 === "independence"
          ? "The friction is you pushing for truth while also refusing to look needy—they get heat, not the full picture."
          : "The friction lives where your conflict style meets what you won’t quite ask for.";

  return `${conflict} ${need} ${friction}`;
}

function costLine(n5, n3) {
  if (n5 === "distance") {
    return "Over time, this creates distance—even when you’re both trying—because protection keeps winning over repair.";
  }
  if (n5 === "chaos") {
    return "Over time, this breeds confusion and fatigue—you keep circling the same ruptures without a clear center.";
  }
  if (n5 === "pressure") {
    return "Over time, this turns into tension that won’t name itself—resentment dressed as patience.";
  }
  if (n5 === "calm") {
    return n3 === "avoidant"
      ? "Over time, calm becomes a cover—things look fine while what’s unsaid stacks up."
      : "Over time, even steady connection can feel fragile if you never risk naming what you actually need.";
  }
  return "Over time, the gap between what you feel and what you show becomes the main story.";
}

function shiftLine(n3, n4) {
  if (n3 === "overwhelmed") {
    return "You don’t need to react less—you need to understand what you’re reacting to before you commit to the shape of it.";
  }
  if (n3 === "avoidant") {
    return "You don’t need to force closeness—you need to stop treating avoidance like it’s the same thing as emotional safety.";
  }
  if (n3 === "confrontational") {
    return "You don’t need to soften into nothing—you need to pair honesty with curiosity about your own defensiveness.";
  }
  if (n4 === "unmet_needs") {
    return "The shift isn’t becoming needier—it’s naming one real need without apologizing for having it.";
  }
  if (n4 === "reassurance") {
    return "The shift isn’t demanding proof—it’s risking a sentence that tells them what steadiness actually means to you.";
  }
  return "The shift is letting one true need be visible before you decide you have to handle everything alone.";
}

function dangerousQuestion(n4, n5, n1) {
  const key = `${n4}|${n5}`;
  const dq = {
    "unmet_needs|distance": "What are you not saying that’s slowly creating distance?",
    "unmet_needs|pressure": "Which expectation are you carrying that you’ve never put into plain words?",
    "unmet_needs|chaos": "What do you need them to understand before the next fight repeats the same shape?",
    "reassurance|distance": "What proof are you waiting for before you’ll believe you’re allowed to need them?",
    "reassurance|chaos": "When things get loud, what are you afraid will happen if you ask to slow down together?",
    "reassurance|calm": "Are you choosing peace—or avoiding the conversation that would actually steady you?",
    "independence|distance": "Where are you ‘fine’ in public and alone in private—and who pays for that split?",
    "independence|pressure": "What would break if you admitted you can’t keep holding this alone?",
    "independence|chaos": "What part of you is tired of being the one who has it together?",
  };
  if (dq[key]) return dq[key];
  if (n5 === "distance") return "What are you protecting by keeping this much space between you?";
  if (n5 === "pressure") return "What are you swallowing that’s turning into quiet resentment?";
  if (n4 === "unmet_needs") return "What do you need that you keep editing so it sounds smaller than it is?";
  if (n4 === "reassurance") return "What would you ask for if you weren’t afraid of sounding too much?";
  if (n1 === "guarded") return "What would change if you stopped rehearsing rejection before you risk being known?";
  return "What truth about you would cost the least to tell and save you the most if you finally said it?";
}

/**
 * Build the full narrative profile from narrative or Luma tags.
 * @param {NarrativeInputTags} input
 * @returns {{
 *   brutalTruth: string,
 *   yourPattern: string,
 *   theTension: string,
 *   theCost: string,
 *   theShift: string,
 *   dangerousQuestion: string,
 *   tags: NormalizedNarrativeTags,
 * }}
 */
export function buildFinalNarrative(input) {
  const tags = normalizeNarrativeTags(input ?? {});
  const n = tags;

  const yourPattern = [openingLine(n.n1), innerLine(n.n2), patternBridge(n.n1, n.n2)].join("\n\n");

  return {
    brutalTruth: pickBrutalTruth(n),
    yourPattern,
    theTension: tensionBlock(n.n3, n.n4),
    theCost: costLine(n.n5, n.n3),
    theShift: shiftLine(n.n3, n.n4),
    dangerousQuestion: dangerousQuestion(n.n4, n.n5, n.n1),
    tags: n,
  };
}

/**
 * @param {Record<number, unknown> | null | undefined} selections
 */
export function buildFinalNarrativeFromSelections(selections) {
  return buildFinalNarrative(extractNarrativeTagsFromSelections(selections));
}
