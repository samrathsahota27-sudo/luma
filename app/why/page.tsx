import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"

export default function WhyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="max-w-[720px] mx-auto px-6 py-20 md:py-28 animate-luma-fade-in">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Philosophy
          </span>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-foreground mt-4 text-balance [font-family:var(--font-serif-display)]">
            Why Luma
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
            Most self-reflection tools ask you to name what you feel. Luma invites
            you to notice what you see — and let the meaning emerge on its own.
          </p>
        </section>

        {/* 1. Why images reveal hidden emotions */}
        <section className="border-t border-white/10 animate-luma-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground text-balance [font-family:var(--font-serif-display)]">
              Why images reveal hidden emotions
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Language shapes what we can notice. When we reach for words too quickly,
              we often settle for familiar categories — &quot;stressed,&quot; &quot;anxious,&quot; &quot;fine.&quot;
              Images bypass this limitation. They speak to a different layer of
              awareness — one that holds complexity without needing to resolve it
              into simple labels.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              What draws your eye, what creates tension, what feels like home or like
              a threshold — these responses often come before we have words. Luma
              creates space for that pre-verbal layer to show itself.
            </p>
          </div>
        </section>

        {/* 2. How the mind projects meaning onto images */}
        <section className="border-t border-white/10 bg-white/[0.03]">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground text-balance [font-family:var(--font-serif-display)]">
              How the mind projects meaning onto images
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              When you look at an image and feel something, you&apos;re not discovering
              what the image &quot;means.&quot; You&apos;re discovering what you bring to it.
              The same scene can feel peaceful to one person and restless to another.
              That difference is the projection of your inner world onto the image.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Luma uses images as mirrors. What resonates, what creates unease, what
              draws attention — these responses reveal patterns in your inner life
              without requiring you to explain or defend them.
            </p>
          </div>
        </section>

        {/* 3. Why reflection works better than personality quizzes */}
        <section className="border-t border-white/10">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground text-balance [font-family:var(--font-serif-display)]">
              Why reflection works better than personality quizzes
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Personality quizzes ask you to choose between fixed options. They
              produce labels — &quot;Type A,&quot; &quot;introvert,&quot; &quot;growth mindset&quot; — that can
              feel satisfying but often flatten the subtlety of lived experience.
              Reflection, by contrast, doesn&apos;t categorize you. It describes what
              emerged in a single moment of attention.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Luma offers no scores, no types, no comparison to others. The outcome
              is a narrative that reflects your choices and words back to you —
              inviting you to notice, not to be judged. Over time, returning to
              the practice lets you see how your inner landscape shifts, without
              the pressure to &quot;improve&quot; or fit a profile.
            </p>
          </div>
        </section>

        {/* What Luma Is Not */}
        <section className="border-t border-white/10 bg-white/[0.04]">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <h2 className="font-serif text-xl md:text-2xl text-foreground text-center mb-12 [font-family:var(--font-serif-display)]">
              What Luma is not
            </h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { title: "Not therapy", description: "Luma does not replace professional mental health care or provide clinical treatment." },
                { title: "Not diagnosis", description: "We don't label, categorize, or diagnose. There are no scores or personality types." },
                { title: "Not advice", description: "The reflections describe what emerged — they don't tell you what to do or how to change." },
                { title: "Not gamified", description: "No points, achievements, or progress bars. This is not self-improvement as entertainment." },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="font-serif text-lg text-foreground mb-2 [font-family:var(--font-serif-display)]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/10 bg-card/85 backdrop-blur-xl text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_80px_rgba(100,80,160,0.1)]">
          <div className="max-w-[720px] mx-auto px-6 py-20 text-center">
            <h2 className="font-serif text-2xl md:text-3xl [font-family:var(--font-serif-display)]">
              Ready to begin?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              The individual reflection is free. Take a quiet moment to see
              what emerges.
            </p>
            <Link
              href="/begin"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-[12px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-opacity hover:opacity-90"
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
