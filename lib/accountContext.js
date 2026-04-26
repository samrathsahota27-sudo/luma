function safeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function capText(value, maxLen = 280) {
  const text = safeString(value);
  if (!text) return "";
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

function toIsoNow() {
  return new Date().toISOString();
}

function limitEntries(entries, max = 6) {
  const arr = safeArray(entries);
  if (!arr.length) return [];
  return arr.slice(Math.max(0, arr.length - max));
}

function sanitizeFeatureActivityEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  return {
    at: safeString(entry.at) || toIsoNow(),
    feature: capText(entry.feature, 80),
    input: entry.input && typeof entry.input === "object" ? entry.input : {},
    output: entry.output && typeof entry.output === "object" ? entry.output : {},
    metadata: entry.metadata && typeof entry.metadata === "object" ? entry.metadata : {},
  };
}

function toPromptJson(obj, maxChars = 12000) {
  try {
    const raw = JSON.stringify(obj);
    if (raw.length <= maxChars) return raw;
    return `${raw.slice(0, maxChars)}…`;
  } catch {
    return "";
  }
}

function summarizePatternEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  return {
    date: safeString(entry.date) || null,
    pattern: capText(entry.pattern, 80) || null,
    description: capText(entry.description, 220) || null,
    weekly_shift_insight: capText(entry.weekly_shift_insight, 220) || null,
  };
}

function summarizeCoupleEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  return {
    date: safeString(entry.date) || null,
    pattern: capText(entry.pattern, 80) || null,
    summary: capText(entry.summary, 220) || null,
    drift: entry?.drift?.value ?? entry?.drift ?? null,
    tension: entry?.tension?.value ?? entry?.tension ?? null,
    alignment: entry?.alignment ?? null,
    weekly_shift_insight: capText(entry.weekly_shift_insight, 220) || null,
  };
}

function summarizeUsersMemory(memory) {
  if (!memory || typeof memory !== "object") return null;
  const reflections = limitEntries(memory.reflections, 4);
  const conflicts = limitEntries(memory.conflicts, 4);
  const timeline = limitEntries(memory.timeline, 6);
  const emotionTracker = limitEntries(memory.emotionTracker, 8);

  return {
    profile: memory.profile && typeof memory.profile === "object" ? memory.profile : {},
    scores: memory.scores && typeof memory.scores === "object" ? memory.scores : {},
    patterns: memory.patterns && typeof memory.patterns === "object" ? memory.patterns : {},
    reflections,
    conflicts,
    timeline,
    emotionTracker,
  };
}

function featureActivityByTool(activity) {
  const grouped = {};
  for (const row of safeArray(activity)) {
    if (!row || typeof row !== "object") continue;
    const key = capText(row.feature, 80) || "unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      at: safeString(row.at) || null,
      input: row.input && typeof row.input === "object" ? row.input : {},
      output: row.output && typeof row.output === "object" ? row.output : {},
      metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
    });
  }
  for (const key of Object.keys(grouped)) {
    grouped[key] = limitEntries(grouped[key], 4);
  }
  return grouped;
}

async function fetchUserProfile(supabase, userId) {
  if (!supabase || !userId) return null;

  // Read with the new feature_activity field when present.
  const preferredSelect = [
    "id",
    "email",
    "pattern_history",
    "couple_sessions",
    "reflection_history",
    "emotional_tags",
    "depth_tone_preference",
    "reflection_count",
    "reflection_count_month",
    "start_date",
    "last_updated",
    "feature_activity",
    "onboarding_goals",
    "onboarding_improve_text",
    "onboarding_strength_text",
    "mirror_summary",
    "onboarding_completed_at",
  ].join(", ");

  const fallbackSelect = [
    "id",
    "email",
    "pattern_history",
    "couple_sessions",
    "reflection_history",
    "emotional_tags",
    "depth_tone_preference",
    "reflection_count",
    "reflection_count_month",
    "start_date",
    "last_updated",
  ].join(", ");

  const first = await supabase.from("user_profiles").select(preferredSelect).eq("id", userId).maybeSingle();
  if (!first.error) return first.data ?? null;

  // Old schema fallback (before migration applied).
  const second = await supabase.from("user_profiles").select(fallbackSelect).eq("id", userId).maybeSingle();
  if (second.error) return null;
  return second.data ?? null;
}

