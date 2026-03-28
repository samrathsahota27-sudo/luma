"use client";

import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[#e8e4df]">
      <Navigation />

      <main className="flex-1 pt-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-[640px]">
          <div className="relative overflow-hidden rounded-3xl bg-white/[0.035] backdrop-blur-2xl p-7 md:p-9 shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_30px_120px_rgba(0,0,0,0.70)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,rgba(180,150,255,0.14),transparent),radial-gradient(ellipse_60%_45%_at_90%_120%,rgba(255,210,160,0.10),transparent)]"
            />
            <div className="relative text-center">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/55 font-medium">Couple mode</p>
              <h1 className="mt-4 font-serif text-[28px] md:text-[34px] text-white [font-family:var(--font-serif-display)] tracking-tight">
                Open access (for now)
              </h1>
              <p className="mt-4 text-sm text-white/60 font-light">
                Payments are disabled. Couple mode is unlocked.
              </p>

              <div className="mt-8 flex justify-center">
                <Link
                  href="/couple-hub"
                  className="w-full max-w-[420px] inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[#0b0a0d] px-7 py-4 text-base font-medium shadow-[0_14px_70px_rgba(255,255,255,0.14)] hover:opacity-95 transition"
                >
                  Go to Control Panel
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5">
                <Link href="/couples" className="text-xs text-white/55 hover:text-white/80 transition-colors">
                  Back to Couples
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
