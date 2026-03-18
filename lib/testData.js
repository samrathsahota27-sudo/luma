/**
 * @deprecated Prefer importing from @/lib/reflection/reflectionRounds
 * Re-exports for backward compatibility with existing test and couple pages.
 */
import { reflectionRounds } from "@/lib/reflection/reflectionRounds";

export const questions = Object.fromEntries(
  reflectionRounds.map((r) => [r.roundNumber, r.question])
);
export const rounds = Object.fromEntries(
  reflectionRounds.map((r) => [r.roundNumber, r.images])
);
export const reflectionLines = Object.fromEntries(
  reflectionRounds.map((r) => [r.roundNumber, r.reflectionLines])
);
export const roundTags = Object.fromEntries(
  reflectionRounds.map((r) => [r.roundNumber, r.tags ?? []])
);

export { reflectionRounds } from "@/lib/reflection/reflectionRounds";
