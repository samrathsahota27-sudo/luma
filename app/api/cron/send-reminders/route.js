import { NextResponse } from "next/server";
import { getStore } from "@/lib/reminderStore";
import { sendEmail } from "@/lib/email";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

function buildFirstReminderHtml(baseUrl) {
  const url = `${baseUrl}/individual`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #e8e4df; background: #050508; max-width: 480px; margin: 0 auto; padding: 28px 24px;">
  <p>Hello,</p>
  <p>Sometimes the quiet patterns inside us change without us noticing.</p>
  <p>Your last reflection was some time ago.</p>
  <p>You may discover something new today.</p>
  <p style="margin-top: 28px;">
    <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #e8e4df; color: #0a090c; text-decoration: none; border-radius: 12px; font-weight: 500; box-shadow: 0 12px 40px rgba(120, 90, 180, 0.25);">Begin Reflection</a>
  </p>
  <p style="margin-top: 32px; font-size: 14px; color: #a39a94;">Luma — a quiet space for noticing what moves within.</p>
</body>
</html>
  `.trim();
}

function buildSecondReminderHtml(baseUrl) {
  const url = `${baseUrl}/individual`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #e8e4df; background: #050508; max-width: 480px; margin: 0 auto; padding: 28px 24px;">
  <p>Your inner world may have moved in ways you haven't noticed yet.</p>
  <p>Take a moment to see what has changed.</p>
  <p style="margin-top: 28px;">
    <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #e8e4df; color: #0a090c; text-decoration: none; border-radius: 12px; font-weight: 500; box-shadow: 0 12px 40px rgba(120, 90, 180, 0.25);">Begin Reflection</a>
  </p>
  <p style="margin-top: 32px; font-size: 14px; color: #a39a94;">Luma — a quiet space for noticing what moves within.</p>
</body>
</html>
  `.trim();
}

async function runReminderJob() {

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      "https://luma.app";
    const origin = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;

    const store = getStore();
    const now = Date.now();
    let firstCount = 0;
    let secondCount = 0;

    for (const [key, entry] of store.entries()) {
      const last = new Date(entry.lastReflectionAt).getTime();
      const elapsed = now - last;

      if (elapsed >= FOURTEEN_DAYS_MS && entry.firstReminderSentAt && !entry.secondReminderSentAt) {
        try {
          await sendEmail({
            to: entry.email,
            subject: "A quiet moment for reflection",
            html: buildSecondReminderHtml(origin),
          });
          entry.secondReminderSentAt = new Date().toISOString();
          secondCount++;
        } catch (e) {
          console.error("Second reminder failed for", entry.email, e);
        }
        continue;
      }

      if (elapsed >= SEVEN_DAYS_MS && !entry.firstReminderSentAt) {
        try {
          await sendEmail({
            to: entry.email,
            subject: "Your inner landscape may have shifted",
            html: buildFirstReminderHtml(origin),
          });
          entry.firstReminderSentAt = new Date().toISOString();
          firstCount++;
        } catch (e) {
          console.error("First reminder failed for", entry.email, e);
        }
      }
    }

    return { ok: true, firstRemindersSent: firstCount, secondRemindersSent: secondCount };
}

function checkAuth(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return;
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    throw new Error("Unauthorized");
  }
}

/**
 * GET or POST: Run reminder job. Call from a cron (e.g. Vercel Cron) with CRON_SECRET in Authorization header.
 * Sends first reminder after 7 days, second after 14 days.
 */
export async function GET(req) {
  try {
    checkAuth(req);
    const result = await runReminderJob();
    return NextResponse.json(result);
  } catch (e) {
    if (e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Send reminders error:", e);
    return NextResponse.json({ error: "Reminder job failed" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    checkAuth(req);
    const result = await runReminderJob();
    return NextResponse.json(result);
  } catch (e) {
    if (e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Send reminders error:", e);
    return NextResponse.json({ error: "Reminder job failed" }, { status: 500 });
  }
}
