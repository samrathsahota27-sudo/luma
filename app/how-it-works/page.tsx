import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"

const rounds = [
  {
    number: "01",
    title: "Orientation",
    theme: "Where does your attention rest?",
    prompt: "What about this image drew your attention first?",
    description: "The first round invites you to notice where your gaze naturally settles. This isn't about finding the \"right\" image — it's about noticing what calls to you."
  },
  {
    number: "02",
    title: "Tension",
    theme: "What holds unresolved energy?",
    prompt: "What in this scene feels slightly uncomfortable or unresolved?",
    description: "Tension isn't always negative. It can signal growth, change, or something asking for attention. This round surfaces what feels unfinished or in motion."
  },
  {
    number: "03",
    title: "Pace",
    theme: "What rhythm emerges?",
    prompt: "If this space had a rhythm, would it move slowly, quickly, or unevenly?",
    description: "Our inner lives have tempo. This round explores the rhythms you're drawn to — and what that might reflect about your current state."
  },
  {
    number: "04",
    title: "Direction",
    theme: "What wants to emerge?",
    prompt: "If you stayed here longer, what might begin to change?",
    description: "The final round looks forward. Not to predict, but to sense what feels ready to shift, grow, or reveal itself."
  }
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              The Process
            </span>
            <h1 className="font-serif text-4xl md:text-5xl leading-tight text-foreground mt-4 text-balance">
              How It Works
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Four rounds of visual selection. Each round presents a grid of symbolic 
              images. You choose the one that resonates, then respond to a brief 
              reflective prompt. At the end, you receive a personalized reflection.
            </p>
          </div>
        </section>

        {/* Rounds */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="space-y-16">
              {rounds.map((round, index) => (
                <div 
                  key={round.number}
                  className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className={index % 2 === 1 ? "md:order-2" : ""}>
                    <span className="text-xs text-accent font-medium">
                      Round {round.number}
                    </span>
                    <h2 className="font-serif text-2xl md:text-3xl text-foreground mt-2">
                      {round.title}
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      {round.theme}
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-6">
                      {round.description}
                    </p>
                    <p className="text-sm italic text-muted-foreground mt-4 border-l-2 border-border pl-4">
                      &quot;{round.prompt}&quot;
                    </p>
                  </div>
                  
                  <div className={`bg-secondary/50 aspect-[4/3] rounded-sm flex items-center justify-center ${
                    index % 2 === 1 ? "md:order-1" : ""
                  }`}>
                    <div className="grid grid-cols-4 gap-2 p-6 max-w-[280px]">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div 
                          key={i}
                          className="aspect-square bg-background border border-border rounded-sm"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Reflection */}
        <section className="border-t border-border bg-secondary/30">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="max-w-2xl mx-auto text-center">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                After the rounds
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mt-4">
                Your Reflection
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                After completing all four rounds, the AI generates a personalized 
                reflection based on your choices and responses. This reflection 
                describes patterns and themes — it does not diagnose or advise.
              </p>
              
              <div className="mt-12 p-8 bg-card border border-border rounded-sm text-left">
                <p className="font-serif text-foreground leading-relaxed">
                  Across the spaces you chose, there is a recurring sense of movement 
                  held in restraint. The environments feel open yet slightly paused, 
                  as if something is waiting for the right moment to unfold. Thresholds 
                  appear often — doorways, paths, edges — suggesting a relationship 
                  with transition that is neither resistant nor rushing...
                </p>
                <p className="mt-4 text-xs text-muted-foreground text-right">
                  Example reflection excerpt
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Time & Privacy */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <h2 className="font-serif text-2xl text-foreground">
                  Time required
                </h2>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  The individual reflection takes approximately 10-15 minutes. There 
                  is no timer. Move at your own pace. The responses are optional but 
                  encouraged — they help create a richer reflection.
                </p>
              </div>
              
              <div>
                <h2 className="font-serif text-2xl text-foreground">
                  Privacy
                </h2>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  Your selections and responses are processed to generate your 
                  reflection, then not stored. We don&apos;t create profiles or track 
                  patterns across sessions. Each reflection is a single, private moment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-primary text-primary-foreground">
          <div className="max-w-5xl mx-auto px-6 py-20 text-center">
            <h2 className="font-serif text-2xl md:text-3xl">
              Begin your reflection
            </h2>
            <p className="mt-4 text-primary-foreground/70 max-w-md mx-auto">
              The individual reflection is free. Find a quiet moment and see what 
              emerges.
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
