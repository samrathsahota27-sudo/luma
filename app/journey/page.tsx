'use client'

import { createClient } from '@/lib/supabase/client'
import {
  buildMergedTimelineEntries,
  getReflections,
  localDateKeyFromIso,
  type CoupleReflectionEntry,
  type IndividualReflectionEntry,
  type ReflectionEntry,
} from '@/lib/reflectionStorage'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getCalendarGrid(year: number, month: number) {
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  const startPad = (first.getDay() + 6) % 7 // Monday = 0
  const daysInMonth = last.getDate()
  const cells: Array<number | null> = []
  for (let i = 0; i < startPad; i += 1) cells.push(null)
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d)
  const remainder = cells.length % 7
  if (remainder) for (let i = 0; i < 7 - remainder; i += 1) cells.push(null)
  return cells
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatDateLabel(iso: string, mode: ReflectionEntry['mode']) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return mode === 'couple' ? 'Couple' : 'Solo'
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  return `${month} ${d.getDate()} · ${mode === 'couple' ? 'Couple' : 'Solo'}`
}

function formatCalendarHeading(selectedDate: string) {
  return new Date(`${selectedDate}T12:00:00`).toLocaleDateString('default', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function excerpt(content: string, max = 135) {
  const clean = content.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max)}...`
}

function reflectionTitle(entry: ReflectionEntry) {
  if (entry.mode === 'couple') return 'Relationship Reflection'
  return 'Your Reflection'
}

export default function JourneyPage() {
  const supabase = createClient()
  const [today] = useState(() => new Date())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1)
  const [entries, setEntries] = useState<ReflectionEntry[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEntries, setSelectedEntries] = useState<ReflectionEntry[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  const refreshEntries = useCallback(async () => {
    const local = getReflections()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setEntries(local)
        setHistoryLoaded(true)
        return
      }
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('pattern_history, couple_sessions')
        .eq('id', user.id)
        .single()

      setEntries(
        buildMergedTimelineEntries({
          local,
          userId: user.id,
          patternHistory: profile?.pattern_history,
          coupleSessions: profile?.couple_sessions,
        })
      )
    } catch {
      setEntries(local)
    } finally {
      setHistoryLoaded(true)
    }
  }, [supabase])

  useEffect(() => {
    void refreshEntries()
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void refreshEntries()
    })
    const onFocus = () => {
      void refreshEntries()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      sub.subscription.unsubscribe()
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [refreshEntries, supabase])

  const monthEntries = useMemo(() => {
    const monthPrefix = `${viewYear}-${String(viewMonth).padStart(2, '0')}-`
    return entries.filter((e) => localDateKeyFromIso(e.date).startsWith(monthPrefix))
  }, [viewYear, viewMonth, entries])

  const entriesByDay = useMemo(() => {
    const map: Record<string, ReflectionEntry[]> = {}
    monthEntries.forEach((e) => {
      const key = localDateKeyFromIso(e.date)
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return map
  }, [monthEntries])

  const calendarCells = useMemo(() => getCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth])

  const sortedHistory = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries]
  )

  const monthLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleDayClick = (year: number, month: number, day: number) => {
    const key = dateKey(year, month, day)
    const dayEntries = entries.filter((e) => localDateKeyFromIso(e.date) === key)
    setSelectedDate(key)
    setSelectedEntries(dayEntries)
    setModalOpen(dayEntries.length > 0)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-5 pb-[96px] text-white">
      <h1 className="text-2xl font-bold">Journey</h1>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:text-white"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold">{monthLabel}</p>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:text-white"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-xs text-white/45">
              {d}
            </div>
          ))}
          {calendarCells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="aspect-square" />
            }
            const key = dateKey(viewYear, viewMonth, day)
            const dayEntries = entriesByDay[key] ?? []
            const hasIndividual = dayEntries.some((e) => e.mode === 'individual')
            const hasCouple = dayEntries.some((e) => e.mode === 'couple')
            const hasAny = dayEntries.length > 0
            const isSelected = selectedDate === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleDayClick(viewYear, viewMonth, day)}
                className={`aspect-square rounded-xl transition-colors ${
                  hasAny ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-white/[0.03] text-white/45 hover:bg-white/[0.06]'
                } ${isSelected ? 'ring-2 ring-violet-400/40' : ''}`}
              >
                <span className="block text-sm font-medium">{day}</span>
                <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px]">
                  {hasIndividual ? <span className="text-[#9db1c7]">○</span> : null}
                  {hasCouple ? <span className="text-[#d8a9b1]">♥</span> : null}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Reflection History</h2>
        {!historyLoaded ? <p className="text-sm text-white/55">Loading your journey...</p> : null}

        {historyLoaded && sortedHistory.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm leading-relaxed text-white/70">
              Your reflections will appear here.
              <br />
              Start your first reflection to begin your journey.
            </p>
          </div>
        ) : null}

        {historyLoaded &&
          sortedHistory.map((entry) => (
            <div key={entry.id} className="mb-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">{formatDateLabel(entry.date, entry.mode)}</p>
              <p className="mt-1 font-semibold text-white">{reflectionTitle(entry)}</p>
              <p className="mt-1 text-sm text-white/70">{excerpt(entry.content)}</p>
            </div>
          ))}
      </section>

      {modalOpen && selectedDate && selectedEntries.length > 0 ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4" onClick={() => setModalOpen(false)}>
          <div
            className="mx-auto max-h-[88vh] w-full max-w-[680px] overflow-y-auto rounded-2xl border border-white/10 bg-[#121212]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <h3 className="font-serif text-xl [font-family:var(--font-serif-display)]">{formatCalendarHeading(selectedDate)}</h3>
                <button type="button" onClick={() => setModalOpen(false)} className="text-white/60 hover:text-white" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {selectedEntries.map((entry) => {
                const typed = entry as IndividualReflectionEntry | CoupleReflectionEntry
                return (
                  <div key={entry.id} className="mb-6 last:mb-0">
                    <p className="text-xs uppercase tracking-[0.12em] text-white/45">{typed.mode === 'couple' ? 'Relationship reflection' : 'Your reflection'}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/85">{typed.content}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
