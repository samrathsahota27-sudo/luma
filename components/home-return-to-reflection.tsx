"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight } from "lucide-react"
import { getReflections, type ReflectionEntry } from "@/lib/reflectionStorage"

function getLatest(entries: ReflectionEntry[]): ReflectionEntry | null {
  if (!entries.length) return null
  const sorted = [...entries].sort((a, b) => (b.date > a.date ? 1 : -1))
  return sorted[0] ?? null
}

export function HomeReturnToReflection() {
  const [latestId, setLatestId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const latest = getLatest(getReflections())
      setLatestId(latest?.id ?? null)
    } catch {
      setLatestId(null)
    }
  }, [])

  const href = useMemo(() => {
    if (!latestId) return null
    return `/dashboard/reflection/${latestId}`
  }, [latestId])

  if (!href) return null

  return (
    <section className="border-t border-[#E8E3D9] px-6 py-16 md:py-20 bg-white/40">
      <div className="max-w-[960px] mx-auto">
        <div className="rounded-[20px] bg-white/70 border border-[#E8E3D9]/70 shadow-[0_10px_30px_rgba(0,0,0,0.05)] px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="font-serif text-[22px] md:text-[26px] text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              Return to your reflection
            </h2>
            <p className="mt-2 text-[#5a5a5a] leading-relaxed text-base">
              Continue from your most recent saved reflection.
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <Link
              href={href}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90 shadow-[0_4px_20px_rgba(47,47,47,0.12)]"
            >
              Continue your journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

