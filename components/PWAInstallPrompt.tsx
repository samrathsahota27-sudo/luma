'use client'

import { usePWA } from '@/hooks/usePWA'
import { PWA_INSTALL_ACCEPTED_KEY, PWA_INSTALL_DISMISSED_KEY } from '@/lib/pwaInstall'
import { useEffect, useMemo, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isIosDevice() {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export default function PWAInstallPrompt() {
  const isPWA = usePWA()
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)

  const isIOS = useMemo(() => isIosDevice(), [])

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setHasScrolled(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isPWA || !hasScrolled) return
    if (typeof window === 'undefined') return

    const wasDismissed = localStorage.getItem(PWA_INSTALL_DISMISSED_KEY) === 'true'
    const wasAccepted = localStorage.getItem(PWA_INSTALL_ACCEPTED_KEY) === 'true'
    if (wasDismissed || wasAccepted) return

    const timer = window.setTimeout(() => {
      setIsOpen(true)
    }, 30000)
    return () => window.clearTimeout(timer)
  }, [hasScrolled, isPWA])

  if (!isOpen || isPWA) return null

  const closePrompt = () => {
    try {
      localStorage.setItem(PWA_INSTALL_DISMISSED_KEY, 'true')
    } catch {
      // ignore storage write errors
    }
    setIsOpen(false)
  }

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') {
      try {
        localStorage.setItem(PWA_INSTALL_ACCEPTED_KEY, 'true')
      } catch {
        // ignore storage write errors
      }
      setIsOpen(false)
      return
    }
    closePrompt()
  }

  const canPromptInstall = Boolean(installEvent)

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-4 md:bottom-6">
      <div className="mx-auto w-full max-w-[560px] rounded-2xl border border-white/10 bg-[#111111] p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Add Luma to your home screen</p>
            {canPromptInstall ? (
              <p className="mt-1 text-xs text-white/70">
                Install the app for a faster, full-screen experience.
              </p>
            ) : isIOS ? (
              <p className="mt-1 text-xs text-white/70">
                Tap Share, then choose "Add to Home Screen".
              </p>
            ) : (
              <p className="mt-1 text-xs text-white/70">
                Use your browser menu and choose "Install app".
              </p>
            )}
          </div>
          <button type="button" onClick={closePrompt} className="text-xs text-white/60 hover:text-white/90">
            Dismiss
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          {canPromptInstall ? (
            <button
              type="button"
              onClick={() => {
                void handleInstall()
              }}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Add to Home Screen
            </button>
          ) : null}
          <button type="button" onClick={closePrompt} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80">
            Later
          </button>
        </div>
      </div>
    </div>
  )
}
