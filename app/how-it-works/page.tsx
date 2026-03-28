import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "lucide-react";
import { RelationshipMapHero } from "@/components/RelationshipMapHero";

const STORY_SECTIONS = [
  {
    statement: "You're not fighting. You're misunderstanding.",
    line: "And it repeats more than you think.",
  },
  {
    statement: "Decode what they actually meant",
    line: "Before it turns into distance.",
  },
  {
    statement: "See the pattern forming",
    line: "Not one moment. A cycle.",
  },
  {
    statement: "See where this leads",
    line: "If nothing changes.",
  },
  {
    statement: "Change the direction",
    line: "Before it becomes your normal.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* HERO (full screen visual) */}
        <section className="relative min-h-[92svh] flex items-center justify-center px-4 sm:px-6 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,rgba(120,90,180,0.22),transparent),radial-gradient(ellipse_55%_40%_at_85%_105%,rgba(100,140,200,0.12),transparent)]"
          />
          <div className="relative w-full md:max-w-[1040px] md:mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 -mx-1 sm:mx-0">
              <RelationshipMapHero
                size="lg"
                className="rounded-[28px] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_26px_120px_rgba(0,0,0,0.65)]"
                connection={58}
                distance={46}
                conflict={52}
                resolvedCount={3}
              />
            </div>
            <div className="mt-10 text-center px-1">
              <h1 className="font-serif text-[32px] leading-[1.08] md:text-[48px] md:leading-tight [font-family:var(--font-serif-display)] tracking-tight">
                Luma shows you what's happening between you.
              </h1>
              <p className="mt-4 text-[15px] md:text-base text-white/60 font-light">
                Not what you say. What you mean.
              </p>
              <div className="mt-10 flex justify-center">
                <Link
                  href="/couple-hub"
                  className="w-full max-w-[420px] inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[#0b0a0d] px-7 py-4 text-base font-medium shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_18px_70px_rgba(140,110,200,0.15)] hover:opacity-95 transition"
                >
                  Start Together
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {STORY_SECTIONS.map(({ statement, line }) => (
          <section
            key={statement}
            className="border-t border-white/10 px-5 sm:px-8 min-h-svh flex flex-col items-center justify-center py-28 md:py-36"
          >
            <div className="w-full max-w-[34rem] mx-auto text-center">
              <h2 className="font-serif text-[clamp(1.5rem,6vw,2.75rem)] leading-[1.12] [font-family:var(--font-serif-display)] tracking-tight text-white font-medium">
                {statement}
              </h2>
              <p className="mt-6 text-[15px] md:text-lg text-white/55 font-light leading-relaxed">
                {line}
              </p>
            </div>
          </section>
        ))}

        {/* Final CTA */}
        <section className="border-t border-white/10 px-5 sm:px-8 min-h-[85svh] md:min-h-[70svh] flex flex-col items-center justify-center py-28 md:py-36">
          <Link
            href="/couple-hub"
            className="group w-full max-w-[420px] inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 text-base font-medium text-[#0b0a0d] shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_18px_70px_rgba(140,110,200,0.15)] transition hover:opacity-95"
          >
            <span className="inline-flex items-center gap-2">
              Start seeing clearly
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
                →
              </span>
            </span>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
