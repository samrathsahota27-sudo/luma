import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"

const faqs = [
  {
    question: "How does Luma work?",
    answer: [
      "Luma guides you through a series of visual choices. The images you select, along with short written reflections, form a pattern. Luma observes these patterns and translates them into reflective insights — not scores or labels, but language designed to help you notice what may already be present in your inner experience.",
    ],
  },
  {
    question: "Is this psychological testing?",
    answer: [
      "No. Luma is not a psychological test or assessment. It is a reflective experience inspired by ideas from psychology and perception research — such as how we project meaning onto images and how visual preference can reveal patterns before we have words for them. Luma does not diagnose, categorize, or evaluate you.",
    ],
  },
  {
    question: "Is my data private?",
    answer: [
      "Yes. Your reflections are private and not shared. Selections and responses are used only to generate your reflection in the moment. We do not sell your data or use it for advertising. If you save a reflection with your email, that information is stored so you can return to it — we do not share it with third parties.",
    ],
  },
  {
    question: "How accurate is the reflection?",
    answer: [
      "Luma offers interpretations designed to encourage reflection, not definitive conclusions. The reflection is a mirror — language that may help you notice themes in your choices and responses. What matters is whether it resonates with you and supports your own awareness, not whether it is \"accurate\" in a clinical or predictive sense.",
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#2F2F2F]">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="max-w-[720px] mx-auto px-6 py-20 md:py-28 animate-luma-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl leading-tight text-[#2F2F2F] text-balance [font-family:var(--font-serif-display)]">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 text-[#5a5a5a] text-lg leading-relaxed max-w-xl">
            Answers to common questions about how Luma works and what to expect.
          </p>
        </section>

        {/* FAQ sections */}
        <section className="border-t border-[#E8E3D9]">
          <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20">
            <div className="space-y-16">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h2 className="font-serif text-xl md:text-2xl text-[#2F2F2F] [font-family:var(--font-serif-display)]">
                    {faq.question}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {faq.answer.map((paragraph, i) => (
                      <p key={i} className="text-[#5a5a5a] leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#E8E3D9] bg-[#E8E3D9]/20">
          <div className="max-w-[720px] mx-auto px-6 py-16 text-center">
            <p className="text-[#2F2F2F] font-serif text-lg [font-family:var(--font-serif-display)]">
              Ready to explore your inner world?
            </p>
            <Link
              href="/test"
              className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 rounded-[12px] bg-[#2F2F2F] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Begin Reflection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
