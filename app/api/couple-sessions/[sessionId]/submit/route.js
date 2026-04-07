import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req, { params }) {
  try {
    const { sessionId } = await params;
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));

    const answers = body.answers;
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "answers is required" }, { status: 400 });
    }
    const role = typeof body.role === "string" ? body.role : null;

    const name = typeof body.name === "string" ? body.name.trim() || null : null;
    const { data: session, error: getError } = await supabase
      .from("couple_sessions")
      .select("id, partner_a, partner_b, status")
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

    if (session.partner_a && session.partner_b) {
      return NextResponse.json({ error: "Session already completed" }, { status: 409 });
    }

    const updates =
      role === "partnerB"
        ? { partner_b: payload }
        : role === "partnerA"
          ? { partner_a: payload }
          : !session.partner_a
            ? { partner_a: payload }
            : { partner_b: payload };

    const { data: updated, error: updateError } = await supabase
      .from("couple_sessions")
      .update(updates)
      .eq("id", sessionId)
      .select("id, partner_a, partner_b, status")
      .single();

    if (updateError) {
      console.error("couple-sessions submit update:", updateError);
      return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
    }

    const partnerA = updated.partner_a ?? null;
    const partnerB = updated.partner_b ?? null;
    const partnerAComplete = Boolean(partnerA);
    const partnerBComplete = Boolean(partnerB);

    return NextResponse.json({
      ok: true,
      id: updated.id,
      status: updated.status ?? null,
      partnerA,
      partnerB,
      partnerAComplete,
      partnerBComplete,
      readyForResult: partnerAComplete && partnerBComplete,
    });
  } catch (e) {
    console.error("couple-sessions submit:", e);
    return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
  }
}
