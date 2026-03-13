import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "lucide-react";

export default function BeginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3]">
      <Navigation />

      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="max-w-[720px] mx-auto text-center">
          <h1 className="font-serif text-[36px] md:text-[38px] text-[#2F2F2F] tracking-tight">
            Choose Your Reflection
          </h1>
        </div>

        <div className="max-w-[720px] mx-auto mt-12 grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Individual Reflection card */}
          <div className="rounded-[16px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300 flex flex-col text-left">
            <h2 className="font-serif text-[22px] text-[#2F2F2F]">
              Individual Reflection
            </h2>
            <p className="mt-4 text-muted-foreground text-base leading-relaxed">
              Explore what your inner world may be expressing right now.
            </p>
            <div className="mt-auto pt-8">
              <Link
                href="/test"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90"
              >
                Begin Individual
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Couple Reflection card */}
          <div className="rounded-[16px] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow duration-300 flex flex-col text-left">
            <h2 className="font-serif text-[22px] text-[#2F2F2F]">
              Couple Reflection
            </h2>
            <p className="mt-4 text-muted-foreground text-base leading-relaxed">
              Explore the dynamic between two inner worlds.
            </p>
            <div className="mt-auto pt-8">
              <Link
                href="/couple"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90"
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
