import { parseInSimpleWordsFromApi as parseLinesFromPayload } from "@/lib/resultHelpers";

/** Normalize `inSimpleWords` / `simpleWords` from /api/generate or /api/analyze JSON. */
export function parseInSimpleWordsFromApi(data: unknown): string[] | null {
  const lines = parseLinesFromPayload(data);
  return lines.length > 0 ? lines.slice(0, 4) : null;
}
