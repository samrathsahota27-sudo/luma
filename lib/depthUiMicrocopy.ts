import { normalizeDepthMode } from "@/lib/depthMode";

function pick(mode: unknown, satin: string, steel: string): string {
  return normalizeDepthMode(mode) === "steel" ? steel : satin;
}

/** Hint under Satin / Steel toggle — describes active tone across Luma. */
export function depthToneHint(mode: unknown): string {
  return pick(
    mode,
    "Satin: supportive, reflective phrasing—same insight, gentler delivery.",
    "Steel: direct, concise, cause–effect—same insight, sharper lines."
  );
}

export function translatorTagline(mode: unknown): string {
  return pick(
    mode,
    "Not just their words—what they may have meant underneath.",
    "Surface words vs. what they’re likely driving at."
  );
}

export function mindTagline(mode: unknown): string {
  return pick(
    mode,
    "Beyond their words—what they might be holding inside.",
    "Skip the script—name the likely emotional read."
  );
}

export function dateTagline(mode: unknown): string {
  return pick(mode, "A connection reset—not a calendar event.", "Repair focus—not a night-out plan.");
}

export function dateExampleHint(mode: unknown): string {
  return pick(
    mode,
    "Example: We’ve been arguing a lot lately — or — We feel distant and disconnected",
    "e.g. More fights lately — or — We feel distant."
  );
}

export function chatPageSubtitle(mode: unknown): string {
  return pick(mode, "Say anything. We’ll keep it steady.", "Say it straight. No judgment.");
}

export function hubChatEmptyPrompt(mode: unknown): string {
  return pick(mode, "Start with one honest sentence. Add another if you want.", "One true line. Then the next.");
}

export function futurePathsBlurb(mode: unknown): string {
  return pick(
    mode,
    "Not fortune-telling—a plausible direction from the pattern you’ve been in.",
    "Not predictions—where your current pattern points."
  );
}

export function futurePathsLoading(mode: unknown): string {
  return pick(mode, "Tracing the direction…", "Mapping the trajectory…");
}

export function reportSubtitle(mode: unknown): string {
  return pick(mode, "A gentle read on how the week landed.", "Plain read: what showed up this week.");
}

export function reflectIntroPrimary(mode: unknown): string {
  return pick(
    mode,
    "Five rounds of visual choices. Each grid holds symbols—pick what resonates, then answer a short prompt (the last round is visual only).",
    "Five rounds: choose images that fit, short prompts between. Last round: visual only."
  );
}

export function reflectIntroSecondary(mode: unknown): string {
  return pick(mode, "Take your time. There are no right or wrong choices.", "No wrong picks. Your pace.");
}

export function preTestLead(mode: unknown): string {
  return pick(
    mode,
    "This works best when you notice what quietly pulls you in.",
    "Follow what grabs you—even if it’s faint."
  );
}

export type HubOverlayKind = "translator" | "mind" | "date" | "chat";

export function hubOverlayMicro(kind: HubOverlayKind, mode: unknown): string {
  switch (kind) {
    case "translator":
      return pick(mode, "Decode the subtext", "Decode subtext");
    case "mind":
      return pick(mode, "Possible inner weather", "Likely inner state");
    case "date":
      return pick(mode, "Repair the bond", "Fix the break");
    case "chat":
      return pick(mode, "Talk it through calmly", "Cut escalation");
  }
}

export function hubOverlayPlaceholder(kind: HubOverlayKind, mode: unknown): string {
  switch (kind) {
    case "translator":
      return pick(mode, "Paste what they sent…", "Paste their text…");
    case "mind":
      return pick(mode, "What happened—specifically?", "What did they do or say?");
    case "date":
      return pick(mode, "What’s going on between you?", "What’s happening between you?");
    case "chat":
      return pick(mode, "Type what’s on your mind…", "Say it here.");
  }
}

export function hubOverlayActionLabel(kind: HubOverlayKind, mode: unknown): string {
  switch (kind) {
    case "translator":
      return "Decode";
    case "mind":
      return pick(mode, "Explore", "Reveal");
    case "date":
      return pick(mode, "Suggest plan", "Prescribe");
    case "chat":
      return "Send";
  }
}
