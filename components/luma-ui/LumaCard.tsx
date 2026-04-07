import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "glass" | "outline" | "ghost";

/**
 * Purpose: Contain one reflective unit (prompt, insight, choice cluster) without SaaS “panel” vibes.
 * Structure: Optional eyebrow → title → body → footer slot.
 * Styling: Uses `.luma-glass` or hairline border; soft shadow from CSS vars.
 * Behavior: Hover lift only on `interactive` variant (subtle).
 */
export function LumaCard({
  eyebrow,
  title,
  children,
  footer,
  variant = "glass",
  interactive = false,
  className,
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: Variant;
  /** Slight border brightening + cursor when the whole card is clickable */
  interactive?: boolean;
  className?: string;
}) {
  const base =
    variant === "glass"
      ? "luma-glass border border-white/[0.08]"
      : variant === "outline"
        ? "rounded-2xl border border-white/10 bg-black/20"
        : "rounded-2xl bg-transparent";

  const hover = interactive
    ? "transition-[box-shadow,transform,border-color] duration-300 ease-out motion-safe:hover:border-white/[0.14] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.85)] cursor-pointer"
    : "";

  return (
    <article className={cn("p-5 sm:p-6 md:p-7", base, hover, className)}>
      {eyebrow ? (
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      ) : null}
      {title ? (
        <h2 className="mb-3 font-serif text-lg sm:text-xl text-foreground [font-family:var(--font-serif-display)]">{title}</h2>
      ) : null}
      <div className="text-sm sm:text-[0.9375rem] leading-relaxed text-foreground/90">{children}</div>
      {footer ? <div className="mt-5 border-t border-white/[0.06] pt-4">{footer}</div> : null}
    </article>
  );
}
