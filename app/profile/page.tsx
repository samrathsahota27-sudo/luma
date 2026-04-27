'use client'

import { createClient } from '@/lib/supabase/client'
import { Bell, BookOpen, ChevronRight, CreditCard, Heart, KeyRound, Shield, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type UserProfile = {
  created_at?: string | null
  pattern_history?: Array<Record<string, unknown>>
  couple_sessions?: Array<Record<string, unknown>>
}

type OpenSection = 'notifications' | 'password' | null

function SectionHeading({ label }: { label: string }) {
  return <p className="mb-2 mt-7 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">{label}</p>
}

function IconWrap({ children }: { children: React.ReactNode }) {
  return <span className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.07] text-violet-200">{children}</span>
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

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [openSection, setOpenSection] = useState<OpenSection>(null)
  const [notifDaily, setNotifDaily] = useState(false)
  const [notifWeekly, setNotifWeekly] = useState(false)
  const [showPrivacySheet, setShowPrivacySheet] = useState(false)
  const [showRedeemSheet, setShowRedeemSheet] = useState(false)
  const [privacyRouteExists, setPrivacyRouteExists] = useState<boolean | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    try {
      setNotifDaily(localStorage.getItem('luma_notif_daily') === 'true')
      setNotifWeekly(localStorage.getItem('luma_notif_weekly') === 'true')
    } catch {
      // ignore localStorage read errors
    }
  }, [])

  useEffect(() => {
    const loadUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (!user) return

      const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
      setProfile(profile)
    }
    void loadUserAndProfile()
  }, [supabase.auth])

  useEffect(() => {
    const checkPrivacyRoute = async () => {
      try {
        const res = await fetch('/privacy', { method: 'HEAD' })
        setPrivacyRouteExists(res.ok)
      } catch {
        setPrivacyRouteExists(false)
      }
    }
    void checkPrivacyRoute()
  }, [])

  const toggleNotificationPreference = async (key: 'luma_notif_daily' | 'luma_notif_weekly', value: boolean) => {
    try {
      localStorage.setItem(key, String(value))
    } catch {
      // ignore localStorage write errors
    }

    if (value && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        await Notification.requestPermission()
      } catch {
        // ignore permission errors
      }
    }
  }

  const formatDisplayName = () => {
    const prefix = user?.email?.split('@')?.[0] ?? 'You'
    if (!prefix) return 'You'
    return prefix.charAt(0).toUpperCase() + prefix.slice(1)
  }

  const formatMemberSince = () => {
    if (!profile?.created_at) return null
    const date = new Date(profile.created_at)
    if (Number.isNaN(date.getTime())) return null
    const formatted = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    return `Member since ${formatted}`
  }

  const getPartnerDisplay = () => {
    const sessions = Array.isArray(profile?.couple_sessions) ? profile.couple_sessions : []
    if (sessions.length === 0) return null

    const latest = sessions[sessions.length - 1] ?? {}
    const candidates = [
      latest.partner_email,
      latest.partnerEmail,
      latest.partner_email_b,
      latest.email_b,
      latest.emailB,
      latest.partner_b_email,
      latest.partnerAEmail,
      latest.partnerBEmail,
    ]

    const partnerEmail = candidates.find((value) => typeof value === 'string' && value.includes('@')) as string | undefined
    if (partnerEmail) {
      const prefix = partnerEmail.split('@')[0] || 'Partner'
      return {
        letter: partnerEmail[0]?.toUpperCase() ?? 'P',
        name: prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : 'Partner',
      }
    }

    return { letter: 'P', name: 'Partner' }
  }

  const partnerDisplay = getPartnerDisplay()
  const patternHistory = Array.isArray(profile?.pattern_history) ? profile.pattern_history : []
  const coupleSessions = Array.isArray(profile?.couple_sessions) ? profile.couple_sessions : []
  const streak = calculateStreak(patternHistory)
  const totalReflections = patternHistory.length + coupleSessions.length
  const completionItems = [
    {
      label: 'Take your first reflection',
      complete: patternHistory.length > 0,
      onClick: () => router.push('/test'),
    },
    {
      label: 'Connect with your partner',
      complete: coupleSessions.length > 0,
      onClick: () => router.push('/couple/start'),
    },
    {
      label: 'Complete a couple reflection',
      complete: coupleSessions.length > 0,
      onClick: () => router.push('/couple/start'),
    },
    {
      label: '7-day streak',
      complete: streak >= 7,
      onClick: () => router.push('/journey'),
    },
  ]
  const completedCount = completionItems.filter((item) => item.complete).length
  const percentage = Math.round((completedCount / completionItems.length) * 100)
  const incompleteItems = completionItems.filter((item) => !item.complete).slice(0, 3)

  const handleSubscription = () => {
    router.push('/pricing')
  }

  const handlePrivacy = () => {
    if (privacyRouteExists !== false) {
      router.push('/privacy')
      return
    }
    setShowPrivacySheet(true)
  }

  const handlePasswordSave = async () => {
    setPasswordMessage(null)
    setPasswordError(null)

    if (!currentPassword.trim()) {
      setPasswordError('Please enter your current password')
      return
    }
    if (!newPassword.trim()) {
      setPasswordError('Please enter a new password')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match')
      return
    }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    setSavingPassword(false)

    if (error) {
      setPasswordError(error.message || 'Unable to update password')
      return
    }

    setPasswordMessage('Password updated')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleShare = async () => {
    const text = `I've been reflecting with Luma for ${streak} days straight. ${totalReflections} reflections deep. luma.app`
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Luma Journey',
          text,
          url: 'https://luma-i8rm.vercel.app',
        })
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // ignore share/copy errors and cancelled share sheet
    }
  }

  const settingsItemClass =
    'flex w-full items-center gap-3 px-4 py-[17px] text-left transition-colors hover:bg-white/[0.04] active:bg-white/[0.06]'

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-5 pb-[96px] pt-4 text-white">
      <h1 className="mb-5 font-serif text-[38px] leading-tight [font-family:var(--font-serif-display)]">Settings</h1>

      <div className="mt-6 mb-8 flex justify-center gap-10">
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-600 text-2xl font-bold text-white">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <p className="mt-2 text-center text-sm text-white">{formatDisplayName()}</p>
        </div>

        <button type="button" className="flex flex-col items-center" onClick={() => router.push('/couple/start')}>
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-white/30 bg-white/5 text-white/40">
            {partnerDisplay ? (
              <span className="text-2xl font-bold text-white">{partnerDisplay.letter}</span>
            ) : (
              <span className="text-3xl">+</span>
            )}
          </div>
          <p className={`mt-2 text-center text-sm ${partnerDisplay ? 'text-white' : 'text-white/40'}`}>
            {partnerDisplay ? partnerDisplay.name : 'Add Partner'}
          </p>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 bg-white/5 rounded-2xl p-4 mb-6">
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

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex flex-col items-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(#a855f7 ${percentage * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
            }}
          >
            <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center text-xs font-semibold text-black">{percentage}%</div>
          </div>
          <h2 className="mt-3 text-base font-semibold text-white">Complete your profile</h2>
        </div>

        {percentage === 100 ? (
          <p className="mt-4 text-center text-sm text-white/80">Profile complete 🎉</p>
        ) : (
          <div className="mt-4 space-y-3">
            {incompleteItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-[11px] text-white/40">○</span>
                  <p className="text-sm text-white/85">{item.label}</p>
                </div>
                <button type="button" onClick={item.onClick} className="text-xs font-medium text-violet-300 hover:text-violet-200">
                  Do it →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-5 flex items-center justify-between gap-4 rounded-[26px] border border-white/10 bg-white/[0.06] p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-[26px] font-bold">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[22px] font-semibold leading-tight">{formatDisplayName()}</p>
            <p className="truncate text-sm text-white/45">{user?.email}</p>
            {formatMemberSince() ? <p className="mt-1 text-xs text-white/30">{formatMemberSince()}</p> : null}
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/80"
          onClick={() => {
            setOpenSection((prev) => (prev === 'password' ? null : 'password'))
            setPasswordMessage(null)
            setPasswordError(null)
          }}
        >
          Edit
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between gap-3 rounded-[26px] border border-white/10 bg-gradient-to-r from-[#171717] to-[#101010] p-4">
        <div>
          <p className="text-base font-semibold text-white">Free Plan</p>
          <p className="text-sm text-white/55">Upgrade for full access</p>
        </div>
        <button
          type="button"
          onClick={handleSubscription}
          className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white"
        >
          Upgrade
        </button>
      </div>

      <SectionHeading label="Settings" />
      <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.06]">
        <button
          className={settingsItemClass}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          onClick={() => setOpenSection((prev) => (prev === 'notifications' ? null : 'notifications'))}
        >
          <IconWrap>
            <Bell className="h-5 w-5" />
          </IconWrap>
          <span className="flex-1 text-[16px] text-white/90">Notifications</span>
          <ChevronRight className="h-5 w-5 text-white/35" />
        </button>

        {openSection === 'notifications' ? (
          <div className="space-y-4 border-b border-white/5 bg-black/20 p-4">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-white/75">Daily reflection reminder</span>
              <button
                type="button"
                className={`h-7 w-12 rounded-full transition-colors ${notifDaily ? 'bg-violet-500/80' : 'bg-white/20'}`}
                onClick={async () => {
                  const next = !notifDaily
                  setNotifDaily(next)
                  await toggleNotificationPreference('luma_notif_daily', next)
                }}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white transition-transform ${notifDaily ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-white/75">Weekly report</span>
              <button
                type="button"
                className={`h-7 w-12 rounded-full transition-colors ${notifWeekly ? 'bg-violet-500/80' : 'bg-white/20'}`}
                onClick={async () => {
                  const next = !notifWeekly
                  setNotifWeekly(next)
                  await toggleNotificationPreference('luma_notif_weekly', next)
                }}
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white transition-transform ${notifWeekly ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </label>
          </div>
        ) : null}

        <button
          className={settingsItemClass}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          onClick={handleSubscription}
        >
          <IconWrap>
            <CreditCard className="h-5 w-5" />
          </IconWrap>
          <span className="flex-1 text-[16px] text-white/90">Subscription</span>
          <ChevronRight className="h-5 w-5 text-white/35" />
        </button>

        <button
          className={settingsItemClass}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          onClick={() => {
            setOpenSection((prev) => (prev === 'password' ? null : 'password'))
            setPasswordMessage(null)
            setPasswordError(null)
          }}
        >
          <IconWrap>
            <KeyRound className="h-5 w-5" />
          </IconWrap>
          <span className="flex-1 text-[16px] text-white/90">Change Password</span>
          <ChevronRight className="h-5 w-5 text-white/35" />
        </button>

        {openSection === 'password' ? (
          <div className="space-y-3 border-b border-white/5 bg-black/20 p-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
            {passwordError ? <p className="text-sm text-red-300">{passwordError}</p> : null}
            {passwordMessage ? <p className="text-sm text-emerald-300">{passwordMessage}</p> : null}
            <button
              type="button"
              onClick={handlePasswordSave}
              disabled={savingPassword}
              className="w-full rounded-xl bg-white/90 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {savingPassword ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : null}

        <button
          className={settingsItemClass}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          onClick={() => router.push('/couple-hub')}
        >
          <IconWrap>
            <Heart className="h-5 w-5" />
          </IconWrap>
          <span className="flex-1 text-[16px] text-white/90">Relationship</span>
          <ChevronRight className="h-5 w-5 text-white/35" />
        </button>

        <button
          className={settingsItemClass}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          onClick={handlePrivacy}
        >
          <IconWrap>
            <Shield className="h-5 w-5" />
          </IconWrap>
          <span className="flex-1 text-[16px] text-white/90">Privacy & Data</span>
          <ChevronRight className="h-5 w-5 text-white/35" />
        </button>

        <button className={settingsItemClass} onClick={() => setShowRedeemSheet(true)}>
          <IconWrap>
            <Tag className="h-5 w-5" />
          </IconWrap>
          <span className="flex-1 text-[16px] text-white/90">Redeem a Code</span>
          <ChevronRight className="h-5 w-5 text-white/35" />
        </button>
      </div>

      <SectionHeading label="Resources" />
      <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.06]">
        <button className={settingsItemClass} onClick={() => router.push('/science')}>
          <IconWrap>
            <BookOpen className="h-5 w-5" />
          </IconWrap>
          <span className="flex-1 text-[16px] text-white/90">Recommended Books</span>
          <ChevronRight className="h-5 w-5 text-white/35" />
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <h3 className="text-white font-semibold mb-1">Your Luma Journey</h3>
        <p className="text-white/40 text-sm mb-4">
          {streak} day streak · {totalReflections} reflections
        </p>
        <button
          onClick={() => {
            void handleShare()
          }}
          className="w-full py-3 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-medium"
        >
          Share my journey →
        </button>
      </div>

      {copied ? (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 px-3 py-2 text-xs text-white">
          Copied!
        </div>
      ) : null}

      <button onClick={handleSignOut} className="mt-6 w-full rounded-2xl bg-red-500/10 py-4 text-center font-medium text-red-400">
        Sign Out
      </button>

      <p className="mt-8 text-center text-xs text-white/20">Luma · Your reflection. Your mirror.</p>

      {showRedeemSheet ? (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowRedeemSheet(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl border border-white/10 bg-[#121212] p-6"
            style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Redeem a Code</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Code redemption will be available soon.
              <br />
              You can still access all current features from your profile and journey tabs.
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-white/10 py-3 text-sm font-medium text-white"
              onClick={() => setShowRedeemSheet(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {showPrivacySheet ? (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowPrivacySheet(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl border border-white/10 bg-[#121212] p-6"
            style={{
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">Privacy & Data</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Luma does not sell or share your data.
              <br />
              Your reflections are private and encrypted.
              <br />
              To delete your account, email: privacy@luma.app
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-white/10 py-3 text-sm font-medium text-white"
              onClick={() => setShowPrivacySheet(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
