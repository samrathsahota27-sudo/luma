"use client";

export type IndividualStructuredResult = {
  pattern: string;
  description: string;
  theme: { title: string; subtitle: string };
  tone: { title: string; subtitle: string };
  core_line: string;
  reach: string;
  shift: string;
};

export function IndividualResultCard({
  badge = "EXAMPLE INDIVIDUAL REFLECTION",
  data,
  variant = "full",
  className = "",
}: {
  badge?: string;
  data: IndividualStructuredResult;
  variant?: "full" | "minimal";
  className?: string;
}) {
  const showExtras = variant === "full";
  return (
    <section className={`mx-auto w-full max-w-[420px] ${className}`}>
      <div className="rounded-3xl p-5 border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all duration-300 hover:border-white/20 hover:scale-[1.01]">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/25" aria-hidden />
          {badge}
        </div>

        <h2 className="mt-3 text-xl font-semibold text-white">
          Pattern: “{data.pattern}”
        </h2>
        <p className="mt-2 text-sm text-white/70 leading-relaxed line-clamp-2">
          {data.description}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-white/5 border border-white/10 transition-all duration-300 hover:border-white/20">
            <p className="text-xs uppercase text-white/50">Theme</p>
            <p className="mt-2 text-base font-medium text-white line-clamp-1">
              {data.theme.title}
            </p>
            <p className="mt-1 text-xs text-white/60 line-clamp-1">
              {data.theme.subtitle}
            </p>
          </div>
          <div className="rounded-2xl p-4 bg-white/5 border border-white/10 transition-all duration-300 hover:border-white/20">
            <p className="text-xs uppercase text-white/50">Tone</p>
            <p className="mt-2 text-base font-medium text-white line-clamp-1">
              {data.tone.title}
            </p>
            <p className="mt-1 text-xs text-white/60 line-clamp-1">
              {data.tone.subtitle}
            </p>
          </div>
        </div>

        {showExtras
          ? [
              { label: "One line you’ll keep hearing", value: data.core_line },
              { label: "What you reach for", value: data.reach },
              { label: "What shifts it", value: data.shift },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-2xl p-4 bg-white/5 border border-white/10 mt-3 transition-all duration-300 hover:border-white/20"
              >
                <p className="text-xs uppercase text-white/50">{row.label}</p>
                <p className="mt-2 text-sm text-white/70 leading-relaxed line-clamp-2">
                  {row.value}
                </p>
              </div>
            ))
          : null}
      </div>
    </section>
  );
}

