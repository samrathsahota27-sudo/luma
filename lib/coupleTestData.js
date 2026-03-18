import { coupleReflectionRounds } from "@/lib/reflection/coupleReflectionRounds";

export const questions = Object.fromEntries(
  coupleReflectionRounds.map((r) => [r.roundNumber, r.question])
);

export const rounds = Object.fromEntries(
  coupleReflectionRounds.map((r) => [r.roundNumber, r.images])
);

export const reflectionLines = Object.fromEntries(
  coupleReflectionRounds.map((r) => [r.roundNumber, r.reflectionLines])
);

export const roundTags = Object.fromEntries(
  coupleReflectionRounds.map((r) => [r.roundNumber, r.tags ?? []])
);

export { coupleReflectionRounds };

