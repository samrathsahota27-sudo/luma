"use client";

import { useMemo } from "react";
import { buildHowToReadVisual } from "@/lib/reflection/howToReadVisual";

export type HowToReadTagInput = {
  round2Tag?: string | null;
  round3Tag?: string | null;
  round5Tag?: string | null;
};

type Props = {
  className?: string;
  /** When null/undefined or no known tags, uses the static decoder copy. */
  tags?: HowToReadTagInput | null;
  /** Optional Round 5 psychological interpretations (result only; hidden during test). */
  round5SupplementLines?: string[] | null;
};

export function HowToReadThisVisual({
  className = "",
  tags = null,
  round5SupplementLines = null,
}: Props) {
  const { bullets, footer } = useMemo(
    () => buildHowToReadVisual(tags ?? {}),
    [tags]
  );

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)] md:px-6 md:py-6 ${className}`}
      aria-labelledby="how-to-read-visual-heading"
    >
      <h2
        id="how-to-read-visual-heading"
        className="font-serif text-lg text-foreground [font-family:var(--font-serif-display)] md:text-xl"
      >
        How to Read This
      </h2>
      <ul className="mt-4 list-none space-y-3 p-0">
        {bullets.map(({ title, text }) => (
          <li
            key={title}
            className="flex gap-2 text-sm leading-snug text-muted-foreground md:text-[15px] md:leading-relaxed"
          >
            <span className="mt-0.5 shrink-0 text-foreground/90" aria-hidden>
              •
            </span>
            <span>
              <span className="font-medium text-foreground/90">{title}:</span> {text}
            </span>
          </li>
        ))}
      </ul>
      {round5SupplementLines && round5SupplementLines.length > 0 ? (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Space between — signals
          </p>
          <ul className="mt-3 list-none space-y-2.5 p-0">
            {round5SupplementLines.map((line, i) => (
              <li
                key={`${line}-${i}`}
                className="flex gap-2 text-sm leading-relaxed text-muted-foreground md:text-[15px]"
              >
                <span className="mt-0.5 shrink-0 text-foreground/80" aria-hidden>
                  •
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-4 border-t border-white/10 pt-4 text-center text-sm font-medium leading-snug text-foreground/90 md:text-[15px]">
        {footer}
      </p>
    </section>
  );
}
