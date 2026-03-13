import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />
      <main className="flex-1 pt-20 px-6 py-16 md:py-24">
        <div className="max-w-[480px] mx-auto text-center animate-luma-fade-in">
          <h1 className="font-serif text-2xl md:text-3xl text-[#2F2F2F] [font-family:var(--font-serif-display)]">
            Login
          </h1>
          <p className="mt-4 text-[#5a5a5a] text-base leading-relaxed">
            Sign in to access your saved reflections and timeline.
          </p>
          <p className="mt-8 text-sm text-[#5a5a5a]">
            Login is coming soon. For now, you can{" "}
            <Link href="/begin" className="text-[#2F2F2F] underline underline-offset-4 hover:opacity-80">
              start a reflection
            </Link>{" "}
            without an account.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
