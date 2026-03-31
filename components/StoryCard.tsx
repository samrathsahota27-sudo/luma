"use client";

import { forwardRef } from "react";

export type StoryCardProps = {
  pattern: string;
  description: string;
  theme: { title: string; subtitle: string };
  tone: { title: string; subtitle: string };
  coreLine: string;
  className?: string;
};

export const StoryCard = forwardRef<HTMLDivElement, StoryCardProps>(function StoryCard(
  { pattern, description, theme, tone, coreLine, className = "" },
  ref
) {
  return (
    <div
      ref={ref}
      className={[
        "relative mx-auto w-full max-w-[360px] overflow-hidden rounded-3xl p-6",
        "bg-gradient-to-b from-black via-zinc-950 to-black",
        "border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]",
        className,
      ].join(" ")}
      style={{ aspectRatio: "9 / 16" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(255,255,255,0.06),transparent_65%),radial-gradient(ellipse_65%_55%_at_100%_100%,rgba(140,110,200,0.10),transparent_70%)]"
      />

      <div className="relative z-10 flex h-full flex-col text-center">
        {/* Top hook + label */}
        <p className="text-xs text-white/80 tracking-wide">
          Most people won’t admit this
        </p>
        <div className="mt-3 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/80">
          Your inner pattern
        </div>

        {/* Pattern + description */}
        <h2 className="mt-4 text-xl font-semibold text-white">
          Pattern: “{pattern}”
        </h2>
        <p className="mt-2 text-sm text-white/70 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Theme + tone boxes */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
            <p className="text-xs uppercase text-white/50">Theme</p>
            <p className="mt-2 text-base font-medium text-white line-clamp-1">{theme.title}</p>
            <p className="mt-1 text-xs text-white/60 line-clamp-1">{theme.subtitle}</p>
          </div>
          <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
            <p className="text-xs uppercase text-white/50">Tone</p>
            <p className="mt-2 text-base font-medium text-white line-clamp-1">{tone.title}</p>
            <p className="mt-1 text-xs text-white/60 line-clamp-1">{tone.subtitle}</p>
          </div>
        </div>

        {/* Hook line */}
        <div className="mt-4 rounded-2xl p-4 bg-white/5 border border-white/10">
          <p className="text-xs uppercase text-white/50">One line you’ll keep hearing</p>
          <p className="mt-2 text-sm text-white/80 leading-relaxed line-clamp-2">{coreLine}</p>
        </div>

        {/* Closing */}
        <div className="mt-auto pt-5">
          <p className="text-[10px] text-white/55 tracking-wide">Find yours → Luma</p>
        </div>
      </div>
    </div>
  );
});

