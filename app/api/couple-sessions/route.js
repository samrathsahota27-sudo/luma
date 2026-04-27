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

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    if (i === 3) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // Format: ABC-123
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

    let sessionId = null;
    let inviteCode = null;
    let lastError = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidateSessionId = buildSessionId();
      const candidateCode = generateInviteCode();
      const row = {
        id: candidateSessionId,
        partner_a: null,
        partner_b: null,
        status: "awaiting_partner",
        result_generated: false,
        result: null,
        invite_code: candidateCode,
      };
      const { error } = await supabase.from("couple_sessions").insert(row);
      if (!error) {
        sessionId = candidateSessionId;
        inviteCode = candidateCode;
        lastError = null;
        break;
      }
      lastError = error;
      if (error?.code !== "23505") break;
    }
    if (!sessionId || !inviteCode) {
      console.log("Supabase error:", lastError);
      throw lastError || new Error("Could not create session");
    }

    console.log(sessionId);

    return NextResponse.json({
      ok: true,
      sessionId,
      inviteCode,
      joinPath: `/couple/join?sessionId=${encodeURIComponent(sessionId)}`,
      codeJoinPath: `/couple/join?code=${inviteCode}`,
    });
  } catch (e) {
    console.error("couple-sessions create crash:", e);
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }
}
