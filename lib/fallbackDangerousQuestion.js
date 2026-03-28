/**
 * Ensures a single conversation-worthy question is always shown at end of results.
 * Prefers model output; falls back to pattern-informed prompts from brutal truth / tag / body.
 */

const MAX_LEN = 200;

function clipToQuestion(s, maxLen = MAX_LEN) {
  let t = String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return "";
  if (!t.endsWith("?")) t = t.endsWith(".") ? `${t.slice(0, -1)}?` : `${t}?`;
  if (t.length <= maxLen) return t;
  const slice = t.slice(0, maxLen);
  const cut = slice.lastIndexOf(" ");
  const base = (cut > 60 ? slice.slice(0, cut) : slice).trim().replace(/\?$/, "");
  return `${base}…?`;
}

/**
 * @param {string | null | undefined} dq
 * @param {string | null | undefined} brutalTruth
 * @param {string | null | undefined} emotionalTag
 * @param {string | null | undefined} resultPreview
 * @param {"individual" | "couple"} mode
 */
export function resolveDangerousQuestion(dq, brutalTruth, emotionalTag, resultPreview, mode = "individual") {
  const raw = typeof dq === "string" ? dq.trim() : "";
  if (raw.length > 0) return clipToQuestion(raw);

  const bt = typeof brutalTruth === "string" ? brutalTruth.replace(/\s+/g, " ").trim() : "";
  const tag = typeof emotionalTag === "string" ? emotionalTag.replace(/\s+/g, " ").trim() : "";
  const body = typeof resultPreview === "string" ? resultPreview.replace(/\s+/g, " ").trim() : "";

  const isCouple = mode === "couple";

  if (bt) {
    const short = bt.length > 110 ? `${bt.slice(0, 107).trim()}…` : bt;
    return clipToQuestion(
      isCouple
        ? `This tension sits between you — "${short}" — what are both of you avoiding saying about it?`
        : `This pattern names something sharp — "${short}" — what are you protecting by not saying the rest out loud?`,
      MAX_LEN + 40
    );
  }

  if (tag) {
    const t = tag.length > 48 ? `${tag.slice(0, 45)}…` : tag;
    return clipToQuestion(
      isCouple
        ? `Your read landed as "${t}" — where does that actually show up in how you two talk when stakes are high?`
        : `Your read landed as "${t}" — when does that show up most in how you show up with someone you care about?`
    );
  }

  if (body.length > 40) {
    return clipToQuestion(
      isCouple
        ? "Reading this woven picture of both of you — what truth would change how you listen to each other if you spoke it tonight?"
        : "Reading this back — what do you most want someone who loves you to understand, and what stops you from saying it plainly?"
    );
  }

  return isCouple
    ? "What are you both afraid will happen if you stop managing the peace and start naming what you actually need?"
    : "What are you afraid will happen if you speak honestly about what you actually feel when it matters?";
}
