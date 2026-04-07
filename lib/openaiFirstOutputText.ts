/**
 * Reads the first assistant text segment from an OpenAI Responses API result.
 * Skips non-message output items (e.g. tool calls) safely for typing.
 */
export function firstResponsesOutputText(response: { output?: unknown }): string {
  const out = response.output;
  if (!Array.isArray(out)) return "";
  for (const item of out) {
    if (!item || typeof item !== "object") continue;
    if (!("content" in item)) continue;
    const content = (item as { content: unknown }).content;
    if (!Array.isArray(content) || content.length === 0) continue;
    const piece = content[0];
    if (piece && typeof piece === "object" && "text" in piece) {
      const text = (piece as { text: unknown }).text;
      if (typeof text === "string") return text;
    }
  }
  return "";
}
