/** Prior couple result (compact) for “since last time” comparison. */
export const COUPLE_PRIOR_SNAPSHOT_KEY = "luma_couple_prior_result_snapshot";

/**
 * @param {string | null | undefined} s
 */
function normTag(s) {
  return (typeof s === "string" ? s : "")
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {Record<string, unknown> | null | undefined} data
 */
export function coupleResultFingerprint(data) {
  if (!data || typeof data !== "object") return "0";
  const tag = normTag(data.emotionalTag);
  const brutal = typeof data.brutalTruth === "string" ? data.brutalTruth.slice(0, 140) : "";
  const body = typeof data.result === "string" ? data.result.slice(0, 240) : "";
  const raw = `${tag}|${brutal}|${body}`;
  let h = 5381;
  for (let i = 0; i < raw.length; i++) {
    h = (h * 33) ^ raw.charCodeAt(i);
  }
  return `fp_${(h >>> 0).toString(36)}`;
}

/**
 * @param {Record<string, unknown> | null | undefined} data
 */
export function buildCoupleResultSnapshot(data) {
  const result = typeof data?.result === "string" ? data.result : "";
  const excerpt = result.slice(0, 520);
  const friction = data?.conflictFrictionPoints;
  const frictionCount = Array.isArray(friction) ? friction.length : 0;
  return {
    savedAt: Date.now(),
    emotionalTag: typeof data?.emotionalTag === "string" ? data.emotionalTag.trim() || null : null,
    brutalTruth: typeof data?.brutalTruth === "string" ? data.brutalTruth.trim() || null : null,
    resultExcerpt: excerpt,
    mapReadBetween:
      typeof data?.mapReadBetween === "string" ? data.mapReadBetween.slice(0, 320) : "",
    calendarState:
      typeof data?.calendarState === "string" ? data.calendarState.trim().toLowerCase() : null,
    frictionCount,
    fingerprint: coupleResultFingerprint(data),
  };
}

export function readCouplePriorSnapshot() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COUPLE_PRIOR_SNAPSHOT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || typeof o !== "object") return null;
    return o;
  } catch {
    return null;
  }
}

/**
 * @param {Record<string, unknown>} snapshot
 */
export function writeCouplePriorSnapshot(snapshot) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COUPLE_PRIOR_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore */
  }
}

/**
 * @param {Record<string, unknown> | null} prior
 * @param {string} currentFingerprint
 */
export function shouldCompareCoupleResults(prior, currentFingerprint) {
  if (!prior || typeof prior !== "object") return false;
  const pf = typeof prior.fingerprint === "string" ? prior.fingerprint : "";
  if (!pf || !currentFingerprint) return false;
  return pf !== currentFingerprint;
}

/**
 * Client-side fallback when API is unavailable.
 * @param {Record<string, unknown>} prior
 * @param {Record<string, unknown>} current
 */
export function heuristicCoupleShiftInsight(prior, current) {
  const pt = normTag(prior.emotionalTag);
  const ct = normTag(current.emotionalTag);
  if (pt && ct && pt === ct) {
    return "This pattern is repeating.";
  }

  const pack = (s) =>
    normTag(
      `${typeof s.brutalTruth === "string" ? s.brutalTruth : ""} ${typeof s.resultExcerpt === "string" ? s.resultExcerpt : ""}`
    );
  const reactive =
    /\b(reactive|reactivity|defensive|defensiveness|snap|volatile|heated|lash|sharp|attack|erupt)\b/;
  const distance =
    /\b(distance|distant|cold|withdraw|withdrawn|apart|wall|shutdown|shut down|silent|disengage)\b/;
  const pr = reactive.test(pack(prior));
  const cr = reactive.test(pack(current));
  const pd = distance.test(pack(prior));
  const cd = distance.test(pack(current));

  if (cr && !pr) return "You're more reactive together than before.";
  if (pr && !cr) return "Things look a little less sharp than last time.";
  if (cd && !pd) return "There's more distance now.";
  if (pd && !cd) return "Some of the distance from before seems to have softened.";

  const pcs = prior.calendarState;
  const ccs = current.calendarState;
  if (pcs && ccs && pcs !== ccs) {
    if (ccs === "distance" && pcs !== "distance") return "There's more distance now.";
    if (ccs === "friction" && (pcs === "calm" || pcs === "clarity"))
      return "Friction’s showing up more than it did last time.";
    if (ccs === "calm" && pcs === "friction") return "Things read calmer between you than last time.";
  }

  const words = (t) => {
    const set = new Set();
    for (const w of normTag(t).split(/\s+/)) {
      if (w.length > 4) set.add(w);
    }
    return set;
  };
  const wa = words(`${prior.resultExcerpt || ""} ${prior.brutalTruth || ""}`);
  const wb = words(`${current.resultExcerpt || ""} ${current.brutalTruth || ""}`);
  let inter = 0;
  for (const w of wa) {
    if (wb.has(w)) inter++;
  }
  const union = new Set([...wa, ...wb]).size;
  const j = union > 0 ? inter / union : 0;
  if (j > 0.32 && wa.size > 6 && wb.size > 6) {
    return "This still rhymes with last time—with a few new notes.";
  }
  if (j < 0.14 && wa.size > 8 && wb.size > 8) {
    return "This pass reads quite different from your last one.";
  }

  return "Something shifted since your last reflection—worth naming what feels new.";
}
