/**
 * Client-side reflection storage (localStorage).
 * Used by the Timeline to display saved individual and couple reflections.
 */

const STORAGE_KEY = "luma_reflections";
const USER_ID = "default";

export type ReflectionMode = "individual" | "couple";

export type IndividualReflectionEntry = {
  id: string;
  userId: string;
  date: string; // ISO
  mode: "individual";
  content: string;
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
  email?: string;
  nameA?: string;
  nameB?: string;
  innerWorldAImage?: string | null;
  innerWorldBImage?: string | null;
  spaceBetweenImage?: string | null;
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
  const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
  const end = new Date(year, month, 0).toISOString().slice(0, 10);
  return entries.filter((e) => e.date.slice(0, 10) >= start && e.date.slice(0, 10) <= end);
}

export function getReflectionsByDate(dateStr: string): ReflectionEntry[] {
  const prefix = dateStr.slice(0, 10);
  return loadEntries().filter((e) => e.date.startsWith(prefix));
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
  email: string;
  name?: string;
  selectedImages?: Record<number, { image: number; text: string }>;
}): void {
  const entries = loadEntries();
  const id = `ind-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const name = payload.name?.trim();
  const entry: IndividualReflectionEntry = {
    id,
    userId: USER_ID,
    date: new Date().toISOString(),
    mode: "individual",
    content: payload.content,
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

export function saveCoupleReflection(payload: {
  content: string;
  nameA?: string;
  nameB?: string;
  innerWorldA?: string | null;
  innerWorldB?: string | null;
  spaceBetween?: string | null;
}): void {
  const entries = loadEntries();
  const id = `couple-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const entry: CoupleReflectionEntry = {
    id,
    userId: USER_ID,
    date: new Date().toISOString(),
    mode: "couple",
    content: payload.content,
    nameA: payload.nameA?.trim(),
    nameB: payload.nameB?.trim(),
    innerWorldAImage: payload.innerWorldA ?? null,
    innerWorldBImage: payload.innerWorldB ?? null,
    spaceBetweenImage: payload.spaceBetween ?? null,
  };
  entries.push(entry);
  saveEntries(entries);
}

export function saveCoupleReflectionWithEmail(payload: {
  content: string;
  email: string;
  nameA?: string;
  nameB?: string;
  innerWorldA?: string | null;
  innerWorldB?: string | null;
  spaceBetween?: string | null;
}): void {
  const entries = loadEntries();
  const id = `couple-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const entry: CoupleReflectionEntry = {
    id,
    userId: USER_ID,
    date: new Date().toISOString(),
    mode: "couple",
    content: payload.content,
    email: payload.email.trim(),
    nameA: payload.nameA?.trim(),
    nameB: payload.nameB?.trim(),
    innerWorldAImage: payload.innerWorldA ?? null,
    innerWorldBImage: payload.innerWorldB ?? null,
    spaceBetweenImage: payload.spaceBetween ?? null,
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
