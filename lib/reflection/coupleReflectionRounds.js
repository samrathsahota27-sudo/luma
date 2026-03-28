import { reflectionRounds as baseReflectionRounds } from "./reflectionRounds";
import { round5ImageFilenames, ROUND_FIVE_TITLE } from "./round5Images";

/** Couple flow: same first four rounds as individual, then round 5 (shared space-between visuals). */
export const coupleReflectionRounds = [
  ...baseReflectionRounds.slice(0, 4),
  {
    roundNumber: 5,
    question: ROUND_FIVE_TITLE,
    spaceBetweenRound: true,
    tags: [],
    reflectionLines: [
      "What does this suggest about closeness or distance with someone who matters?",
      "What draws you into this image?",
      "What feels present here?",
    ],
    images: [...round5ImageFilenames],
  },
];

export const COUPLE_TOTAL_ROUNDS = coupleReflectionRounds.length;

