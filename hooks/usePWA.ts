'use client'

import { useEffect, useState } from 'react'

export const usePWA = () => {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as { standalone?: boolean }).standalone === true
      setIsPWA(isStandalone || isIOSStandalone)
    }
    checkPWA()
  }, [])

  return isPWA
}
