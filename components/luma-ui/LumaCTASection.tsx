import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Purpose: End-of-flow commitment strip — one clear next step + low-anxiety reassurance.
 * Structure: Optional heading → children (buttons) → fine print.
 * Styling: Centered stack on mobile; row on md+ when multiple actions.
 * Behavior: No dependency on marketing illustrations; text carries emotion.
 */
export function LumaCTASection({
  title,
  children,
  footnote,
  className,
}: {
  title?: string;
  children: ReactNode;
  footnote?: string;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col items-stretch gap-4 sm:items-center sm:text-center", className)}>
      {title ? (
        <h3 className="max-w-md text-center font-serif text-lg text-foreground [font-family:var(--font-serif-display)] sm:mx-auto">
          {title}
        </h3>
      ) : null}
      <div className="flex w-full flex-col gap-3 sm:max-w-md sm:flex-row sm:justify-center">{children}</div>
      {footnote ? <p className="text-center text-xs leading-relaxed text-muted-foreground sm:max-w-sm sm:mx-auto">{footnote}</p> : null}
    </section>
  );
}
