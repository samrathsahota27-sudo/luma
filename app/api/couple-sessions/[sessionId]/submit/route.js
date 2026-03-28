import { NextResponse } from "next/server";
import { getCoupleSessionStore } from "@/lib/coupleSessionStore";

export async function POST(req, { params }) {
  try {
    const sessionId = await params.sessionId;
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const role = typeof body.role === "string" ? body.role.toLowerCase().trim() : "";
    if (role !== "a" && role !== "b") {
      return NextResponse.json({ error: 'role must be "a" or "b"' }, { status: 400 });
    }

    const answers = body.answers;
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "answers is required" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() || null : null;

    const store = getCoupleSessionStore();
    const session = store.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const slot = role === "a" ? "a" : "b";
    session[slot] = { answers, name, submittedAt: Date.now() };
    store.set(sessionId, session);

    const partnerAComplete = Boolean(session.a?.answers);
    const partnerBComplete = Boolean(session.b?.answers);

    return NextResponse.json({
      ok: true,
      partnerAComplete,
      partnerBComplete,
      readyForResult: partnerAComplete && partnerBComplete,
    });
  } catch (e) {
    console.error("couple-sessions submit:", e);
    return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
  }
}
