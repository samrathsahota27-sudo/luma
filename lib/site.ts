/** Canonical public site URL (no trailing slash). */
export const PUBLIC_SITE_URL =
  (typeof process.env.NEXT_PUBLIC_SITE_URL === "string"
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "") || "https://luma-i8rm.vercel.app";

export function publicSiteHost(): string {
  try {
    return new URL(PUBLIC_SITE_URL).host;
  } catch {
    return "luma-i8rm.vercel.app";
  }
}
