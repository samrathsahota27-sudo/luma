"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Variant = "individual" | "couple";

export function ReflectionRetentionPrompt({
  className,
  variant = "individual",
}: {
  className?: string;
  variant?: Variant;
}) {
  const supabase = createClient();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [reminderSaved, setReminderSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!cancelled) setSignedIn(!!user);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase.auth]);

  const onRemind = useCallback(async () => {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/user/reflection-reminder", { method: "POST" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Could not save");
      setReminderSaved(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <aside
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 md:px-6 md:py-6 text-center",
        className
      )}
      aria-label={variant === "couple" ? "Return reminder for couples" : "Return reminder"}
    >
      <p className="text-sm text-foreground/90 leading-relaxed">
        Reflection patterns shift over time. Try this again in 7 days to see what&apos;s changed.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        {signedIn === null ? (
          <span className="text-xs text-muted-foreground">…</span>
        ) : signedIn ? (
          <button
            type="button"
            onClick={onRemind}
            disabled={busy || reminderSaved}
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {reminderSaved ? "Reminder saved" : busy ? "Saving…" : "Remind me"}
          </button>
        ) : (
          <Link
            href="/signup"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.1]"
          >
            Save &amp; track over time →
          </Link>
        )}
      </div>
      {err ? <p className="mt-2 text-xs text-destructive">{err}</p> : null}
    </aside>
  );
}
