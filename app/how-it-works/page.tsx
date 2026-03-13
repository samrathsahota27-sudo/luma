import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight, ImageIcon, Heart, Sparkles, Leaf } from "lucide-react"

const steps = [
  {
    number: 1,
    title: "Choose the images that resonate with you",
    description: "Each round presents a grid of symbolic images. There are no right or wrong answers — only what draws your attention, creates tension, or feels significant in the moment.",
    icon: ImageIcon,
  },
  {
    number: 2,
    title: "Your choices reveal emotional patterns",
    description: "What you select and how you respond to short prompts creates a pattern. These patterns often reflect underlying emotional terrain that is hard to name directly.",
    icon: Heart,
  },
  {
    number: 3,
    title: "AI generates a reflective interpretation",
    description: "Based on your selections and words, a reflective narrative is generated. It describes themes and textures — it does not diagnose, advise, or compare you to others.",
    icon: Sparkles,
  },
  {
    number: 4,
    title: "Over time your inner landscape evolves",
    description: "Returning to the experience over time lets you notice how your responses shift. The focus is on awareness and curiosity, not on fixing or improving.",
    icon: Leaf,
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="max-w-[720px] mx-auto px-6 py-20 md:py-28 animate-luma-fade-in">
          <span className="text-xs uppercase tracking-widest text-[#5a5a5a]">
            The Process
          </span>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-[#2F2F2F] mt-4 text-balance [font-family:var(--font-serif-display)]">
            How It Works
          </h1>
          <p className="mt-6 text-lg text-[#5a5a5a] leading-relaxed max-w-xl">
            Four rounds of visual selection. You choose what resonates, respond to
            brief prompts, and receive a personalized reflection — no scores, no labels.
          </p>
        </section>

        {/* 4 Steps with icons */}
        <section className="border-t border-[#E8E3D9]">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <div className="space-y-16 md:space-y-20">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.number}
                    className="animate-luma-fade-in"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="flex gap-6 md:gap-8">
                      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[#E8E3D9]/60 border border-[#E8E3D9] flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#2F2F2F]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="text-xs text-[#5a5a5a] font-medium">
                          Step {step.number}
                        </span>
                        <h2 className="font-serif text-xl md:text-2xl text-[#2F2F2F] mt-2 [font-family:var(--font-serif-display)]">
                          {step.title}
                        </h2>
                        <p className="mt-4 text-[#5a5a5a] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Rounds detail */}
        <section className="border-t border-[#E8E3D9] bg-[#E8E3D9]/20">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <span className="text-xs uppercase tracking-widest text-[#5a5a5a]">
              The four rounds
            </span>
            <h2 className="font-serif text-2xl text-[#2F2F2F] mt-4 [font-family:var(--font-serif-display)]">
              Orientation, Tension, Pace, Direction
            </h2>
            <p className="mt-4 text-[#5a5a5a] leading-relaxed">
              Each round has a theme: where your attention rests, what feels unresolved,
              what rhythm emerges, and what might begin to change. You&apos;ll choose one
              image per round and answer a short reflective prompt. The whole experience
              takes about 10–15 minutes.
            </p>
          </div>
        </section>

        {/* Time & Privacy */}
        <section className="border-t border-[#E8E3D9]">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="font-serif text-xl text-[#2F2F2F] [font-family:var(--font-serif-display)]">
                  Time required
                </h2>
                <p className="mt-4 text-[#5a5a5a] leading-relaxed">
                  The individual reflection takes approximately 10–15 minutes. There
                  is no timer. Move at your own pace.
                </p>
              </div>
              <div>
                <h2 className="font-serif text-xl text-[#2F2F2F] [font-family:var(--font-serif-display)]">
                  Privacy
                </h2>
                <p className="mt-4 text-[#5a5a5a] leading-relaxed">
                  Your selections and responses are used to generate your reflection.
                  We don&apos;t create profiles or track you across sessions. Each reflection
                  is a single, private moment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#E8E3D9] bg-[#2F2F2F] text-white">
          <div className="max-w-[720px] mx-auto px-6 py-20 text-center">
            <h2 className="font-serif text-2xl md:text-3xl [font-family:var(--font-serif-display)]">
              Begin your reflection
            </h2>
            <p className="mt-4 text-white/70 max-w-md mx-auto">
              The individual reflection is free. Find a quiet moment and see what
              emerges.
            </p>
            <Link
              href="/begin"
              className="inline-flex items-center justify-center gap-2 mt-8 px-6 py-3 bg-white text-[#2F2F2F] text-sm font-medium rounded-[12px] hover:opacity-90 transition-opacity"
            >
              Start Reflection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
