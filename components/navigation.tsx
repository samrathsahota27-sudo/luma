"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { getReflections } from "@/lib/reflectionStorage"

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
  const [isOpen, setIsOpen] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    try {
      setShowTimeline(getReflections().length > 0)
    } catch {
      setShowTimeline(false)
    }
  }, [pathname])

  const desktopLinks = showTimeline
    ? [...navLinks.slice(0, 4), timelineLink, ...navLinks.slice(4)]
    : navLinks

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
