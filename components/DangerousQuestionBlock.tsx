"use client";

import React from "react";
import { resolveDangerousQuestion } from "@/lib/fallbackDangerousQuestion";

export function DangerousQuestionBlock({
  text,
  brutalTruth,
  emotionalTag,
  resultPreview,
  mode = "individual",
  className = "",
}: {
  text?: string | null;
  brutalTruth?: string | null;
  emotionalTag?: string | null;
  resultPreview?: string | null;
  mode?: "individual" | "couple";
  className?: string;
}) {
  const resolved = resolveDangerousQuestion(text ?? null, brutalTruth ?? null, emotionalTag ?? null, resultPreview ?? null, mode);

  return (
    <section
      className={`mt-14 md:mt-20 px-1 sm:px-2 ${className}`}
      aria-label="Conversation prompt"
    >
      <div className="mx-auto max-w-lg text-center">
        <div className="relative rounded-2xl border border-violet-400/35 bg-gradient-to-b from-violet-500/[0.12] via-violet-950/[0.04] to-transparent px-5 py-8 shadow-[0_0_56px_-8px_rgba(139,92,246,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] md:px-10 md:py-10">
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40 blur-2xl bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(167,139,250,0.35),transparent_65%)]"
            aria-hidden
          />
          <div className="relative">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-violet-200/85">
              Dangerous question
            </p>
            <p className="text-balance text-center font-serif text-[1.08rem] leading-[1.55] text-foreground md:text-[1.2rem] md:leading-[1.6] [font-family:var(--font-serif-display)]">
              {resolved}
            </p>
            <p className="mt-5 text-center text-xs text-muted-foreground/90 leading-relaxed">
              One line to take into a real conversation — not to solve alone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
