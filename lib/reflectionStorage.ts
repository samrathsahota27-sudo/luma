/**
 * Client-side reflection storage (localStorage).
 * Used by the Timeline to display saved individual and couple reflections.
 */

const STORAGE_KEY = "luma_reflections";
const USER_ID = "default";

/** YYYY-MM-DD in the user's local timezone (for calendar cells). */
export function localDateKeyFromIso(isoLike: string): string {
  try {
    const d = new Date(isoLike);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

export type ReflectionMode = "individual" | "couple";

/** Person A vs B friction row from couple / connect conflict analysis. */
export type ConflictFrictionPointStored = {
  personA: string;
  personB: string;
  mismatch: string;
};

/** Tags used to generate dynamic “How to Read This” copy for couple reflections. */
export type HowToReadTagsStored = {
  round2Tag?: string | null;
  round3Tag?: string | null;
  round5Tag?: string | null;
};

export type IndividualReflectionEntry = {
  id: string;
  userId: string;
  date: string; // ISO
  mode: "individual";
  content: string;
  /** Plain 3–4 line summary (optional; older saves omit). */
  inSimpleWords?: string[];
  /** Tags for “How to Read This” when replaying (optional). */
  howToReadTags?: HowToReadTagsStored | null;
  /** One-line AI TL;DR (optional; older saves omit). */
  brutalTruth?: string;
  /** AI conversation prompt at end of result (optional; older saves omit). */
  dangerousQuestion?: string;
  /** Pattern the user may be avoiding (optional; older saves omit). */
  shadowInsight?: string;
  email?: string;
  name?: string;
  corePattern?: string;
  gentleDirection?: string;
  selectedImages?: Record<number, { image: number; text: string }>;
};

export type CoupleReflectionEntry = {
  id: string;
  userId: string;
  date: string;
  mode: "couple";
  content: string;
  brutalTruth?: string;
  dangerousQuestion?: string;
  shadowInsight?: string;
  email?: string;
  nameA?: string;
  nameB?: string;
  innerWorldAImage?: string | null;
  innerWorldBImage?: string | null;
  spaceBetweenImage?: string | null;
  conflictFrictionPoints?: ConflictFrictionPointStored[];
  howToReadTags?: HowToReadTagsStored | null;
};

export type ReflectionEntry = IndividualReflectionEntry | CoupleReflectionEntry;

function loadEntries(): ReflectionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: ReflectionEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn("Failed to save reflections", e);
  }
}

export function getReflections(): ReflectionEntry[] {
  return loadEntries();
}

export function getReflectionById(id: string): ReflectionEntry | null {
  const entries = loadEntries();
  return entries.find((e) => e.id === id) ?? null;
}

export function getIndividualReflections(): IndividualReflectionEntry[] {
  const entries = loadEntries();
  return entries.filter((e): e is IndividualReflectionEntry => e.mode === "individual");
}

export function getReflectionsByMonth(year: number, month: number): ReflectionEntry[] {
  const entries = loadEntries();
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}-`;
  return entries.filter((e) => localDateKeyFromIso(e.date).startsWith(monthPrefix));
}

export function getReflectionsByDate(dateStr: string): ReflectionEntry[] {
  const prefix = dateStr.slice(0, 10);
  return loadEntries().filter((e) => localDateKeyFromIso(e.date) === prefix);
}

export function saveIndividualReflection(content: string): void {
  const entries = loadEntries();
  const id = `ind-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const entry: IndividualReflectionEntry = {
    id,
    userId: USER_ID,
    date: new Date().toISOString(),
    mode: "individual",
    content,
  };
  entries.push(entry);
  saveEntries(entries);
}

const CURRENT_USER_NAME_KEY = "luma_user_name";

