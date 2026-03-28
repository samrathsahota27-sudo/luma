/**
 * One-line contextual hint for the Rewrite This Path screen (client-side signals only).
 */

import { extractNarrativeTagsFromSelections, normalizeNarrativeTags } from "./finalNarrativeEngine";

const SUFFIX = " Let's change that pattern.";

function withSuffix(lead) {
  const t = typeof lead === "string" ? lead.trim() : "";
  if (!t) return null;
  return `${t.replace(/\.$/, "")}.${SUFFIX}`;
}

/**
 * @param {import("./finalNarrativeEngine").NormalizedNarrativeTags} n
 */
function soloLead(n) {
  if (n.n3 === "avoidant" && (n.n5 === "distance" || n.n2 === "heavy")) {
    return "You tend to withdraw under pressure";
  }
  if (n.n3 === "avoidant") {
    return "You tend to go quiet instead of risking a hard conversation";
  }
  if (n.n3 === "overwhelmed") {
    return "You tend to get flooded before you can think straight";
  }
  if (n.n3 === "confrontational") {
    return "You tend to push for resolution before the room feels safe";
  }
  if (n.n5 === "chaos") {
    return "Things spike fast—and repair rarely keeps pace";
  }
  if (n.n5 === "pressure" && n.n4 === "unmet_needs") {
    return "You carry strain while needs stay partly unnamed";
  }
  if (n.n2 === "anxious") {
    return "You tend to brace and overthink before anything even happens";
  }
  if (n.n2 === "heavy") {
    return "You hold more weight than you show";
  }
  if (n.n1 === "guarded") {
    return "You protect yourself tightly before anyone gets close";
  }
  if (n.n4 === "reassurance") {
    return "You scan for proof you’re safe before you’ll lean in";
  }
  if (n.n4 === "independence") {
    return "You handle it alone until distance becomes a habit";
  }
  return "The habits you reach for under stress steer more than you think";
}

function isReactive(n3) {
  return n3 === "overwhelmed" || n3 === "confrontational";
}

function isWithdrawn(n3) {
  return n3 === "avoidant";
}

/**
 * @param {import("./finalNarrativeEngine").NormalizedNarrativeTags} a
 * @param {import("./finalNarrativeEngine").NormalizedNarrativeTags} b
 */
function coupleLead(a, b) {
  const avoidA = isWithdrawn(a.n3);
  const avoidB = isWithdrawn(b.n3);
  const reactA = isReactive(a.n3);
  const reactB = isReactive(b.n3);

  if ((avoidA && reactB) || (avoidB && reactA)) {
    return "You keep landing in push–pull—one reaches, the other shuts down";
  }
  if (avoidA && avoidB) {
    return "You both dodge the tense moment—and what’s unsaid piles up";
  }
  if (reactA && reactB) {
    return "You both react hard when you’re scared—and repair keeps getting skipped";
  }
  if (a.n5 === "distance" && b.n5 === "distance") {
    return "Distance has become a familiar shape between you";
  }
  if (a.n5 === "chaos" || b.n5 === "chaos") {
    return "Things go loud and messy before you find the real issue";
  }
  const pressure = a.n5 === "pressure" || b.n5 === "pressure";
  const unmet = a.n4 === "unmet_needs" || b.n4 === "unmet_needs";
  if (pressure && unmet) {
    return "You’re stretched thin while needs stay partly off the table";
  }
  if (a.n5 === "calm" && b.n5 === "calm" && (avoidA || avoidB)) {
    return "Calm on the surface is hiding what neither of you will name yet";
  }
  return "The same loop costs you both more than you admit";
}

/**
 * @param {Record<number, unknown> | null | undefined} selections
 * @returns {string | null}
 */
export function buildSoloRewritePathHint(selections) {
  if (!selections || typeof selections !== "object") return null;
  const raw = extractNarrativeTagsFromSelections(selections);
  const n = normalizeNarrativeTags(raw);
  return withSuffix(soloLead(n));
}

/**
 * @param {Record<number, unknown> | null | undefined} partnerA
 * @param {Record<number, unknown> | null | undefined} partnerB
 * @returns {string | null}
 */
export function buildCoupleRewritePathHint(partnerA, partnerB) {
  if (!partnerA || !partnerB || typeof partnerA !== "object" || typeof partnerB !== "object") {
    return null;
  }
  const a = normalizeNarrativeTags(extractNarrativeTagsFromSelections(partnerA));
  const b = normalizeNarrativeTags(extractNarrativeTagsFromSelections(partnerB));
  return withSuffix(coupleLead(a, b));
}

const COUPLE_RESULT_KEY = "luma_couple_result";
const PROFILE_KEY = "luma_profile";

/**
 * Read browser storage and return a full hint sentence, or null if nothing usable.
 * Safe to call only on the client after mount.
 */
export function readRewritePathHintFromBrowser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(COUPLE_RESULT_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.partnerA && data?.partnerB) {
        const hint = buildCoupleRewritePathHint(data.partnerA, data.partnerB);
        if (hint) return hint;
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    const user = p?.user;
    if (user && typeof user === "object") {
      return buildSoloRewritePathHint(user);
    }
  } catch {
    /* ignore */
  }

  return null;
}

/** When no stored pattern is available. */
export const REWRITE_PATH_HINT_FALLBACK =
  "When stress hits, old habits run the show. Let's change that pattern.";
