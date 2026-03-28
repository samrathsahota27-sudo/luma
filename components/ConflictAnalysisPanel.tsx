import React from "react";

export type ConflictFrictionPoint = {
  personA: string;
  personB: string;
  mismatch: string;
};

export function ConflictAnalysisPanel({
  points,
  labelA = "Person A",
  labelB = "Person B",
}: {
  points: ConflictFrictionPoint[] | null | undefined;
  labelA?: string;
  labelB?: string;
}) {
  const list = Array.isArray(points) ? points.filter((p) => p && (p.personA || p.personB || p.mismatch)) : [];
  if (list.length === 0) return null;

  return (
    <section
      className="mb-6 md:mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7"
      aria-labelledby="conflict-analysis-heading"
    >
      <h2
        id="conflict-analysis-heading"
        className="font-serif text-lg md:text-xl text-foreground [font-family:var(--font-serif-display)] mb-1"
      >
        Where you pull apart
      </h2>
      <p className="text-[13px] md:text-sm text-muted-foreground mb-6 leading-snug">
        Not who’s wrong—how your styles collide.
      </p>

      <ul className="space-y-6 md:space-y-5">
        {list.map((p, i) => (
          <li key={i} className="border-t border-white/10 pt-5 md:pt-5 first:border-t-0 first:pt-0">
            {/* Mobile: A → B → mismatch stacked */}
            <div className="flex flex-col gap-3 md:hidden">
              <div className="rounded-xl border border-violet-400/15 bg-violet-500/[0.06] px-3.5 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-200/70 mb-1.5">
                  {labelA}
                </p>
                <p className="text-[14px] leading-snug text-foreground/90">{p.personA}</p>
              </div>
              <div className="rounded-xl border border-amber-400/15 bg-amber-500/[0.05] px-3.5 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200/70 mb-1.5">
                  {labelB}
                </p>
                <p className="text-[14px] leading-snug text-foreground/90">{p.personB}</p>
              </div>
              <div className="rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                  Why it clashes
                </p>
                <p className="text-[14px] leading-snug text-foreground/95 font-medium">{p.mismatch}</p>
              </div>
            </div>

            {/* Desktop: side by side */}
            <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-3 md:items-stretch">
              <div className="rounded-xl border border-violet-400/15 bg-violet-500/[0.06] px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-200/70 mb-2">
                  {labelA}
                </p>
                <p className="text-[15px] leading-snug text-foreground/90">{p.personA}</p>
              </div>
              <div
                className="flex items-center justify-center px-1 text-muted-foreground text-xs shrink-0"
                aria-hidden
              >
                vs
              </div>
              <div className="rounded-xl border border-amber-400/15 bg-amber-500/[0.05] px-4 py-3.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-200/70 mb-2">
                  {labelB}
                </p>
                <p className="text-[15px] leading-snug text-foreground/90">{p.personB}</p>
              </div>
            </div>
            <div className="hidden md:block mt-3 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                Why it clashes
              </p>
              <p className="text-[15px] leading-snug text-foreground/95">{p.mismatch}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
