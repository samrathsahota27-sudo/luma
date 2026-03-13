/**
 * Centralized reflection test data.
 * Single source of truth for individual and couple reflection rounds.
 */

export const reflectionRounds = [
  {
    roundNumber: 1,
    question: "Which image reflects you the most right now?",
    reflectionLines: [
      "What feels most true about your current state?",
      "What emotion is strongest right now?",
      "What about this image feels familiar?",
    ],
    images: ["r1_a.jpg", "r1_b.jpg", "r1_c.jpg", "r1_d.jpg"],
  },
  {
    roundNumber: 2,
    question: "Which image creates a sense of discomfort or heaviness for you?",
    reflectionLines: [
      "Is the discomfort more mental or emotional?",
      "Do you avoid this feeling or face it often?",
      "What specifically makes this image feel difficult?",
    ],
    images: ["r2_a.jpg", "r2_b.jpg", "r2_c.jpg", "r2_d.jpg"],
  },
  {
    roundNumber: 3,
    question: "Which image feels closest to your current phase of movement?",
    reflectionLines: [
      "Does this feel slow, steady, or fast?",
      "Does this feel intentional or forced?",
      "Does this feel stable or uncertain?",
    ],
    images: ["r3_a.jpg", "r3_b.jpg", "r3_c.jpg", "r3_d.jpg"],
  },
  {
    roundNumber: 4,
    question: "Which image represents where you feel drawn to next?",
    reflectionLines: [
      "Does this feel peaceful or ambitious?",
      "Does this feel achievable right now?",
      "What would change in your life if this became real?",
    ],
    images: ["r4_a.jpg", "r4_b.jpg", "r4_c.jpg", "r4_d.jpg"],
  },
];

export const TOTAL_ROUNDS = reflectionRounds.length;
