export type TensionInput = {
  pattern: string;
  themeTitle?: string;
  toneTitle?: string;
  signals?: string[];
  relationshipTags?: string[];
  relationshipSummary?: string;
};

export type TensionOutput = {
  think: string;
  actually: string;
  so: string;
};

function norm(s: unknown): string {
  return typeof s === "string" ? s.trim().toLowerCase() : "";
}

function hasAny(tags: string[], needles: string[]) {
  return needles.some((n) => tags.some((t) => t.includes(n)));
}

export function buildTension(input: TensionInput): TensionOutput {
  const pattern = String(input.pattern ?? "").trim();
  const p = pattern.toLowerCase();
  const signals = Array.isArray(input.signals)
    ? input.signals.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
    : [];
  const tags = Array.isArray(input.relationshipTags) ? input.relationshipTags.map(norm).filter(Boolean) : [];
  const summary = String(input.relationshipSummary ?? "").trim();

  // Optional bias words from tags/summary.
  const feelsDistant = hasAny(tags, ["distant", "distance"]) || /distant|distance/i.test(summary);
  const feelsCalm = hasAny(tags, ["calm", "safe", "warm"]) || /calm|safe/i.test(summary);
  const feelsUnstable = hasAny(tags, ["unstable", "heavy", "draining"]) || /unstable|heavy|draining/i.test(summary);

  const tighten = (s: string) => {
    const words = String(s || "")
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .filter(Boolean);
    // Keep 6–12 words by trimming the end (deterministic).
    if (words.length > 12) return words.slice(0, 12).join(" ") + ".";
    if (words.length < 6) return (words.join(" ") + " right now.").trim();
    return words.join(" ").replace(/[.?!]+$/, "") + ".";
  };

  function hasAnySignal(needles: string[]) {
    return needles.some((n) => signals.some((s) => s.includes(n)));
  }
  const countHits = (needles: string[]) => needles.reduce((acc, n) => (signals.some((s) => s.includes(n)) ? acc + 1 : acc), 0);
  const h = signals.join("|").length % 7;

  const away = countHits(["avoid", "withdraw", "pull back", "silence", "distance", "disconnect", "numb", "shutdown"]);
  const toward = countHits(["close", "closeness", "connection", "reach", "pursue", "support", "warm", "openness", "together"]);
  const stuck = countHits(["overthink", "ruminate", "loop", "replay", "what if", "uncertain", "confus", "clarity"]);
  const intensity = countHits(["tension", "pressure", "fight", "argument", "hot", "cold", "spike", "swing", "push pull"]);
  const control = countHits(["control", "guard", "careful", "managed", "edited", "measured"]);

  // Pick the most specific contradiction first (data-driven).
  if (toward >= 2 && away >= 2) {
    const thinkLine = h % 2 === 0 ? "You move toward closeness, then hesitate halfway." : "You reach for connection, then stop mid‑step.";
    const actuallyLine =
      control >= 1
        ? "But you keep control by holding back the real sentence."
        : "But you never fully stay, and you never fully leave.";
    const soLine = "So things stay unresolved instead of deepening.";
    return { think: tighten(thinkLine), actually: tighten(actuallyLine), so: tighten(soLine) };
  }

  if (stuck >= 2 && toward >= 1) {
    const thinkLine = h % 2 === 0 ? "You want closeness, but you need certainty first." : "You want to be close, but your mind won’t settle.";
    const actuallyLine = "But you keep thinking until the moment passes.";
    const soLine = "So you miss the window to be real.";
    return { think: tighten(thinkLine), actually: tighten(actuallyLine), so: tighten(soLine) };
  }

  if (away >= 2 && feelsCalm) {
    const thinkLine = feelsCalm ? "You call it calm, like nothing is wrong." : "You call it fine, like it’s under control.";
    const actuallyLine = feelsDistant ? "But it lands as distance to other people." : "But it slowly becomes distance.";
    const soLine = "So closeness stalls right before honesty lands.";
    return { think: tighten(thinkLine), actually: tighten(actuallyLine), so: tighten(soLine) };
  }

  if (intensity >= 2) {
    const thinkLine = h % 2 === 0 ? "You want it to feel close, not heavy." : "You want love, not pressure.";
    const actuallyLine = "But the moment spikes, and you both tense up.";
    const soLine = "So repair happens late, after damage.";
    return { think: tighten(thinkLine), actually: tighten(actuallyLine), so: tighten(soLine) };
  }

  if (control >= 2 && toward >= 1) {
    const thinkLine = "You try to be open, but only safely.";
    const actuallyLine = "But careful words keep you out of reach.";
    const soLine = "So you’re seen, but not met.";
    return { think: tighten(thinkLine), actually: tighten(actuallyLine), so: tighten(soLine) };
  }

  // Fallback (still sharp, not advice-y).
  return {
    think: tighten(feelsUnstable ? "You think this is just a rough patch" : "You think you are handling it fine"),
    actually: tighten("But a pattern keeps steering the moment"),
    so: tighten("So the same outcome keeps repeating"),
  };
}

