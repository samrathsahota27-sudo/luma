'use client'

import { usePWA } from '@/hooks/usePWA'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
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
    label: 'Reflect',
    path: '/test',
    action: 'reflect',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  },
  {
    label: 'Couple',
    path: '/couple-hub',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'white' : 'none'} stroke={active ? 'white' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    label: 'Journey',
    path: '/journey',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function PWALayout({ children }: { children: React.ReactNode }) {
  const isPWA = usePWA()
  const pathname = usePathname()
  const router = useRouter()
  const [reflectSheetOpen, setReflectSheetOpen] = useState(false)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  if (!isPWA) return <>{children}</>

  const handleNavTap = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.action === 'reflect') {
      setReflectSheetOpen(true)
      return
    }
    router.push(item.path)
  }

  const isReflectActive = pathname.startsWith('/test') || pathname.startsWith('/couple')

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0a]">
      <div className="bg-[#0a0a0a]" style={{ paddingTop: 'env(safe-area-inset-top)' }} />

      <div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>

      <div
        className="flex items-center justify-around border-t border-white/5 bg-[#111111]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', minHeight: '60px' }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.action === 'reflect'
              ? isReflectActive
              : pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))

          return (
            <button
              key={item.path}
              onClick={() => handleNavTap(item)}
              className="flex min-w-[60px] flex-col items-center justify-center gap-1 px-4 py-2"
            >
              {item.icon(isActive)}
              <span className="text-[10px] font-medium" style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.4)' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${reflectSheetOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setReflectSheetOpen(false)}
      >
        <div
          className="absolute bottom-0 left-0 right-0 rounded-t-3xl border border-white/10 bg-[#121212] p-5"
          style={{
            transition: 'transform 0.3s ease',
            transform: reflectSheetOpen ? 'translateY(0)' : 'translateY(100%)',
            paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => setTouchStartY(e.touches[0]?.clientY ?? null)}
          onTouchEnd={(e) => {
            const endY = e.changedTouches[0]?.clientY ?? null
            if (touchStartY != null && endY != null && endY - touchStartY > 60) {
              setReflectSheetOpen(false)
            }
            setTouchStartY(null)
          }}
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />

          <button
            type="button"
            className="mb-3 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
            onClick={() => {
              setReflectSheetOpen(false)
              router.push('/test')
            }}
          >
            <p className="text-base font-semibold text-white">Individual Reflection</p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm text-white/60">See your inner world</p>
              <span className="text-lg text-white/50">→</span>
            </div>
          </button>

          <button
            type="button"
            className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
            onClick={() => {
              setReflectSheetOpen(false)
              router.push('/couple/start')
            }}
          >
            <p className="text-base font-semibold text-white">Couple Reflection</p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm text-white/60">See what&apos;s between you</p>
              <span className="text-lg text-white/50">→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
