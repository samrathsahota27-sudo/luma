import { NextResponse } from "next/server";
import { getCoupleSessionStore } from "@/lib/coupleSessionStore";

export async function GET(_req, { params }) {
  try {
    const sessionId = await params.sessionId;
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const store = getCoupleSessionStore();
    const session = store.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const partnerAComplete = Boolean(session.a?.answers);
    const partnerBComplete = Boolean(session.b?.answers);
    const readyForResult = partnerAComplete && partnerBComplete;

    const body = {
      partnerAComplete,
      partnerBComplete,
      readyForResult,
    };

    if (readyForResult) {
      body.partnerA = session.a.answers;
      body.partnerB = session.b.answers;
      body.nameA = session.a.name ?? null;
      body.nameB = session.b.name ?? null;
    }

    return NextResponse.json(body);
  } catch (e) {
    console.error("couple-sessions GET:", e);
    return NextResponse.json({ error: "Could not load session" }, { status: 500 });
  }
}
