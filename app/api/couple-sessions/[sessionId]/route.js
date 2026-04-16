import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_req, { params }) {
  try {
    const { sessionId } = await params;
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("couple_sessions")
      .select("id, partner_a, partner_b, status, result, result_generated")
      .eq("id", sessionId)
      .maybeSingle();

    if (error) {
      console.error("couple-sessions get:", error);
      return NextResponse.json({ error: "Could not load session" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Invalid session" }, { status: 404 });
    }

    const partnerA = data.partner_a ?? null;
    const partnerB = data.partner_b ?? null;
    const hasResult = Boolean(data.result && typeof data.result === "object");
    const bothSubmitted = Boolean(partnerA) && Boolean(partnerB);

    return NextResponse.json({
      id: data.id,
      status: data.status ?? null,
      partnerA,
      partnerB,
      partnerAComplete: Boolean(partnerA),
      partnerBComplete: Boolean(partnerB),
      bothSubmitted,
      hasResult,
      resultGenerated: data.result_generated === true,
      readyForResult: hasResult,
    });
  } catch (e) {
    console.error("couple-sessions get crash:", e);
    return NextResponse.json({ error: "Could not load session" }, { status: 500 });
  }
}
