import { NextResponse } from "next/server";
import { getStore } from "@/lib/reminderStore";

/**
 * POST: Register (or update) a user for reminder emails.
 * Body: { email: string, lastReflectionAt: string (ISO date) }
 * When user saves their reflection with email, call this so we can send 7-day / 14-day reminders.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const email = body?.email?.trim();
    const lastReflectionAt = body?.lastReflectionAt;

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }
    if (!lastReflectionAt || typeof lastReflectionAt !== "string") {
      return NextResponse.json({ error: "lastReflectionAt (ISO date) is required" }, { status: 400 });
    }

    const key = email.toLowerCase();
    const store = getStore();
    store.set(key, {
      email: key,
      lastReflectionAt,
      firstReminderSentAt: null,
      secondReminderSentAt: null,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Reminder register error:", e);
    return NextResponse.json({ error: "Could not register" }, { status: 500 });
  }
}
