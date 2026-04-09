import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PricingTiersCards } from "@/components/PricingTiersCards";
import { ProWaitlistForm } from "@/components/ProWaitlistForm";
import { ArrowLeft } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07060a] text-foreground">
      <Navigation />

      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="max-w-[960px] mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back home
          </Link>

          <header className="mt-8 text-center max-w-xl mx-auto">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">Pricing</p>
            <h1 className="mt-3 font-serif text-[2rem] md:text-[2.5rem] leading-tight text-white [font-family:var(--font-serif-display)] text-balance">
              Start free. Go deeper with Pro.
            </h1>
            <p className="mt-4 text-sm md:text-base text-white/55 leading-relaxed">
              No card required for Free. Pro pricing is a placeholder until checkout launches — join the waitlist to get
              early access.
            </p>
          </header>

          <PricingTiersCards className="mt-14" />

          <div className="mt-16 md:mt-20 rounded-[22px] border border-white/10 bg-white/[0.03] p-8 md:p-10">
            <ProWaitlistForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
