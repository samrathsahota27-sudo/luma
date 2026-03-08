import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "lucide-react";

export default function BeginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf7f0]">
      <Navigation />

      <main className="flex-1 pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-3xl md:text-4xl text-neutral-800 tracking-tight">
            Choose Your Reflection
          </h1>
        </div>

        <div className="max-w-4xl mx-auto mt-16 md:mt-24 grid md:grid-cols-2 gap-8 md:gap-10">
          {/* Individual Reflection card */}
          <div className="rounded-2xl bg-[#f5f0f8]/80 border border-[#e8e0ef] shadow-sm hover:shadow-md transition-shadow p-8 md:p-10 flex flex-col text-left">
            <h2 className="font-serif text-xl md:text-2xl text-neutral-800">
              Individual Reflection
            </h2>
            <p className="mt-4 text-neutral-600 text-sm md:text-base leading-relaxed">
              Explore what your inner world may be expressing right now.
            </p>
            <div className="mt-auto pt-8">
              <Link
                href="/test"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-800 text-white text-sm font-medium shadow-sm hover:bg-neutral-700 hover:shadow transition"
              >
                Begin Individual
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Couple Reflection card */}
          <div className="rounded-2xl bg-[#f0f5f2]/80 border border-[#dce8e2] shadow-sm hover:shadow-md transition-shadow p-8 md:p-10 flex flex-col text-left">
            <h2 className="font-serif text-xl md:text-2xl text-neutral-800">
              Couple Reflection
            </h2>
            <p className="mt-4 text-neutral-600 text-sm md:text-base leading-relaxed">
              Explore the dynamic between two inner worlds.
            </p>
            <div className="mt-auto pt-8">
              <Link
                href="/couple"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-800 text-white text-sm font-medium shadow-sm hover:bg-neutral-700 hover:shadow transition"
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
