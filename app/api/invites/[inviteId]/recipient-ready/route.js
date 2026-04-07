import { NextResponse } from "next/server";
import { getInviteStore } from "@/lib/inviteStore";

/**
 * Partner signals they have a saved reflection and are on the accept flow.
 * Inviter can poll GET /api/invites/[id] for recipientReady (no PII).
 */
export async function POST(_req, { params }) {
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

    if (!invite.recipientReadyAt) {
      invite.recipientReadyAt = Date.now();
      inviteStore.set(inviteId, invite);
    }

    return NextResponse.json({ ok: true, recipientReady: true });
  } catch (error) {
    console.error("recipient-ready error:", error);
    return NextResponse.json({ error: "Could not update invite" }, { status: 500 });
  }
}
