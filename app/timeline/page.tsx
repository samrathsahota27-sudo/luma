"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  getReflections,
  getReflectionsByDate,
  daysUntilNextReflection,
  type ReflectionEntry,
  type IndividualReflectionEntry,
  type CoupleReflectionEntry,
} from "@/lib/reflectionStorage";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ConflictAnalysisPanel } from "@/components/ConflictAnalysisPanel";
import { GeneratedCoupleArtImage } from "@/components/GeneratedCoupleArtImage";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCalendarGrid(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startPad = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = last.getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const remainder = cells.length % 7;
  if (remainder) for (let i = 0; i < 7 - remainder; i++) cells.push(null);
  return cells;
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function TimelinePage() {
  const [today] = useState(() => new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<ReflectionEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setEntries(getReflections());
  }, []);

  const monthEntries = useMemo(() => {
    const start = `${viewYear}-${String(viewMonth).padStart(2, "0")}-01`;
    const lastDay = new Date(viewYear, viewMonth, 0).getDate();
    const end = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return entries.filter(
      (e) => e.date.slice(0, 10) >= start && e.date.slice(0, 10) <= end
    );
  }, [viewYear, viewMonth, entries]);

  const entriesByDay = useMemo(() => {
    const map: Record<string, ReflectionEntry[]> = {};
    monthEntries.forEach((e) => {
      const key = e.date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [monthEntries]);

  const calendarCells = useMemo(
    () => getCalendarGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const daysUntil = daysUntilNextReflection();
  const showNextMessage = daysUntil !== null && daysUntil > 0;

  const handleDayClick = (year: number, month: number, day: number) => {
    const key = dateKey(year, month, day);
    const list = getReflectionsByDate(key);
    if (list.length === 0) return;
    setSelectedDate(key);
    setSelectedEntries(list);
    setModalOpen(true);
  };

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 pt-24 pb-20 px-6 max-w-[720px] mx-auto w-full">
        <h1 className="text-foreground text-3xl md:text-4xl [font-family:var(--font-serif-display)] tracking-wide mb-2">
          Your Timeline
        </h1>
        <p className="text-muted-foreground text-base mb-10">
          A quiet record of your reflections over time.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 mb-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="text-[#6b7b8a] font-medium">○</span> Individual Reflection
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[#CFA3A3] font-medium">♥</span> Relationship Reflection
          </span>
        </div>

        {/* Next reflection message */}
        {showNextMessage && (
          <div className="mb-8 rounded-2xl border border-white/10 p-4 luma-glass">
            <p className="text-foreground font-medium">Your inner landscape needs time to shift.</p>
            <p className="text-muted-foreground text-sm mt-1">
              Next reflection available in {daysUntil} day{daysUntil !== 1 ? "s" : ""}.
            </p>
          </div>
        )}

        {/* Calendar */}
        <div className="luma-glass p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-foreground font-medium [font-family:var(--font-serif-display)]">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-xs text-muted-foreground py-2 font-medium">
                {d}
              </div>
            ))}
            {calendarCells.map((day, i) => {
              if (day === null)
                return <div key={`e-${i}`} className="aspect-square" />;
              const key = dateKey(viewYear, viewMonth, day);
              const dayEntries = entriesByDay[key] ?? [];
              const hasIndividual = dayEntries.some((e) => e.mode === "individual");
              const hasCouple = dayEntries.some((e) => e.mode === "couple");
              const hasAny = dayEntries.length > 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDayClick(viewYear, viewMonth, day)}
                  disabled={!hasAny}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-colors ${
                    hasAny
                      ? "bg-[#f0eeeb] hover:bg-[#e8e3d9] text-foreground cursor-pointer"
                      : "text-[#9a9a9a] cursor-default"
                  }`}
                >
                  <span className="text-foreground font-medium">{day}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {hasIndividual && (
                      <span className="text-[#6b7b8a]" title="Individual">○</span>
                    )}
                    {hasCouple && (
                      <span className="text-[#CFA3A3]" title="Relationship">♥</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8">
          <p className="text-center text-muted-foreground text-sm">
            Your journey grows with every reflection.
          </p>
          <div className="flex flex-col gap-3 mt-6 md:flex-row">
            <Link
              href="/choose-mode"
              className="w-full inline-flex items-center justify-center rounded-full py-3 px-6 bg-primary text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
            >
              Start Reflection
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.05] py-3 px-6 text-sm font-medium text-foreground shadow-[0_0_24px_rgba(0,0,0,0.2)] transition-all duration-200 hover:bg-white/[0.1] hover:scale-[1.02]"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {entries.length === 0 && (
          <p className="mt-8 text-center text-muted-foreground text-sm">
            Complete a reflection to see it here.
          </p>
        )}
      </main>

      {/* Modal */}
      {modalOpen && selectedDate && selectedEntries.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-background rounded-2xl shadow-xl max-w-[680px] w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-foreground text-2xl [font-family:var(--font-serif-display)]">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("default", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedEntries.map((entry) =>
                entry.mode === "individual" ? (
                  <IndividualModalContent key={entry.id} entry={entry} />
                ) : (
                  <CoupleModalContent key={entry.id} entry={entry} />
                )
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function IndividualModalContent({ entry }: { entry: IndividualReflectionEntry }) {
  return (
    <div className="mb-10 last:mb-0">
      <h3 className="text-foreground text-xl [font-family:var(--font-serif-display)] mb-4 border-b border-white/10 pb-2">
        Your Reflection
      </h3>
      <div
        className="text-[#3d3d3d] text-base leading-[1.8] whitespace-pre-wrap [&>br]:block [&>br]:mb-4"
        dangerouslySetInnerHTML={{
          __html: entry.content.replace(/\n/g, "<br>"),
        }}
      />
    </div>
  );
}

function CoupleModalContent({ entry }: { entry: CoupleReflectionEntry }) {
  const hasImages =
    entry.innerWorldAImage || entry.innerWorldBImage || entry.spaceBetweenImage;

  return (
    <div className="mb-10 last:mb-0">
      <h3 className="text-foreground text-xl [font-family:var(--font-serif-display)] mb-4 border-b border-white/10 pb-2">
        Relationship Reflection
      </h3>

      {hasImages && (
        <div className="space-y-6 mb-8">
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-2">Inner World A</p>
              {entry.innerWorldAImage ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                  <GeneratedCoupleArtImage
                    src={entry.innerWorldAImage}
                    alt="Inner World A"
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-white/[0.05] text-xs text-muted-foreground">
                  —
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-2">Inner World B</p>
              {entry.innerWorldBImage ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                  <GeneratedCoupleArtImage
                    src={entry.innerWorldBImage}
                    alt="Inner World B"
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-white/[0.05] text-xs text-muted-foreground">
                  —
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-2">The Space Between</p>
            {entry.spaceBetweenImage ? (
              <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl">
                <GeneratedCoupleArtImage
                  src={entry.spaceBetweenImage}
                  alt="The Space Between"
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ) : (
              <div className="mx-auto flex aspect-square w-full max-w-sm items-center justify-center rounded-xl bg-white/[0.05] text-xs text-muted-foreground">
                —
              </div>
            )}
          </div>
        </div>
      )}

      {entry.conflictFrictionPoints && entry.conflictFrictionPoints.length > 0 ? (
        <ConflictAnalysisPanel
          points={entry.conflictFrictionPoints}
          labelA={entry.nameA?.trim() ? entry.nameA.trim() : "Person A"}
          labelB={entry.nameB?.trim() ? entry.nameB.trim() : "Person B"}
        />
      ) : null}

      <div className="text-[#3d3d3d] text-base leading-[1.8] whitespace-pre-wrap [&>br]:block [&>br]:mb-4">
        <div
          dangerouslySetInnerHTML={{
            __html: entry.content.replace(/\n/g, "<br>"),
          }}
        />
      </div>
    </div>
  );
}
