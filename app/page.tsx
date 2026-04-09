import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeftRight, ArrowRight, Eye, Heart, Link2, Shield, Sparkles, Users } from "lucide-react"
import { RelationshipMapHero } from "@/components/RelationshipMapHero"
import { HomeHowItWorks } from "@/components/home-how-it-works"
import { HomeReturnToReflection } from "@/components/home-return-to-reflection"
import { HomeBeginPopup } from "@/components/home-begin-popup"
import { HomeInnerJourneyCalendar } from "@/components/home-inner-journey-calendar"

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
              It&apos;s not what you say. It&apos;s what you avoid.
            </h1>
            <p className="mt-8 text-base md:text-lg leading-relaxed text-white/80 max-w-xl mx-auto text-balance">
              Luma decodes the emotional patterns between you - the tension, distance, and unspoken signals you can
              feel but can&apos;t explain.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/choose-mode"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-white text-base font-medium transition-all duration-300 hover:bg-white/14 hover:border-white/35 hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_14px_44px_rgba(0,0,0,0.30)]"
              >
                See My Pattern
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/couple/start"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-white text-base font-medium transition-all duration-300 hover:bg-black/30 hover:border-white/30 hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.22)] hover:shadow-[0_14px_44px_rgba(0,0,0,0.28)]"
              >
                Decode Our Dynamic
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 2 — How Luma Helps You */}
        <section className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(80,60,120,0.12),rgba(5,5,8,0.96))] px-4 py-12">
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

        {/* SECTION 4 — Science Preview */}
        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-[960px] mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_16px_60px_rgba(31,26,23,0.14)]">
              {/* Background image */}
              <div aria-hidden className="absolute inset-0">
                <img src="/psy.jpg" alt="" className="w-full h-full object-cover" />
              </div>
              {/* Dark cinematic overlay */}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />

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

        {/* SECTION 5 — Your Inner Journey */}
        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <HomeInnerJourneyCalendar />
          </div>
        </section>

        {/* SECTION 6 — Previews (Example reflection cards) */}
        <section className="border-t border-white/10 px-4 py-10">
          <div className="max-w-[720px] mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* Example Individual Reflection */}
              <div className="w-full flex-shrink-0 md:flex-none md:w-[320px]">
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_26px_120px_rgba(0,0,0,0.70)] backdrop-blur-xl">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(140,110,200,0.20),transparent_70%),radial-gradient(ellipse_55%_45%_at_100%_100%,rgba(90,130,200,0.10),transparent_70%)]"
                  />
                  <div className="relative p-5 sm:p-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/25" aria-hidden />
                      Example Individual Reflection
                    </div>
                    <h3 className="mt-5 font-serif text-[22px] text-white [font-family:var(--font-serif-display)] tracking-tight">
                      Pattern: “Quiet Withdrawal”
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      When things get close, you go numb—then blame yourself for it.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                          Theme
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">Safety</p>
                        <p className="mt-1 text-xs text-white/45">protecting yourself</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                          Tone
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">Soft</p>
                        <p className="mt-1 text-xs text-white/45">not dramatic</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                          One line you&apos;ll keep hearing
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-white/70">
                          You call it “peace” when it&apos;s actually avoidance.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                          What you reach for
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-white/70">
                          Less noise. More control. A room you can breathe in.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                          What shifts it
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-white/70">
                          A small truth said early—before you disappear.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Couple Reflection */}
              <div className="w-full flex-shrink-0 md:flex-none md:w-[320px]">
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_26px_120px_rgba(0,0,0,0.70)] backdrop-blur-xl">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(140,110,200,0.18),transparent_70%),radial-gradient(ellipse_55%_45%_at_100%_100%,rgba(90,130,200,0.10),transparent_70%)]"
                  />
                  <div className="relative p-5 sm:p-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/25" aria-hidden />
                      Example Couple Reflection
                    </div>
                    {(() => {
                      const innerWorldAImage = "/iwa.jpg"
                      const spaceBetweenImage = "/sbu.jpg"
                      const innerWorldBImage = "/iwb.jpg"

                      return (
                        <div className="flex items-center justify-between gap-3 mt-4 mb-4 overflow-x-auto flex-nowrap px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {[
                            { src: innerWorldAImage, label: "Inner World A", emphasis: "none" as const },
                            { src: spaceBetweenImage, label: "Space Between", emphasis: "primary" as const },
                            { src: innerWorldBImage, label: "Inner World B", emphasis: "none" as const },
                          ].map((item) => (
                            <div key={item.label} className="flex flex-col items-center flex-none">
                              <div
                                className={[
                                  "relative rounded-xl overflow-hidden border shadow-lg",
                                  "w-[90px] h-[90px] md:w-[110px] md:h-[110px]",
                                  item.emphasis === "primary"
                                    ? "scale-105 border-white/20 shadow-xl ring-1 ring-white/10"
                                    : "border-white/10",
                                ].join(" ")}
                              >
                                <Image src={item.src} alt="" fill className="object-cover" sizes="110px" />
                              </div>
                              <p className="text-xs text-white/60 text-center mt-1">{item.label}</p>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                    <h3 className="mt-5 font-serif text-[22px] text-white [font-family:var(--font-serif-display)] tracking-tight">
                      Shared pattern: “Soft Pursuit”
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      One reaches gently. The other goes quiet. Both feel rejected.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Drift</p>
                        <p className="mt-2 text-2xl font-semibold text-white tabular-nums">41%</p>
                        <p className="mt-1 text-xs text-white/45">rising slowly</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Tension</p>
                        <p className="mt-2 text-2xl font-semibold text-white tabular-nums">58%</p>
                        <p className="mt-1 text-xs text-white/45">hot/cold</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">One shared insight</p>
                        <p className="mt-3 text-sm leading-relaxed text-white/70">
                          When one softens, the other follows—just a beat later.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Alignment</p>
                        <div className="mt-3">
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,rgba(160,140,255,0.55),rgba(255,255,255,0.65))]" />
                          </div>
                          <p className="mt-2 text-xs text-white/55 tabular-nums">72%</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Distance signal</p>
                        <p className="mt-3 text-sm leading-relaxed text-white/70">
                          Silence feels like peace for one of you—and punishment for the other.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7 — Couple Preview (Relationship Map) */}
        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
                Relationship map
              </p>
              <h2 className="mt-3 font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
                SEE → UNDERSTAND → CLICK
              </h2>
              <p className="mt-3 text-sm text-white/55">
                A visual snapshot of alignment, drift, and tension.
              </p>
            </div>

            <div className="mt-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <RelationshipMapHero
                size="lg"
                className="rounded-[28px] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_26px_120px_rgba(0,0,0,0.65)]"
                connection={58}
                distance={46}
                conflict={52}
                resolvedCount={3}
              />
            </div>
          </div>
        </section>

        {/* SECTION 8 — Return to your reflection (only if saved) */}
        <HomeReturnToReflection />

        {/* SECTION 9 — Final CTA */}
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

        {/* SECTION 10 — Share Preview */}
        <section className="border-t border-white/10 bg-white/[0.03] px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-foreground [font-family:var(--font-serif-display)]">
              Share Your Inner Landscape
            </h2>
            <div className="mt-10 mx-auto w-full max-w-[280px] aspect-[9/16] rounded-[24px] overflow-hidden bg-white/[0.04] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(0,0,0,0.45),0_0_60px_rgba(120,90,180,0.12)] backdrop-blur-md">
              <div className="relative w-full h-full">
                <Image src="/r2_a.jpg" alt="" fill className="object-cover" sizes="280px" />
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
      </main>

      <Footer />
    </div>
  )
}
