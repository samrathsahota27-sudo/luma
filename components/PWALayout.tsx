'use client'

import { usePWA } from '@/hooks/usePWA'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

type NavItem = {
  label: string
  path: string
  matchPrefixes?: string[]
  icon: (active: boolean) => ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    path: '/',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'white' : 'none'} stroke={active ? 'white' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Explore',
    path: '/journey',
    matchPrefixes: ['/journey', '/dashboard'],
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M3 11a9 9 0 0 1 18 0" />
        <path d="M3 16h18" />
        <circle cx="12" cy="16" r="2" fill={active ? 'white' : 'none'} />
      </svg>
    ),
  },
  {
    label: 'Chat',
    path: '/tools/chat-assistant',
    matchPrefixes: ['/tools/chat-assistant', '/tools/emotional-translator'],
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'white' : 'none'} stroke={active ? 'white' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    ),
  },
  {
    label: 'Answers',
    path: '/insights',
    matchPrefixes: ['/insights', '/tools/theory-mode', '/tools/signal-detector', '/tools/idea-generator'],
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M9 3h6l4 4v14H5V3z" />
        <path d="M9 12h6M9 16h6M15 3v4h4" />
      </svg>
    ),
  },
  {
    label: 'Us',
    path: '/us',
    matchPrefixes: ['/us', '/couple-hub', '/profile'],
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'white' : 'none'} stroke={active ? 'white' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
]

export default function PWALayout({ children }: { children: React.ReactNode }) {
  const isPWA = usePWA()
  const rawPathname = usePathname()
  const pathname = rawPathname || '/'
  const router = useRouter()
  const [isMobileShell, setIsMobileShell] = useState(false)

  useEffect(() => {
    const sync = () => {
      const compactViewport = window.matchMedia('(max-width: 1024px)').matches
      const coarsePointer = window.matchMedia('(pointer: coarse)').matches
      setIsMobileShell(compactViewport || coarsePointer)
    }
    sync()
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
    }
  }, [])

  // Fallback to mobile shell when standalone detection is inconsistent on iOS/PWA.
  if (!isPWA && !isMobileShell) return <>{children}</>

  const handleNavTap = (item: NavItem) => {
    router.push(item.path)
  }

  const navState = useMemo(
    () =>
      NAV_ITEMS.map((item) => {
        const prefixes = item.matchPrefixes?.length ? item.matchPrefixes : [item.path]
        const isActive = prefixes.some((prefix) => pathname === prefix || (prefix !== '/' && pathname.startsWith(prefix)))
        return { item, isActive }
      }),
    [pathname]
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a]">
      <div className="bg-[#0a0a0a]" style={{ paddingTop: 'env(safe-area-inset-top)' }} />

      <div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>

      <div
        className="flex items-center justify-around border-t border-white/5 bg-[#111111]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', minHeight: '72px' }}
      >
        {navState.map(({ item, isActive }) => {
          return (
            <button
              key={item.path}
              onClick={() => handleNavTap(item)}
              className="flex min-h-[58px] min-w-[64px] flex-col items-center justify-center gap-1 px-3 py-2"
              aria-label={item.label}
            >
              {item.icon(isActive)}
              <span className="text-[10px] font-medium" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.4)' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
