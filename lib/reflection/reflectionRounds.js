/**
 * Centralized reflection test data.
 * Single source of truth for individual reflection rounds (5 rounds).
 */

import { round5ImageFilenames, ROUND_FIVE_TITLE } from "./round5Images";

export const reflectionRounds = [
  {
    roundNumber: 1,
    question: "How things feel lately",
    tags: ["Busy", "Calm", "Overwhelming", "Still", "Heavy", "Light"],
    reflectionLines: [
      "What feels most true about your current state?",
      "What emotion is strongest right now?",
      "What about this image feels familiar?",
    ],
    images: ["r1_a.jpg", "r1_b.jpg", "r1_c.jpg", "r1_d.jpg"],
  },
  {
    roundNumber: 2,
    question: "What’s beneath the surface",
    tags: ["Hidden", "Unclear", "Tense", "Quiet", "Conflicted", "Numb"],
    reflectionLines: [
      "Is the discomfort more mental or emotional?",
      "Do you avoid this feeling or face it often?",
      "What specifically makes this image feel difficult?",
    ],
    images: ["r2_a.jpg", "r2_b.jpg", "r2_c.jpg", "r2_d.jpg"],
  },
  {
    roundNumber: 3,
    question: "How you relate to yourself",
    tags: ["Kind", "Critical", "Distant", "Connected", "Confused", "Aware"],
    reflectionLines: [
      "Does this feel slow, steady, or fast?",
      "Does this feel intentional or forced?",
      "Does this feel stable or uncertain?",
    ],
    images: ["r3_a.jpg", "r3_b.jpg", "r3_c.jpg", "r3_d.jpg"],
  },
  {
    roundNumber: 4,
    question: "What you might need right now",
    tags: ["Rest", "Clarity", "Support", "Space", "Expression", "Direction"],
    reflectionLines: [
      "Does this feel peaceful or ambitious?",
      "Does this feel achievable right now?",
      "What would change in your life if this became real?",
    ],
    images: ["r4_a.jpg", "r4_b.jpg", "r4_c.jpg", "r4_d.jpg"],
  },
  {
    roundNumber: 5,
    question: ROUND_FIVE_TITLE,
    spaceBetweenRound: true,
    tags: [],
    reflectionLines: [
      "What does this suggest about closeness or distance with someone who matters?",
    ],
    images: round5ImageFilenames,
  },
];

/** Full reflection config length (includes round 5 — “space between” / relational). */
export const TOTAL_ROUNDS = reflectionRounds.length;

/** Individual reflection: rounds 1–4 only; round 5 is for couple / extended flows. */
export const INDIVIDUAL_TOTAL_ROUNDS = 4;
