import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Purpose: Minimal wayfinding without breaking immersion.
 * Structure: Left mark → optional right slot (icon / text link).
 * Styling: Blur + hairline bottom; stays calm on scroll.
 * Behavior: Fixed; safe-area aware padding.
 */
export function LumaTopNav({
  logoHref = "/",
  logoLabel = "Luma",
  right,
  className,
}: {
  logoHref?: string;
  logoLabel?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full border-b border-white/[0.06] bg-background/75 backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:px-6">
        <Link
          href={logoHref}
          className="font-serif text-sm tracking-tight text-foreground [font-family:var(--font-serif-display)] transition-opacity hover:opacity-80"
        >
          {logoLabel}
        </Link>
        {right ? <div className="flex items-center gap-3 text-xs text-muted-foreground">{right}</div> : null}
      </div>
    </header>
  );
}
