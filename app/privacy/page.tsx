import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20">
        <section className="max-w-3xl mx-auto px-6 py-24">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Privacy Policy</span>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-foreground mt-4 text-balance">
            Your relationship is not our business
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">
            This policy explains what data Luma collects, why we collect it, how we protect it, and what control you
            have. See also{" "}
            <Link href="/terms" className="text-foreground underline underline-offset-4 hover:opacity-90">
              Terms of use
            </Link>
            .
          </p>

          <div className="mt-10 max-w-2xl">
            <div className="space-y-10">
              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">1) What we collect</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may collect account details (such as email), reflection inputs you provide (text, selected images,
                  tool prompts, and optional uploads), generated reflection outputs, and product usage events needed to
                  run core features.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">2) How we use your data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use data to deliver reflections and tool outputs, personalize insights across your journey,
                  maintain timelines and progress features, improve reliability, and detect abuse or misuse. We do not
                  use your reflection content to build ad profiles.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">3) AI processing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Some features send prompts and related context to model providers to generate responses. We only send
                  data needed for the requested feature, and we design prompts to keep outputs focused on your
                  reflection context. Provider handling may vary by endpoint and plan.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">4) Storage and security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use industry-standard technical safeguards to protect data in transit and at rest. No system is
                  perfectly secure, but we continuously improve controls around access, logging, and infrastructure
                  hardening.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">5) Data sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal data. We may share limited data with service providers that help us run
                  core infrastructure (hosting, auth, storage, analytics, and model APIs), strictly for service
                  delivery and security operations.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">6) Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We keep data as long as needed to provide your account and requested features, comply with legal
                  obligations, resolve disputes, and enforce our terms. You can request deletion at any time.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">7) Your controls and rights</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You can access, update, or delete your account data where features allow. You may also request export
                  or deletion support by contacting us. If local device storage is used for feature continuity, you can
                  clear it from your browser settings.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">8) Cookies and local storage</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Luma may use cookies or local storage for authentication state, feature preferences, reminders, and
                  safe session continuity. We do not use this data for third-party behavioral advertising.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">9) Children&apos;s privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Luma is not intended for children under 13 (or the equivalent minimum age in your jurisdiction). If
                  you believe a child provided personal data, contact us and we will review and delete as required.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">10) International data use</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Depending on your location, your data may be processed in countries different from your own. Where
                  applicable, we use reasonable safeguards for cross-border processing.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">11) Changes to this policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this policy as features evolve. Material changes will be reflected by an updated date
                  and, where appropriate, in-product notice.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">12) Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For privacy requests or account deletion, contact{" "}
                  <a href="mailto:privacy@luma.app" className="text-foreground underline underline-offset-4 hover:opacity-90">
                    privacy@luma.app
                  </a>
                  .
                </p>
              </section>

              <div className="pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Last updated: April 2026
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
