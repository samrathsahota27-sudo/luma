export const JOURNEY_STEPS = [
  "Week 1: Awareness",
  "Week 2: Friction",
  "Week 3: Understanding",
  "Week 4: Reconnection",
  "Final: Reflection",
] as const;

export const JOURNEY_PROGRESS_STORAGE_KEY = "luma_couple_journey_step";

export function clampJourneyStep(step: number): number {
  return Math.max(0, Math.min(JOURNEY_STEPS.length - 1, Math.round(step)));
}

export function getJourneyStepFromPath(pathname: string): number {
  if (!pathname) return 0;

  if (pathname.startsWith("/translator") || pathname.startsWith("/mind")) return 0;
  if (pathname.startsWith("/date") || pathname.startsWith("/chat")) return 1;
  if (pathname.startsWith("/report")) return 2;
  if (pathname.startsWith("/map")) return 3;
  if (pathname.startsWith("/reflect") || pathname.startsWith("/test")) return 4;
  if (pathname.startsWith("/couple-hub")) return 0;

  return 0;
}

export function getWeekFromStep(step: number): number {
  return Math.min(4, clampJourneyStep(step) + 1);
}

export function getProgressPercentFromStep(step: number): number {
  const clamped = clampJourneyStep(step);
  if (clamped >= 4) return 100;
  return Math.round(((clamped + 1) / 4) * 100);
}

export function getNextStepLabel(step: number): string {
  const clamped = clampJourneyStep(step);
  if (clamped >= JOURNEY_STEPS.length - 1) {
    return "Final: Reflection";
  }
  return JOURNEY_STEPS[clamped + 1];
}
