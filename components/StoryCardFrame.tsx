"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

export type StoryCardFrameProps = {
  title: string;
  imageUrl?: string | null;
  subtitle?: string;
  insight?: string;
  drift?: number | null;
  tension?: number | null;
  brand?: string;
  className?: string;
};

/**
 * 9:16 story card for PNG export (html-to-image). Mobile: width 100% of container, max 360px.
 * Remote images are fetched to a blob URL so capture is not tainted by CORS.
 */
export const StoryCardFrame = forwardRef<HTMLDivElement, StoryCardFrameProps>(
  function StoryCardFrame(
    {
      title,
      imageUrl,
      subtitle = "What does your inner world look like?",
      insight,
      drift = null,
      tension = null,
      brand = "Luma",
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

      const url = imageUrl?.trim();
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
    }, [imageUrl]);

    return (
      <div
        ref={ref}
        className={`relative mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl bg-[#050508] shadow-[0_12px_48px_rgba(0,0,0,0.22)] ${className}`}
        style={{ aspectRatio: "9 / 16", width: "100%", minHeight: 640 }}
      >
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#0c0b12] via-[#11101a] to-[#050508]"
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" aria-hidden />
        <div className="relative z-10 flex h-full min-h-0 flex-col justify-between px-5 py-9 text-center sm:px-6 sm:py-10">
          <h2
            className="font-serif text-[1.35rem] font-semibold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] [font-family:var(--font-serif-display),Georgia,serif] sm:text-2xl"
          >
            {title}
          </h2>
          {insight ? (
            <p className="mt-3 px-2 text-sm leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
              {insight}
            </p>
          ) : null}
          {drift != null || tension != null ? (
            <div className="mt-4 inline-flex items-center justify-center gap-3 text-xs text-white/85">
              {drift != null ? <span>Drift {Math.round(drift)}%</span> : null}
              {tension != null ? <span>Tension {Math.round(tension)}%</span> : null}
            </div>
          ) : null}
          <div className="min-w-0 shrink pb-1">
            <p className="text-base font-semibold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {brand}
            </p>
            <p className="mt-2 text-xs leading-snug text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] sm:text-sm">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    );
  }
);
