import { NextResponse } from "next/server";
import { getStore } from "@/lib/referralStore";

/**
 * POST: Record that a referred user completed a reflection.
 * Body: { referrerSlug: string }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const referrerSlug = body?.referrerSlug?.trim();
    if (!referrerSlug) {
      return NextResponse.json(
        { error: "referrerSlug is required" },
        { status: 400 }
      );
    }
    const store = getStore();
    const list = store.get(referrerSlug) || [];
    list.push({ completedAt: Date.now() });
    store.set(referrerSlug, list);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Referral POST error:", e);
    return NextResponse.json({ error: "Could not record referral" }, { status: 500 });
  }
}
