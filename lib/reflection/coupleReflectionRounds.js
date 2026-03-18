import { reflectionRounds as baseReflectionRounds } from "./reflectionRounds";

export const coupleReflectionRounds = [
  ...baseReflectionRounds,
  {
    roundNumber: 5,
    question: "What does your relationship feel like right now?",
    tags: [],
    reflectionLines: [
      "What draws you into this image?",
      "What feels present here?",
      "What feels missing or distant?",
    ],
    // Environment-style symbolic options (existing assets).
    images: ["a.jpg", "b.jpg", "c.jpg", "d.jpg"],
  },
];

export const COUPLE_TOTAL_ROUNDS = coupleReflectionRounds.length;

