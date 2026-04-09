import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date().toISOString();

    const { data: existing } = await supabase.from("user_profiles").select("id").eq("id", user.id).maybeSingle();

    const writeRes = existing
      ? await supabase
          .from("user_profiles")
          .update({ reflection_reminder_requested_at: now, last_updated: now })
          .eq("id", user.id)
      : await supabase.from("user_profiles").insert({
          id: user.id,
          email: user.email ?? null,
          reflection_reminder_requested_at: now,
          last_updated: now,
        });
    const { error } = writeRes;

    if (error) {
      console.error("reflection-reminder write:", error);
      return NextResponse.json({ error: "Could not save reminder" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reflection_reminder_requested_at: now });
  } catch (e) {
    console.error("reflection-reminder:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
