'use client'

import { useEffect, useState } from 'react'
import { PWA_INSTALL_ACCEPTED_KEY } from '@/lib/pwaInstall'

export const usePWA = () => {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    const checkPWA = () => {
      const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches
      const displayModeFullscreen = window.matchMedia('(display-mode: fullscreen)').matches
      const displayModeMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches
      const isIOSStandalone = (window.navigator as { standalone?: boolean }).standalone === true
      const isAndroidTwa = document.referrer.startsWith('android-app://')

      let acceptedInstallHint = false
      try {
        acceptedInstallHint = localStorage.getItem(PWA_INSTALL_ACCEPTED_KEY) === 'true'
      } catch {
        acceptedInstallHint = false
      }

      // Fallback for devices where standalone detection is flaky despite installation.
      const mobileViewport = window.matchMedia('(max-width: 1024px)').matches
      const installedHeuristic = acceptedInstallHint && mobileViewport

      setIsPWA(
        displayModeStandalone ||
          displayModeFullscreen ||
          displayModeMinimalUi ||
          isIOSStandalone ||
          isAndroidTwa ||
          installedHeuristic
      )
    }

    checkPWA()
    const onVisibility = () => checkPWA()
    const onFocus = () => checkPWA()
    const onStorage = () => checkPWA()
    const onResize = () => checkPWA()
    const onOrientation = () => checkPWA()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onFocus)
    window.addEventListener('storage', onStorage)
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onOrientation)

    // iOS sometimes reports standalone state a moment later.
    const timer = window.setTimeout(checkPWA, 250)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onOrientation)
    }
  }, [])

  return isPWA
}
