import Link from "next/link"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* SECTION 1 — Hero */}
        <section className="relative px-6 py-24 md:py-32 text-center overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#E8E6E0] via-[#F5F3EE] to-[#F7F6F3]"
            aria-hidden
          />
          <div className="relative z-10 max-w-[720px] mx-auto">
            <h1 className="font-serif text-[36px] md:text-[48px] leading-tight text-balance text-[#2F2F2F] [font-family:var(--font-serif-display)] tracking-wide">
              What does your inner world look like?
            </h1>
            <p className="mt-8 text-base md:text-lg leading-relaxed text-[#5a5a5a] max-w-xl mx-auto">
              Luma is a reflective experience that reveals emotional patterns through images rather than questions.
            </p>
            <div className="mt-12">
              <Link
                href="/individual"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90 shadow-[0_4px_20px_rgba(47,47,47,0.15)]"
              >
                Start Reflection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Inner Landscapes Preview */}
        <section className="border-t border-[#E8E3D9] px-6 py-20 md:py-24">
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              Inner Landscapes
            </h2>
            <div className="mt-12 grid grid-cols-3 gap-5 md:gap-8">
              {["/r1_a.jpg", "/r2_a.jpg", "/r3_a.jpg"].map((src) => (
                <div
                  key={src}
                  className="relative aspect-[4/5] rounded-[16px] overflow-hidden bg-[#E8E3D9]/40 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 280px"
                  />
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-[#5a5a5a] max-w-lg mx-auto leading-relaxed text-base">
              Each reflection reveals a symbolic landscape shaped by your visual attention.
            </p>
          </div>
        </section>

        {/* SECTION 3 — How Luma Works (3 steps) */}
        <section className="border-t border-[#E8E3D9] bg-[#E8E3D9]/20 px-6 py-20 md:py-24">
          <div className="max-w-[960px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-[#2F2F2F] [font-family:var(--font-serif-display)] mb-16">
              How Luma Works
            </h2>

            <div className="space-y-24 md:space-y-28">
              {/* Step 1: Choose images */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#5a5a5a]">Step 1</span>
                  <h3 className="font-serif text-[22px] mt-3 text-[#2F2F2F] [font-family:var(--font-serif-display)]">
                    Choose the images that resonate with you
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-2 rounded-[16px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                  {["/r1_a.jpg", "/r2_a.jpg", "/r1_b.jpg", "/r2_b.jpg", "/r3_a.jpg", "/r4_a.jpg"].map((src) => (
                    <div key={src} className="relative aspect-square">
                      <Image src={src} alt="" fill className="object-cover" sizes="160px" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Patterns emerge */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 flex justify-center">
                  <div className="w-full max-w-[280px] aspect-square rounded-[16px] bg-gradient-to-br from-[#D4CFC4] via-[#E8E3D9] to-[#C9C4B8] shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center p-8">
                    <div className="grid grid-cols-3 gap-3 w-full h-full max-w-[140px]">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="rounded-full bg-[#2F2F2F]/10"
                          style={{ aspectRatio: "1" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <span className="text-xs uppercase tracking-widest text-[#5a5a5a]">Step 2</span>
                  <h3 className="font-serif text-[22px] mt-3 text-[#2F2F2F] [font-family:var(--font-serif-display)]">
                    Patterns begin to emerge
                  </h3>
                </div>
              </div>

              {/* Step 3: Reflection appears */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#5a5a5a]">Step 3</span>
                  <h3 className="font-serif text-[22px] mt-3 text-[#2F2F2F] [font-family:var(--font-serif-display)]">
                    A reflection appears
                  </h3>
                </div>
                <div className="rounded-[16px] overflow-hidden bg-white border border-[#E8E3D9] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-4">
                  <div className="relative aspect-[4/3] rounded-[12px] overflow-hidden bg-[#E8E3D9]/30">
                    <Image
                      src="/r2_a.jpg"
                      alt=""
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                  </div>
                  <p className="mt-4 text-sm text-[#5a5a5a] leading-relaxed">
                    Your reflection — a symbolic landscape shaped by your choices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 — Science Preview */}
        <section className="border-t border-[#E8E3D9] px-6 py-20 md:py-24">
          <div className="max-w-[640px] mx-auto text-center">
            <h2 className="font-serif text-[26px] md:text-[30px] text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              Inspired by psychology and perception research
            </h2>
            <p className="mt-6 text-[#5a5a5a] leading-relaxed text-base">
              Luma draws inspiration from research in visual cognition and projection psychology, which explore how people reveal emotional patterns through images.
            </p>
            <Link
              href="/science"
              className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-[#2F2F2F] hover:opacity-80 transition-opacity"
            >
              Learn More
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* SECTION 5 — Couple Reflection */}
        <section className="border-t border-[#E8E3D9] bg-[#E8E3D9]/20 px-6 py-20 md:py-24">
          <div className="max-w-[960px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              Two Inner Worlds
            </h2>
            <div className="mt-12 grid grid-cols-3 gap-4 md:gap-6 max-w-[720px] mx-auto">
              {[
                { src: "/r1_a.jpg", label: "Inner World A" },
                { src: "/r2_a.jpg", label: "Inner World B" },
                { src: "/r3_a.jpg", label: "The Space Between" },
              ].map(({ src, label }) => (
                <div key={label} className="flex flex-col">
                  <div className="relative aspect-[3/4] rounded-[16px] overflow-hidden bg-[#E8E3D9]/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 220px"
                    />
                  </div>
                  <p className="text-xs text-[#5a5a5a] mt-3 text-center font-medium tracking-wide">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-[#5a5a5a] max-w-md mx-auto leading-relaxed text-base">
              Explore the emotional landscape that emerges between two people.
            </p>
            <div className="mt-10 text-center">
              <Link
                href="/couple"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90 shadow-[0_4px_20px_rgba(47,47,47,0.15)]"
              >
                Try Couple Reflection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 6 — Reflection Journey */}
        <section className="border-t border-[#E8E3D9] px-6 py-20 md:py-24">
          <div className="max-w-[800px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              Your Inner Journey
            </h2>
            <div className="mt-12 grid grid-cols-3 gap-4 md:gap-6 max-w-[560px] mx-auto">
              {["/r1_a.jpg", "/r2_a.jpg", "/r3_a.jpg"].map((src) => (
                <div key={src} className="relative aspect-[3/4] rounded-[16px] overflow-hidden bg-[#E8E3D9]/40 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 180px"
                  />
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-[#5a5a5a] max-w-lg mx-auto leading-relaxed text-base">
              Over time, your reflections reveal subtle shifts in your inner landscape.
            </p>
          </div>
        </section>

        {/* SECTION 7 — Share Preview */}
        <section className="border-t border-[#E8E3D9] bg-[#E8E3D9]/20 px-6 py-20 md:py-24">
          <div className="max-w-[420px] mx-auto">
            <h2 className="font-serif text-[26px] md:text-[30px] text-center text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              Share Your Inner Landscape
            </h2>
            <div className="mt-10 mx-auto w-full max-w-[280px] aspect-[9/16] rounded-[24px] overflow-hidden bg-[#2F2F2F] shadow-[0_12px_40px_rgba(0,0,0,0.2)] border border-[#E8E3D9]/50">
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
            <p className="mt-6 text-center text-[#5a5a5a] text-base italic">
              Some reflections are worth sharing.
            </p>
          </div>
        </section>

        {/* SECTION 8 — Final CTA */}
        <section className="border-t border-[#E8E3D9] px-6 py-24 md:py-32 text-center">
          <div className="max-w-[600px] mx-auto">
            <p className="font-serif text-[22px] md:text-[26px] leading-relaxed text-[#2F2F2F] [font-family:var(--font-serif-display)]">
              Your inner world may already be speaking.
              <br />
              Luma simply helps you notice it.
            </p>
            <Link
              href="/individual"
              className="inline-flex items-center justify-center gap-2 mt-10 px-6 py-3.5 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90 shadow-[0_4px_20px_rgba(47,47,47,0.15)]"
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