export async function buildUnifiedAccountContext({ supabase, user, clientContext = null, maxChars = 12000 }) {
  const hasClientContext = clientContext && typeof clientContext === "object";
  if (!user?.id || !supabase) {
    const onlyClient = hasClientContext ? { clientContext } : null;
    return {
      context: onlyClient,
      contextJson: onlyClient ? toPromptJson(onlyClient, maxChars) : "",
    };
  }

  const [profile, emotionTrackerRes, usersMemoryRes, tonightMirrorRes] = await Promise.all([
    fetchUserProfile(supabase, user.id),
    supabase
      .from("emotion_tracker_entries")
      .select("created_at, emotional_tag, short_insight, session_type")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("users_memory")
      .select("memory")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("tonight_mirror_logs")
      .select(
        "question_date, cycle_week, onboarding_goals, question_for_you, question_for_them, answer_for_you, answer_for_them, mirror_reflection, micro_shift_insight, saved_as_ritual, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const patternHistory = safeArray(profile?.pattern_history)
    .map(summarizePatternEntry)
    .filter(Boolean);
  const coupleSessions = safeArray(profile?.couple_sessions)
    .map(summarizeCoupleEntry)
    .filter(Boolean);
  const reflectionHistory = safeArray(profile?.reflection_history).slice(-6);
  const emotionalTags = safeArray(profile?.emotional_tags).slice(-12);
  const featureActivity = safeArray(profile?.feature_activity)
    .map(sanitizeFeatureActivityEntry)
    .filter(Boolean);
  const onboardingGoals = safeArray(profile?.onboarding_goals)
    .map((x) => capText(x, 80))
    .filter(Boolean)
    .slice(0, 6);
  const onboardingImproveText = capText(profile?.onboarding_improve_text, 380);
  const onboardingStrengthText = capText(profile?.onboarding_strength_text, 380);
  const mirrorSummary = capText(profile?.mirror_summary, 380);

  const context = {
    account: {
      userId: user.id,
      email: user.email || profile?.email || null,
      startDate: profile?.start_date || null,
      depthTonePreference: profile?.depth_tone_preference || null,
      lastUpdated: profile?.last_updated || null,
    },
    usage: {
      reflectionsThisMonth: profile?.reflection_count ?? null,
      reflectionMonth: profile?.reflection_count_month ?? null,
    },
    recentSignals: {
      individualReflections: limitEntries(patternHistory, 6),
      coupleReflections: limitEntries(coupleSessions, 6),
      reflectionHistory: limitEntries(reflectionHistory, 6),
      emotionalTags: emotionalTags,
      emotionTracker: safeArray(emotionTrackerRes?.data).slice(0, 10),
      featureActivityByTool: featureActivityByTool(featureActivity),
      mirrorSummary: mirrorSummary || null,
      tonightMirrorHistory: safeArray(tonightMirrorRes?.data).slice(0, 8),
      onboarding: {
        completedAt: profile?.onboarding_completed_at || null,
        goals: onboardingGoals,
        improve: onboardingImproveText || null,
        strengths: onboardingStrengthText || null,
      },
    },
    memory: summarizeUsersMemory(usersMemoryRes?.data?.memory ?? null),
    ...(hasClientContext ? { clientContext } : {}),
  };

  return {
    context,
    contextJson: toPromptJson(context, maxChars),
  };
}

export async function recordFeatureUsage({
  supabase,
  user,
  feature,
  input = {},
  output = {},
  metadata = {},
}) {
  if (!supabase || !user?.id || !feature) return;

  const entry = sanitizeFeatureActivityEntry({
    at: toIsoNow(),
    feature,
    input,
    output,
    metadata,
  });
  if (!entry) return;

  try {
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("feature_activity, email")
      .eq("id", user.id)
      .maybeSingle();

    const prev = safeArray(existing?.feature_activity).map(sanitizeFeatureActivityEntry).filter(Boolean);
    const next = [...prev, entry].slice(-120);

    const { error } = await supabase.from("user_profiles").upsert({
      id: user.id,
      email: user.email || existing?.email || null,
      feature_activity: next,
      last_updated: toIsoNow(),
    });
    if (error) {
      // Ignore schema-missing and non-critical persistence failures.
      return;
    }
  } catch {
    // Non-blocking logging path.
  }
}
