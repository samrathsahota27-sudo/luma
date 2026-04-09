import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20">
        <section className="max-w-3xl mx-auto px-6 py-24">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Legal</span>
          <h1 className="font-serif text-4xl md:text-5xl leading-tight mt-4 text-balance">Terms of use</h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            This is a placeholder page. A full Terms of Service will be published here before broader launch.
          </p>

          <div className="mt-10 max-w-2xl space-y-8 text-muted-foreground leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">Use of Luma</h2>
              <p>
                Luma offers reflective experiences for personal insight. It is not medical, therapeutic, or legal
                advice. Do not use it as a substitute for professional care.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">Accounts &amp; content</h2>
              <p>
                You are responsible for activity under your account. Content you submit should be yours to share, and
                must not violate applicable law or others&apos; rights.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif text-xl text-foreground">Changes</h2>
              <p>We may update these terms. Continued use after changes means you accept the updated terms.</p>
            </section>

            <p className="text-xs pt-4 border-t border-border">
              Questions?{" "}
              <Link href="/contact" className="text-foreground underline underline-offset-4 hover:opacity-90">
                Contact us
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
