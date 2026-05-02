'use client'

import { createClient } from '@/lib/supabase/client'
import {
  buildMergedTimelineEntries,
  getReflections,
  type ReflectionEntry,
} from '@/lib/reflectionStorage'
import { CalendarOfUsTimeline } from '@/components/CalendarOfUsTimeline'
import type { MergedEmotionEntry } from '@/hooks/useEmotionTrackerMerged'
import { useCallback, useEffect, useMemo, useState } from 'react'

function formatDateLabel(iso: string, mode: ReflectionEntry['mode']) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return mode === 'couple' ? 'Couple' : 'Solo'
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  return `${month} ${d.getDate()} · ${mode === 'couple' ? 'Couple' : 'Solo'}`
}

function excerpt(content: string, max = 135) {
  const clean = content.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max)}...`
}

function reflectionTitle(entry: ReflectionEntry) {
  if (entry.mode === 'couple') return 'Relationship Reflection'
  return 'Your Reflection'
}

function toDateKey(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calculateStreak(patternHistory: Array<Record<string, unknown>>) {
  const uniqueDates = new Set<string>()
  for (const entry of patternHistory) {
    const rawDate = typeof entry?.date === 'string' ? entry.date : ''
    if (!rawDate) continue
    const key = toDateKey(rawDate)
    if (key) uniqueDates.add(key)
  }

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const todayKey = toDateKey(today.toISOString())
  const yesterdayKey = toDateKey(yesterday.toISOString())
  if (!todayKey || !yesterdayKey) return 0

  if (!uniqueDates.has(todayKey) && !uniqueDates.has(yesterdayKey)) return 0

  const cursor = uniqueDates.has(todayKey) ? new Date(today) : new Date(yesterday)
  let streak = 0
  while (true) {
    const cursorKey = toDateKey(cursor.toISOString())
    if (!cursorKey || !uniqueDates.has(cursorKey)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export default function JourneyPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<ReflectionEntry[]>([])
  const [patternHistory, setPatternHistory] = useState<Array<Record<string, unknown>>>([])
  const [coupleSessions, setCoupleSessions] = useState<Array<Record<string, unknown>>>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const refreshEntries = useCallback(async () => {
    const local = getReflections()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setEntries(local)
        setPatternHistory([])
        setCoupleSessions([])
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
      setPatternHistory(Array.isArray(profile?.pattern_history) ? profile.pattern_history : [])
      setCoupleSessions(Array.isArray(profile?.couple_sessions) ? profile.couple_sessions : [])
    } catch {
      setEntries(local)
      setPatternHistory([])
      setCoupleSessions([])
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

  const sortedHistory = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries]
  )

  const streak = calculateStreak(patternHistory)
  const totalReflections = patternHistory.length + coupleSessions.length

  const calendarEntries = useMemo<MergedEmotionEntry[]>(
    () =>
      entries.map((entry) => ({
        id: String(entry.id),
        tag: entry.mode === 'couple' ? 'Relationship reflection' : 'Personal reflection',
        insight: excerpt(entry.content, 260),
        at: entry.date,
        sessionType: entry.mode,
        source: 'local',
        calendarState: null,
      })),
    [entries]
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-5 pb-[96px] text-white">
      <h1 className="text-2xl font-bold">Journey</h1>

      <div className="mt-6 flex items-center justify-center gap-2 bg-white/5 rounded-2xl p-4 mb-6">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="text-white text-2xl font-bold">{streak}</p>
          <p className="text-white/40 text-xs">day streak</p>
        </div>
        <div className="ml-6 text-center">
          <p className="text-white text-2xl font-bold">{totalReflections}</p>
          <p className="text-white/40 text-xs">reflections</p>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <CalendarOfUsTimeline variant="dark" entriesOverride={calendarEntries} loadingOverride={!historyLoaded} />
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

    </div>
  )
}
