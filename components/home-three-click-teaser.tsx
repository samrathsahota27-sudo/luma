"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { TEASER_IMAGES, resolveTeaserBrutalTruth } from "@/lib/teaserBrutalTruths";

export function HomeThreeClickTeaser() {
  const [order, setOrder] = useState<number[]>([]);
  const done = order.length === 3;
  const brutalLine = done ? resolveTeaserBrutalTruth(order[0]!, order[1]!, order[2]!) : null;

  const pick = useCallback((id: number) => {
    setOrder((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const reset = useCallback(() => {
    setOrder([]);
  }, []);

  const stepLabel = done ? "Here’s a line" : `Pick ${3 - order.length} more`;

  return (
    <section
      className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(25,20,40,0.35),rgba(5,5,8,0.98))] px-4 py-14 md:py-20"
      aria-labelledby="teaser-heading"
    >
      <div className="mx-auto max-w-lg md:max-w-2xl">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
          3 taps
        </p>
        <h2
          id="teaser-heading"
          className="mt-3 text-center font-serif text-[1.65rem] leading-tight text-white [font-family:var(--font-serif-display)] md:text-[2rem]"
        >
          A taste of your brutal truth
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-white/55">
          Pick three images—fast. No account, no wait.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-white/50">
          <span className="tabular-nums">{stepLabel}</span>
          {order.length > 0 ? (
            <>
              <span className="text-white/35" aria-hidden>
                ·
              </span>
              <span className="tabular-nums text-violet-200/80">{order.length}/3</span>
            </>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
          {TEASER_IMAGES.map((img) => {
            const idx = order.indexOf(img.id);
            const selected = idx >= 0;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => pick(img.id)}
                disabled={done}
                aria-label={selected ? `Image ${idx + 1} of 3` : "Select image"}
                aria-pressed={selected}
                className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] shadow-[0_16px_50px_rgba(0,0,0,0.45)] transition-transform active:scale-[0.98] md:rounded-3xl md:active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0910] disabled:cursor-default"
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03] group-disabled:group-hover:scale-100"
                  sizes="(max-width:640px) 45vw, 200px"
                  draggable={false}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15"
                  aria-hidden
                />
                {selected ? (
                  <div className="absolute inset-0 ring-2 ring-inset ring-white/85 md:ring-[3px]" aria-hidden />
                ) : null}
                {selected ? (
                  <div className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0b0a0d] shadow-lg md:right-3 md:top-3 md:h-11 md:w-11">
                    <span className="text-sm font-bold tabular-nums md:text-base">{idx + 1}</span>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        {brutalLine ? (
          <output
            className="mt-8 block animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-2xl border border-white/14 bg-black/40 px-5 py-6 text-center shadow-[0_0_48px_-8px_rgba(139,92,246,0.35)] backdrop-blur-md md:px-8 md:py-8"
            aria-live="polite"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/85">
              Brutal truth
            </p>
            <p className="mt-4 font-serif text-[1.15rem] leading-snug text-white text-balance md:text-[1.35rem] md:leading-snug [font-family:var(--font-serif-display)]">
              {brutalLine}
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/[0.1] min-h-[48px]"
              >
                <RotateCcw className="h-4 w-4 opacity-80" aria-hidden />
                Try different picks
              </button>
              <Link
                href="/test"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-medium text-[#0b0a0d] shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_12px_40px_rgba(0,0,0,0.35)] transition-opacity hover:opacity-92 min-h-[48px]"
              >
                Go deeper
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </output>
        ) : null}
      </div>
    </section>
  );
}