export function saveIndividualReflectionWithEmail(payload: {
  content: string;
  brutalTruth?: string | null;
  dangerousQuestion?: string | null;
  shadowInsight?: string | null;
  inSimpleWords?: string[] | null;
  howToReadTags?: HowToReadTagsStored | null;
  email: string;
  name?: string;
  selectedImages?: Record<number, { image: number; text: string }>;
}): void {
  const entries = loadEntries();
  const id = `ind-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const name = payload.name?.trim();
  const bt = typeof payload.brutalTruth === "string" ? payload.brutalTruth.trim() : "";
  const dq =
    typeof payload.dangerousQuestion === "string" ? payload.dangerousQuestion.trim() : "";
  const si = typeof payload.shadowInsight === "string" ? payload.shadowInsight.trim() : "";
  const isw = Array.isArray(payload.inSimpleWords)
    ? payload.inSimpleWords
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean)
        .slice(0, 4)
    : [];
  const htr = payload.howToReadTags;
  const hasHowToRead =
    htr &&
    typeof htr === "object" &&
    !!(htr.round2Tag || htr.round3Tag || htr.round5Tag);
  const entry: IndividualReflectionEntry = {
    id,
    userId: USER_ID,
    date: new Date().toISOString(),
    mode: "individual",
    content: payload.content,
    ...(isw.length > 0 ? { inSimpleWords: isw } : {}),
    ...(hasHowToRead ? { howToReadTags: htr } : {}),
    ...(bt ? { brutalTruth: bt } : {}),
    ...(dq ? { dangerousQuestion: dq } : {}),
    ...(si ? { shadowInsight: si } : {}),
    email: payload.email.trim(),
    name: name || undefined,
    selectedImages: payload.selectedImages,
  };
  entries.push(entry);
  saveEntries(entries);
  if (name && typeof window !== "undefined") {
    try {
      localStorage.setItem(CURRENT_USER_NAME_KEY, name);
    } catch {}
  }
}

/** Name of the current user (from most recent save with name, or last individual entry). Used for story card personalization. */
export function getCurrentUserName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromKey = localStorage.getItem(CURRENT_USER_NAME_KEY);
    if (fromKey && fromKey.trim()) return fromKey.trim();
    const last = getLastIndividualReflection();
    const entry = last as IndividualReflectionEntry | null;
    return entry?.name?.trim() ?? null;
  } catch {
    return null;
  }
}

function normalizeConflictFrictionPointsForSave(
  raw: unknown
): ConflictFrictionPointStored[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: ConflictFrictionPointStored[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const a = typeof o.personA === "string" ? o.personA.trim() : "";
    const b = typeof o.personB === "string" ? o.personB.trim() : "";
    const m = typeof o.mismatch === "string" ? o.mismatch.trim() : "";
    if (a && b && m) out.push({ personA: a, personB: b, mismatch: m });
    if (out.length >= 3) break;
  }
  return out.length > 0 ? out : undefined;
}

export function saveCoupleReflection(payload: {
  content: string;
  brutalTruth?: string | null;
  dangerousQuestion?: string | null;
  shadowInsight?: string | null;
  conflictFrictionPoints?: ConflictFrictionPointStored[] | null;
  nameA?: string;
  nameB?: string;
  innerWorldA?: string | null;
  innerWorldB?: string | null;
  spaceBetween?: string | null;
  howToReadTags?: HowToReadTagsStored | null;
}): void {
  const entries = loadEntries();
  const id = `couple-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const bt = typeof payload.brutalTruth === "string" ? payload.brutalTruth.trim() : "";
  const dq =
    typeof payload.dangerousQuestion === "string" ? payload.dangerousQuestion.trim() : "";
  const si = typeof payload.shadowInsight === "string" ? payload.shadowInsight.trim() : "";
  const cfp = normalizeConflictFrictionPointsForSave(payload.conflictFrictionPoints);
  const entry: CoupleReflectionEntry = {
    id,
    userId: USER_ID,
    date: new Date().toISOString(),
    mode: "couple",
    content: payload.content,
    ...(bt ? { brutalTruth: bt } : {}),
    ...(dq ? { dangerousQuestion: dq } : {}),
    ...(si ? { shadowInsight: si } : {}),
    ...(cfp ? { conflictFrictionPoints: cfp } : {}),
    nameA: payload.nameA?.trim(),
    nameB: payload.nameB?.trim(),
    innerWorldAImage: payload.innerWorldA ?? null,
    innerWorldBImage: payload.innerWorldB ?? null,
    spaceBetweenImage: payload.spaceBetween ?? null,
    ...(payload.howToReadTags &&
    (payload.howToReadTags.round2Tag ||
      payload.howToReadTags.round3Tag ||
      payload.howToReadTags.round5Tag)
      ? { howToReadTags: payload.howToReadTags }
      : {}),
  };
  entries.push(entry);
  saveEntries(entries);
}

