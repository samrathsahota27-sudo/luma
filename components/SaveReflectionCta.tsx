"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const SESSION_DISMISS_KEY = "luma_soft_save_reflection_cta_dismissed";

type SaveReflectionCtaProps = {
  className?: string;
};

export function SaveReflectionCta({ className }: SaveReflectionCtaProps) {
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let dismissed = false;
      try {
        dismissed = sessionStorage.getItem(SESSION_DISMISS_KEY) === "1";
      } catch {
        /* ignore */
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setShow(!user && !dismissed);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!ready || !show) return null;

  return (
    <aside
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        className
      )}
      aria-label="Optional account signup"
    >
      <h2 className="font-serif text-lg text-foreground [font-family:var(--font-serif-display)]">
        Want to save your reflection?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Create a free account to track your patterns over time.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/signup"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-opacity hover:opacity-90"
        >
          Save my results
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/12 bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          Maybe later
        </button>
      </div>
    </aside>
  );
}
