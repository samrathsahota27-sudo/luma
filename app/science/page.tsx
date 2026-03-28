import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"

export default function SciencePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Section 1 — Hero */}
        <section className="max-w-[720px] mx-auto px-6 py-20 md:py-28 animate-luma-fade-in text-center">
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-foreground text-balance [font-family:var(--font-serif-display)]">
            Understanding the Mind Through Images
          </h1>
          <div className="mt-10 space-y-6 text-muted-foreground text-base md:text-lg leading-relaxed max-w-[640px] mx-auto">
            <p>
              Human beings often recognize emotional patterns through
              images before they find the words to explain them.
            </p>
            <p>
              Luma is built around this simple idea.
            </p>
            <p>
              Instead of relying on verbal questionnaires, Luma allows
              patterns to surface through visual attention and reflection.
            </p>
          </div>
        </section>

        {/* Section 2 — Visual Cognition */}
        <section className="border-t border-white/10">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground text-balance [font-family:var(--font-serif-display)]">
              Visual Cognition
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Research in cognitive psychology shows that the brain
              processes visual information significantly faster than language.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Images can evoke memories, emotions, and associations
              before conscious reasoning begins.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Because of this, visual preference can sometimes reveal
              patterns that structured verbal questions might overlook.
            </p>
          </div>
        </section>

        {/* Section 3 — Projection in Psychology */}
        <section className="border-t border-white/10 bg-white/[0.03]">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground text-balance [font-family:var(--font-serif-display)]">
              Projection and Meaning-Making
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              In psychology, projection refers to the way people interpret
              ambiguous images through their own internal experiences.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              When two people look at the same image, they often see
              different meanings shaped by personal memories, emotions,
              and associations.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              This principle has been explored for decades in psychological
              research using visual stimuli to understand perception
              and emotional organization.
            </p>
          </div>
        </section>

        {/* Section 4 — Non-Verbal Cognition */}
        <section className="border-t border-white/10">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground text-balance [font-family:var(--font-serif-display)]">
              Reflection Before Explanation
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Many emotional processes occur before they are translated
              into language.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Non-verbal cognition research suggests that intuitive
              perception can reveal subtle patterns before people are
              able to describe them with words.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              By beginning with images instead of direct questions,
              Luma allows reflection to emerge gradually rather than
              forcing immediate explanations.
            </p>
          </div>
        </section>

        {/* Section 5 — Pattern Recognition */}
        <section className="border-t border-white/10 bg-white/[0.04]">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground text-balance [font-family:var(--font-serif-display)]">
              Patterns of Attention
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Human perception naturally searches for patterns.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Across multiple visual choices, small preferences can
              begin to reveal recurring themes in attention and
              emotional response.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Luma observes these patterns and transforms them
              into reflective language designed to help people
              notice what may already exist in their inner experience.
            </p>
          </div>
        </section>

        {/* Section 6 — AI as a Reflective Interpreter */}
        <section className="border-t border-white/10">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground text-balance [font-family:var(--font-serif-display)]">
              AI as a Mirror
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Luma uses artificial intelligence not to diagnose
              or categorize people, but to translate patterns into
              thoughtful observations.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              The goal is not to define who someone is, but to
              offer language that may help them reflect on their
              own inner landscape.
            </p>
          </div>
        </section>

        {/* Section 7 — Scientific Inspiration */}
        <section className="border-t border-white/10 bg-white/[0.03]">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground text-balance [font-family:var(--font-serif-display)]">
              Fields That Inspire Luma
            </h2>
            <ul className="mt-6 space-y-2 text-muted-foreground leading-relaxed list-disc list-inside">
              <li>cognitive psychology</li>
              <li>visual perception research</li>
              <li>projective psychology</li>
              <li>non-verbal cognition</li>
              <li>expressive arts therapy</li>
            </ul>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Luma is inspired by ideas from these areas of research,
              which explore how images, symbols, and perception
              can reflect emotional patterns.
            </p>
          </div>
        </section>

        {/* Final Section — Closing */}
        <section className="border-t border-white/10">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20 text-center">
            <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed [font-family:var(--font-serif-display)]">
              Luma is not designed to explain the mind.
            </p>
            <p className="mt-4 font-serif text-xl md:text-2xl text-foreground leading-relaxed [font-family:var(--font-serif-display)]">
              It is designed to help people notice it.
            </p>
          </div>
        </section>

        {/* Call to Action */}
        <section className="border-t border-white/10 bg-card/85 backdrop-blur-xl text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_80px_rgba(100,80,160,0.1)]">
          <div className="max-w-[720px] mx-auto px-6 py-20 text-center">
            <h2 className="font-serif text-2xl md:text-3xl [font-family:var(--font-serif-display)]">
              Curious what your inner world looks like?
            </h2>
            <Link
              href="/test"
              className="inline-flex items-center justify-center gap-2 mt-8 rounded-[12px] bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-opacity hover:opacity-90"
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
