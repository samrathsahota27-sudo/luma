import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Purpose: Present model / reflection output as a slow-read artifact, not chat bubbles.
 * Structure: Label → headline → body paragraphs → optional pull quote → actions slot.
 * Styling: Optical hierarchy: display line for “truth”, serif for body optional.
 * Behavior: Sections spaced for thumb-scrolling; no auto marquee animations.
 */
export function LumaResultPanel({
  label = "What showed up",
  headline,
  children,
  pullQuote,
  actions,
  className,
}: {
  label?: string;
  headline: string;
  children: ReactNode;
  pullQuote?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "luma-glass animate-luma-fade-in-slow border border-white/[0.08] p-5 sm:p-7 md:p-8",
        className
      )}
      aria-label={label}
    >
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <h2 className="font-serif text-xl sm:text-2xl leading-snug text-foreground [font-family:var(--font-serif-display)] tracking-[-0.02em]">
        {headline}
      </h2>
      <div className="mt-5 space-y-4 text-sm sm:text-[0.9375rem] leading-[1.65] text-foreground/88">{children}</div>
      {pullQuote ? (
        <blockquote className="mt-6 border-l-2 border-white/20 pl-4 font-serif text-base italic leading-relaxed text-foreground/80 [font-family:var(--font-serif)]">
          {pullQuote}
        </blockquote>
      ) : null}
      {actions ? <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
    </section>
  );
}
