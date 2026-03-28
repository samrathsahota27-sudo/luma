/** Unified public asset path + error fallback for reflection UI images. */
export const IMAGE_FALLBACK_SRC = "/images/fallback.jpg";

/**
 * @param {string | null | undefined} src
 * @returns {string} Absolute path under /public (leading slash).
 */
export function normalizePublicImageSrc(src) {
  if (src == null || typeof src !== "string") return IMAGE_FALLBACK_SRC;
  const t = src.trim();
  if (!t) return IMAGE_FALLBACK_SRC;
  if (t.startsWith("//")) return IMAGE_FALLBACK_SRC;
  return t.startsWith("/") ? t : `/${t}`;
}

/**
 * Use with next/image or <img> onError. Clears srcset so the fallback applies.
 * @param {{ currentTarget?: HTMLImageElement }} e
 */
export function applyImageErrorFallback(e) {
  const el = e?.currentTarget;
  if (!el || el.tagName !== "IMG") return;
  try {
    if (typeof el.src === "string" && el.src.includes("fallback.jpg")) return;
  } catch {
    /* ignore */
  }
  el.removeAttribute("srcset");
  el.removeAttribute("sizes");
  el.src = IMAGE_FALLBACK_SRC;
}
