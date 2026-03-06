import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight, Users, Lock, Heart } from "lucide-react"

export default function CouplesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Premium Experience
            </span>
            <h1 className="font-serif text-4xl md:text-5xl leading-tight text-foreground mt-4 text-balance">
              The Space Between Us
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              A reflective experience for couples that approaches your relationship as 
              a shared space rather than a problem to solve. Each partner reflects 
              privately, then you explore what emerges together.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t border-border bg-secondary/30">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
              <h2 className="font-serif text-2xl md:text-3xl text-foreground">
                How the couple reflection works
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-border rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2">
                  Private Links
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each partner receives a private link to complete their individual 
                  reflection separately, without seeing the other&apos;s choices.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-border rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2">
                  Individual Reflections
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each partner completes the four rounds of visual selection and 
                  reflective prompts on their own time.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 border border-border rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2">
                  Shared Space
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  After both complete, enter The Space Between Us to explore relational 
                  imagery and receive a shared reflection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Shared Space */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="bg-secondary/50 aspect-[4/3] rounded-sm flex items-center justify-center">
                <div className="grid grid-cols-3 gap-3 p-6 max-w-xs">
                  {["Bridges", "Tables", "Paths", "Rooms", "Doors", "Meetings"].map((item) => (
                    <div 
                      key={item}
                      className="aspect-square bg-background border border-border rounded-sm flex items-center justify-center"
                    >
                      <span className="text-[10px] text-muted-foreground text-center px-1">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="font-serif text-2xl md:text-3xl text-foreground text-balance">
                  Relational Imagery
                </h2>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  In The Space Between Us, partners choose from symbolic relational 
                  images — bridges, shared tables, parallel paths, open rooms, doorways, 
                  and meeting points.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Each partner answers reflective prompts privately:
                </p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground italic">
                  <li>&quot;What part of this shared space feels most alive?&quot;</li>
                  <li>&quot;Where does distance appear?&quot;</li>
                  <li>&quot;What seems quietly supportive here?&quot;</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* The Reflection */}
        <section className="border-t border-border bg-secondary/30">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-serif text-2xl md:text-3xl text-foreground">
                The Shared Reflection
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                After completion, the AI generates a shared reflection describing the 
                tone of your relationship space, emotional atmosphere, and relational 
                dynamics — without assigning blame, roles, or responsibility.
              </p>
              
              <div className="mt-12 p-8 bg-card border border-border rounded-sm text-left">
                <p className="font-serif text-foreground italic leading-relaxed">
                  &quot;The space you&apos;ve created together holds a quality of patient attention. 
                  There&apos;s a bridge here that feels well-traveled, though one side shows signs 
                  of recent weathering. The shared table appears not at the center but slightly 
                  to the side, as if making room for something unnamed. What emerges is not 
                  distance but a kind of parallel movement — two rhythms that occasionally 
                  sync, occasionally diverge, always within hearing of each other...&quot;
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Example reflection
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-24">
            <div className="max-w-md mx-auto text-center">
              <h2 className="font-serif text-2xl md:text-3xl text-foreground">
                Begin your couple reflection
              </h2>
              <p className="mt-4 text-muted-foreground">
                A meaningful experience for two people.
              </p>
              
              <div className="mt-10 p-8 bg-card border border-border rounded-sm">
                <div className="text-3xl font-serif text-foreground">$29</div>
                <p className="text-sm text-muted-foreground mt-2">
                  One-time payment for both partners
                </p>
                
                <ul className="mt-6 space-y-3 text-sm text-left">
                  {[
                    "Two private reflection links",
                    "Individual reflections for each partner",
                    "The Space Between Us experience",
                    "AI-generated shared reflection",
                    "Private and confidential"
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/couples/checkout"
                  className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors"
                >
                  Start Couple Reflection
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <p className="mt-6 text-xs text-muted-foreground">
                Payment processing via Stripe. Your data is never stored.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
