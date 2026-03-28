import React from "react";

export function ShadowInsightBlock({ text }: { text: string | null | undefined }) {
  const t = typeof text === "string" ? text.trim() : "";
  if (!t) return null;

  return (
    <aside
      className="mt-6 md:mt-7 rounded-2xl border border-amber-200/12 bg-gradient-to-br from-amber-500/[0.06] to-white/[0.02] px-5 py-4 md:px-6 md:py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      aria-label="Shadow insight"
    >
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-200/55">
        Shadow insight
      </p>
      <p className="text-[15px] md:text-base leading-snug text-foreground/90 text-balance line-clamp-2 md:line-clamp-none [font-family:var(--font-sans),Inter,system-ui,sans-serif]">
        {t}
      </p>
    </aside>
  );
}
