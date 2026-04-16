import { NextResponse } from "next/server";
import { ensureCoupleSessionResult } from "@/lib/coupleSessionResult";

export async function GET(req, { params }) {
  try {
    const { sessionId } = await params;
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const depthMode = req.nextUrl.searchParams.get("dm") === "steel" ? "steel" : "satin";
    const ensured = await ensureCoupleSessionResult(req, sessionId, depthMode);

    if (ensured.status === "missing") {
      return NextResponse.json({ error: "Invalid session" }, { status: 404 });
    }
    if (ensured.status === "waiting") {
      return NextResponse.json({
        ok: true,
        status: "waiting",
        readyForResult: false,
      });
    }
    if (ensured.status === "generating") {
      return NextResponse.json(
        {
          ok: true,
          status: "generating",
          readyForResult: false,
        },
        { status: 202 }
      );
    }
    if (ensured.status === "ready" && ensured.payload) {
      return NextResponse.json({
        ok: true,
        status: "ready",
        readyForResult: true,
        resultGenerated: true,
        cached: ensured.cached === true,
        ...ensured.payload,
      });
    }
    return NextResponse.json({ error: "Could not generate result" }, { status: 500 });
  } catch (e) {
    console.error("couple-session result route:", e);
    return NextResponse.json({ error: "Could not generate result" }, { status: 500 });
  }
}
