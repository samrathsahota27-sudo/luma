type MaybeRecord = Record<string, unknown> | null | undefined;

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toneToTensionScore(toneTitle: string): number {
  const t = toneTitle.toLowerCase();
  if (t.includes("intense")) return 72;
  if (t.includes("restless")) return 64;
  if (t.includes("guarded")) return 57;
  if (t.includes("quiet")) return 48;
  if (t.includes("steady")) return 38;
  return 52;
}

function clampDelta(value: number): number {
  if (value > 99) return 99;
  if (value < -99) return -99;
  return Math.round(value);
}

function buildTensionPhrase(delta: number): string {
  const d = clampDelta(delta);
  if (Math.abs(d) < 3) return "Your tension stayed relatively steady.";
  if (d > 0) return `Your tension increased by about ${d} points.`;
  return `Your tension decreased by about ${Math.abs(d)} points.`;
}

export function buildIndividualWeeklyInsight(previous: MaybeRecord, current: MaybeRecord): string | null {
  if (!previous || !current) return null;

  const prevPattern = asText(previous.pattern);
  const currPattern = asText(current.pattern);
  const prevTone = asText((previous.tone as MaybeRecord)?.title);
  const currTone = asText((current.tone as MaybeRecord)?.title);

  const lead =
    prevPattern && currPattern && prevPattern !== currPattern
      ? `You've shifted slightly toward ${currPattern}.`
      : currPattern
        ? `You're still orbiting ${currPattern}, but the emotional texture is moving.`
        : "";

  const prevTension = toneToTensionScore(prevTone);
  const currTension = toneToTensionScore(currTone);
  const tensionLine = buildTensionPhrase(currTension - prevTension);

  const lines = [lead, tensionLine].filter(Boolean);
  return lines.length ? lines.join(" ") : null;
}

export function buildCoupleWeeklyInsight(previous: MaybeRecord, current: MaybeRecord): string | null {
  if (!previous || !current) return null;

  const prevPattern = asText(previous.pattern);
  const currPattern = asText(current.pattern);
  const prevTension =
    asNumber((previous.tension as MaybeRecord)?.value) ??
    asNumber(previous.tension) ??
    0;
  const currTension =
    asNumber((current.tension as MaybeRecord)?.value) ??
    asNumber(current.tension) ??
    0;

  const patternLine =
    prevPattern && currPattern && prevPattern !== currPattern
      ? `You've shifted slightly toward ${currPattern} as a couple.`
      : currPattern
        ? `Your shared pattern is still ${currPattern}, but the pressure is changing.`
        : "";

  const tensionLine = buildTensionPhrase(currTension - prevTension);
  const lines = [patternLine, tensionLine].filter(Boolean);
  return lines.length ? lines.join(" ") : null;
}
