import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeftRight, ArrowRight, Eye, Heart, Link2, Shield, Sparkles, Users } from "lucide-react"
import { HomeHowItWorks } from "@/components/home-how-it-works"
import { HomeReturnToReflection } from "@/components/home-return-to-reflection"
import { HomeBeginPopup } from "@/components/home-begin-popup"
import { HomeInnerJourneyCalendar } from "@/components/home-inner-journey-calendar"
import { HomeThreeClickTeaser } from "@/components/home-three-click-teaser"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />
      <HomeBeginPopup />

      <main className="flex-1 pt-20">
        {/* SECTION 1 — Hero */}
        <section className="relative px-6 py-24 md:py-32 text-center overflow-hidden min-h-[90vh] flex items-center justify-center">
          {/* Full-width background image */}
          <div aria-hidden className="absolute inset-0 scale-[1.05]">
            <Image
              src="/eye.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center blur-[2px]"
            />
          </div>
          {/* Soft dark overlay */}
          <div aria-hidden className="absolute inset-0 bg-black/30" />

          <div className="relative z-10 max-w-[720px] mx-auto animate-luma-fade-only" style={{ animationDuration: "0.8s" }}>
            <h1 className="font-serif text-[36px] md:text-[52px] leading-tight text-balance text-white [font-family:var(--font-serif-display)] tracking-wide">
              What does your inner world look like?
            </h1>
            <p className="mt-8 text-base md:text-lg leading-relaxed text-white/80 max-w-xl mx-auto">
              Luma reveals emotional patterns through images, not questions.
            </p>
            <div className="mt-12">
              <Link
                href="/choose-mode"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-white text-base font-medium transition-all duration-300 hover:bg-white/14 hover:border-white/35 hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_44px_rgba(0,0,0,0.30)]"
              >
                Explore Your Inner World
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <HomeThreeClickTeaser />

        {/* SECTION 2 — How Luma Helps You */}
        <section className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(80,60,120,0.12),rgba(5,5,8,0.96))] px-6 py-20 md:py-24">
          <div className="max-w-[960px] mx-auto">
            <div className="text-center max-w-[720px] mx-auto">
              <h2 className="font-serif text-[26px] md:text-[34px] text-foreground [font-family:var(--font-serif-display)]">
                How Luma Helps You
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Individual */}
              <div className="rounded-[22px] bg-white/[0.06] border border-white/10 shadow-[0_10px_35px_rgba(31,26,23,0.06)] p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55 text-center">
                  Individual
                </p>
                <div className="grid grid-cols-2 gap-6 mt-6">
                  {[
                    { Icon: Heart, text: "Understand your emotions" },
                    { Icon: Eye, text: "See hidden patterns" },
                    { Icon: Shield, text: "Reflect without judgment" },
                    { Icon: Sparkles, text: "Gain clarity about yourself" },
                  ].map(({ Icon, text }) => (
                    <div
                      key={text}
                      className="flex flex-col items-center text-center gap-2 rounded-[16px] bg-white/[0.04] border border-white/10 px-4 py-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(31,26,23,0.07)]"
                    >
                      <Icon className="h-5 w-5 text-white/70" />
                      <p className="text-sm text-white/75 leading-snug">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Couple */}
              <div className="rounded-[22px] bg-white/[0.06] border border-white/10 shadow-[0_10px_35px_rgba(31,26,23,0.06)] p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55 text-center">
                  Couple
                </p>
                <div className="grid grid-cols-2 gap-6 mt-6">
                  {[
                    { Icon: Users, text: "Understand each other better" },
                    { Icon: ArrowLeftRight, text: "See where you align" },
                    { Icon: Eye, text: "Notice emotional distance" },
                    { Icon: Link2, text: "Strengthen your connection" },
                  ].map(({ Icon, text }) => (
                    <div
                      key={text}
                      className="flex flex-col items-center text-center gap-2 rounded-[16px] bg-white/[0.04] border border-white/10 px-4 py-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(31,26,23,0.07)]"
                    >
                      <Icon className="h-5 w-5 text-white/70" />
                      <p className="text-sm text-white/75 leading-snug">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — How it works (swipeable) */}
        <HomeHowItWorks />

        {/* SECTION 4 — Return to your reflection (only if saved) */}
        <HomeReturnToReflection />

        {/* SECTION 5 — Science Preview */}
        <section className="border-t border-white/10 px-6 py-20 md:py-24">
          <div className="max-w-[960px] mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_16px_60px_rgba(31,26,23,0.14)]">
              {/* Background image */}
              <div aria-hidden className="absolute inset-0">
                <img
                  src="/psy.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Dark cinematic overlay */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"
              />

              {/* Text overlay */}
              <div className="relative z-10 p-7 md:p-10">
                <div className="max-w-[560px]">
                  <div className="inline-block px-4 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs tracking-wide border border-white/30 shadow-sm font-medium uppercase">
                    THE SCIENCE BEHIND LUMA
                  </div>
                  <h2 className="mt-5 font-serif text-[28px] md:text-[36px] leading-tight text-white [font-family:var(--font-serif-display)] drop-shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
                    Understand how your mind reveals itself
                  </h2>
                  <p className="mt-4 text-white/80 leading-relaxed text-base md:text-[17px] drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
                    Your choices reflect patterns shaped by how you see and feel.
                  </p>

                  <div className="mt-8">
                    <Link
                      href="/science"
                      className="inline-flex items-center gap-2 text-sm font-medium text-white/90 underline underline-offset-4 decoration-white/30 hover:decoration-white/60 hover:text-white transition"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 — Couple Reflection */}
        <section className="border-t border-white/10 bg-white/[0.03] px-6 py-20 md:py-24">
          <div className="max-w-[960px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-foreground [font-family:var(--font-serif-display)]">
              Two Inner Worlds
            </h2>
            <div className="mt-12 grid grid-cols-3 gap-4 md:gap-6 max-w-[720px] mx-auto">
              {[
                { src: "/iwa.jpg", label: "Inner World A" },
                { src: "/iwb.jpg", label: "Inner World B" },
                { src: "/sbu.jpg", label: "The Space Between" },
              ].map(({ src, label }) => (
                <div key={label} className="flex flex-col">
                  <div className="relative aspect-[3/4] rounded-[16px] overflow-hidden bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_30px_rgba(0,0,0,0.35)]">
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 220px"
                    />
                  </div>
                  <p className="text-xs text-white/60 mt-3 text-center font-medium tracking-wide">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-white/60 max-w-md mx-auto leading-relaxed text-base">
              Explore the emotional landscape that emerges between two people.
            </p>
            <div className="mt-10 text-center">
              <Link
                href="/couple-hub"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[12px] bg-white text-[#0b0a0d] text-base font-medium transition-opacity hover:opacity-90 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_40px_rgba(120,90,180,0.2)]"
              >
                Start Together
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 8 — Inner Journey Timeline */}
        <HomeInnerJourneyCalendar />

        {/* SECTION 7 — Share Preview */}
        <section className="border-t border-white/10 bg-white/[0.03] px-6 py-20 md:py-24">
          <div className="max-w-[420px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-foreground [font-family:var(--font-serif-display)]">
              Share Your Inner Landscape
            </h2>
            <div className="mt-10 mx-auto w-full max-w-[280px] aspect-[9/16] rounded-[24px] overflow-hidden bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(0,0,0,0.45),0_0_60px_rgba(120,90,180,0.12)] backdrop-blur-md">
              <div className="relative w-full h-full">
                <Image
                  src="/r2_a.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="280px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-sm font-medium opacity-90">My Luma reflection</p>
                  <p className="text-xs mt-1 opacity-75">@luma</p>
                </div>
              </div>
            </div>
            <p className="mt-6 text-center text-white/60 text-base italic">
              Some reflections are worth sharing.
            </p>
          </div>
        </section>

        {/* SECTION 8 — Final CTA */}
        <section className="border-t border-white/10 px-6 py-24 md:py-32 text-center">
          <div className="max-w-[600px] mx-auto">
            <p className="font-serif text-[22px] md:text-[26px] leading-relaxed text-foreground [font-family:var(--font-serif-display)]">
              Your inner world may already be speaking.
              <br />
              Luma simply helps you notice it.
            </p>
            <Link
              href="/test"
              className="inline-flex items-center justify-center gap-2 mt-10 px-6 py-3.5 rounded-[12px] bg-white text-[#0b0a0d] text-base font-medium transition-opacity hover:opacity-90 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_40px_rgba(120,90,180,0.2)]"
            >
              Begin Reflection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
