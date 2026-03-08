"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function ImageOption({ src, alt, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-sm transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-[0.98]"
          : "hover:scale-[0.98] hover:shadow-lg"
      )}
      aria-pressed={selected}
      aria-label={alt}
    >
      <Image
        src={`/${src}`}
        alt={alt}
        fill
        className="object-cover transition-all duration-500"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {selected && (
        <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
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

