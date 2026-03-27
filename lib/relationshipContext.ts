/* Client-side relationship context builder (localStorage-backed). */

import {
  getCurrentUserName,
  getIndividualReflectionCount,
  getLastIndividualReflection,
} from "@/lib/reflectionStorage";
import { JOURNEY_PROGRESS_STORAGE_KEY, clampJourneyStep, JOURNEY_STEPS } from "@/lib/coupleJourney";
import { getMemory } from "@/lib/memory";

export type RelationshipContextFeature =
  | "chat"
  | "translate"
  | "mind"
  | "date"
  | "report"
  | "generate"
  | "futurePaths";

const USAGE_KEY = "luma_usage";
const PROFILE_KEY = "luma_profile";

type UsageStore = Record<
  string,
  {
    count: number;
    lastUsedAt?: string;
  }
>;

function loadUsage(): UsageStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as UsageStore) : {};
  } catch {
    return {};
  }
}

function saveUsage(store: UsageStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function recordFeatureUse(feature: RelationshipContextFeature) {
  const store = loadUsage();
  const current = store[feature] ?? { count: 0 };
  store[feature] = {
    count: (current.count ?? 0) + 1,
    lastUsedAt: new Date().toISOString(),
  };
  saveUsage(store);
}

function safeJourneyStep(): number {
  if (typeof window === "undefined") return 0;
  try {
    const saved = Number(localStorage.getItem(JOURNEY_PROGRESS_STORAGE_KEY) ?? "0");
    return clampJourneyStep(saved);
  } catch {
    return 0;
  }
}

function loadProfile(): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function buildRelationshipContext(feature: RelationshipContextFeature) {
  const journeyStep = safeJourneyStep();
  const usage = loadUsage();
  const last = getLastIndividualReflection();
  const memory = getMemory();
  const profile = (memory && typeof memory === "object" && (memory as any).profile) ? (memory as any).profile : loadProfile();

  // Keep these grounded in stored signals. Unknown stays null rather than guessing.
  const context = {
    feature,
    memory,
    profile,
    userProfile: {
      name: getCurrentUserName(),
      personalityTraits: null as null | string[],
    },
    partnerProfile: {
      name: null as null | string,
      personalityTraits: null as null | string[],
    },
    relationshipState: {
      journeyStep,
      journeyLabel: JOURNEY_STEPS[journeyStep] ?? JOURNEY_STEPS[0],
      connection:
        typeof (profile as any)?.connection === "number"
          ? (profile as any).connection
          : typeof (memory as any)?.relationship?.connection === "number"
            ? (memory as any).relationship.connection
            : null,
      conflict:
        typeof (profile as any)?.conflict === "number"
          ? (profile as any).conflict
          : typeof (memory as any)?.relationship?.conflict === "number"
            ? (memory as any).relationship.conflict
            : null,
      connectionLevel: null as null | "low" | "medium" | "high",
      conflictTrend: null as null | "decreasing" | "stable" | "increasing",
    },
    recentBehavior: {
      lastInteraction: last?.date ?? null,
      lastReflectionExcerpt: typeof last?.content === "string" ? last.content.slice(0, 600) : null,
      usagePattern: usage,
      reflectionCount: getIndividualReflectionCount(),
    },
  };

  return context;
}

