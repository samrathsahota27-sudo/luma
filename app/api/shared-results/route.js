import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_JSON_BYTES = 512 * 1024;
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request) {
  try {
    const admin = createSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Sharing is not configured (missing SUPABASE_SERVICE_ROLE_KEY)." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => null);
    const resultJson = body?.resultJson ?? body?.result_json;
    if (resultJson == null || typeof resultJson !== "object") {
      return NextResponse.json({ error: "Invalid payload: resultJson required" }, { status: 400 });
    }

    const serialized = JSON.stringify(resultJson);
    if (serialized.length > MAX_JSON_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const expiresAt = new Date(Date.now() + TTL_MS).toISOString();

    const { data, error } = await admin
      .from("shared_results")
      .insert({
        result_json: resultJson,
        expires_at: expiresAt,
      })
      .select("id, expires_at")
      .single();

    if (error) {
      console.error("shared_results insert:", error);
      return NextResponse.json({ error: "Could not create share link" }, { status: 500 });
    }

    const origin =
      request.headers.get("x-forwarded-host") && request.headers.get("x-forwarded-proto")
        ? `${request.headers.get("x-forwarded-proto")}://${request.headers.get("x-forwarded-host")}`
        : request.headers.get("origin") || "";

    const path = `/shared/${data.id}`;
    const url = origin ? `${origin.replace(/\/$/, "")}${path}` : path;

    return NextResponse.json({
      id: data.id,
      expiresAt: data.expires_at,
      path,
      url: url.startsWith("http") ? url : null,
    });
  } catch (e) {
    console.error("shared-results POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
