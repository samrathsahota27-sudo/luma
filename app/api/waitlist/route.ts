import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Waitlist is not configured (missing SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const obj = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const raw = obj.email;
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const rawSource = obj.source;
  let source =
    typeof rawSource === "string" ? rawSource.trim().slice(0, 120) : "";
  if (!source) source = "unknown";

  const { error } = await admin.from("waitlist").insert({ email, source });

  // Unique violation → still success (do not reveal whether email existed)
  if (error && error.code !== "23505") {
    console.error("waitlist insert:", error);
    return NextResponse.json({ error: "Could not save. Try again later." }, { status: 500 });
  }

  const message =
    source === "pricing-pro" || source.startsWith("pricing")
      ? "You're on the list — we'll reach out when Pro launches."
      : "You're on the list — we'll let you know when new features ship.";

  return NextResponse.json({
    ok: true,
    message,
  });
}
