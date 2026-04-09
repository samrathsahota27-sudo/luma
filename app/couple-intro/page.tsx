import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"

export default function CoupleIntroPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* SECTION 1 — HERO */}
        <section className="relative px-6 py-24 md:py-32 text-center overflow-hidden">
          <div aria-hidden className="absolute inset-0 scale-[1.05]">
            <Image
              src="/co.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center blur-[2px]"
            />
          </div>
          <div aria-hidden className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} />

          <div className="relative z-10 max-w-[760px] mx-auto animate-luma-fade-only" style={{ animationDuration: "0.8s" }}>
            <h1 className="font-serif text-[34px] md:text-[48px] leading-tight text-balance text-white [font-family:var(--font-serif-display)] tracking-wide">
              See your relationship in a new way
            </h1>
            <p className="mt-6 text-base md:text-lg leading-relaxed text-white/80 max-w-xl mx-auto">
              Understand not just yourself, but what exists between you.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3">
              <Link
                href="/couple-hub"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-white text-base font-medium transition-all duration-300 hover:bg-white/14 hover:border-white/35"
              >
                Open Control Panel
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-sm text-white/70">Open access for now</p>
            </div>
          </div>
        </section>

        {/* SECTION 2 — WHAT YOU GET */}
        <section className="border-t border-white/10 px-6 py-20 md:py-24">
          <div className="max-w-[960px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-foreground [font-family:var(--font-serif-display)]">
              What you&apos;ll experience
            </h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[
                "See both inner worlds",
                "Understand your emotional patterns",
                "Discover the space between you",
              ].map((t) => (
                <div
                  key={t}
                  className="rounded-[16px] bg-white/[0.05] border border-white/10 shadow-sm p-6"
                >
                  <p className="text-foreground font-medium">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3 — HOW IT WORKS */}
        <section className="border-t border-white/10 bg-white/[0.03] px-6 py-20 md:py-24">
          <div className="max-w-[960px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-foreground [font-family:var(--font-serif-display)]">
              How it works
            </h2>
            <div className="mt-12 space-y-4 md:space-y-5 max-w-[720px] mx-auto">
              {[
                { step: "Step 1", text: "Both partners take the reflection separately" },
                { step: "Step 2", text: "Your responses are combined" },
                { step: "Step 3", text: "You receive a shared emotional insight" },
              ].map((s) => (
                <div
                  key={s.step}
                  className="rounded-[16px] bg-white/[0.05] border border-white/10 shadow-sm p-6 md:p-7"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{s.step}</p>
                  <p className="mt-3 text-foreground font-medium">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 — WHY IT MATTERS */}
        <section className="border-t border-white/10 px-6 py-20 md:py-24">
          <div className="max-w-[760px] mx-auto text-center">
            <h2 className="font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
              Why it matters
            </h2>
            <p className="mt-8 text-muted-foreground leading-relaxed text-base md:text-lg">
              Most relationship tools focus on problems.
              <br />
              Luma reveals patterns you didn&apos;t know existed.
            </p>
          </div>
        </section>

        {/* SECTION 5 — VISUAL PREVIEW */}
        <section className="border-t border-white/10 bg-white/[0.03] px-6 py-20 md:py-24">
          <div className="max-w-[960px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-foreground [font-family:var(--font-serif-display)]">
              Visual preview
            </h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-[840px] mx-auto">
              {[
                { src: "/iwa.jpg", label: "Inner World A" },
                { src: "/iwb.jpg", label: "Inner World B" },
                { src: "/sbu.jpg", label: "The Space Between" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <div className="relative aspect-[3/4] rounded-[16px] overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                    <Image src={item.src} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 260px" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center font-medium tracking-wide">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6 — ACCESS */}
        <section className="border-t border-white/10 px-6 py-20 md:py-24">
          <div className="max-w-[720px] mx-auto text-center">
            <h2 className="font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
              Couple Reflection
            </h2>
            <p className="mt-6 text-foreground text-3xl md:text-4xl font-serif [font-family:var(--font-serif-display)]">
              Unlocked
            </p>
            <p className="mt-2 text-muted-foreground text-base">Open access for now</p>
            <div className="mt-10">
              <Link
                href="/couple/start"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-base font-medium transition-opacity hover:opacity-90 shadow-[0_4px_20px_rgba(47,47,47,0.15)]"
              >
                Start Together
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 7 — TRUST / SAFETY */}
        <section className="border-t border-white/10 bg-white/[0.03] px-6 py-20 md:py-24">
          <div className="max-w-[960px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-foreground [font-family:var(--font-serif-display)]">
              Trust and safety
            </h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-[960px] mx-auto">
              {[
                "Private and confidential",
                "No right or wrong answers",
                "Designed for reflection, not judgment",
              ].map((t) => (
                <div
                  key={t}
                  className="rounded-[16px] bg-white/[0.05] border border-white/10 shadow-sm p-6"
                >
                  <p className="text-foreground font-medium">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

