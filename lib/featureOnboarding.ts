export type FeatureOnboardingKey =
  | "emotional_translator"
  | "ai_chat"
  | "date_ai"
  | "their_mind"
  | "silent_signal";

export const FEATURE_SEEN_STORAGE_KEYS: Record<FeatureOnboardingKey, string> = {
  emotional_translator: "luma_feature_emotional_translator_seen",
  ai_chat: "luma_feature_ai_chat_seen",
  date_ai: "luma_feature_date_ai_seen",
  their_mind: "luma_feature_their_mind_seen",
  silent_signal: "luma_feature_silent_signal_seen",
};

export const FEATURE_ONBOARDING_COPY: Record<
  FeatureOnboardingKey,
  { title: string; intro: string; short: string }
> = {
  emotional_translator: {
    title: "Emotional Translator",
    intro:
      "Paste the line that hurt or confused you.\nWe decode what was said, what was likely meant,\nand how to respond without feeding the same fight.",
    short:
      "Translate charged words into emotional meaning,\nthen answer in a way that lowers heat and keeps truth intact.",
  },
  ai_chat: {
    title: "AI Chat",
    intro:
      "When everything feels tangled, start here.\nTalk through the moment in plain language,\nand get grounded before another escalation starts.",
    short:
      "A neutral space to process conflict in real time,\none message at a time.",
  },
  date_ai: {
    title: "Date AI",
    intro:
      "This is not date-night fluff.\nDescribe what's been happening,\nand get one practical plan built for your current emotional pattern.",
    short:
      "Turn emotional drift into one clear shared plan\nyou can do soon, not someday.",
  },
  their_mind: {
    title: "Their Mind",
    intro:
      "Bring one behavior you can't decode.\nWe'll map likely interpretations,\nwhat need might be underneath, and a check-in question to verify.",
    short:
      "A structured read on their behavior,\nwithout pretending mind-reading is certainty.",
  },
  silent_signal: {
    title: "Silent Signal",
    intro:
      "For moments when words don't land.\nSilent Signal helps you send emotional intent with less friction\nthrough small, low-pressure prompts and cues.",
    short:
      "A low-verbal bridge for tense moments,\nwhen direct conversation is too hot to hold.",
  },
};

