"use client";

import { useState } from "react";

/**
 * AI-generated couple artwork (prompts forbid on-image text).
 * `filter: "none"` keeps pixels sharp; switch to a light blur here if a model ever leaks typography.
 */
const IMG_STYLE = { filter: "none" };

function proxiedSrc(src) {
  if (!src || typeof src !== "string") return "";
  const t = src.trim();
  if (!t) return "";
  // Proxy external URLs to avoid client-side CORS issues.
  if (t.startsWith("http://") || t.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(t)}`;
  }
  return t;
}

export function GeneratedCoupleArtImage({ src, alt, className = "" }) {
  if (!src) return null;
  const [failed, setFailed] = useState(false);
  const finalSrc = failed ? "/images/fallback.jpg" : proxiedSrc(src);
  return (
    <div className={`relative min-h-0 min-w-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={finalSrc}
        alt={alt}
        className="h-full w-full object-cover object-center"
        style={IMG_STYLE}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
      {/* Inactive text-soften layer: raise opacity + blur() if copy ever appears in generated art */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ opacity: 0, backdropFilter: "blur(0px)" }}
        aria-hidden
      />
    </div>
  );
}
