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
            Your relationship is not our business.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">
            This policy explains what information Luma collects, how we use it, and what choices you have. See also{" "}
            <Link href="/terms" className="text-foreground underline underline-offset-4 hover:opacity-90">
              Terms of use
            </Link>
            .
          </p>

          <div className="mt-10 max-w-2xl space-y-10">
            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">1) What we collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                We collect information you provide directly, such as account email, profile preferences, reflections,
                journal-like text, and tool inputs (for example, chat prompts, conflict replay entries, and onboarding responses).
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you use image-enabled features, we process the images you upload for analysis. We may also store
                metadata such as timestamps, feature usage events, and device/session context needed to run the product.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">2) How we use your information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use your information to provide reflections, personalize insights, maintain your history, improve
                feature quality, and support product reliability and abuse prevention.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We do not use your private reflections to run ad targeting. We do not sell your personal data.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">3) AI processing and third-party providers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Luma uses trusted infrastructure and AI providers to generate outputs. Data sent to these providers is
                limited to what is required to perform the requested feature.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Providers may temporarily process data for security and service operation. We configure integrations to
                prioritize privacy and minimize retention where possible.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">4) Storage and retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reflection data and related profile context are stored to support continuity across sessions and devices.
                We retain data while your account is active, or as needed for legitimate operational, legal, or security reasons.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can request deletion. Some logs may persist for a limited period in backups or security systems.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">5) Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use reasonable technical and organizational safeguards, including encrypted transport and restricted
                system access. No system is 100% secure, but we continuously improve protections and monitoring.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">6) Sharing and disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell personal information. We may share limited data with service providers who help us run
                Luma, and only under contractual confidentiality and processing obligations.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose information if required by law, legal process, or to protect users, rights, and service safety.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">7) Your choices and rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                Depending on where you live, you may have rights to access, correct, export, restrict, or delete your data.
                You may also object to certain processing.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                To make a request, email{" "}
                <a href="mailto:privacy@luma.app" className="text-foreground underline underline-offset-4 hover:opacity-90">
                  privacy@luma.app
                </a>
                .
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">8) Children&apos;s privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Luma is not intended for children under 13 (or the minimum age required in your jurisdiction). If you
                believe a child has provided personal information, contact us and we will take appropriate action.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">9) International users</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be processed in countries other than your own. Where required, we use safeguards
                designed to protect personal data transferred across borders.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">10) Policy changes</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this policy as Luma evolves. Material updates will be reflected by the revised date and,
                where appropriate, by additional notice in product.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Questions about privacy, data handling, or deletion requests:
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <a href="mailto:privacy@luma.app" className="text-foreground underline underline-offset-4 hover:opacity-90">
                  privacy@luma.app
                </a>
              </p>
            </section>

            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">Last updated: April 2026</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
