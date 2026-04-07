import { coupleReflectionRounds } from "@/lib/reflection/coupleReflectionRounds";
import { QUESTIONS } from "@/lib/testConfig";

export const questions = Object.fromEntries(
  coupleReflectionRounds.map((r) => [
    r.roundNumber,
    r.roundNumber >= 1 && r.roundNumber <= 4
      ? QUESTIONS[r.roundNumber - 1]
      : r.question,
  ])
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

