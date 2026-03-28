import { ROUND_SIGNAL_LABELS, getRoundTag } from "@/lib/reflection/roundTagging";
import { normalizeDepthMode } from "@/lib/depthMode";

function normalizeRoundAnswer(a, roundNumber) {
  if (!a || typeof a !== "object") return { type: "missing" };
  const selectedType = a.selectedType ?? "image";
  if (selectedType === "none") {
    const explanation = String(a.userExplanation ?? a.text ?? "").trim();
    return { type: "none", explanation };
  }
  const idx = a.selectedImageId ?? a.image;
  const tag = a.tag ?? (typeof idx === "number" ? getRoundTag(roundNumber, idx) : null);
  const userTags = Array.isArray(a.tags) ? a.tags.filter(Boolean) : [];
  const text = String(a.text ?? "").trim();
  const psychologicalTags =
    roundNumber === 5 && Array.isArray(a.psychologicalTags)
      ? a.psychologicalTags.filter((x) => typeof x === "string" && x.trim())
      : [];
  const imageId =
    roundNumber === 5 && typeof a.imageId === "string" && a.imageId.trim()
      ? a.imageId.trim()
      : null;
  return {
    type: "image",
    tag: tag ?? null,
    userTags,
    text,
    psychologicalTags,
    imageId,
  };
}

function buildSignals(answers) {
  const signals = [];
  const tags = [];
  const tagObjects = [];

  for (let round = 1; round <= 5; round++) {
    const label = ROUND_SIGNAL_LABELS?.[round] ?? `Round ${round}`;
    const a = normalizeRoundAnswer(answers?.[round], round);

    if (a.type === "none") {
      const extra = a.explanation ? ` (user: "${a.explanation}")` : "";
      signals.push(`- ${label}: none${extra}`);
      continue;
    }

    const tagText = a.tag ? a.tag : "unknown";
    const meta = answers?.[round]?.meta === "unsure" ? "unsure" : null;
    signals.push(`- ${label}: ${tagText}${meta ? " (meta: unsure)" : ""}`);
    if (round === 5 && a.type === "image") {
      if (a.imageId) {
        signals.push(`  - round5_image_id: ${a.imageId}`);
      }
      if (a.psychologicalTags?.length) {
        signals.push(
          `  - round5_psychological_tags: ${a.psychologicalTags.join(", ")}`
        );
        signals.push(
          `  - round5_psychological_tags_json: ${JSON.stringify(a.psychologicalTags)}`
        );
      }
    }
    if (a.userTags?.length) {
      signals.push(`  - chosen words: ${a.userTags.join(", ")}`);
    }
    if (a.tag) tags.push(a.tag);
    if (a.psychologicalTags?.length) {
      for (const pt of a.psychologicalTags) {
        if (pt && !tags.includes(pt)) tags.push(pt);
      }
    }
    if (round === 5 && a.psychologicalTags?.length) {
      tagObjects.push({
        tag: a.tag,
        imageId: a.imageId ?? undefined,
        psychologicalTags: a.psychologicalTags,
      });
    } else if (a.tag) {
      tagObjects.push({ tag: a.tag, ...(meta ? { meta: "unsure" } : {}) });
    }
  }

  return { signals, tags, tagObjects };
}

/**
 * @param {Record<number, unknown>} answers
 * @param {unknown} [depthMode] - "satin" | "steel" (legacy gentle/balanced/direct normalized)
 */
