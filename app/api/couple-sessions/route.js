import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function buildSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST() {
  try {
    console.log("API HIT");
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase env vars");
    }

    if (!supabase) {
      throw new Error("Supabase client not initialized");
    }

    const sessionId = buildSessionId();
    console.log(sessionId);
    const row = {
      id: sessionId,
      partner_a: null,
      partner_b: null,
      status: "awaiting_partner",
    };

    const { error } = await supabase.from("couple_sessions").insert(row);
    if (error) {
      console.log("Supabase error:", error);
      throw error;
    }

    return NextResponse.json({
      ok: true,
      sessionId,
      joinPath: `/couple/join?sessionId=${encodeURIComponent(sessionId)}`,
    });
  } catch (e) {
    console.error("couple-sessions create crash:", e);
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }
}
