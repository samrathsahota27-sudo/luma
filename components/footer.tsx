import Link from "next/link"

const footerLinks = [
  { href: "/help", label: "Help & FAQ" },
  { href: "/insights", label: "Insights" },
  { href: "/privacy", label: "Privacy & Ethics" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/contact", label: "Contact" },
]

export function Footer() {
  return (
    <footer className="border-t border-[#E8E3D9] bg-[#E8E3D9]/30">
      <div className="max-w-[720px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Link href="/" className="font-serif text-lg text-foreground">
              Luma
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              A quiet space for noticing what moves within.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Luma is not therapy, diagnosis, or treatment. It is a reflective experience.
          </p>
        </div>
      </div>
    </footer>
  )
}
