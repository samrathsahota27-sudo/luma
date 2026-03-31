"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

export type IndividualStoryCardProps = {
  patternName: string;
  subtext: string;
  /** Optional: a single "inner world" image URL (remote or local). */
  innerWorldImage?: string | null;
  brutalLine: string;
  themeLabel: string;
  themeValue: string;
  toneLabel: string;
  toneValue: string;
  shiftInsight: string;
  footerLine?: string;
  className?: string;
};

export const IndividualStoryCard = forwardRef<HTMLDivElement, IndividualStoryCardProps>(
  function IndividualStoryCard(
    {
      patternName,
      subtext,
      innerWorldImage,
      brutalLine,
      themeLabel,
      themeValue,
      toneLabel,
      toneValue,
      shiftInsight,
      footerLine = "See what’s really happening inside you",
      className = "",
    },
    ref
  ) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const blobUrlRef = useRef<string | null>(null);

    useEffect(() => {
      const prev = blobUrlRef.current;
      if (prev) {
        URL.revokeObjectURL(prev);
        blobUrlRef.current = null;
      }
      setImgSrc(null);

      const url = innerWorldImage?.trim();
      if (!url) return;

      let cancelled = false;
      fetch(url)
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
        .then((blob) => {
          if (cancelled) return;
          const objectUrl = URL.createObjectURL(blob);
          blobUrlRef.current = objectUrl;
          setImgSrc(objectUrl);
        })
        .catch(() => {
          if (!cancelled) setImgSrc(null);
        });

      return () => {
        cancelled = true;
        const u = blobUrlRef.current;
        if (u) {
          URL.revokeObjectURL(u);
          blobUrlRef.current = null;
        }
      };
    }, [innerWorldImage]);

    return (
      <div
        ref={ref}
        className={[
          "relative mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl",
          "border border-white/10 bg-[#07070b] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_26px_90px_rgba(0,0,0,0.65)]",
          className,
        ].join(" ")}
        style={{ aspectRatio: "9 / 16" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_60%_at_50%_0%,rgba(140,110,200,0.20),transparent_70%),radial-gradient(ellipse_70%_55%_at_100%_100%,rgba(90,130,200,0.10),transparent_72%)]"
        />

        <div className="relative z-10 flex h-full min-h-0 flex-col justify-between px-5 py-7 text-white">
          {/* Top */}
          <div className="min-w-0">
            <h2 className="font-serif text-2xl font-semibold leading-tight text-white [font-family:var(--font-serif-display)] line-clamp-2">
              {patternName}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70 line-clamp-3">{subtext}</p>
          </div>

          {/* Visual core */}
          <div className="mt-5">
            <div className="relative h-[180px] w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
              {imgSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]"
                  aria-hidden
                />
              )}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
              />
            </div>
          </div>

          {/* Brutal line */}
          <p className="mt-5 text-center text-base font-medium text-white leading-snug text-balance line-clamp-3">
            {brutalLine}
          </p>

          {/* Traits */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs text-white/60">{themeLabel}</p>
              <p className="mt-1 text-sm font-semibold text-white">{themeValue}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs text-white/60">{toneLabel}</p>
              <p className="mt-1 text-sm font-semibold text-white">{toneValue}</p>
            </div>
          </div>

          {/* Shift insight */}
          <p className="mt-5 text-sm text-white/80 leading-relaxed text-balance line-clamp-3">
            {shiftInsight}
          </p>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-[10px] text-white/40 tracking-wide">Luma</p>
            <p className="text-[10px] text-white/40 text-right max-w-[220px] leading-snug">
              {footerLine}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

