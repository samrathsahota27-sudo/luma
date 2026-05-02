import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ensureCoupleSessionResult } from "@/lib/coupleSessionResult";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req, { params }) {
  try {
    const { sessionId } = await params;
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    let user = null;
    try {
      const authSupabase = await createServerClient();
      const {
        data: { user: authUser },
      } = await authSupabase.auth.getUser();
      user = authUser ?? null;
    } catch {
      user = null;
    }

    const answers = body.answers;
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "answers is required" }, { status: 400 });
    }
    const role = typeof body.role === "string" ? body.role : null;
    const depthMode = body?.depthMode === "steel" ? "steel" : "satin";

    const name = typeof body.name === "string" ? body.name.trim() || null : null;
    const { data: session, error: getError } = await supabase
      .from("couple_sessions")
      .select("id, partner_a, partner_b, status, result, result_generated, user_a_id, user_b_id")
      .eq("id", sessionId)
      .maybeSingle();

    if (getError) {
      console.error("couple-sessions submit get:", getError);
      return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
    }
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 404 });
    }

    const payload = {
      answers,
      name,
      submittedAt: Date.now(),
    };

    if (session.result && typeof session.result === "object") {
      return NextResponse.json({
        ok: true,
        id: session.id,
        status: session.status ?? null,
        partnerA: session.partner_a ?? null,
        partnerB: session.partner_b ?? null,
        partnerAComplete: Boolean(session.partner_a),
        partnerBComplete: Boolean(session.partner_b),
        readyForResult: true,
        resultGenerated: true,
      });
    }

    const normalizedRole =
      role === "partnerA" || role === "partnerB"
        ? role
        : session.partner_a && !session.partner_b
          ? "partnerB"
          : !session.partner_a && session.partner_b
            ? "partnerA"
            : "partnerA";

    const updates = normalizedRole === "partnerB" ? { partner_b: payload } : { partner_a: payload };
    const updateData = {
      ...updates,
      ...(normalizedRole === "partnerB" ? { name_b: name } : { name_a: name }),
      ...(user && normalizedRole === "partnerB" ? { user_b_id: user.id } : {}),
      ...(user && normalizedRole === "partnerA" ? { user_a_id: user.id } : {}),
    };

    const { data: updated, error: updateError } = await supabase
      .from("couple_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select("id, partner_a, partner_b, status, result, result_generated, user_a_id, user_b_id")
      .single();

    if (updateError) {
      console.error("couple-sessions submit update:", updateError);
      return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
    }

    const partnerA = updated.partner_a ?? null;
    const partnerB = updated.partner_b ?? null;
    const partnerAComplete = Boolean(partnerA);
    const partnerBComplete = Boolean(partnerB);
    const bothSubmitted = partnerAComplete && partnerBComplete;

    if (user) {
      try {
        const authSupabase = await createServerClient();
        const adminSupabase = createSupabaseAdmin();
        const partnerUserId =
          normalizedRole === "partnerA" ? updated.user_b_id ?? null : updated.user_a_id ?? null;
        let partnerEmail = null;
        if (adminSupabase && partnerUserId) {
          const { data: partnerProfile } = await adminSupabase
            .from("user_profiles")
            .select("id, email")
            .eq("id", partnerUserId)
            .single();
          partnerEmail = partnerProfile?.email ?? null;
        }
        const { data: existingProfile } = await authSupabase
          .from("user_profiles")
          .select("couple_sessions")
          .eq("id", user.id)
          .single();
        const sessionRef = {
          session_id: sessionId,
          date: new Date().toISOString(),
          role: normalizedRole,
          partner_user_id: partnerUserId,
          partner_email: partnerEmail,
        };
        await authSupabase.from("user_profiles").upsert({
          id: user.id,
          email: user.email,
          couple_sessions: [...(existingProfile?.couple_sessions || []), sessionRef].slice(-20),
          last_updated: new Date().toISOString(),
        });

        if (adminSupabase && updated.user_a_id && updated.user_b_id) {
          const counterpartId = normalizedRole === "partnerA" ? updated.user_b_id : updated.user_a_id;
          const { data: counterpartProfile } = await adminSupabase
            .from("user_profiles")
            .select("couple_sessions, email")
            .eq("id", counterpartId)
            .single();

          const counterpartRole = normalizedRole === "partnerA" ? "partnerB" : "partnerA";
          const counterpartRef = {
            session_id: sessionId,
            date: new Date().toISOString(),
            role: counterpartRole,
            partner_user_id: user.id,
            partner_email: user.email ?? null,
          };

          const existingCounterpartSessions = Array.isArray(counterpartProfile?.couple_sessions)
            ? counterpartProfile.couple_sessions
            : [];
          const dedupedSessions = existingCounterpartSessions.filter(
            (entry) =>
              !(
                entry &&
                typeof entry === "object" &&
                entry.session_id === sessionId &&
                entry.role === counterpartRole
              )
          );

          await adminSupabase.from("user_profiles").upsert({
            id: counterpartId,
            email: counterpartProfile?.email ?? null,
            couple_sessions: [...dedupedSessions, counterpartRef].slice(-20),
            last_updated: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn("Profile update failed:", e?.message || e);
      }
    }

    let resultStatus = "waiting";
    if (updated.result && typeof updated.result === "object") {
      resultStatus = "ready";
    } else if (bothSubmitted) {
      try {
        const ensured = await ensureCoupleSessionResult(req, sessionId, depthMode);
        resultStatus = ensured.status;
      } catch (error) {
        console.error("couple-sessions submit ensure result:", error);
        return NextResponse.json({ error: "Could not generate result" }, { status: 500 });
      }
    }

    return NextResponse.json({
      ok: true,
      id: updated.id,
      status: updated.status ?? null,
      partnerA,
      partnerB,
      partnerAComplete,
      partnerBComplete,
      readyForResult: resultStatus === "ready",
      resultStatus,
      resultGenerated: resultStatus === "ready" || updated.result_generated === true,
    });
  } catch (e) {
    console.error("couple-sessions submit:", e);
    return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
  }
}
