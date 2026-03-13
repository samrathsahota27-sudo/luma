/**
 * Generates a short Reflection Mirror message by comparing previous and current reflection text.
 * No AI — uses simple heuristics (length, word count) to produce a calm comparison.
 */

export function getReflectionMirrorMessage(previousContent: string, currentContent: string): string {
  if (!previousContent?.trim() || !currentContent?.trim()) {
    return "Your previous reflection and this one offer two snapshots of your inner landscape. Notice what feels similar or different.";
  }

  const prevLen = previousContent.replace(/\s+/g, " ").trim().length;
  const currLen = currentContent.replace(/\s+/g, " ").trim().length;
  const prevWords = previousContent.trim().split(/\s+/).length;
  const currWords = currentContent.trim().split(/\s+/).length;

  const ratio = currLen / (prevLen || 1);
  const wordRatio = currWords / (prevWords || 1);

  if (ratio >= 1.3 || wordRatio >= 1.3) {
    return "Your previous reflection suggested a quieter inner landscape. In this reflection your attention appears drawn toward more open imagery.";
  }
  if (ratio <= 0.7 || wordRatio <= 0.7) {
    return "Your previous reflection explored more. This one holds a more contained focus.";
  }
  return "Your previous reflection and this one offer two snapshots of your inner landscape. Notice what feels similar or different.";
}
