import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getInviteStore } from "@/lib/inviteStore";

function generateInviteId() {
  return randomBytes(16).toString("hex");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { fromReflectionContent, toEmail } = body;

    if (!fromReflectionContent || typeof fromReflectionContent !== "string") {
      return NextResponse.json(
        { error: "fromReflectionContent is required" },
        { status: 400 }
      );
    }
    if (!toEmail || typeof toEmail !== "string" || !toEmail.trim()) {
      return NextResponse.json(
        { error: "toEmail is required" },
        { status: 400 }
      );
    }

    const inviteId = generateInviteId();
    const inviteStore = getInviteStore();
    inviteStore.set(inviteId, {
      fromReflectionContent,
      toEmail: toEmail.trim(),
      createdAt: Date.now(),
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      (req.headers.get("x-forwarded-host") && `https://${req.headers.get("x-forwarded-host")}`) ||
      "http://localhost:3000";
    const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
    const inviteLink = `${origin}/connect/accept?invite=${inviteId}`;

    return NextResponse.json({ inviteId, inviteLink });
  } catch (error) {
    console.error("Invites POST error:", error);
    return NextResponse.json(
      { error: "Could not create invite" },
      { status: 500 }
    );
  }
}
