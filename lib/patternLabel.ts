function norm(x: unknown) {
  return typeof x === "string" ? x.trim().toLowerCase() : "";
}

function hasAny(signals: string[], needles: string[]) {
  return needles.some((n) => signals.some((s) => s.includes(n)));
}

function countHits(signals: string[], needles: string[]) {
  let c = 0;
  for (const n of needles) if (signals.some((s) => s.includes(n))) c += 1;
  return c;
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickByHash<T>(items: T[], h: number) {
  if (!items.length) return null;
  return items[h % items.length];
}

function words(s: string) {
  return String(s || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function clampWords(s: string, max: number) {
  const w = words(s);
  if (w.length <= max) return w.join(" ");
  return w.slice(0, max).join(" ");
}

function cleanPatternLabel(label: string) {
  // 2–4 words max, title case-ish already in templates
  const trimmed = String(label || "").trim().replace(/\s+/g, " ");
  return clampWords(trimmed, 4);
}

const BANNED_DEFAULTS = new Set([
  "quiet withdrawal",
  "emotional distance",
  "inner conflict",
]);

export function derivePatternLabel(input: {
  signals: string[];
  selections?: any;
}): string {
  const signals = Array.isArray(input.signals) ? input.signals.map(norm).filter(Boolean) : [];
  const h = hashString(signals.join("|"));

  // Axes from signals (image tags + chosen tags + text)
  const away = countHits(signals, ["avoid", "withdraw", "pull back", "silence", "distance", "disconnect", "numb", "shutdown"]);
  const toward = countHits(signals, ["close", "closeness", "connection", "reach", "pursue", "support", "warm", "openness", "together"]);
  const stuck = countHits(signals, ["overthink", "ruminate", "loop", "replay", "what if", "uncertain", "confus", "clarity"]);
  const intensity = countHits(signals, ["tension", "pressure", "fight", "argument", "hot", "cold", "spike", "swing", "push pull"]);
  const control = countHits(signals, ["control", "guard", "careful", "managed", "edited", "measured"]);
  const calm = countHits(signals, ["calm", "peace", "still", "grounded", "steady", "quiet"]);
  const desire = countHits(signals, ["want", "desire", "need", "closer", "miss", "more"]);

  // Direction buckets
  const netToward = toward + desire - away;
  const netAway = away - toward;

  // Strong, specific mappings (only when clearly supported)
  if (away >= 3 && calm >= 1 && intensity === 0) {
    const options = ["Held Back Closeness", "Quiet Guardrails", "Careful Distance"];
    return cleanPatternLabel(pickByHash(options, h) || "Held Back Closeness");
  }

  if (intensity >= 2 && hasAny(signals, ["push pull", "hot", "cold"])) {
    const options = ["Unstable Pull", "Hot‑Cold Swing", "Pressure Spiral"];
    return cleanPatternLabel(pickByHash(options, h) || "Unstable Pull");
  }

  if (stuck >= 3 && intensity <= 1) {
    const options = ["Looping Mind", "Mental Loop", "Restless Thinking"];
    return cleanPatternLabel(pickByHash(options, h) || "Looping Mind");
  }

  if (control >= 2 && (netToward >= 1 || toward >= 1) && away >= 1) {
    const options = ["Care With Caution", "Guarded Closeness", "Measured Reach"];
    return cleanPatternLabel(pickByHash(options, h) || "Care With Caution");
  }

  if (toward >= 3 && calm >= 1 && intensity === 0 && away === 0) {
    const options = ["Steady Presence", "Open Steadiness", "Warm Clarity"];
    return cleanPatternLabel(pickByHash(options, h) || "Steady Presence");
  }

  // General synthesis (still deterministic, avoids defaults)
  const candidates: string[] = [];
  if (netToward >= 2 && control >= 1) candidates.push("Measured Closeness");
  if (netToward >= 2 && stuck >= 1) candidates.push("Hesitant Reach");
  if (netAway >= 2 && stuck >= 1) candidates.push("Distant Overthinking");
  if (netAway >= 2 && control >= 1) candidates.push("Guarded Retreat");
  if (intensity >= 2) candidates.push("Reactive Loop");
  if (stuck >= 2) candidates.push("Searching Mind");
  if (away >= 2) candidates.push("Pulled Back");
  if (toward >= 2) candidates.push("Seeking Closeness");
  if (calm >= 2) candidates.push("Quiet Steadiness");

  let label = cleanPatternLabel(pickByHash(candidates.filter(Boolean), h) || "Careful Pattern");

  // Hard anti-default: never output banned defaults unless overwhelmingly present.
  const lower = label.toLowerCase();
  if (BANNED_DEFAULTS.has(lower) && away < 5) {
    label = "Care With Caution";
  }

  return label;
}

