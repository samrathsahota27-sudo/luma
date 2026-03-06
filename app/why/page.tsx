import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"

export default function WhyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Philosophy
            </span>
            <h1 className="font-serif text-4xl md:text-5xl leading-tight text-foreground mt-4 text-balance">
              Why Luma
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Most self-reflection tools ask you to name what you feel. Luma invites 
              you to notice what you see — and let the meaning emerge on its own.
            </p>
          </div>
        </section>

        {/* Philosophy Sections */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <h2 className="font-serif text-2xl text-foreground text-balance">
                  Non-verbal reflection
                </h2>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  Language shapes what we can notice. When we reach for words too quickly, 
                  we often settle for familiar categories — &quot;stressed,&quot; &quot;anxious,&quot; &quot;fine.&quot;
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Images bypass this limitation. They speak to a different layer of 
                  awareness — one that holds complexity without needing to resolve it 
                  into simple labels.
                </p>
              </div>
              
              <div>
                <h2 className="font-serif text-2xl text-foreground text-balance">
                  Projection as insight
                </h2>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  When you look at an image and feel something, you&apos;re not discovering 
                  what the image &quot;means.&quot; You&apos;re discovering what you bring to it.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  This is the principle behind Luma: the images are mirrors. What 
                  resonates, what creates tension, what draws attention — these 
                  responses reveal patterns in your inner life.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Luma Is Not */}
        <section className="border-t border-border bg-secondary/30">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground text-center mb-16">
              What Luma is not
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Not therapy",
                  description: "Luma does not replace professional mental health care or provide clinical treatment."
                },
                {
                  title: "Not diagnosis",
                  description: "We don't label, categorize, or diagnose. There are no scores or personality types."
                },
                {
                  title: "Not advice",
                  description: "The reflections describe what emerged — they don't tell you what to do or how to change."
                },
                {
                  title: "Not gamified",
                  description: "There are no points, achievements, or progress bars. This is not self-improvement as entertainment."
                }
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="font-serif text-lg text-foreground mb-2">
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

        {/* The Approach */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl text-foreground text-center mb-12">
                The approach
              </h2>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground">1</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-foreground mb-2">
                      Images as containers
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Each image holds symbolic space — environments, thresholds, rhythms. 
                      Your response to these spaces reveals something about your own 
                      inner landscape.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground">2</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-foreground mb-2">
                      Prompts as invitations
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      The questions aren&apos;t asking for information. They&apos;re inviting 
                      you to stay with what you noticed — to let it unfold rather than 
                      explain it.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground">3</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-foreground mb-2">
                      AI as witness
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      The reflection at the end doesn&apos;t come from analyzing you. It 
                      comes from noticing the patterns in what you chose and what you 
                      wrote — and describing them back to you with care.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-primary text-primary-foreground">
          <div className="max-w-5xl mx-auto px-6 py-20 text-center">
            <h2 className="font-serif text-2xl md:text-3xl">
              Ready to begin?
            </h2>
            <p className="mt-4 text-primary-foreground/70 max-w-md mx-auto">
              The individual reflection is free. Take ten quiet minutes to see 
              what emerges.
            </p>
            <Link
              href="/reflect"
              className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-3 bg-background text-foreground text-sm font-medium rounded-sm hover:bg-background/90 transition-colors"
            >
              Begin Free Reflection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
