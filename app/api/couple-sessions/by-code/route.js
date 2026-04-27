import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("couple_sessions")
      .select("id, status, partner_a, partner_b, result_generated, invite_code")
      .eq("invite_code", code)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid code" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      sessionId: data.id,
      status: data.status,
      readyForResult: data.result_generated || (!!data.partner_a && !!data.partner_b),
    });
  } catch {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }
}
