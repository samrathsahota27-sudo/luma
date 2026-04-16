import { supabase } from "@/lib/supabase";

function buildResultBundle(analyzed, sessionId, createdAt, session) {
  const partnerAData = session.partner_a?.answers ?? null;
  const partnerBData = session.partner_b?.answers ?? null;
  const nameA = session.partner_a?.name ?? null;
  const nameB = session.partner_b?.name ?? null;

  return {
    sessionId,
    created_at: createdAt,
    result: analyzed.result,
    brutalTruth: analyzed.brutalTruth ?? null,
    emotionalTag: analyzed.emotionalTag ?? null,
    trackerInsight: analyzed.trackerInsight ?? null,
    dangerousQuestion: analyzed.dangerousQuestion ?? null,
    shadowInsight: analyzed.shadowInsight ?? null,
    mapReadInnerA: analyzed.mapReadInnerA ?? null,
    mapReadInnerB: analyzed.mapReadInnerB ?? null,
    mapReadBetween: analyzed.mapReadBetween ?? null,
    conflictFrictionPoints: analyzed.conflictFrictionPoints ?? null,
    innerWorldA: analyzed.innerWorldA ?? null,
    innerWorldB: analyzed.innerWorldB ?? null,
    spaceBetween: analyzed.spaceBetween ?? null,
    imageInterpretA: analyzed.imageInterpretA ?? null,
    imageInterpretB: analyzed.imageInterpretB ?? null,
    imageInterpretBetween: analyzed.imageInterpretBetween ?? null,
    weeklyShiftInsight: analyzed.weeklyShiftInsight ?? null,
    calendarState: analyzed.calendarState ?? null,
    structured: analyzed.structured ?? null,
    nameA,
    nameB,
    partnerA: partnerAData,
    partnerB: partnerBData,
  };
}

async function readSession(sessionId) {
  const { data, error } = await supabase
    .from("couple_sessions")
    .select("id, partner_a, partner_b, result, result_generated")
    .eq("id", sessionId)
    .maybeSingle();
  return { data, error };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function ensureCoupleSessionResult(req, sessionId, depthMode = "satin") {
  const initial = await readSession(sessionId);
  if (initial.error) {
    throw new Error("Could not load session");
  }
  if (!initial.data) {
    return { status: "missing" };
  }

  if (initial.data.result && typeof initial.data.result === "object") {
    return { status: "ready", cached: true, payload: initial.data.result };
  }

  if (!initial.data.partner_a || !initial.data.partner_b) {
    return { status: "waiting" };
  }

  const claimAt = new Date().toISOString();
  const { data: claimed, error: claimError } = await supabase
    .from("couple_sessions")
    .update({ result_generated: true })
    .eq("id", sessionId)
    .eq("result_generated", false)
    .is("result", null)
    .select("id, partner_a, partner_b, result, result_generated")
    .maybeSingle();

  if (claimError) {
    throw new Error("Could not claim generation");
  }

  if (!claimed) {
    for (let i = 0; i < 20; i += 1) {
      await sleep(250);
      const next = await readSession(sessionId);
      if (next.data?.result && typeof next.data.result === "object") {
        return { status: "ready", cached: true, payload: next.data.result };
      }
      if (next.data?.result_generated !== true) {
        break;
      }
    }
    return { status: "generating" };
  }

  const nameA = claimed.partner_a?.name ?? null;
  const nameB = claimed.partner_b?.name ?? null;
  const partnerA = claimed.partner_a?.answers ?? null;
  const partnerB = claimed.partner_b?.answers ?? null;
  const origin = req.nextUrl.origin;

  try {
    const analyzeResponse = await fetch(`${origin}/api/couple-analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerA,
        partnerB,
        depthMode,
        nameA,
        nameB,
      }),
    });
    const analyzed = await analyzeResponse.json().catch(() => ({}));
    if (!analyzeResponse.ok) {
      throw new Error(analyzed.error || "AI generation failed");
    }

    const bundle = buildResultBundle(analyzed, sessionId, claimAt, claimed);

    const { data: updated, error: saveError } = await supabase
      .from("couple_sessions")
      .update({
        result: bundle,
        result_generated: true,
      })
      .eq("id", sessionId)
      .is("result", null)
      .select("result")
      .maybeSingle();

    if (saveError) {
      throw new Error("Could not save generated result");
    }
    if (updated?.result && typeof updated.result === "object") {
      return { status: "ready", cached: false, payload: updated.result };
    }

    const latest = await readSession(sessionId);
    if (latest.data?.result && typeof latest.data.result === "object") {
      return { status: "ready", cached: true, payload: latest.data.result };
    }
    throw new Error("Could not persist generated result");
  } catch (error) {
    await supabase
      .from("couple_sessions")
      .update({ result_generated: false })
      .eq("id", sessionId)
      .is("result", null);
    throw error;
  }
}
