"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"
import { slugToDisplayName } from "@/lib/referralSlug"

const REFERRER_STORAGE_KEY = "luma_referrer"

export default function InviteLandingPage() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : ""
  const displayName = slugToDisplayName(slug)

  useEffect(() => {
    if (slug && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(REFERRER_STORAGE_KEY, slug)
      } catch {}
    }
  }, [slug])

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />

      <main className="flex-1 pt-20">
        <section className="max-w-[720px] mx-auto px-6 py-20 md:py-28 text-center animate-luma-fade-in">
          <p className="text-[#5a5a5a] text-lg leading-relaxed">
            {displayName} explored their inner world on Luma.
          </p>
          <h1 className="font-serif text-3xl md:text-4xl leading-tight text-[#2F2F2F] mt-8 text-balance [font-family:var(--font-serif-display)]">
            What does your inner world look like?
          </h1>
          <Link
            href="/test"
            className="inline-flex items-center justify-center gap-2 mt-10 px-6 py-3.5 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium hover:opacity-90 transition-opacity"
          >
            Begin Reflection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
