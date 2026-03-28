/**
 * Parse OpenAI reflection responses that return JSON:
 * { brutalTruth, reflection, inSimpleWords, emotionalTag, trackerInsight, calendarState, dangerousQuestion, shadowInsight, conflictFrictionPoints, mapReadInnerA/B/Between }.
 * Falls back to treating the full string as body if JSON is missing (legacy models).
 */

export function extractOpenAIResponsesText(aiResponse) {
  const t = aiResponse?.output_text?.trim?.();
  if (t) return t;
  const blocks = aiResponse?.output?.[0]?.content;
  if (!Array.isArray(blocks)) return "";
  const out = blocks.find((c) => c?.type === "output_text" && typeof c?.text === "string");
  if (out?.text) return String(out.text).trim();
  const legacy = blocks.find((c) => c?.type === "text" && typeof c?.text === "string");
  if (legacy?.text) return String(legacy.text).trim();
  return "";
}

function pickOptionalString(o, camel, snake) {
  const a = typeof o[camel] === "string" ? o[camel].trim() : "";
  if (a) return a;
  const b = typeof o[snake] === "string" ? o[snake].trim() : "";
  return b || null;
}

/** @returns {"calm"|"friction"|"distance"|"clarity"|null} */
function normalizeCalendarStateFromObject(o) {
  const s = pickOptionalString(o, "calendarState", "calendar_state");
  if (!s) return null;
  const v = s.trim().toLowerCase();
  if (v === "calm" || v === "friction" || v === "distance" || v === "clarity") return v;
  return null;
}

/** 2–3 friction rows: Person A vs B + why it clashes (couple / connect JSON). */
/** @returns {string[] | null} 3–4 plain lines for "In Simple Words" (individual). */
function normalizeInSimpleWords(o) {
  const raw = o.inSimpleWords ?? o.in_simple_words;
  if (Array.isArray(raw)) {
    const lines = raw.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
    return lines.length > 0 ? lines.slice(0, 4) : null;
  }
  if (typeof raw === "string") {
    const lines = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    return lines.length > 0 ? lines.slice(0, 4) : null;
  }
  return null;
}

function normalizeConflictFrictionPoints(o) {
  const raw = o.conflictFrictionPoints ?? o.conflict_friction_points;
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const personA = pickOptionalString(item, "personA", "person_a");
    const personB = pickOptionalString(item, "personB", "person_b");
    const mismatch =
      pickOptionalString(item, "mismatch", "why_it_clashes") ||
      pickOptionalString(item, "whyItClashes", "why_it_clashes") ||
      pickOptionalString(item, "friction", "friction_line");
    if (personA && personB && mismatch) {
      out.push({ personA, personB, mismatch });
    }
    if (out.length >= 3) break;
  }
  return out.length > 0 ? out : null;
}

function tryParseObject(o) {
  if (!o || typeof o !== "object") return null;
  const truthRaw =
    typeof o.brutalTruth === "string"
      ? o.brutalTruth.trim()
      : typeof o.brutal_truth === "string"
        ? o.brutal_truth.trim()
        : "";
  const truth = truthRaw.length > 0 ? truthRaw : null;
  const dqRaw =
    typeof o.dangerousQuestion === "string"
      ? o.dangerousQuestion.trim()
      : typeof o.dangerous_question === "string"
        ? o.dangerous_question.trim()
        : "";
  const dangerousQuestion = dqRaw.length > 0 ? dqRaw : null;
  const shadowInsight = pickOptionalString(o, "shadowInsight", "shadow_insight");
  const emotionalTag = pickOptionalString(o, "emotionalTag", "emotional_tag");
  const trackerInsight = pickOptionalString(o, "trackerInsight", "tracker_insight");
  const mapReadInnerA = pickOptionalString(o, "mapReadInnerA", "map_read_inner_a");
  const mapReadInnerB = pickOptionalString(o, "mapReadInnerB", "map_read_inner_b");
  const mapReadBetween = pickOptionalString(o, "mapReadBetween", "map_read_between");
  const body =
    typeof o.reflection === "string"
      ? o.reflection.trim()
      : typeof o.result === "string"
        ? o.result.trim()
        : "";
  if (!body) return null;
  const conflictFrictionPoints = normalizeConflictFrictionPoints(o);
  const calendarState = normalizeCalendarStateFromObject(o);
  const inSimpleWords = normalizeInSimpleWords(o);
  return {
    brutalTruth: truth,
    body,
    inSimpleWords,
    emotionalTag,
    trackerInsight,
    calendarState,
    dangerousQuestion,
    shadowInsight,
    conflictFrictionPoints,
    mapReadInnerA,
    mapReadInnerB,
    mapReadBetween,
  };
}

export function parseAiReflectionOutput(raw) {
  const text = String(raw ?? "").trim();
  if (!text)
    return {
      brutalTruth: null,
      body: "",
      inSimpleWords: null,
      emotionalTag: null,
      trackerInsight: null,
      calendarState: null,
      dangerousQuestion: null,
      shadowInsight: null,
      conflictFrictionPoints: null,
      mapReadInnerA: null,
      mapReadInnerB: null,
      mapReadBetween: null,
    };

  const tryJson = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  let o = tryJson(text);
  if (o) {
    const parsed = tryParseObject(o);
    if (parsed) return parsed;
  }

  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/im);
  if (fence) {
    o = tryJson(fence[1].trim());
    if (o) {
      const parsed = tryParseObject(o);
      if (parsed) return parsed;
    }
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    o = tryJson(text.slice(start, end + 1));
    if (o) {
      const parsed = tryParseObject(o);
      if (parsed) return parsed;
    }
  }

  return {
    brutalTruth: null,
    body: text,
    inSimpleWords: null,
    emotionalTag: null,
    trackerInsight: null,
    calendarState: null,
    dangerousQuestion: null,
    shadowInsight: null,
    conflictFrictionPoints: null,
    mapReadInnerA: null,
    mapReadInnerB: null,
    mapReadBetween: null,
  };
}
