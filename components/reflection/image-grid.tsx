"use client"

import Image from "next/image"
import { useState } from "react"
import type { ReflectionImage } from "@/lib/reflection-data"
import { cn } from "@/lib/utils"

interface ImageGridProps {
  images: ReflectionImage[]
  onSelect: (image: ReflectionImage) => void
  selectedId?: string
}

export function ImageGrid({ images, onSelect, selectedId }: ImageGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set())

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => new Set(prev).add(id))
  }

  const handleImageError = (id: string) => {
    setErrorImages(prev => new Set(prev).add(id))
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {images.map((image) => {
        const isSelected = selectedId === image.id
        const hasError = errorImages.has(image.id)
        
        return (
          <button
            key={image.id}
            onClick={() => onSelect(image)}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-sm transition-all duration-300",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected 
                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-[0.98]" 
                : "hover:scale-[0.98] hover:shadow-lg"
            )}
            aria-label={`Select ${image.alt}`}
            aria-pressed={isSelected}
          >
            {/* Placeholder/Loading State */}
            <div 
              className={cn(
                "absolute inset-0 bg-secondary flex items-center justify-center transition-opacity duration-300",
                loadedImages.has(image.id) && !hasError ? "opacity-0" : "opacity-100"
              )}
            >
              <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
            </div>
            
            {/* Image or Symbolic Fallback */}
            {hasError ? (
              <div className="absolute inset-0 bg-secondary flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 border border-border rounded-sm flex items-center justify-center">
                    <div className="w-6 h-6 bg-muted-foreground/10 rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
                    {image.alt}
                  </p>
                </div>
              </div>
            ) : (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className={cn(
                  "object-cover transition-all duration-500",
                  loadedImages.has(image.id) ? "opacity-100 scale-100" : "opacity-0 scale-105",
                  isSelected ? "brightness-90" : "group-hover:brightness-95"
                )}
                onLoad={() => handleImageLoad(image.id)}
                onError={() => handleImageError(image.id)}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
            
            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
            
            {/* Hover Label */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              isSelected && "opacity-100"
            )}>
              <p className="text-xs text-white leading-tight line-clamp-2">
                {image.alt}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
