/**
 * Strict structured outputs for UI cards.
 * We parse a JSON object from a model response and validate required keys.
 */

function stripToJsonCandidate(text) {
  const t = String(text ?? "").trim();
  if (!t) return "";

  // Allow fenced JSON.
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/im);
  if (fence?.[1]) return fence[1].trim();

  // Best-effort: slice first {...} block.
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) return t.slice(start, end + 1).trim();
  return t;
}

export function parseStrictJsonObject(raw) {
  const candidate = stripToJsonCandidate(raw);
  try {
    const o = JSON.parse(candidate);
    return o && typeof o === "object" ? o : null;
  } catch {
    return null;
  }
}

function mustString(o, key) {
  const v = o?.[key];
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

function mustNumber(o, key) {
  const v = o?.[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

function mustObject(o, key) {
  const v = o?.[key];
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v;
}

export function validateIndividualStructured(o, expectedPatternName) {
  if (!o || typeof o !== "object") return null;
  const pattern = mustString(o, "pattern");
  const description = mustString(o, "description") || mustString(o, "summary");
  const coreLine = mustString(o, "core_line") || mustString(o, "mirror_line");
  const reach = mustString(o, "reach");
  const shift = mustString(o, "shift");
  const themeObj = mustObject(o, "theme");
  const toneObj = mustObject(o, "tone");
  const themeTitle = mustString(themeObj, "title");
  const themeSubtitle = mustString(themeObj, "subtitle") || mustString(themeObj, "description");
  const toneTitle = mustString(toneObj, "title");
  const toneSubtitle = mustString(toneObj, "subtitle") || mustString(toneObj, "description");

  if (
    !pattern ||
    !description ||
    !themeTitle ||
    !themeSubtitle ||
    !toneTitle ||
    !toneSubtitle ||
    !coreLine ||
    !reach ||
    !shift
  ) {
    return null;
  }

  if (expectedPatternName && pattern !== expectedPatternName) {
    return null;
  }

  return {
    pattern,
    description,
    theme: { title: themeTitle, subtitle: themeSubtitle },
    tone: { title: toneTitle, subtitle: toneSubtitle },
    core_line: coreLine,
    reach,
    shift,
  };
}

export function validateCoupleStructured(o, expectedPatternName) {
  if (!o || typeof o !== "object") return null;
  const pattern = mustString(o, "pattern");
  const summary = mustString(o, "summary");
  const insight = mustString(o, "insight");
  const distanceSignal = mustString(o, "distance_signal");
  const alignment = mustNumber(o, "alignment");

  const driftObj = mustObject(o, "drift");
  const tensionObj = mustObject(o, "tension");
  const driftValue = mustNumber(driftObj, "value");
  const driftLabel = mustString(driftObj, "label");
  const tensionValue = mustNumber(tensionObj, "value");
  const tensionLabel = mustString(tensionObj, "label");

  if (
    !pattern ||
    !summary ||
    driftValue == null ||
    !driftLabel ||
    tensionValue == null ||
    !tensionLabel ||
    !insight ||
    alignment == null ||
    !distanceSignal
  ) {
    return null;
  }

  if (expectedPatternName && pattern !== expectedPatternName) {
    return null;
  }

  return {
    pattern,
    summary,
    drift: { value: driftValue, label: driftLabel },
    tension: { value: tensionValue, label: tensionLabel },
    insight,
    alignment,
    distance_signal: distanceSignal,
  };
}

