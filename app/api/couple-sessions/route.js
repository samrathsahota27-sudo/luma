import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getCoupleSessionStore } from "@/lib/coupleSessionStore";

function publicOrigin(req) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    (req.headers.get("x-forwarded-host") && `https://${req.headers.get("x-forwarded-host")}`) ||
    "http://localhost:3000";
  return baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
}

export async function POST(req) {
  try {
    const sessionId = randomBytes(14).toString("hex");
    const store = getCoupleSessionStore();
    store.set(sessionId, {
      createdAt: Date.now(),
      a: null,
      b: null,
    });

    const origin = publicOrigin(req);
    const joinUrl = `${origin}/couple/join?session=${sessionId}`;

    return NextResponse.json({ sessionId, joinUrl });
  } catch (e) {
    console.error("couple-sessions POST:", e);
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }
}
