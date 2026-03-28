"use client";

type Props = {
  lines: string[] | null | undefined;
  className?: string;
};

/** Plain-language summary: pattern → behavior → impact → optional insight. One row per line, mobile-scannable. */
export function InSimpleWordsSection({ lines, className = "" }: Props) {
  const cleaned = (lines ?? [])
    .map((s) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim() : ""))
    .filter(Boolean)
    .slice(0, 4);
  if (cleaned.length === 0) return null;

  return (
    <section
      className={[
        "luma-glass border border-white/10 rounded-2xl p-6 md:p-8",
        className,
      ].join(" ")}
      aria-labelledby="in-simple-words-heading"
    >
      <h2
        id="in-simple-words-heading"
        className="font-serif text-lg md:text-xl text-foreground [font-family:var(--font-serif-display)] mb-5 md:mb-6 tracking-tight"
      >
        In Simple Words
      </h2>
      <div className="flex min-w-0 flex-col gap-4 md:gap-5">
        {cleaned.map((line, i) => (
          <p
            key={i}
            className="min-w-0 break-words text-[15px] md:text-base leading-relaxed text-foreground/90 font-sans border-l-2 border-primary/35 pl-4 md:pl-5"
            style={{ fontFamily: "var(--font-sans), Inter, system-ui, sans-serif" }}
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
