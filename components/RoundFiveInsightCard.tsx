"use client";

export type Round5SpaceBetweenPayload = {
  tag: string;
  tldr: string;
  meaning: string;
  meaningLines?: string[];
  shadowInsight: string;
  dangerousQuestion: string;
};

export function RoundFiveInsightCard({
  payload,
  className = "",
}: {
  payload: Round5SpaceBetweenPayload | null | undefined;
  className?: string;
}) {
  if (!payload?.tldr) return null;

  const lines =
    payload.meaningLines?.length && payload.meaningLines.length > 0
      ? payload.meaningLines
      : payload.meaning.split(/\n+/).filter(Boolean);

  return (
    <section
      className={`mb-10 rounded-2xl border border-violet-400/20 bg-violet-500/[0.06] px-5 py-6 shadow-[0_0_0_1px_rgba(167,139,250,0.12),0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-sm md:px-7 md:py-7 ${className}`}
      aria-labelledby="round5-insight-heading"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-200/70">
        The space between you
      </p>
      <h2
        id="round5-insight-heading"
        className="mt-2 font-serif text-lg leading-snug text-foreground md:text-xl [font-family:var(--font-serif-display)]"
      >
        {payload.tldr}
      </h2>

      <div className="mt-4 space-y-2 text-sm leading-relaxed text-white/80 md:text-[15px]">
        {lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
          Shadow
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/88 md:text-[15px]">
          {payload.shadowInsight}
        </p>
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
          Dangerous question
        </p>
        <p className="mt-3 font-serif text-base italic leading-snug text-foreground/95 md:text-lg [font-family:var(--font-serif-display)]">
          {payload.dangerousQuestion}
        </p>
      </div>
    </section>
  );
}
