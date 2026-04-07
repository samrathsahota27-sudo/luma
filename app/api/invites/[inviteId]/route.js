import { NextResponse } from "next/server";
import { getInviteStore } from "@/lib/inviteStore";

export async function GET(req, { params }) {
  try {
    const { inviteId } = await params;
    if (!inviteId) {
      return NextResponse.json({ error: "Invite ID required" }, { status: 400 });
    }

    const inviteStore = getInviteStore();
    const invite = inviteStore.get(inviteId);
    if (!invite) {
      return NextResponse.json({ error: "Invite not found or expired" }, { status: 404 });
    }

    return NextResponse.json({
      fromReflectionContent: invite.fromReflectionContent,
      toEmail: invite.toEmail,
      recipientReady: Boolean(invite.recipientReadyAt),
    });
  } catch (error) {
    console.error("Invites GET error:", error);
    return NextResponse.json(
      { error: "Could not fetch invite" },
      { status: 500 }
    );
  }
}
