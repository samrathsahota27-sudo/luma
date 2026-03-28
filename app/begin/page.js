import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "lucide-react";

export default function BeginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto text-center">
          <h1 className="font-serif text-[36px] md:text-[38px] text-foreground tracking-tight">
            Choose Your Reflection
          </h1>
        </div>

        <div className="max-w-[720px] mx-auto mt-12 grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Individual Reflection card */}
          <div className="luma-glass border border-white/10 p-6 transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(120,90,180,0.12)] flex flex-col text-left">
            <h2 className="font-serif text-[22px] text-foreground">
              Individual Reflection
            </h2>
            <p className="mt-4 text-muted-foreground text-base leading-relaxed">
              Explore what your inner world may be expressing right now.
            </p>
            <div className="mt-auto pt-8">
              <Link
                href="/test"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-base font-medium transition-opacity hover:opacity-90"
              >
                Begin Individual
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Couple Reflection card */}
          <div className="luma-glass border border-white/10 p-6 transition-shadow duration-300 hover:shadow-[0_0_60px_rgba(120,90,180,0.12)] flex flex-col text-left">
            <h2 className="font-serif text-[22px] text-foreground">
              Couple Reflection
            </h2>
            <p className="mt-4 text-muted-foreground text-base leading-relaxed">
              Explore the dynamic between two inner worlds.
            </p>
            <div className="mt-auto pt-8">
              <Link
                href="/couple-hub"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[12px] bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-base font-medium transition-opacity hover:opacity-90"
              >
                Begin Couple
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
