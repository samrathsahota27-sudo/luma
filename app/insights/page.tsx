import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"

const articles = [
  {
    slug: "why-images-reveal-emotional-patterns",
    title: "Why images reveal emotional patterns",
    excerpt:
      "How visual choice can surface what we feel before we have the words — and why Luma starts with images instead of questions.",
  },
  {
    slug: "visual-cognition-and-self-reflection",
    title: "Visual cognition and self-reflection",
    excerpt:
      "Research on how the brain processes images faster than language, and what that means for noticing patterns in our inner experience.",
  },
  {
    slug: "projection-in-psychology",
    title: "Projection in psychology",
    excerpt:
      "The way we interpret ambiguous images through our own experiences — and how that principle shapes Luma's approach to reflection.",
  },
  {
    slug: "how-perception-shapes-inner-awareness",
    title: "How perception shapes inner awareness",
    excerpt:
      "Exploring the link between what we notice, what we choose, and what we can learn about our own emotional landscape.",
  },
]

export default function InsightsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="max-w-[720px] mx-auto px-6 py-20 md:py-28 animate-luma-fade-in">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Insights
          </span>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-foreground mt-4 text-balance [font-family:var(--font-serif-display)]">
            Ideas behind Luma
          </h1>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-xl">
            Articles on visual cognition, perception, and the science of reflection — written to deepen your understanding of how Luma works.
          </p>
        </section>

        {/* Article list */}
        <section className="border-t border-white/10">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <div className="space-y-12">
              {articles.map((article) => (
                <article
                  key={article.slug}
                  className="group border-b border-white/10 pb-12 last:border-b-0 last:pb-0"
                >
                  <h2 className="font-serif text-xl md:text-2xl text-foreground [font-family:var(--font-serif-display)] group-hover:text-foreground/90 transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {article.excerpt}
                  </p>
                  <Link
                    href={`/insights/${article.slug}`}
                    className="inline-flex items-center gap-2 mt-4 text-sm text-foreground font-medium hover:opacity-80 transition-opacity"
                  >
                    Read more
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/10 bg-card/85 backdrop-blur-xl text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_-24px_80px_rgba(100,80,160,0.1)]">
          <div className="max-w-[720px] mx-auto px-6 py-16 text-center">
            <p className="font-serif text-xl [font-family:var(--font-serif-display)]">
              Curious what your inner world looks like?
            </p>
            <Link
              href="/test"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-[12px] bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-opacity hover:opacity-90"
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