export function saveCoupleReflectionWithEmail(payload: {
  content: string;
  brutalTruth?: string | null;
  dangerousQuestion?: string | null;
  shadowInsight?: string | null;
  conflictFrictionPoints?: ConflictFrictionPointStored[] | null;
  email: string;
  nameA?: string;
  nameB?: string;
  innerWorldA?: string | null;
  innerWorldB?: string | null;
  spaceBetween?: string | null;
  howToReadTags?: HowToReadTagsStored | null;
}): void {
  const entries = loadEntries();
  const id = `couple-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const bt = typeof payload.brutalTruth === "string" ? payload.brutalTruth.trim() : "";
  const dq =
    typeof payload.dangerousQuestion === "string" ? payload.dangerousQuestion.trim() : "";
  const si = typeof payload.shadowInsight === "string" ? payload.shadowInsight.trim() : "";
  const cfp = normalizeConflictFrictionPointsForSave(payload.conflictFrictionPoints);
  const htr = payload.howToReadTags;
  const entry: CoupleReflectionEntry = {
    id,
    userId: USER_ID,
    date: new Date().toISOString(),
    mode: "couple",
    content: payload.content,
    ...(bt ? { brutalTruth: bt } : {}),
    ...(dq ? { dangerousQuestion: dq } : {}),
    ...(si ? { shadowInsight: si } : {}),
    ...(cfp ? { conflictFrictionPoints: cfp } : {}),
    email: payload.email.trim(),
    nameA: payload.nameA?.trim(),
    nameB: payload.nameB?.trim(),
    innerWorldAImage: payload.innerWorldA ?? null,
    innerWorldBImage: payload.innerWorldB ?? null,
    spaceBetweenImage: payload.spaceBetween ?? null,
    ...(htr && (htr.round2Tag || htr.round3Tag || htr.round5Tag) ? { howToReadTags: htr } : {}),
  };
  entries.push(entry);
  saveEntries(entries);
}

export function getLastReflectionDate(): string | null {
  const entries = loadEntries();
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => (b.date > a.date ? 1 : -1));
  return sorted[0].date;
}

/**
 * Returns the most recent saved individual reflection, if any.
 * Used for "Your Inner Shift" comparison (returning users only).
 */
export function getLastIndividualReflection(): IndividualReflectionEntry | null {
  const entries = loadEntries();
  const individual = entries.filter((e): e is IndividualReflectionEntry => e.mode === "individual");
  if (individual.length === 0) return null;
  const sorted = [...individual].sort((a, b) => (b.date > a.date ? 1 : -1));
  return sorted[0];
}

/**
 * Number of saved individual reflections. Used for "A Letter From Your Inner World"
 * (show only when count >= 3, i.e. this is at least their third reflection).
 */
export function getIndividualReflectionCount(): number {
  const entries = loadEntries();
  return entries.filter((e) => e.mode === "individual").length;
}

export function daysUntilNextReflection(): number | null {
  const last = getLastReflectionDate();
  if (!last) return null;
  const lastDate = new Date(last);
  const nextAllowed = new Date(lastDate);
  nextAllowed.setDate(nextAllowed.getDate() + 10);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  nextAllowed.setHours(0, 0, 0, 0);
  if (today >= nextAllowed) return null;
  return Math.ceil((nextAllowed.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

/** Map Supabase `user_profiles.pattern_history` rows into timeline entries. */
export function entriesFromPatternHistory(userId: string, history: unknown): IndividualReflectionEntry[] {
  if (!Array.isArray(history)) return [];
  const out: IndividualReflectionEntry[] = [];
  for (let i = 0; i < history.length; i += 1) {
    const e = history[i] as Record<string, unknown>;
    const date = typeof e.date === "string" ? e.date : "";
    if (!date) continue;
    const fullInsight = typeof e.fullInsight === "string" ? e.fullInsight.trim() : "";
    const fullText = typeof e.full_text_response === "string" ? e.full_text_response.trim() : "";
    const pattern = typeof e.pattern === "string" ? e.pattern.trim() : "";
    const desc = typeof e.description === "string" ? e.description.trim() : "";
    const core = typeof e.core_line === "string" ? e.core_line.trim() : "";
    const content =
      fullInsight ||
      fullText ||
      [pattern && `Pattern: ${pattern}`, desc, core].filter(Boolean).join("\n\n") ||
      "Individual reflection (saved to your account).";
    out.push({
      id: `account-ind-${userId}-${i}-${date}`,
      userId,
      date,
      mode: "individual",
      content,
    });
  }
  return out;
}

/** Map Supabase `user_profiles.couple_sessions` rows into timeline entries. */
export function entriesFromCoupleSessions(userId: string, sessions: unknown): CoupleReflectionEntry[] {
  if (!Array.isArray(sessions)) return [];
  const out: CoupleReflectionEntry[] = [];
  for (let i = 0; i < sessions.length; i += 1) {
    const e = sessions[i] as Record<string, unknown>;
    const date = typeof e.date === "string" ? e.date : "";
    if (!date) continue;
    const pattern = typeof e.pattern === "string" ? e.pattern.trim() : "";
    const summary = typeof e.summary === "string" ? e.summary.trim() : "";
    const insight = typeof e.insight === "string" ? e.insight.trim() : "";
    const content =
      [pattern && `Pattern: ${pattern}`, summary, insight].filter(Boolean).join("\n\n") ||
      "Couple reflection (saved to your account).";
    out.push({
      id: `account-couple-${userId}-${i}-${date}`,
      userId,
      date,
      mode: "couple",
      content,
    });
  }
  return out;
}

export function dedupeReflectionEntriesByDayAndContent(entries: ReflectionEntry[]): ReflectionEntry[] {
  const seen = new Set<string>();
  const out: ReflectionEntry[] = [];
  for (const e of entries) {
    const dk = localDateKeyFromIso(e.date);
    const snippet = String(e.content ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
    const key = `${dk}|${e.mode}|${snippet}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

export function buildMergedTimelineEntries(options: {
  local: ReflectionEntry[];
  userId: string | null;
  patternHistory: unknown;
  coupleSessions: unknown;
}): ReflectionEntry[] {
  const { local, userId, patternHistory, coupleSessions } = options;
  if (!userId) return [...local];
  const fromAccount: ReflectionEntry[] = [
    ...entriesFromPatternHistory(userId, patternHistory),
    ...entriesFromCoupleSessions(userId, coupleSessions),
  ];
  return dedupeReflectionEntriesByDayAndContent([...local, ...fromAccount]);
}
