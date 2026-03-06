import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 pt-20">
        <section className="max-w-3xl mx-auto px-6 py-24">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Trust & Transparency
          </span>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-foreground mt-4">
            Privacy & Ethics
          </h1>
          
          <div className="mt-12 prose prose-neutral max-w-none">
            <div className="space-y-12">
              <div>
                <h2 className="font-serif text-xl text-foreground mb-4">
                  Our commitment
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Luma is built on the principle that reflection should be private. 
                  Your inner life belongs to you. We do not store, analyze, or monetize 
                  your data. The experience exists to serve your awareness, not to 
                  extract value from it.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-xl text-foreground mb-4">
                  What we collect
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/30 rounded-sm">
                    <h3 className="font-medium text-foreground mb-2">
                      Individual Reflection (Free)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your image selections and written responses are sent to generate 
                      your reflection, then immediately discarded. We do not store them, 
                      create user profiles, or track patterns across sessions.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-secondary/30 rounded-sm">
                    <h3 className="font-medium text-foreground mb-2">
                      Couple Reflection (Paid)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Email addresses are used only to deliver private reflection links 
                      and are deleted after 30 days. Payment processing is handled by 
                      Stripe; we do not store payment details.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-xl text-foreground mb-4">
                  AI processing
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your selections and responses are processed by OpenAI to generate 
                  your reflection. This data is processed in real-time and not stored 
                  by OpenAI for training purposes. We use their API solely to generate 
                  your personalized reflection.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-xl text-foreground mb-4">
                  Cookies & analytics
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use minimal, privacy-respecting analytics to understand how Luma 
                  is used (page views, general geographic region). We do not use 
                  advertising cookies, retargeting, or cross-site tracking.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-xl text-foreground mb-4">
                  Ethical principles
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span>We do not claim therapeutic efficacy or medical benefit.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span>We do not diagnose, label, or categorize users.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span>We do not sell, share, or monetize personal data.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span>We do not create permanent records of your reflections.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span>We encourage professional support for mental health needs.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="font-serif text-xl text-foreground mb-4">
                  Your rights
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Because we don&apos;t store your reflection data, there&apos;s nothing to delete. 
                  If you&apos;ve used the paid couple experience, you can request deletion of 
                  your email address by contacting us. We will comply within 7 days.
                </p>
              </div>

              <div>
                <h2 className="font-serif text-xl text-foreground mb-4">
                  Contact
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Questions about privacy or data handling? Reach us at{" "}
                  <a 
                    href="mailto:privacy@luma.app" 
                    className="text-foreground underline underline-offset-4 hover:no-underline"
                  >
                    privacy@luma.app
                  </a>
                </p>
              </div>

              <div className="pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Last updated: March 2026
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
