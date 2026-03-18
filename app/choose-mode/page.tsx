import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function ChooseModePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />

      <main className="flex-1 pt-20 px-6">
        <div className="max-w-[960px] mx-auto min-h-[calc(100vh-80px)] flex items-center justify-center py-16 md:py-20">
          <div className="w-full">
            <div className="text-center max-w-[640px] mx-auto">
              <p className="text-xs uppercase tracking-[0.18em] text-[#5a5a5a]">
                Choose your path
              </p>
              <h1 className="mt-4 font-serif text-[30px] md:text-[40px] leading-tight text-balance [font-family:var(--font-serif-display)]">
                Individual or Couple
              </h1>
            </div>

            <div className="mt-12 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Individual */}
            <Link
              href="/test"
              className="group relative rounded-[24px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-[#E8E3D9] p-8 md:p-10 transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F2F2F]/15"
            >
              {/* 1) Image layer */}
              <div
                aria-hidden
                className="absolute inset-0 bg-center bg-cover bg-no-repeat blur-[1px] brightness-75 contrast-110 scale-[1.05] transition-transform duration-500 ease-out group-hover:scale-[1.08]"
                style={{ backgroundImage: "url('/uid.jpg')" }}
              />
              {/* 2) Overlay layer (dark) */}
              <div
                aria-hidden
                className="absolute inset-0 transition-opacity duration-300 opacity-100 group-hover:opacity-92"
                style={{ background: "rgba(0,0,0,0.40)" }}
              />
              {/* 3) Content layer */}
              <div className="relative z-[2] min-h-[260px] flex flex-col items-center justify-center text-center text-white">
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-medium shadow-[0_8px_24px_rgba(0,0,0,0.22)]">
                  Free
                </span>
                <h2 className="mt-5 font-serif text-[26px] md:text-[30px] text-white [font-family:var(--font-serif-display)] drop-shadow-[0_10px_26px_rgba(0,0,0,0.35)]">
                  Individual
                </h2>
                <p className="mt-2 text-base md:text-lg text-white font-medium drop-shadow-[0_10px_26px_rgba(0,0,0,0.35)]">
                  Explore your inner world
                </p>
              </div>
            </Link>

            {/* Couple */}
            <Link
              href="/couple-intro"
              className="group relative rounded-[24px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-[#2F2F2F]/10 p-8 md:p-10 transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F2F2F]/15"
            >
              {/* 1) Image layer */}
              <div
                aria-hidden
                className="absolute inset-0 bg-center bg-cover bg-no-repeat blur-[2px] scale-[1.05]"
                style={{ backgroundImage: "url('/co.jpg')" }}
              />
              {/* 2) Overlay layer (dark) */}
              <div
                aria-hidden
                className="absolute inset-0 transition-opacity duration-300 opacity-100 group-hover:opacity-92"
                style={{ background: "rgba(0,0,0,0.45)" }}
              />
              {/* 3) Content layer */}
              <div className="relative z-[2] min-h-[260px] flex flex-col items-center justify-center text-center text-white">
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-medium">
                  Paid
                </span>
                <h2 className="mt-5 font-serif text-[26px] md:text-[30px] text-white [font-family:var(--font-serif-display)]">
                  Couple
                </h2>
                <p className="mt-2 text-base md:text-lg text-white font-medium">
                  Explore your relationship
                </p>
                <p className="mt-3 text-sm text-white/75 max-w-[320px]">
                  Includes deeper insights and shared reflection
                </p>
              </div>
            </Link>
          </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

