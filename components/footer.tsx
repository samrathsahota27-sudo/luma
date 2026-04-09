"use client"

import Link from "next/link"

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
  { href: "/help", label: "Help & FAQ" },
  { href: "/insights", label: "Insights" },
  { href: "/disclaimer", label: "Disclaimer" },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#08070a] shadow-[0_-20px_60px_-20px_rgba(100,80,160,0.12)]">
      <div className="max-w-[720px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div>
            <Link href="/" className="font-serif text-lg text-white/95">
              Luma
            </Link>
            <p className="text-sm mt-2 max-w-xs text-white/55">
              A quiet space for noticing what moves within.
            </p>
            <p className="text-sm mt-4 text-white/45">
              Built with care by{" "}
              <span className="text-white/70">Samrath Sahota</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/55 hover:text-white/90 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="mx-auto max-w-[560px] text-center text-xs leading-relaxed text-white/40">
            Luma provides psychological patterns, not medical advice. Use the truth responsibly.
          </p>
        </div>
      </div>
    </footer>
  )
}
