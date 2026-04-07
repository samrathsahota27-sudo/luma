"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"
import { getReflections } from "@/lib/reflectionStorage"
import { createClient } from "@/lib/supabase/client"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/science", label: "The Science Behind Luma" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/test", label: "Individual" },
  { href: "/couple-hub", label: "Couple" },
]

const timelineLink = { href: "/dashboard/timeline", label: "Timeline" }

export function Navigation() {
  const supabase = createClient()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    try {
      setShowTimeline(getReflections().length > 0)
    } catch {
      setShowTimeline(false)
    }
  }, [pathname])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (mounted) setUserEmail(data?.user?.email ?? null)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase.auth])

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!accountMenuRef.current?.contains(target)) {
        setShowAccountMenu(false)
      }
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [])

  const desktopLinks = showTimeline
    ? [...navLinks.slice(0, 4), timelineLink, ...navLinks.slice(4)]
    : navLinks

  const avatarLetter = userEmail?.trim()?.charAt(0)?.toUpperCase() || "U"

  async function handleSignOut() {
    await supabase.auth.signOut()
    setShowAccountMenu(false)
    setIsOpen(false)
    router.push("/")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0b0a0d]/90 backdrop-blur-md shadow-[0_0_40px_-12px_rgba(120,90,180,0.25)]">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight text-white/95 hover:opacity-90 transition-opacity [font-family:var(--font-serif-display)]"
          >
            Luma
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? "text-white font-medium"
                    : "text-white/60 hover:text-white/95"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {userEmail ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowAccountMenu((v) => !v)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-medium"
                  aria-label="Open account menu"
                >
                  {avatarLetter}
                </button>
                {showAccountMenu ? (
                  <div className="absolute right-0 mt-2 min-w-[220px] rounded-xl border border-white/10 bg-[#141218]/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
                    <p className="text-xs text-white/45 break-all">{userEmail}</p>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="mt-3 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm text-white/80 hover:text-white hover:bg-white/[0.08] transition"
                    >
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link href="/auth" className="text-white/60 text-sm hover:text-white transition-colors">
                Sign in
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-white/10 mt-4 animate-in fade-in duration-200">
            <div className="flex flex-col gap-4">
              {userEmail ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-white/45 break-all">{userEmail}</p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-2 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="text-white/60 text-sm hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              )}
              {desktopLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm transition-colors ${
                    pathname === link.href
                      ? "text-white font-medium"
                      : "text-white/60 hover:text-white/95"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
