import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"
import { notFound } from "next/navigation"

const articles: Record<
  string,
  { title: string; excerpt: string; content: string[] }
> = {
  "why-images-reveal-emotional-patterns": {
    title: "Why images reveal emotional patterns",
    excerpt:
      "How visual choice can surface what we feel before we have the words — and why Luma starts with images instead of questions.",
    content: [
      "Human beings often recognize emotional patterns through images before they find the words to explain them. Language can narrow what we notice; images invite a different kind of attention.",
      "When you choose an image that resonates, you are not decoding a fixed meaning — you are revealing something about what you bring to it. That preference is a form of reflection.",
      "Luma is built around this idea: by starting with images instead of verbal questionnaires, we allow patterns to surface through visual attention and short written reflections, then translate those patterns into language designed to support your own awareness.",
    ],
  },
  "visual-cognition-and-self-reflection": {
    title: "Visual cognition and self-reflection",
    excerpt:
      "Research on how the brain processes images faster than language, and what that means for noticing patterns in our inner experience.",
    content: [
      "Research in cognitive psychology shows that the brain processes visual information significantly faster than language. Images can evoke memories, emotions, and associations before conscious reasoning begins.",
      "Because of this, visual preference can sometimes reveal patterns that structured verbal questions might overlook. What draws your eye, what creates tension, what feels like home — these responses often come before we have words.",
      "Luma uses this principle not to test you, but to create conditions for reflection. By observing patterns in your choices and responses, we offer language that may help you notice what is already present in your inner experience.",
    ],
  },
  "projection-in-psychology": {
    title: "Projection in psychology",
    excerpt:
      "The way we interpret ambiguous images through our own experiences — and how that principle shapes Luma's approach to reflection.",
    content: [
      "In psychology, projection refers to the way people interpret ambiguous images through their own internal experiences. When two people look at the same image, they often see different meanings shaped by personal memories, emotions, and associations.",
      "This principle has been explored for decades in psychological research using visual stimuli to understand perception and emotional organization. Luma is inspired by this idea: the images are mirrors. What resonates, what creates unease, what draws attention — these responses reveal patterns in your inner life.",
      "Luma does not diagnose or categorize. It uses projection as a window into reflection, offering observations that may help you notice what you bring to the images you choose.",
    ],
  },
  "how-perception-shapes-inner-awareness": {
    title: "How perception shapes inner awareness",
    excerpt:
      "Exploring the link between what we notice, what we choose, and what we can learn about our own emotional landscape.",
    content: [
      "Many emotional processes occur before they are translated into language. Non-verbal cognition research suggests that intuitive perception can reveal subtle patterns before people are able to describe them with words.",
      "Human perception naturally searches for patterns. Across multiple visual choices, small preferences can begin to reveal recurring themes in attention and emotional response.",
      "Luma observes these patterns and transforms them into reflective language — not to define who you are, but to help you notice what may already exist in your inner experience. Perception shapes awareness; Luma is designed to support that process.",
    ],
  },
}

type Props = { params: Promise<{ slug: string }> }

export default async function InsightArticlePage({ params }: Props) {
  const { slug } = await params
  const article = articles[slug]
  if (!article) notFound()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20">
        <article className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
          <Link
            href="/insights"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Insights
          </Link>
          <h1 className="font-serif text-3xl md:text-4xl leading-tight text-foreground mt-6 text-balance [font-family:var(--font-serif-display)]">
            {article.title}
          </h1>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            {article.excerpt}
          </p>
          <div className="mt-12 space-y-6">
            {article.content.map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-14 pt-8 border-t border-white/10">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-sm text-foreground font-medium hover:opacity-80 transition-opacity"
            >
              All insights
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>

        <section className="border-t border-white/10 bg-white/[0.03]">
          <div className="max-w-[720px] mx-auto px-6 py-16 text-center">
            <p className="text-foreground font-serif text-lg [font-family:var(--font-serif-display)]">
              Ready to explore your inner world?
            </p>
            <Link
              href="/test"
              className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium hover:opacity-90 transition-opacity"
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

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }))
}
