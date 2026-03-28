"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { round5Images } from "@/lib/reflection/round5Images";
import { applyImageErrorFallback, normalizePublicImageSrc } from "@/lib/publicImage";

/**
 * 2×2 mobile-first grid: image fills top of card; name + one-line meaning below.
 */
export function RoundFiveImageGrid({ selectedIndex, onSelectImage }) {
  const hasSelection = selectedIndex != null;

  return (
    <div
      className="grid w-full grid-cols-2 gap-3 sm:gap-3.5"
      role="radiogroup"
      aria-label="Choose one image"
    >
      {round5Images.map((item, index) => {
        const selected = selectedIndex === index;
        return (
          <button
            key={item.src}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelectImage(index)}
            className={cn(
              "group flex min-h-[44px] w-full min-w-0 flex-col overflow-hidden rounded-xl text-left",
              "border transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out",
              "motion-safe:active:scale-[0.97] motion-safe:active:duration-100",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0a0d]",
              selected
                ? "scale-[1.01] border-violet-400/70 bg-violet-500/[0.08] shadow-[0_0_0_1px_rgba(167,139,250,0.35),0_12px_40px_rgba(139,92,246,0.28)]"
                : "border-white/12 bg-white/[0.03] hover:border-white/18",
              hasSelection && !selected && "opacity-[0.72]"
            )}
          >
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-black/30">
              <Image
                src={normalizePublicImageSrc(item.src)}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-200 ease-out motion-safe:group-active:scale-[0.98]"
                sizes="(max-width: 640px) 50vw, 360px"
                onError={applyImageErrorFallback}
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-0.5 px-2.5 py-2 sm:px-3 sm:py-2.5">
              <p className="line-clamp-1 text-[13px] font-semibold leading-tight text-foreground sm:text-sm">
                {item.name}
              </p>
              <p className="line-clamp-1 text-[11px] leading-tight text-muted-foreground sm:text-xs">
                {item.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
