import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "By my third reflection I could see the same Quiet Withdrawal loop showing up in different situations. It finally felt measurable, not just 'a bad week.'",
    name: "Ari T.",
    role: "Beta user · Product design",
    focus: "Pattern clarity",
  },
  {
    quote:
      "The image rounds are fast enough that I don't over-edit myself. The insight line about 'protective composure' was exactly what my partner keeps trying to tell me.",
    name: "N. Patel",
    role: "Beta user · Engineering",
    focus: "Individual mirror",
  },
  {
    quote:
      "Couples mode gave us language for the mismatch: I read silence as distance, she reads it as decompression. That one map saved us a full night of guessing.",
    name: "M & K",
    role: "Beta couple · 4 years together",
    focus: "Couples map",
  },
  {
    quote:
      "The nightly prompt is what kept me coming back. It turns reflection into a ritual instead of a one-off emotional deep dive.",
    name: "Jules R.",
    role: "Beta user · Healthcare",
    focus: "Daily habit",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2);
}

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
          What early users noticed after repeating reflections and trying couples mode.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name + t.focus}
              className="relative rounded-[20px] border border-white/10 bg-white/[0.035] p-6 md:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-xs font-semibold text-white/85">
                    {initials(t.name)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white/90">{t.name}</p>
                    <p className="text-xs text-white/45 mt-0.5">{t.role}</p>
                  </div>
                </div>
                <Quote
                  className="h-8 w-8 text-violet-300/25 shrink-0"
                  strokeWidth={1.25}
                  aria-hidden
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <StarRow />
                <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/55">
                  {t.focus}
                </span>
              </div>
              <blockquote className="mt-4 text-sm md:text-[15px] leading-relaxed text-white/75">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
