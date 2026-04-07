import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Purpose: Above-the-fold emotional anchor — one idea, one action, no clutter.
 * Structure: Optional kicker → display headline → supporting line → slot (CTAs).
 * Styling: Serif display for gravity; sans for legibility at small sizes.
 * Behavior: Content stacks; optional stagger via parent `animate-luma-fade-in-*` classes.
 */
export function LumaHero({
  kicker,
  title,
  subtitle,
  align = "left",
  children,
  className,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  children?: ReactNode;
  className?: string;
}) {
  const a = align === "center" ? "text-center items-center" : "text-left items-start";
  return (
    <header className={cn("flex flex-col gap-5 md:gap-6", a, className)}>
      {kicker ? (
        <p
          className={cn(
            "text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground",
            align === "center" && "max-w-md"
          )}
        >
          {kicker}
        </p>
      ) : null}
      <h1
        className={cn(
          "font-serif text-[1.75rem] leading-[1.15] sm:text-[2.125rem] md:text-[2.5rem] text-foreground [font-family:var(--font-serif-display)] tracking-[-0.02em]",
          align === "center" && "max-w-xl"
        )}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          className={cn(
            "max-w-xl text-base sm:text-[1.05rem] leading-relaxed text-muted-foreground font-sans font-normal",
            align === "center" && "max-w-lg"
          )}
        >
          {subtitle}
        </p>
      ) : null}
      {children ? <div className={cn("flex flex-col gap-3 sm:flex-row sm:gap-4", align === "center" && "justify-center")}>{children}</div> : null}
    </header>
  );
}
