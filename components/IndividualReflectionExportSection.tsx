"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { downloadStoryFromElement } from "@/lib/storyCardCapture";
import { cn } from "@/lib/utils";

/**
 * Wraps individual result blocks and adds "Save as image" using html-to-image (same stack as story cards).
 */
export function IndividualReflectionExportSection({
  children,
  className,
  filename = "luma-reflection.png",
}: {
  children: ReactNode;
  className?: string;
  filename?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const onSave = useCallback(async () => {
    const el = ref.current;
    if (!el || busy) return;
    setBusy(true);
    try {
      await downloadStoryFromElement(el, filename);
    } catch (e) {
      console.warn("Reflection export failed", e);
    } finally {
      setBusy(false);
    }
  }, [busy, filename]);

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={ref}
        className="rounded-2xl border border-white/8 bg-[#07060a] p-4 md:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        {children}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.09] disabled:opacity-50"
        >
          {busy ? "Preparing image…" : "Save as image"}
        </button>
      </div>
    </div>
  );
}
