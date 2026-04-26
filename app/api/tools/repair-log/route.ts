import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordFeatureUsage } from "@/lib/accountContext";

function safeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function safeNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const cycleId = safeString(body.cycleId) || null;
    const strategy = safeString(body.strategy) || "Conflict Replay";
    const note = safeString(body.note) || null;
    const outcomeRatingRaw = Number(body.outcomeRating);
    const outcomeRating =
      Number.isFinite(outcomeRatingRaw) && outcomeRatingRaw >= 1 && outcomeRatingRaw <= 5
        ? Math.round(outcomeRatingRaw)
        : null;

    const patternsJson =
      body.patternsJson && typeof body.patternsJson === "object" ? body.patternsJson : {};

    const row = {
      user_id: user.id,
      cycle_id: cycleId,
      strategy,
      outcome_rating: outcomeRating,
      note,
      patterns_json: patternsJson,
      drift_before: safeNumber(body.driftBefore),
      tension_before: safeNumber(body.tensionBefore),
      drift_after: safeNumber(body.driftAfter),
      tension_after: safeNumber(body.tensionAfter),
    };

    const { data, error } = await supabase.from("repair_logs").insert(row).select("id, created_at").single();
    if (error) throw error;

    await recordFeatureUsage({
      supabase,
      user,
      feature: "repair_log_added",
      input: {
        strategy,
        outcomeRating,
      },
      output: {
        repairLogId: data?.id || null,
      },
      metadata: { route: "/api/tools/repair-log" },
    });

    return NextResponse.json({ ok: true, repairLogId: data?.id || null });
  } catch (error) {
    console.error("repair-log POST error:", error);
    return NextResponse.json({ error: "Could not save repair log" }, { status: 500 });
  }
}
