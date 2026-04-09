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
            Plain-language summary for now; a fuller legal Privacy Policy may be added as Luma grows. See also{" "}
            <Link href="/terms" className="text-foreground underline underline-offset-4 hover:opacity-90">
              Terms of use
            </Link>
            .
          </p>
          
          <div className="mt-10 max-w-2xl">
            <div className="space-y-10">
              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We don’t sell or share your data. What you write stays private.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">Neutrality</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Luma doesn’t take sides. It helps you understand, not judge.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">No Ads</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We don’t use your data to target ads.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="font-serif text-xl text-foreground">Control</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You can delete your data anytime.
                </p>
              </section>

              <div className="pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
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
