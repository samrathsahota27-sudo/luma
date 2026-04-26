'use client'

import { usePWA } from '@/hooks/usePWA'
import { PWA_INSTALL_ACCEPTED_KEY } from '@/lib/pwaInstall'
import { useEffect, useMemo, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isIosDevice() {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export default function AddToHomeScreenCta() {
  const isPWA = usePWA()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [hide, setHide] = useState(false)
  const isIOS = useMemo(() => isIosDevice(), [])

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(PWA_INSTALL_ACCEPTED_KEY) === 'true'
      setHide(accepted)
    } catch {
      setHide(false)
    }
  }, [])

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  if (isPWA || hide) return null

  const markAdded = () => {
    try {
      localStorage.setItem(PWA_INSTALL_ACCEPTED_KEY, 'true')
    } catch {
      // ignore storage write errors
    }
    setHide(true)
  }

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') {
      markAdded()
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-violet-300/30 bg-[linear-gradient(135deg,rgba(124,58,237,0.22),rgba(59,130,246,0.18))] p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-100/90">Install Luma</p>
      <h3 className="mt-2 font-serif text-2xl leading-tight [font-family:var(--font-serif-display)]">Add to Home Screen</h3>
      {installEvent ? (
        <p className="mt-2 text-sm leading-relaxed text-white/85">
          Install Luma now for faster loading, full-screen use, and a cleaner app experience.
        </p>
      ) : isIOS ? (
        <p className="mt-2 text-sm leading-relaxed text-white/85">
          On iPhone: tap Share, then select "Add to Home Screen".
        </p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-white/85">
          Open your browser menu and choose "Install app" or "Add to Home Screen".
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {installEvent ? (
          <button
            type="button"
            onClick={() => {
              void handleInstall()
            }}
            className="min-h-[46px] rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:opacity-95"
          >
            Add to Home Screen
          </button>
        ) : null}
        <button
          type="button"
          onClick={markAdded}
          className="min-h-[46px] rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white"
        >
          I&apos;ve added it
        </button>
      </div>
    </section>
  )
}

