import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Purpose: Consistent horizontal rhythm + max width for mobile-first immersive layouts.
 * Structure: Single wrapper; optional vertical spacing presets.
 * Behavior: No client JS.
 */
export function LumaShell({
  children,
  className,
  density = "comfortable",
}: {
  children: ReactNode;
  className?: string;
  /** comfortable: marketing / intros; tight: dense result flows */
  density?: "comfortable" | "tight";
}) {
  const py = density === "tight" ? "py-10 md:py-14" : "py-14 md:py-24";
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[min(100%,42rem)] px-5 sm:px-6 md:max-w-2xl lg:max-w-3xl",
        py,
        className
      )}
    >
      {children}
    </div>
  );
}
