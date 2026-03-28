export const defaultMemory = {
  profile: {
    userName: "",
    partnerName: "",
  },

  reflections: [],

  conflicts: [],

  patterns: {
    communication: [],
    emotionalTrends: [],
  },

  scores: {
    connection: 0,
    conflict: 0,
    distance: 0,
  },

  timeline: [],

  /** Local emotional tracker snapshots (tag, insight, time); capped in code. */
  emotionTracker: [],
};

