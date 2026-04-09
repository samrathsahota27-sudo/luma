import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "About",
  description: "Why Luma exists, what it is, and how to reach the team.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />
      <main className="flex-1 pt-24 pb-20 px-6">
        <article className="max-w-2xl mx-auto space-y-10">
          <header>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">About</p>
            <h1 className="mt-3 font-serif text-3xl md:text-4xl [font-family:var(--font-serif-display)] text-balance">
              A quieter way to notice what moves inside
            </h1>
          </header>

          <section className="space-y-3">
            <h2 className="font-serif text-xl [font-family:var(--font-serif-display)]">Founder note</h2>
            <p className="text-muted-foreground leading-relaxed">
              I built Luma because so much of how we understand ourselves is buried under explanations — and images
              get to the felt sense faster than questionnaires ever did. The goal isn&apos;t to label you; it&apos;s to
              give you language you can actually use.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl [font-family:var(--font-serif-display)]">What Luma is</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-relaxed">
              <li>A short, image-led reflection you can finish in a few minutes.</li>
              <li>A mirror for patterns — emotional tone, tension, and what you might be reaching for.</li>
              <li>Optional couple mode to compare inner worlds side by side.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl [font-family:var(--font-serif-display)]">What Luma isn&apos;t</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-relaxed">
              <li>Not therapy, not a clinical assessment, and not a substitute for professional care.</li>
              <li>Not a personality test with fixed types — outputs are reflective, not diagnostic.</li>
            </ul>
          </section>

          <section className="space-y-3 rounded-2xl border border-border bg-card/50 p-6">
            <h2 className="font-serif text-xl [font-family:var(--font-serif-display)]">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions or partnerships: use the{" "}
              <Link href="/contact" className="text-foreground underline underline-offset-4 hover:opacity-90">
                contact form
              </Link>
              . Updates:{" "}
              <a
                href="https://twitter.com/lumareflect"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:opacity-90"
              >
                @lumareflect
              </a>{" "}
              on X.
            </p>
          </section>

          <p className="text-sm text-muted-foreground">
            <Link href="/" className="underline underline-offset-4 hover:text-foreground">
              ← Back home
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
