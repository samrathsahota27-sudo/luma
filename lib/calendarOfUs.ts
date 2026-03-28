export type CalendarMood = "calm" | "friction" | "distance" | "clarity";

const VALID: CalendarMood[] = ["calm", "friction", "distance", "clarity"];

export function parseCalendarMood(raw: string | null | undefined): CalendarMood | null {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (VALID.includes(s as CalendarMood)) return s as CalendarMood;
  return null;
}

/** AI hint wins; else keyword heuristic on tag + insight. */
export function resolveCalendarMood(
  tag: string,
  insight: string,
  explicit?: string | null
): CalendarMood {
  const fromAi = parseCalendarMood(explicit);
  if (fromAi) return fromAi;

  const t = `${tag} ${insight}`.toLowerCase();

  if (
    /\b(fight|fighting|conflict|tension|friction|angry|anger|defens|resent|attack|argue|fractur|spike|sharp edge)\b/.test(
      t
    )
  ) {
    return "friction";
  }
  if (
    /\b(withdraw|distance|distant|far apart|drift|cold|avoid|avoidance|silent treatment|shut down|wall|fog|space between|disconnect|isolat|alone together)\b/.test(
      t
    )
  ) {
    return "distance";
  }
  if (
    /\b(clarity|clear|repair|hope|understood|open|soften|aligned|bridge|gentle|heal|conversation land|making sense)\b/.test(
      t
    )
  ) {
    return "clarity";
  }
  if (
    /\b(calm|steady|quiet|peace|at ease|safe|grounded|regulated|softer)\b/.test(t)
  ) {
    return "calm";
  }

  return "calm";
}

export const CALENDAR_MOOD_META: Record<
  CalendarMood,
  { label: string; dotClass: string; waveClass: string; ringClass: string }
> = {
  calm: {
    label: "Calm",
    dotClass: "bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.45)]",
    waveClass: "from-sky-500/35 via-sky-400/15 to-transparent",
    ringClass: "ring-sky-400/40",
  },
  friction: {
    label: "Friction",
    dotClass: "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.45)]",
    waveClass: "from-rose-600/40 via-rose-500/15 to-transparent",
    ringClass: "ring-rose-500/45",
  },
  distance: {
    label: "Distance",
    dotClass: "bg-zinc-400 shadow-[0_0_16px_rgba(161,161,170,0.35)]",
    waveClass: "from-zinc-500/35 via-zinc-400/12 to-transparent",
    ringClass: "ring-zinc-400/40",
  },
  clarity: {
    label: "Clarity",
    dotClass: "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]",
    waveClass: "from-emerald-500/38 via-emerald-400/15 to-transparent",
    ringClass: "ring-emerald-400/45",
  },
};

export function dateKeyLocal(iso: string): string {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

export function shortWeekdayLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
  } catch {
    return "";
  }
}
