/**
 * Client-only: call couple-analyze and shape payload for result page / sessionStorage.
 * @param {Record<number, unknown>} partnerA
 * @param {Record<number, unknown>} partnerB
 * @param {unknown} depthMode
 * @param {string | null | undefined} nameA
 * @param {string | null | undefined} nameB
 */
export async function runCoupleAnalyzeClient(partnerA, partnerB, depthMode, nameA, nameB) {
  const response = await fetch("/api/couple-analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ partnerA, partnerB, depthMode }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "AI generation failed");
  }
  const data = await response.json();
  return {
    result: data.result,
    brutalTruth: data.brutalTruth ?? null,
    emotionalTag: data.emotionalTag ?? null,
    trackerInsight: data.trackerInsight ?? null,
    dangerousQuestion: data.dangerousQuestion ?? null,
    shadowInsight: data.shadowInsight ?? null,
    mapReadInnerA: data.mapReadInnerA ?? null,
    mapReadInnerB: data.mapReadInnerB ?? null,
    mapReadBetween: data.mapReadBetween ?? null,
    conflictFrictionPoints: data.conflictFrictionPoints ?? null,
    innerWorldA: data.innerWorldA ?? null,
    innerWorldB: data.innerWorldB ?? null,
    spaceBetween: data.spaceBetween ?? null,
    calendarState: data.calendarState ?? null,
    nameA: nameA?.trim() ? nameA.trim() : null,
    nameB: nameB?.trim() ? nameB.trim() : null,
    partnerA,
    partnerB,
  };
}
