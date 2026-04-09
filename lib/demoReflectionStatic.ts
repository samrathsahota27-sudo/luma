import type { IndividualStructuredResult } from "@/components/IndividualResultCard";
import type { ConflictFrictionPoint } from "@/components/ConflictAnalysisPanel";

export const DEMO_INDIVIDUAL_IMAGE = "/demo/individual-hero.jpg";

export const demoIndividualStructured: IndividualStructuredResult = {
  pattern: "Quiet Holding",
  description:
    "You stay composed on the surface while a whole weather system moves underneath—mostly unnoticed, even by you.",
  theme: { title: "Stability", subtitle: "keeping the room steady" },
  tone: { title: "Reserved", subtitle: "careful with what you show" },
  core_line: "You call it being fine. Your body is still bracing.",
  reach: "Predictability, warmth without having to explain yourself, and proof you won't be misunderstood again.",
  shift: "One honest sentence before you withdraw—not to fix it, just to be seen mid-pattern.",
};

export const demoIndividualInsightSections: { title: string; body: string }[] = [
  {
    title: "Emotional tone",
    body:
      "There is a soft fog of restraint—like you're listening for danger in the silence. It reads as calm, but it functions as a holding pattern: nothing wrong, nothing at risk, nothing fully felt.",
  },
  {
    title: "Core themes",
    body:
      "Self-protection through competence. A preference for being the steady one. A quiet hope that if you don't need much, you won't be a burden—and if you're not a burden, you won't be left.",
  },
  {
    title: "What this might mean",
    body:
      "Your inner world may be asking for permission to need without negotiating for it first. The pattern isn't weakness; it's an old strategy that once kept you safe.",
  },
  {
    title: "Under the surface",
    body:
      "The cost isn't drama—it's slow erosion: less curiosity, less contact, more rehearsing conversations you never start. The repair isn't a big talk; it's a small risk, repeated.",
  },
];

export const demoIndividualDangerousQuestion =
  "What are you afraid would happen if you said you were hurt before you had it all figured out?";

export const demoIndividualBrutalTruth =
  "You disappear into reasonableness so no one can accuse you of being 'too much'.";

export const demoIndividualEmotionalTag = "Quiet holding";

/** Couple demo — image paths under /public/demo */
export const demoCoupleImages = {
  partnerA: "/demo/partner-a.jpg",
  spaceBetween: "/demo/space-between.jpg",
  partnerB: "/demo/partner-b.jpg",
} as const;

export const demoCouplePatternName = "Gentle Pursuit, Quiet Retreat";

export const demoCouplePunchline =
  "One partner reaches with care; the other goes still—not from absence, but from overwhelm. Both end up feeling unseen.";

export const demoCoupleSharedLandscape =
  "Your shared landscape isn't empty—it's full of unspoken care. The friction shows up when pace mismatches: one reads stillness as peace, the other reads it as distance. The bond is real; the timing of repair is what wobbles.";

export const demoCoupleDrift = { value: 38, label: "slow drift", status: "recoverable with small check-ins" };

export const demoCoupleTension = { value: 61, label: "ebb and flow", status: "spikes after unspoken needs" };

export const demoCoupleSharedInsight =
  "When one of you names something tender without fixing it, the other softens faster than either of you expect.";

export const demoCoupleAlignment = 74;

export const demoCoupleDistanceSignal =
  "Silence feels like safety for one of you—and like a door closing for the other.";

export const demoCoupleFrictionItems: { label: string; description: string }[] = [
  {
    label: "How you each signal care",
    description:
      "One shows up with questions and follow-through; the other shows up with presence and patience. When stress hits, the first reads the second as absent, and the second reads the first as intense.",
  },
  {
    label: "What “resolved” looks like",
    description:
      "Partner A wants language and a plan. Partner B wants the nervous system to settle first. Without naming that, you replay the same loop: pursue → withdraw → mutual hurt.",
  },
];

export const demoCoupleConflictPoints: ConflictFrictionPoint[] = [
  {
    personA: "I step in because silence scares me—I think if we don't talk, we're drifting.",
    personB: "I go quiet because I'm processing. If I'm pushed, I freeze harder.",
    mismatch: "Speed mismatch: one equates motion with care; the other equates space with safety.",
  },
  {
    personA: "I need reassurance in words—small, clear signals that we're okay.",
    personB: "I show love by staying steady and not adding pressure.",
    mismatch: "You each offer real love in different dialects, then interpret the gap as rejection.",
  },
];

export const demoCoupleWhatHelps: string[] = [
  "Name the pace out loud: “I need ten minutes, then I'm here.”",
  "One micro-repair a week: a two-sentence check-in with zero problem-solving.",
  "Swap roles on purpose—the pursuer practices waiting; the withdrawer practices one early sentence.",
];
