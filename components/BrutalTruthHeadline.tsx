import React from "react";

export function BrutalTruthHeadline({ text }: { text: string | null | undefined }) {
  const t = typeof text === "string" ? text.trim() : "";
  if (!t) return null;

  return (
    <div className="mb-8 md:mb-10">
      <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Brutal truth
      </p>
      <p className="text-balance text-center font-serif text-[1.35rem] font-semibold leading-snug tracking-tight text-foreground md:text-2xl lg:text-[1.65rem] [font-family:var(--font-serif-display)]">
        {t}
      </p>
    </div>
  );
}
