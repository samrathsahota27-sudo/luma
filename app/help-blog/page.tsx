import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function HelpBlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />

      <main className="flex-1 pt-20 px-6 py-20 md:py-28">
        <div className="max-w-[720px] mx-auto">
          <h1 className="font-serif text-[34px] md:text-[40px] [font-family:var(--font-serif-display)]">
            How Luma works
          </h1>
          <p className="mt-6 text-[#5a5a5a] leading-relaxed text-base md:text-lg">
            Luma is a simple reflection. You choose images that feel right to you. Your choices help show patterns in how you feel.
          </p>

          <div className="mt-12 space-y-8">
            <section className="rounded-[16px] bg-white/70 border border-[#E8E3D9]/70 p-6 md:p-8 shadow-sm">
              <h2 className="font-serif text-[22px] [font-family:var(--font-serif-display)] mb-3">
                Step 1: Choose images
              </h2>
              <p className="text-[#5a5a5a] leading-relaxed">
                Pick the images that connect with you. There are no right or wrong answers.
              </p>
            </section>

            <section className="rounded-[16px] bg-white/70 border border-[#E8E3D9]/70 p-6 md:p-8 shadow-sm">
              <h2 className="font-serif text-[22px] [font-family:var(--font-serif-display)] mb-3">
                Step 2: Follow your instinct
              </h2>
              <p className="text-[#5a5a5a] leading-relaxed">
                Don&apos;t overthink. Choose what feels true in the moment.
              </p>
            </section>

            <section className="rounded-[16px] bg-white/70 border border-[#E8E3D9]/70 p-6 md:p-8 shadow-sm">
              <h2 className="font-serif text-[22px] [font-family:var(--font-serif-display)] mb-3">
                Step 3: Read your result
              </h2>
              <p className="text-[#5a5a5a] leading-relaxed">
                You get a clear reflection of what may be shaping your emotional state.
              </p>
            </section>
          </div>

          <div className="mt-14 flex flex-col sm:flex-row gap-4">
            <Link
              href="/choose-mode"
              className="inline-flex items-center justify-center rounded-full px-6 py-3.5 bg-[#2F2F2F] text-white text-base font-medium hover:opacity-90 transition-opacity"
            >
              Start reflection
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center justify-center rounded-full px-6 py-3.5 border border-[#E8E3D9] text-[#2F2F2F] text-base font-medium hover:bg-white/60 transition-colors"
            >
              Help & FAQ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

