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
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="max-w-[720px] mx-auto px-6 py-20 md:py-28 animate-luma-fade-in">
          <span className="text-xs uppercase tracking-widest text-[#5a5a5a]">
            Insights
          </span>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-[#2F2F2F] mt-4 text-balance [font-family:var(--font-serif-display)]">
            Ideas behind Luma
          </h1>
          <p className="mt-6 text-[#5a5a5a] text-lg leading-relaxed max-w-xl">
            Articles on visual cognition, perception, and the science of reflection — written to deepen your understanding of how Luma works.
          </p>
        </section>

        {/* Article list */}
        <section className="border-t border-[#E8E3D9]">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <div className="space-y-12">
              {articles.map((article) => (
                <article
                  key={article.slug}
                  className="group border-b border-[#E8E3D9] pb-12 last:border-b-0 last:pb-0"
                >
                  <h2 className="font-serif text-xl md:text-2xl text-[#2F2F2F] [font-family:var(--font-serif-display)] group-hover:text-[#2F2F2F]/90 transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-3 text-[#5a5a5a] leading-relaxed">
                    {article.excerpt}
                  </p>
                  <Link
                    href={`/insights/${article.slug}`}
                    className="inline-flex items-center gap-2 mt-4 text-sm text-[#2F2F2F] font-medium hover:opacity-80 transition-opacity"
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
        <section className="border-t border-[#E8E3D9] bg-[#2F2F2F] text-white">
          <div className="max-w-[720px] mx-auto px-6 py-16 text-center">
            <p className="font-serif text-xl [font-family:var(--font-serif-display)]">
              Curious what your inner world looks like?
            </p>
            <Link
              href="/test"
              className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 rounded-[12px] bg-white text-[#2F2F2F] text-sm font-medium hover:opacity-90 transition-opacity"
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
