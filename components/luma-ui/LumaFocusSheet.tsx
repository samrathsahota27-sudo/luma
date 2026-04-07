"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Purpose: Interruptive-but-soft overlay for disclaimers, depth mode, payoffs.
 * Structure: Radix Dialog; Luma-styled content (glass).
 * Styling: Dark scrim; content matches `.luma-glass` language.
 * Behavior: Focus trap + Esc from Radix; no extra animation library.
 */
export function LumaFocusSheet({
  trigger,
  title,
  description,
  children,
  className,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={cn(
          "max-h-[min(90vh,640px)] overflow-y-auto border-white/10 bg-zinc-950/95 sm:max-w-md",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl [font-family:var(--font-serif-display)]">{title}</DialogTitle>
          {description ? <DialogDescription className="text-sm leading-relaxed text-muted-foreground">{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="pt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
