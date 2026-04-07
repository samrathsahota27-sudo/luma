import { NextResponse } from "next/server";
import { getStore } from "@/lib/referralStore";

/**
 * GET: Return referral count for a slug (for optional reward / "X friends started").
 */
export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    }
    const store = getStore();
    const list = store.get(slug) || [];
    return NextResponse.json({ count: list.length });
  } catch (e) {
    console.error("Referral GET error:", e);
    return NextResponse.json({ error: "Could not fetch referral count" }, { status: 500 });
  }
}