export function buildPrompt(answers, depthMode = "satin") {
  const { signals, tags, tagObjects } = buildSignals(answers);
  const mode = normalizeDepthMode(depthMode);
  const steel = mode === "steel";
  const wordBand = steel ? "220–310" : "340–450";
  const sectionShape = steel
    ? "Each section: 2–3 tight paragraphs (few sentences each). No throat-clearing or repeated setup."
    : "Each section: 3–5 short paragraphs. One small reflective beat per section is welcome when it deepens the read.";
  const toneBlock = steel
    ? `Tone:
Sharp, direct, psychologically precise—no filler.
Speak directly to the user in second person.`
    : `Tone:
Insightful, calm, psychologically precise, elegant, reflective without drifting.
Speak directly to the user in second person.`;
  const identityNote = steel
    ? "Favor plain, economical habit language; avoid stacking softeners—still vary stems (\"You avoid…\", \"You reach for…\", \"You shut down when…\")."
    : "Ground habits in recognizable stems (\"You tend to…\", \"You often…\", \"over time…\", \"it can lead to…\")—vary; do not start every sentence the same way.";
  const brutalWords = steel ? "about 10–20 words" : "about 16–30 words";
  const trackerCap = steel ? "max ~90 characters" : "up to ~110 characters";
  const shadowCap = steel ? "max ~180 characters" : "max ~220 characters";

  return `
The user completed a 5-round emotional reflection test.

User emotional signals (round-specific tags):
${signals.join("\n")}

Aggregated tags:
${tags.length ? JSON.stringify(tags) : "[]"}

Aggregated tag objects:
${tagObjects.length ? JSON.stringify(tagObjects) : "[]"}

Important:
- Follow any "Depth tone" and "Individual result" blocks appended after this prompt by the API—the same insight as the other mode, different delivery (Satin vs Steel), consistent with the rest of Luma.
- If any round is "none", treat the user's explanation as the primary input for that round.
- Do NOT infer meaning from an image when a round is "none".
- Round 5 ("Space Between You"): use the round5_image_id and round5_psychological_tags lines in the signals above as the primary relational signal layer (e.g. emotional_distance, calm_connection, overwhelm, breaking_point). Treat every listed psychological tag as meaningful—integrate them with rounds 1–4. Weave their combined felt sense into reflection, brutalTruth, inSimpleWords, trackerInsight, and shadowInsight; do not treat Round 5 as a single generic "relationship" label.
- Use the tag contrasts (e.g., Drawn to vs Discomfort vs Current state vs Direction) to generate:
  - core pattern
  - emotional contrast
  - direction insight
- If a tag has meta "unsure", interpret it as an intuitive / subconscious signal:
  - emphasize felt sense over logical explanation
  - avoid over-confident causal claims
  - reflect gently: "this seems felt rather than clearly defined"

Generate ${steel ? "a tighter" : "a reflective"} emotional reflection, about ${wordBand} words total, structured into 4 sections:

1. Core Pattern Insight
2. Gentle Direction
3. Emotional Expansion
4. Soft Invitation to unlock deeper analysis using Couple Mode

Each section must:
- Start with a clear heading
- Use short paragraphs
- Leave a blank line between sections
- ${sectionShape}
- Weave in at least one identity-anchored observation per section where natural (habit + what it does in their life), always tied to the signals above—not generic character description.

${toneBlock}

Identity-based language (required across brutalTruth, reflection body, trackerInsight, shadowInsight, and dangerousQuestion where it fits naturally):
- ${identityNote}
- Examples of stems to rotate: "You tend to…", "You often…", "You avoid…", "You reach for…", "You're quick to…", "You hold back when…" — vary; do not lean on one crutch.
- Each statement must tie to a concrete behavior, choice, or tension implied by THIS user's round signals—not generic personality ("You are a deep feeler"), horoscope-style lines, or flat trait lists ("You are caring, loyal, reflective").
- Name the mechanism (what happens between an inner pull and what others experience), not a personality "type."
- Forbidden: vague praise with no behavior ("You have such a big heart"), hollow inventory adjectives, "As someone who…", "At the end of the day," or therapy filler with no specificity.
- Good shape (do not copy verbatim)${steel ? ': "You avoid tension. Distance grows."' : ': "You tend to stay quiet when things feel uncertain, which creates distance over time."'}

CRITICAL — OUTPUT FORMAT:
Return a single JSON object only. No markdown code fences, no text before or after the JSON.

Required keys:
- "inSimpleWords": JSON array of exactly 3 strings, optional 4th string. Each string is ONE line only (max ~100 characters), everyday plain English a teenager could follow. Order: [0] = their repeating pattern in simple words; [1] = what they usually do (behavior); [2] = what that does in their life or relationships (impact); [3] optional = one small plain takeaway. No psychology jargon—do not use words like: attachment, trauma, regulation, nervous system, projection, defense mechanism, cognitive, processing, dysregulation, trigger (as therapy term), inner child, codependent, narcissist, toxic, healing journey, hold space, boundaries (as buzzword), vibes, energy. No abstract filler. Must match the same core read as "reflection" and "brutalTruth" but stripped down. Do not repeat these lines inside "reflection".
- "brutalTruth": one sentence only (${brutalWords}). Should sound identity-in-pattern: ${steel ? "plain cause–effect or sharp habit naming tied to cost; minimal padding." : "prefer an opening like \"You tend to…\", \"You often…\", or \"You avoid…\" tied to a specific cost or outcome grounded in their signals."} Direct, emotionally sharp, slightly uncomfortable, honest but never insulting. Names the core tension in plain language. Avoid generic soft lines like "you are going through a lot" or "everyone feels this way."
- "emotionalTag": 2–5 words only—a compact mood/state label for a timeline (e.g. "Quiet & guarded", "Seeking clarity", "Overloaded, pulling back"). No punctuation except maybe an ampersand; grounded in their signals; not generic ("Fine", "Okay").
- "trackerInsight": one short line only (${trackerCap}), ${steel ? "tight snapshot for a pattern card—second person; scannable." : "gentler snapshot for a pattern-over-time card—lead with an identity habit if it fits (\"You tend to…\" / \"You often…\"); may align with brutalTruth but need not repeat it word-for-word; second person; scannable; grounded in their signals."}
- "calendarState": exactly one string: "calm" | "friction" | "distance" | "clarity". Emotional tone of this snapshot for a calendar: calm = settled or soft regulation; friction = tension, conflict, or activation; distance = withdrawal, coldness, or drift; clarity = insight, repair, or understanding opening up. Pick the single best fit.
- "reflection": string containing the full 4-section reflection exactly as specified above (same headings, short paragraphs, blank lines between sections). Preserve newlines inside this string.
- "dangerousQuestion": REQUIRED. Exactly one short question (one sentence, must end with ?). Must name something specific to this user's signals and this brutalTruth—not a generic therapy question. Grounded in this reflection. Push toward honest conversation: slightly uncomfortable but fair, never cruel or shaming. ${steel ? "Keep it lean—no lead-in clause." : "Examples of tone: \"Why do you avoid saying what you actually feel when it matters?\"; \"When was the last time you felt truly heard by them?\"; \"What are you afraid will happen if you speak honestly?\""} Use "you" (second person). Forbidden: "How does that make you feel?", "What are your thoughts?" or other vague prompts.
- "shadowInsight": one or two short sentences only (${shadowCap}). Name one pattern the user may be avoiding or not fully seeing—specific to their round signals, not generic. ${steel ? "Mostly naming behavior + cost; little cushioning." : "Roughly 70% honest naming of the behavior (what it costs or how it repeats) and ~30% grounding (context, care, or a gentler read)."} Focus on behaviors and interpretations, not harsh labels (never "toxic", "narcissist", "you always"). Non-judgmental, invitational tone. Examples: "You tend to stay quiet to avoid conflict, but that silence builds distance over time."; "You want to be understood, but you often don't say what you actually need."; "You interpret their silence as disinterest, but it may be avoidance rather than lack of care."

The "reflection" value must contain ONLY the four sections—do not repeat inSimpleWords, brutalTruth, emotionalTag, trackerInsight, dangerousQuestion, or shadowInsight inside it.
`;
}

