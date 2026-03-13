import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "lucide-react";

export default function CouplePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3]">
      <Navigation />

      <main className="flex-1 pt-24 pb-20 px-6 flex flex-col items-center justify-center">
        <div className="max-w-[720px] mx-auto text-center space-y-8">
          <h1 className="font-serif text-[36px] md:text-[40px] text-[#2F2F2F] tracking-tight">
            Couple Reflection
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
            This experience explores the emotional space between two inner worlds.
          </p>
          <div className="pt-4">
            <Link
              href="/couple/start"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-base font-medium transition-opacity hover:opacity-90"
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
