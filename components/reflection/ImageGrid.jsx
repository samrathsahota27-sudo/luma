"use client";

import { useEffect } from "react";
import { ImageOption } from "@/components/ImageOption";
import { normalizePublicImageSrc } from "@/lib/publicImage";

/**
 * Displays selectable image options for a reflection round.
 */
export function ImageGrid({
  images,
  selectedIndex,
  onSelectImage,
}) {
  const hasSelection = selectedIndex != null;

  useEffect(() => {
    if (!Array.isArray(images) || images.length === 0) return;
    const preload = images.slice(0, 6);
    for (const raw of preload) {
      const u = normalizePublicImageSrc(raw);
      if (/^https?:\/\//i.test(String(u))) {
        const img = new window.Image();
        img.src = u;
      }
    }
  }, [images]);

  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-4">
      {images.map((imgName, index) => (
        <ImageOption
          key={imgName}
          src={imgName}
          alt={`Option ${index + 1}`}
          selected={selectedIndex === index}
          dimmed={hasSelection && selectedIndex !== index}
          onSelect={() => onSelectImage(index)}
        />
      ))}
    </div>
  );
}
