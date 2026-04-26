'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useMemo, useState } from 'react'

type ReflectionLike = {
  date?: string
  pattern?: string
  pattern_name?: string
  shared_pattern?: string
  description?: string
  summary?: string
  core_line?: string
  fullInsight?: string
}

type CalendarReflection = {
  dateKey: string
  patternName: string
}

type HistoryItem = {
  id: string
  date: string
  kind: 'Solo' | 'Couple'
  patternName: string
  description: string
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizePatternName(entry: ReflectionLike) {
  const pattern = entry?.pattern || entry?.pattern_name || entry?.shared_pattern || 'Reflection'
  return String(pattern).trim() || 'Reflection'
}

function normalizeDescription(entry: ReflectionLike) {
  const description = entry?.description || entry?.core_line || entry?.summary || entry?.fullInsight || 'No description yet.'
  return String(description).replace(/\s+/g, ' ').trim() || 'No description yet.'
}

function formatMemberDateLabel(isoDate: string, kind: 'Solo' | 'Couple') {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return kind
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  return `${month} ${day} · ${kind}`
}

function buildCalendarCells(monthDate: Date) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const cells: Array<{ date: Date; inCurrentMonth: boolean }> = []

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    cells.push({ date: new Date(year, month, -i), inCurrentMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), inCurrentMonth: true })
  }

  const trailing = (7 - (cells.length % 7)) % 7
  for (let i = 1; i <= trailing; i += 1) {
    cells.push({ date: new Date(year, month + 1, i), inCurrentMonth: false })
  }

  return cells
}

export default function JourneyPage() {
  const supabase = createClient()
  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [calendarReflections, setCalendarReflections] = useState<CalendarReflection[]>([])
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadJourneyData = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setCalendarReflections([])
        setHistoryItems([])
        setLoading(false)
        return
      }

      const { data: profile } = await supabase.from('user_profiles').select('pattern_history, couple_sessions').eq('id', user.id).single()

      const patternHistory = Array.isArray(profile?.pattern_history) ? profile.pattern_history : []
      const coupleSessions = Array.isArray(profile?.couple_sessions) ? profile.couple_sessions : []

      const soloCalendar = patternHistory
        .map((entry: ReflectionLike, index: number) => {
          const date = new Date(String(entry?.date || ''))
          if (Number.isNaN(date.getTime())) return null
          return {
            id: `solo-${index}`,
            date,
            dateKey: getDateKey(date),
            patternName: normalizePatternName(entry),
            description: normalizeDescription(entry),
          }
        })
        .filter(Boolean) as Array<{
        id: string
        date: Date
        dateKey: string
        patternName: string
        description: string
      }>

      const coupleHistory = coupleSessions
        .map((entry: ReflectionLike, index: number) => {
          const date = new Date(String(entry?.date || ''))
          if (Number.isNaN(date.getTime())) return null
          return {
            id: `couple-${index}`,
            date,
            dateKey: getDateKey(date),
            patternName: normalizePatternName(entry),
            description: normalizeDescription(entry),
          }
        })
        .filter(Boolean) as Array<{
        id: string
        date: Date
        dateKey: string
        patternName: string
        description: string
      }>

      const nextHistory: HistoryItem[] = [
        ...soloCalendar.map((item) => ({
          id: item.id,
          date: item.date.toISOString(),
          kind: 'Solo' as const,
          patternName: item.patternName,
          description: item.description,
        })),
        ...coupleHistory.map((item) => ({
          id: item.id,
          date: item.date.toISOString(),
          kind: 'Couple' as const,
          patternName: item.patternName,
          description: item.description,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setCalendarReflections(
        soloCalendar.map((item) => ({
          dateKey: item.dateKey,
          patternName: item.patternName,
        }))
      )
      setHistoryItems(nextHistory)
      setLoading(false)
    }

    void loadJourneyData()
  }, [supabase])

  const monthLabel = displayMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const highlightedDateMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const reflection of calendarReflections) {
      if (!map.has(reflection.dateKey)) map.set(reflection.dateKey, reflection.patternName)
    }
    return map
  }, [calendarReflections])

  const calendarCells = useMemo(() => buildCalendarCells(displayMonth), [displayMonth])

  const selectedPattern = selectedDateKey ? highlightedDateMap.get(selectedDateKey) ?? null : null

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-5 pb-[96px] text-white">
      <h1 className="text-2xl font-bold">Journey</h1>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
            onClick={() => setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          >
            ←
          </button>
          <p className="text-sm font-semibold">{monthLabel}</p>
          <button
            type="button"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
            onClick={() => setDisplayMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          >
            →
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7">
          {WEEKDAY_LABELS.map((label) => (
            <p key={label} className="pb-2 text-center text-xs text-white/45">
              {label}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell) => {
            const dateKey = getDateKey(cell.date)
            const isHighlighted = highlightedDateMap.has(dateKey)
            const isSelected = selectedDateKey === dateKey
            const canOpen = isHighlighted && cell.inCurrentMonth
            return (
              <button
                key={`${dateKey}-${cell.inCurrentMonth ? 'in' : 'out'}`}
                type="button"
                onClick={() => {
                  if (!canOpen) return
                  setSelectedDateKey((prev) => (prev === dateKey ? null : dateKey))
                }}
                className={`relative flex h-10 items-center justify-center rounded-lg text-sm transition-colors ${
                  cell.inCurrentMonth ? 'text-white/90' : 'text-white/25'
                } ${isSelected ? 'bg-white/15' : 'bg-white/5'} ${canOpen ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {cell.date.getDate()}
                {isHighlighted ? <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-violet-400" /> : null}
              </button>
            )
          })}
        </div>

        {selectedPattern ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-white/45">Selected reflection</p>
            <p className="mt-1 text-sm text-white/85">{selectedPattern}</p>
          </div>
        ) : null}
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Reflection History</h2>
        {loading ? <p className="text-sm text-white/55">Loading your journey...</p> : null}

        {!loading && historyItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm leading-relaxed text-white/70">
              Your reflections will appear here.
              <br />
              Start your first reflection to begin your journey.
            </p>
          </div>
        ) : null}

        {!loading &&
          historyItems.map((item) => (
            <div key={item.id} className="mb-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">{formatMemberDateLabel(item.date, item.kind)}</p>
              <p className="mt-1 font-semibold text-white">{item.patternName}</p>
              <p className="mt-1 text-sm text-white/70">{item.description}</p>
            </div>
          ))}
      </section>
    </div>
  )
}
