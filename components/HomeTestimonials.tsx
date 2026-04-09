import { Quote, Star } from "lucide-react";

/**
 * TODO(replace): Swap with real early-beta quotes when you have them.
 * These are plausible placeholders for layout and tone only.
 */
const TESTIMONIALS = [
  {
    quote:
      "I expected something generic, but the read-back felt uncomfortably accurate—in a good way. It put words to a pattern I've circled for years.",
    name: "Maya",
    city: "Austin, TX",
  },
  {
    quote:
      "The image rounds are fast, which helped me stay honest. I didn't have time to craft a 'good' answer—just react.",
    name: "Chris",
    city: "Toronto, ON",
  },
  {
    quote:
      "We used the couple flow on a hard week. Seeing our two inner worlds side by side opened a conversation we'd been avoiding.",
    name: "Sam & Lee",
    city: "London, UK",
  },
];

function StarRow() {
  return (
    <div className="flex gap-0.5 text-amber-400/85" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} aria-hidden />
      ))}
    </div>
  );
}

export function HomeTestimonials() {
  return (
    <section className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(40,32,68,0.12),rgba(8,7,12,0.98))] px-4 py-14 md:py-20">
      <div className="max-w-[960px] mx-auto">
        <h2 className="text-center font-serif text-[24px] md:text-[30px] text-white [font-family:var(--font-serif-display)] text-balance px-2">
          Early voices
        </h2>
        <p className="mt-3 text-center text-sm text-white/50 max-w-lg mx-auto">
          {/* TODO(replace): remove this line when real testimonials ship */}
          Placeholder quotes for layout—replace with beta feedback.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name + t.city}
              className="relative rounded-[20px] border border-white/10 bg-white/[0.035] p-6 md:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm"
            >
              <Quote
                className="h-8 w-8 text-violet-300/25 shrink-0 mb-3"
                strokeWidth={1.25}
                aria-hidden
              />
              <StarRow />
              <blockquote className="mt-4 text-sm md:text-[15px] leading-relaxed text-white/75">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <footer className="mt-5 pt-4 border-t border-white/10">
                <p className="text-sm font-medium text-white/90">{t.name}</p>
                <p className="text-xs text-white/45 mt-0.5">{t.city}</p>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
