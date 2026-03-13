/**
 * Send a single email. Uses Resend if RESEND_API_KEY is set.
 * Set REMINDER_FROM_EMAIL (e.g. "Luma <reminders@yourdomain.com>") for sender.
 */

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REMINDER_FROM_EMAIL || "Luma <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[Reminder] RESEND_API_KEY not set; email not sent:", { to, subject });
    return { ok: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || res.statusText);
    }
    return await res.json();
  } catch (e) {
    console.error("[Reminder] Send failed:", e.message);
    throw e;
  }
}

module.exports = { sendEmail };
