import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "lucide-react";

export default function CouplePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf7f0]">
      <Navigation />

      <main className="flex-1 pt-24 pb-20 px-6 flex flex-col items-center justify-center">
        <div className="max-w-xl mx-auto text-center space-y-8">
          <h1 className="font-serif text-3xl md:text-4xl text-neutral-800 tracking-tight">
            Couple Reflection
          </h1>
          <p className="text-neutral-600 text-base md:text-lg leading-relaxed">
            This experience explores the emotional space between two inner worlds.
          </p>
          <div className="pt-4">
            <Link
              href="/couple/start"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-neutral-800 text-white text-sm font-medium shadow-sm hover:bg-neutral-700 hover:shadow transition"
            >
              Start Couple Reflection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
