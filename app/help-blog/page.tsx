import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function HelpBlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20 px-6 py-20 md:py-28">
        <div className="max-w-[720px] mx-auto">
          <h1 className="font-serif text-[34px] md:text-[40px] [font-family:var(--font-serif-display)]">
            How Luma works
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed text-base md:text-lg">
            Luma is a simple reflection. You choose images that feel right to you. Your choices help show patterns in how you feel.
          </p>

          <div className="mt-12 space-y-8">
            <section className="rounded-[16px] bg-white/[0.05] border border-white/10 p-6 md:p-8 shadow-sm">
              <h2 className="font-serif text-[22px] [font-family:var(--font-serif-display)] mb-3">
                Step 1: Choose images
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pick the images that connect with you. There are no right or wrong answers.
              </p>
            </section>

            <section className="rounded-[16px] bg-white/[0.05] border border-white/10 p-6 md:p-8 shadow-sm">
              <h2 className="font-serif text-[22px] [font-family:var(--font-serif-display)] mb-3">
                Step 2: Follow your instinct
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Don&apos;t overthink. Choose what feels true in the moment.
              </p>
            </section>

            <section className="rounded-[16px] bg-white/[0.05] border border-white/10 p-6 md:p-8 shadow-sm">
              <h2 className="font-serif text-[22px] [font-family:var(--font-serif-display)] mb-3">
                Step 3: Read your result
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You get a clear reflection of what may be shaping your emotional state.
              </p>
            </section>
          </div>

          <div className="mt-14 flex flex-col sm:flex-row gap-4">
            <Link
              href="/choose-mode"
              className="inline-flex items-center justify-center rounded-full px-6 py-3.5 bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-base font-medium hover:opacity-90 transition-opacity"
            >
              Start reflection
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3.5 text-base font-medium text-foreground shadow-[0_0_24px_rgba(0,0,0,0.15)] transition-colors hover:bg-white/[0.08]"
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

