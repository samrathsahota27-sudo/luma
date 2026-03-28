"use client";

import { ImageOption } from "@/components/ImageOption";

/**
 * Displays selectable image options for a reflection round.
 */
export function ImageGrid({
  images,
  selectedIndex,
  onSelectImage,
}) {
  const hasSelection = selectedIndex != null;
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
