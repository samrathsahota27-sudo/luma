import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

/**
 * Purpose: High-contrast primary for conversion; quieter secondaries for reflection paths.
 * Structure: Native button; supports `asChild` pattern not included to avoid extra deps — wrap with Link externally.
 * Styling: Inverted primary on dark; glass outline for secondary.
 * Behavior: Focus ring; active scale 0.98; 200ms transitions.
 */
export function LumaButton({
  children,
  variant = "primary",
  className,
  fullWidth,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  const variants: Record<Variant, string> = {
    primary:
      "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.35)] hover:bg-primary/92 motion-safe:active:scale-[0.98]",
    secondary:
      "bg-white/[0.06] text-white border border-white/10 hover:bg-white/[0.09] hover:border-white/[0.14] motion-safe:active:scale-[0.98]",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
  };

  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium tracking-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
