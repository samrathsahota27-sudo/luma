import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function buildResultBundle(analyzed, partnerAData, partnerBData, nameA, nameB) {
  return {
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
    calendarState: analyzed.calendarState ?? null,
    structured: analyzed.structured ?? null,
    nameA,
    nameB,
    partnerA: partnerAData,
    partnerB: partnerBData,
  };
}

async function generateViaAnalyzeApi(req, session, depthMode) {
  const partnerAData = session.partner_a?.answers;
  const partnerBData = session.partner_b?.answers;
  const nameA = session.partner_a?.name ?? null;
  const nameB = session.partner_b?.name ?? null;
  const origin = req.nextUrl.origin;

  const response = await fetch(`${origin}/api/couple-analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partnerA: partnerAData,
      partnerB: partnerBData,
      depthMode,
      nameA,
      nameB,
    }),
  });
  const analyzed = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(analyzed.error || "AI generation failed");
  }

  return buildResultBundle(analyzed, partnerAData, partnerBData, nameA, nameB);
}

function isStaleGenerationLock(generatedAtIso) {
  if (!generatedAtIso) return false;
  const t = Date.parse(generatedAtIso);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t > 2 * 60 * 1000;
}

async function readSession(sessionId) {
  return supabase
    .from("couple_sessions")
    .select("id, partner_a, partner_b, result, generated_at")
    .eq("id", sessionId)
    .maybeSingle();
}

async function clearResultCache(sessionId) {
  return supabase
    .from("couple_sessions")
    .update({ result: null, generated_at: null })
    .eq("id", sessionId);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(req, { params }) {
  try {
    const { sessionId } = await params;
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const depthMode = req.nextUrl.searchParams.get("dm") || "satin";
    const { data: sessionInit, error: getError } = await readSession(sessionId);
    let session = sessionInit;

    if (getError) {
      console.error("couple-session result get:", getError);
      return NextResponse.json({ error: "Could not load session" }, { status: 500 });
    }
    if (!sessionInit) {
      return NextResponse.json({ error: "Invalid session" }, { status: 404 });
    }

    if (session.result && typeof session.result === "object") {
      // Re-generate if the cached result is missing the structured deep-insight fields
      // (results stored before `structured` was added to buildResultBundle).
      const s = session.result.structured;
      const hasDeepInsights =
        s &&
        typeof s === "object" &&
        (Array.isArray(s.differences) ||
          Array.isArray(s.frictionMap) ||
          Array.isArray(s.riskPatterns) ||
          Array.isArray(s.whatHelps) ||
          s.partnerDecoder ||
          s.decoder);

      if (hasDeepInsights) {
        return NextResponse.json({
          ok: true,
          status: "ready",
          readyForResult: true,
          generatedAt: session.generated_at ?? null,
          cached: true,
          ...session.result,
        });
      }

      // Structured data missing — clear the cached result so it regenerates below.
      await clearResultCache(sessionId);
      session = { ...session, result: null, generated_at: null };
    }

    if (!session.partner_a || !session.partner_b) {
      return NextResponse.json({
        ok: true,
        status: "waiting",
        readyForResult: false,
      });
    }

    if (session.generated_at && !session.result && isStaleGenerationLock(session.generated_at)) {
      await supabase
        .from("couple_sessions")
        .update({ generated_at: null })
        .eq("id", sessionId)
        .is("result", null);
    }

    const claimAt = new Date().toISOString();
    const { data: claimRow, error: claimError } = await supabase
      .from("couple_sessions")
      .update({ generated_at: claimAt })
      .eq("id", sessionId)
      .is("result", null)
      .is("generated_at", null)
      .select("id, partner_a, partner_b, result, generated_at")
      .maybeSingle();

    if (claimError) {
      console.error("couple-session result claim:", claimError);
      return NextResponse.json({ error: "Could not generate result" }, { status: 500 });
    }

    if (!claimRow) {
      for (let i = 0; i < 20; i += 1) {
        await sleep(300);
        const { data: fresh } = await readSession(sessionId);
        if (fresh?.result) {
          return NextResponse.json({
            ok: true,
            status: "ready",
            readyForResult: true,
            generatedAt: fresh.generated_at ?? null,
            cached: true,
            ...fresh.result,
          });
        }
      }
      return NextResponse.json(
        {
          ok: true,
          status: "generating",
          readyForResult: false,
        },
        { status: 202 }
      );
    }

    const generatedResult = await generateViaAnalyzeApi(req, claimRow, depthMode);

    const { data: updated, error: updateError } = await supabase
      .from("couple_sessions")
      .update({
        result: generatedResult,
      })
      .eq("id", sessionId)
      .eq("generated_at", claimAt)
      .is("result", null)
      .select("result, generated_at")
      .maybeSingle();

    if (updateError) {
      console.error("couple-session result save:", updateError);
      await supabase
        .from("couple_sessions")
        .update({ generated_at: null })
        .eq("id", sessionId)
        .eq("generated_at", claimAt)
        .is("result", null);
      return NextResponse.json({ error: "Could not generate result" }, { status: 500 });
    }

    if (updated?.result) {
      return NextResponse.json({
        ok: true,
        status: "ready",
        readyForResult: true,
        generatedAt: updated.generated_at ?? claimAt,
        cached: false,
        ...updated.result,
      });
    }

    const { data: fresh } = await supabase
      .from("couple_sessions")
      .select("result, generated_at")
      .eq("id", sessionId)
      .maybeSingle();

    if (fresh?.result) {
      return NextResponse.json({
        ok: true,
        status: "ready",
        readyForResult: true,
        generatedAt: fresh.generated_at ?? null,
        cached: true,
        ...fresh.result,
      });
    }

    return NextResponse.json({
      ok: true,
      status: "ready",
      readyForResult: true,
      generatedAt: claimAt,
      cached: true,
      ...generatedResult,
    });
  } catch (e) {
    console.error("couple-session result route:", e);
    return NextResponse.json({ error: "Could not generate result" }, { status: 500 });
  }
}
