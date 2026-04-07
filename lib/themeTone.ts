type MicroPair = { title: string; subtitle: string };

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

function clampWords(s: string, maxWords: number) {
  const w = String(s || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (w.length <= maxWords) return w.join(" ");
  return w.slice(0, maxWords).join(" ");
}

function cleanMicro(pair: MicroPair): MicroPair {
  const title = clampWords(pair.title, 2) || "Clarity";
  const subtitle = clampWords(pair.subtitle, 4) || "finding what matters";
  return { title, subtitle };
}

function ensureContrast(theme: MicroPair, tone: MicroPair): { theme: MicroPair; tone: MicroPair } {
  const tA = norm(theme.title);
  const tB = norm(tone.title);
  if (tA && tB && tA === tB) {
    // minimal deterministic nudge
    const fallbackTone: MicroPair = { title: "Careful", subtitle: "measuring the risk" };
    return { theme, tone: cleanMicro(fallbackTone) };
  }
  // Avoid obvious repetition like Distance/Distant, Calm/Calm.
  if (tA && tB && (tB.startsWith(tA) || tA.startsWith(tB))) {
    const fallbackTone: MicroPair = { title: "Guarded", subtitle: "holding back truth" };
    return { theme, tone: cleanMicro(fallbackTone) };
  }
  return { theme, tone };
}

/**
 * Deterministically derive theme/tone from the user's signals.
 * - Theme: what drives the pattern
 * - Tone: how it expresses itself
 * Strict constraints:
 * - title: 1–2 words
 * - subtitle: 2–4 words
 */
export function deriveThemeTone(signalsRaw: string[]): { theme: MicroPair; tone: MicroPair } {
  const signals = Array.isArray(signalsRaw) ? signalsRaw.map(norm).filter(Boolean) : [];

  // Axes (no randomness)
  const avoid = countHits(signals, ["avoid", "withdraw", "pull back", "silence", "numb", "shutdown", "distance", "disconnect"]);
  const think = countHits(signals, ["overthink", "ruminate", "loop", "replay", "what if", "uncertain", "confus", "clarity"]);
  const control = countHits(signals, ["control", "guard", "careful", "managed", "edited", "measured"]);
  const intensity = countHits(signals, ["intense", "pressure", "fight", "argument", "tension", "hot", "cold", "spike", "swing"]);
  const closeness = countHits(signals, ["close", "closeness", "connection", "together", "reach", "pursue", "support", "warm"]);
  const calm = countHits(signals, ["calm", "peace", "still", "grounded", "steady", "quiet"]);

  // THEME candidates (driver)
  const themeCandidates: Array<{ score: number; pair: MicroPair }> = [
    { score: 4 * avoid + 2 * control + 1 * calm, pair: { title: "Protection", subtitle: "guarding yourself" } },
    { score: 4 * closeness + 2 * intensity, pair: { title: "Closeness", subtitle: "seeking connection" } },
    { score: 4 * think + 1 * control, pair: { title: "Uncertainty", subtitle: "searching for clarity" } },
    { score: 3 * control + 1 * avoid, pair: { title: "Control", subtitle: "keeping it contained" } },
    { score: 2 * calm + 1 * avoid, pair: { title: "Stability", subtitle: "keeping it steady" } },
  ];

  // TONE candidates (expression)
  const toneCandidates: Array<{ score: number; pair: MicroPair }> = [
    { score: 4 * avoid + 1 * calm, pair: { title: "Quiet", subtitle: "holding things in" } },
    { score: 4 * control + 1 * think, pair: { title: "Guarded", subtitle: "choosing words carefully" } },
    { score: 4 * think + 1 * intensity, pair: { title: "Restless", subtitle: "mentally on edge" } },
    { score: 4 * intensity + 1 * closeness, pair: { title: "Intense", subtitle: "emotionally charged" } },
    { score: 3 * calm + 1 * closeness, pair: { title: "Steady", subtitle: "slow to react" } },
  ];

  const pickTop = (arr: Array<{ score: number; pair: MicroPair }>, fallback: MicroPair) => {
    const ranked = [...arr].sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (!best || best.score <= 0) return cleanMicro(fallback);
    return cleanMicro(best.pair);
  };

  let theme = pickTop(themeCandidates, { title: "Clarity", subtitle: "finding what matters" });
  let tone = pickTop(toneCandidates, { title: "Careful", subtitle: "measuring the risk" });

  // If the user is strongly avoidant but also overthinking, bias tone toward "Restless" and theme toward "Protection".
  if (avoid >= 2 && think >= 2) {
    theme = cleanMicro({ title: "Protection", subtitle: "guarding yourself" });
    tone = cleanMicro({ title: "Restless", subtitle: "mentally active" });
  }

  // If intensity dominates without much avoidance, keep theme about closeness and tone about intensity.
  if (intensity >= 2 && avoid === 0) {
    theme = cleanMicro({ title: "Closeness", subtitle: "needing connection" });
    tone = cleanMicro({ title: "Intense", subtitle: "emotionally charged" });
  }

  // Ensure Theme and Tone don't feel identical.
  const contrasted = ensureContrast(theme, tone);
  return { theme: contrasted.theme, tone: contrasted.tone };
}

