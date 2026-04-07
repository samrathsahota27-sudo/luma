function norm(x: unknown) {
  return typeof x === "string" ? x.trim().toLowerCase() : "";
}

function hasAny(signals: string[], needles: string[]) {
  return needles.some((n) => signals.some((s) => s.includes(n)));
}

function dedupe(arr: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of arr) {
    const t = String(s || "").trim();
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function buildGuidingReflection(input: {
  pattern: string;
  signals?: string[];
}): string[] {
  const pattern = String(input.pattern || "").trim();
  const p = pattern.toLowerCase();
  const signals = Array.isArray(input.signals) ? input.signals.map(norm).filter(Boolean) : [];

  const avoid = hasAny(signals, ["avoid", "withdraw", "pull back", "silence", "distance", "disconnect", "numb", "shutdown"]);
  const think = hasAny(signals, ["overthink", "ruminate", "loop", "replay", "uncertain", "confus"]);
  const control = hasAny(signals, ["control", "guard", "careful", "managed", "edited", "measured"]);
  const intense = hasAny(signals, ["tension", "pressure", "fight", "argument", "hot", "cold", "spike", "swing"]);

  const qs: string[] = [];

  // Pattern-specific anchors (deterministic)
  if (p.includes("quiet withdrawal") || avoid) {
    qs.push("What do you feel right before you go quiet?");
    qs.push("What are you protecting, and is it still needed?");
    qs.push("What would change if you stayed ten seconds longer?");
  } else if (p.includes("silent overthinking") || think) {
    qs.push("What sentence do you keep rewriting in your head?");
    qs.push("What are you trying to prove to yourself?");
    qs.push("What would you say if you didn’t need certainty first?");
  } else if (p.includes("controlled openness") || control) {
    qs.push("What do you edit out when you speak?");
    qs.push("What outcome are you trying to control?");
    qs.push("What would it cost to be unfiltered once?");
  } else if (intense) {
    qs.push("What do you want in the moment you spike?");
    qs.push("What are you afraid will happen if you soften?");
    qs.push("What does repair look like before it’s urgent?");
  } else {
    qs.push("What do you keep hoping they’ll notice without asking?");
    qs.push("Where do you hold back the real sentence?");
    qs.push("What happens when you stop performing “fine”?");
  }

  return dedupe(qs).slice(0, 3);
}

