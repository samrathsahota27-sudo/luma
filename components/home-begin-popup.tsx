"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "luma_popup_shown";
const DELAY_MS = 25000;

export function HomeBeginPopup() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let timer: number | null = null;

    try {
      const already = localStorage.getItem(STORAGE_KEY);
      if (already) return;
    } catch {
      // If storage is unavailable, fail closed (don't show).
      return;
    }

    timer = window.setTimeout(() => {
      try {
        const already = localStorage.getItem(STORAGE_KEY);
        if (already) return;
        setOpen(true);
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // If storage errors, don't show.
      }
    }, DELAY_MS);

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [mounted]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Begin your reflection"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          "relative w-full max-w-[520px] rounded-[24px] border border-white/10",
          "bg-[linear-gradient(180deg,rgba(232,227,217,0.70),rgba(247,246,243,0.95))]",
          "shadow-[0_18px_60px_rgba(31,26,23,0.18)] p-6 md:p-8",
          "animate-luma-fade-only"
        )}
        style={{ animationDuration: "420ms" }}
      >
        <div className="flex items-start gap-4">
          <div
            aria-hidden
            className="mt-0.5 h-10 w-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-[0_6px_20px_rgba(31,26,23,0.06)]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-foreground/80"
            >
              <path
                d="M12 21s-7-4.35-7-11a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 6.65-7 11-7 11Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M10.2 11.9 11.6 13.3 14.8 10.1"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h2 className="font-serif text-[22px] md:text-[26px] text-foreground [font-family:var(--font-serif-display)]">
              Begin your reflection
            </h2>
            <p className="mt-2 text-muted-foreground text-sm md:text-[15px] leading-relaxed">
              See what’s shaping your thoughts beneath the surface.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/choose-mode")}
                className="inline-flex items-center justify-center rounded-full px-5 py-3 sm:px-6 bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] text-sm font-medium text-center transition-all duration-200 hover:opacity-90 hover:brightness-[1.03]"
              >
                Start your reflection — it&apos;s free
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close popup"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-white/50 transition"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

