import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ReflectionRecord = {
  date?: string;
  created_at?: string;
  pattern?: string;
};

function toDayKey(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim();
  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  const ts = Date.parse(`${raw}T00:00:00.000Z`);
  if (!Number.isNaN(ts)) return new Date(ts).toISOString().slice(0, 10);
  return null;
}

function buildDateKeys(records: ReflectionRecord[] | null | undefined): string[] {
  if (!Array.isArray(records)) return [];
  return records
    .map((entry) => toDayKey(entry?.date || entry?.created_at || null))
    .filter(Boolean) as string[];
}

function getCycleWeek(startDate: unknown) {
  if (typeof startDate !== "string" || !startDate.trim()) return 1;
  const startTs = Date.parse(`${startDate.trim()}T00:00:00.000Z`);
  if (!Number.isFinite(startTs)) return 1;
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const elapsedDays = Math.max(0, Math.floor((todayUtc - startTs) / 86400000));
  return Math.max(1, Math.min(4, Math.floor(elapsedDays / 7) + 1));
}

function getCurrentStreak(uniqueDayKeys: string[]) {
  if (uniqueDayKeys.length === 0) return 0;
  const set = new Set(uniqueDayKeys);
  const today = new Date();
  const base = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const todayKey = new Date(base).toISOString().slice(0, 10);
  if (!set.has(todayKey)) return 0;

  let streak = 0;
  let cursor = base;
  while (true) {
    const key = new Date(cursor).toISOString().slice(0, 10);
    if (!set.has(key)) break;
    streak += 1;
    cursor -= 86400000;
  }
  return streak;
}

function toUtcTsFromKey(dayKey: string | null) {
  if (!dayKey) return null;
  const ts = Date.parse(`${dayKey}T00:00:00.000Z`);
  return Number.isFinite(ts) ? ts : null;
}

function daysBetweenUtc(fromKey: string | null, toKey: string) {
  const fromTs = toUtcTsFromKey(fromKey);
  const toTs = toUtcTsFromKey(toKey);
  if (!fromTs || !toTs) return null;
  return Math.floor((toTs - fromTs) / 86400000);
}

function latestPatternLabel(patternHistory: ReflectionRecord[] | null | undefined) {
  if (!Array.isArray(patternHistory) || patternHistory.length === 0) return null;
  const latest = patternHistory[patternHistory.length - 1] as Record<string, unknown>;
  const fromPattern = typeof latest?.pattern === "string" ? latest.pattern.trim() : "";
  if (fromPattern) return fromPattern;
  const fromLine = typeof latest?.core_line === "string" ? latest.core_line.trim() : "";
  return fromLine || null;
}

function completionMessage(percent: number) {
  if (percent <= 0) return "Let's strengthen your mirror.";
  if (percent >= 100) return "Your mirror is complete. Beautiful work together.";
  if (percent < 40) return "You're building the foundation of your shared mirror.";
  if (percent < 80) return "Your mirror is taking shape with every detail you add.";
  return "You are close to a fully personalized mirror experience.";
}

function personalizationNote(nextMissing: string | null) {
  if (!nextMissing) return "Your profile context is fully available for personalized Mirror Questions.";
  if (nextMissing === "anniversary")
    return "Adding anniversary helps tailor special Mirror Questions for meaningful dates.";
  if (nextMissing === "birthday")
    return "Adding birthdays helps tune timing and emotional prompts with more care.";
  if (nextMissing === "photo")
    return "Adding a profile photo strengthens warmth and identity in shared spaces.";
  if (nextMissing === "joint_reflection")
    return "Completing one joint reflection helps calibrate your couple-level pattern model.";
  return "Answering onboarding goals helps personalize guidance to your exact relationship intentions.";
}

