"use client";

import type { TensionOutput } from "@/lib/tensionEngine";

export function TensionCard({
  tension,
  className = "",
}: {
  tension: TensionOutput;
  className?: string;
}) {
  return (
    <section
      className={[
        "mx-auto w-full max-w-[420px] rounded-3xl p-5 border border-white/15 bg-white/[0.07] backdrop-blur-xl",
        "shadow-[0_0_60px_rgba(255,255,255,0.06)] transition-all duration-300 hover:border-white/25",
        className,
      ].join(" ")}
    >
      <p className="text-sm text-white/70">The tension</p>
      <div className="mt-3 space-y-2">
        <p className="text-sm text-white/85 leading-relaxed">{tension.think}</p>
        <p className="text-sm text-white/85 leading-relaxed">{tension.actually}</p>
        <p className="text-sm text-white/85 leading-relaxed">{tension.so}</p>
      </div>
    </section>
  );
}

