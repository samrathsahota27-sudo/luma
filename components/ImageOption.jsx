"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { applyImageErrorFallback, normalizePublicImageSrc } from "@/lib/publicImage";

export function ImageOption({ src, alt, selected, dimmed, disabled, onSelect }) {
  const imageSrc = normalizePublicImageSrc(src);
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "group relative aspect-square w-full min-w-0 overflow-hidden rounded-xl transition-all duration-[220ms] ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected && "scale-[1.03] ring-2 ring-ring/30 ring-offset-2 ring-offset-background shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
        !selected && "hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
        dimmed && "opacity-70",
        disabled && "cursor-not-allowed"
      )}
      aria-pressed={selected}
      aria-label={alt}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-cover transition-all duration-[220ms] ease-out"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        onError={applyImageErrorFallback}
      />

      {selected && (
        <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center transition-opacity duration-[220ms]">
          <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-lg">
            <svg
              className="w-4 h-4 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}