function countPatternShifts(patternHistory: ReflectionRecord[] | null | undefined) {
  if (!Array.isArray(patternHistory) || patternHistory.length === 0) return 0;
  const distinct = new Set(
    patternHistory
      .map((entry) => (typeof entry?.pattern === "string" ? entry.pattern.trim() : ""))
      .filter(Boolean)
  );
  return Math.max(0, distinct.size - 1);
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ data: profile }, { data: tonightLogs }] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("tonight_mirror_logs")
        .select("question_date, created_at")
        .eq("user_id", user.id)
        .order("question_date", { ascending: false })
        .limit(90),
    ]);

    const individual = Array.isArray(profile?.pattern_history) ? profile.pattern_history : [];
    const joint = Array.isArray(profile?.couple_sessions) ? profile.couple_sessions : [];
    const tonight = Array.isArray(tonightLogs) ? tonightLogs : [];

    const individualCount = individual.length;
    const jointCount = joint.length;
    const tonightCount = tonight.length;

    const individualDates = buildDateKeys(individual as ReflectionRecord[]);
    const jointDates = buildDateKeys(joint as ReflectionRecord[]);
    const tonightDates = (tonight as Record<string, unknown>[])
      .map((entry) => toDayKey(entry?.question_date || entry?.created_at || null))
      .filter(Boolean) as string[];

    const allDates = [...individualDates, ...jointDates, ...tonightDates];
    const streakDays = getCurrentStreak(allDates);
    const uniqueAllDates = Array.from(new Set(allDates)).sort((a, b) => b.localeCompare(a));
    const lastActivityDate = uniqueAllDates[0] || null;
    const previousStreak = typeof profile?.current_streak === "number" ? Math.max(0, profile.current_streak) : 0;
    const todayKey = new Date().toISOString().slice(0, 10);
    const inactiveDays = daysBetweenUtc(lastActivityDate, todayKey);
    const streakBroken = streakDays === 0 && previousStreak > 0 && inactiveDays !== null && inactiveDays >= 1;
    const streakMessage = streakBroken
      ? `Your ${previousStreak}-day streak paused. One reflection today gets your momentum flowing again.`
      : streakDays > 0
        ? `${streakDays} day streak and growing.`
        : "Start your first streak today.";

    const onboardingDone =
      Boolean(profile?.onboarding_completed_at) ||
      (Array.isArray(profile?.onboarding_goals) && profile.onboarding_goals.length > 0);
    const profileStepMap = {
      photo: Boolean(profile?.profile_photo_url),
      anniversary: Boolean(profile?.anniversary_date),
      birthday: Boolean(profile?.birthday_date),
      joint_reflection: jointCount > 0,
      onboarding_goals: onboardingDone,
    };
    const profileSteps = Object.values(profileStepMap);
    const profileCompletionDone = profileSteps.filter(Boolean).length;
    const profileCompletionSteps = profileSteps.length;
    const completionPercent = Math.round((profileCompletionDone / profileCompletionSteps) * 100);
    const nextMissing = (Object.entries(profileStepMap).find(([, done]) => !done)?.[0] as string | null) || null;

    const individualPercent = Math.min(100, Math.round((individualCount / 28) * 100));
    const jointPercent = Math.min(100, Math.round((jointCount / 14) * 100));
    const streakPercent = Math.min(100, Math.round((streakDays / 7) * 100));
    const cycleWeek = getCycleWeek(profile?.couple_journey_start_date);
    const patternSignal = latestPatternLabel(individual as ReflectionRecord[]);
    const patternShifts = countPatternShifts(individual as ReflectionRecord[]);
    const totalCompleted = individualCount + jointCount + tonightCount;
    const encouragement = completionMessage(completionPercent);
    const personalizationHint = personalizationNote(nextMissing);
    const milestone =
      completionPercent >= 100
        ? 100
        : completionPercent >= 80
          ? 80
          : completionPercent >= 60
            ? 60
            : completionPercent >= 40
              ? 40
              : completionPercent >= 20
                ? 20
                : 0;

    const shareText = [
      "Luma Mirror Stats ✨",
      `${totalCompleted} moments completed`,
      `${individualCount} solo reflections`,
      `${jointCount} joint reflections`,
      `${streakDays} day streak`,
      `${patternShifts} pattern shifts observed`,
      `Cycle week ${cycleWeek}${patternSignal ? ` · Current pattern: ${patternSignal}` : ""}`,
      `Profile completion ${completionPercent}%`,
    ].join("\n");

    // Keep a persisted snapshot for cycle/profile analytics without blocking UI on schema mismatches.
    try {
      await supabase
        .from("user_profiles")
        .update({
          profile_completion_percent: completionPercent,
          profile_completion_state: {
            ...profileStepMap,
            done: profileCompletionDone,
            total: profileCompletionSteps,
            milestone,
            updated_at: new Date().toISOString(),
          },
          current_streak: streakDays,
          last_activity_date: lastActivityDate,
          last_updated: new Date().toISOString(),
        })
        .eq("id", user.id);
    } catch {
      // Non-blocking persistence.
    }

    return NextResponse.json({
      completionPercent,
      profileCompletionSteps,
      profileCompletionDone,
      profileStepMap,
      encouragement,
      personalizationHint,
      milestone,
      individualCount,
      jointCount,
      tonightCount,
      totalCompleted,
      individualPercent,
      jointPercent,
      streakDays,
      streakPercent,
      cycleWeek,
      patternSignal,
      patternShifts,
      streakBroken,
      streakMessage,
      lastActivityDate,
      unlockHint:
        streakDays >= 7
          ? "7-day consistency unlocks deeper pattern insight prompts."
          : "Build your streak to unlock deeper pattern insights.",
      shareText,
    });
  } catch (error) {
    console.error("us activity GET error:", error);
    return NextResponse.json({ error: "Could not load activity metrics" }, { status: 500 });
  }
}
