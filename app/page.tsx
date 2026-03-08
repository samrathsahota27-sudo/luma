import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf7f0] text-neutral-900">
      <Navigation />
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight text-balance">
              See what may be shaping your inner world.
            </h1>
            <p className="mt-6 text-base md:text-lg leading-relaxed text-neutral-700 max-w-2xl mx-auto">
              A quiet visual reflection experience designed to reveal patterns beneath your awareness.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/begin"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-neutral-900 text-[#fbf7f0] text-sm font-medium shadow-sm hover:shadow-md hover:bg-neutral-800 transition"
              >
                Begin Reflection
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/couples"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                Couple Reflection
              </Link>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16">
              <div>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Philosophy
                </span>
                <h2 className="font-serif text-2xl md:text-3xl mt-4 text-balance">
                  Awareness before advice
                </h2>
              </div>
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Luma does not diagnose, instruct, or prescribe. Instead, it creates 
                  conditions for you to notice what is already present within your 
                  experience — the patterns, rhythms, and textures of your inner life.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Through symbolic imagery and gentle prompts, meaning emerges gradually, 
                  discovered rather than produced.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Preview */}
        <section className="border-t border-border bg-secondary/30">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                The Experience
              </span>
              <h2 className="font-serif text-2xl md:text-3xl mt-4">
                Four rounds of reflection
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  number: "01", 
                  title: "Orientation", 
                  description: "What draws your attention first?" 
                },
                { 
                  number: "02", 
                  title: "Tension", 
                  description: "What feels slightly uncomfortable or unresolved?" 
                },
                { 
                  number: "03", 
                  title: "Pace", 
                  description: "Does this space move slowly, quickly, or unevenly?" 
                },
                { 
                  number: "04", 
                  title: "Direction", 
                  description: "What might begin to change if you stayed longer?" 
                },
              ].map((step) => (
                <div key={step.number} className="group">
                  <span className="text-xs text-accent font-medium">
                    {step.number}
                  </span>
                  <h3 className="font-serif text-lg mt-2 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <Link
                href="/how-it-works"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Learn more about the process
              </Link>
            </div>
          </div>
        </section>

        {/* Couple Section */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  For Couples
                </span>
                <h2 className="font-serif text-2xl md:text-3xl mt-4 text-balance">
                  The Space Between Us
                </h2>
                <p className="text-muted-foreground leading-relaxed mt-6">
                  A premium experience where partners complete individual reflections 
                  separately, then enter a shared space to explore the relationship 
                  itself — approached as a shared environment rather than a problem to solve.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  The AI-generated reflection describes the tone and atmosphere of 
                  your relationship space, without assigning blame or roles.
                </p>
                <Link
                  href="/couples"
                  className="inline-flex items-center gap-2 mt-8 text-sm text-foreground hover:text-muted-foreground transition-colors"
                >
                  Explore couple reflection
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-secondary/50 aspect-square rounded-sm flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto border border-border rounded-full flex items-center justify-center">
                    <div className="w-8 h-px bg-border rotate-45" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-6 uppercase tracking-wider">
                    Premium Experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-primary text-primary-foreground">
          <div className="max-w-5xl mx-auto px-6 py-20 text-center">
            <h2 className="font-serif text-2xl md:text-3xl">
              Begin your reflection
            </h2>
            <p className="mt-4 text-primary-foreground/70 max-w-md mx-auto">
              A quiet moment of attention. No scores, no labels, no advice — 
              just space to notice.
            </p>
            <Link
              href="/test"
              className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-3 bg-background text-foreground text-sm font-medium rounded-sm hover:bg-background/90 transition-colors"
            >
              Start Free Reflection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
