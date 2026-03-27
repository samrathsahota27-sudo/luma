"use client";

import { useMemo, useState } from "react";

type Example = {
  hear: string;
  meant: string;
  trap: string;
};

const EXAMPLES: Example[] = [
  {
    hear: "Fine, do whatever you want.",
    meant: "I feel like my opinion doesn’t matter to you.",
    trap: "Don’t walk away. Ask for 5 minutes to understand.",
  },
  {
    hear: "You never listen.",
    meant: "I don’t feel heard, and I’m scared this won’t change.",
    trap: "Don’t argue the word ‘never.’ Ask what they most want you to understand.",
  },
] as const;

export function ConflictPreview({ enableToggle = true }: { enableToggle?: boolean }) {
  const [index, setIndex] = useState(0);
  const example = useMemo(() => EXAMPLES[index] ?? EXAMPLES[0], [index]);

  return (
    <section className="border-t border-border bg-[#0a090c] text-white">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <div className="flex flex-col items-center text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/55 font-medium">
            Conflict preview
          </p>
          <h2 className="mt-4 font-serif text-[26px] md:text-[32px] [font-family:var(--font-serif-display)] tracking-tight">
            The moment it starts to turn
          </h2>
          <p className="mt-3 text-sm md:text-[15px] text-white/70 font-light max-w-xl leading-relaxed">
            Luma helps you hear what’s underneath the words — before you step into the same trap.
          </p>

          {enableToggle && (
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
              <button
                type="button"
                onClick={() => setIndex(0)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  index === 0 ? "bg-white text-[#0b0a0d]" : "text-white/70 hover:text-white",
                ].join(" ")}
              >
                Example 1
              </button>
              <button
                type="button"
                onClick={() => setIndex(1)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  index === 1 ? "bg-white text-[#0b0a0d]" : "text-white/70 hover:text-white",
                ].join(" ")}
              >
                Example 2
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {/* LEFT */}
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-medium">
              What you hear
            </p>
            <div className="mt-4 rounded-xl border border-[#6b2d2d]/35 bg-[#2a1111]/55 px-5 py-4">
              <p className="text-[18px] md:text-[20px] leading-relaxed text-[#ffd6d6]">
                {example.hear}
              </p>
            </div>
            <p className="mt-4 text-xs text-white/45">
              Harsh on the surface. Easy to react to.
            </p>
          </article>

          {/* RIGHT */}
          <article className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-white/[0.02] p-7 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-medium">
              What they meant
            </p>
            <div className="mt-4 rounded-xl border border-[#2f6a58]/35 bg-[#0f1a16]/65 px-5 py-4">
              <p className="text-[18px] md:text-[20px] leading-relaxed text-[#d8fff0]">
                {example.meant}
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-medium">
                The trap
              </p>
              <p className="mt-2 text-sm md:text-[15px] leading-relaxed text-white/80">
                {example.trap}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

