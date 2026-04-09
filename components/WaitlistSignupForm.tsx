"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

type Props = {
  source: string;
  title: string;
  description: string;
  submitLabel: string;
  successMessage?: string;
  theme?: Theme;
  className?: string;
  idPrefix?: string;
};

export function WaitlistSignupForm({
  source,
  title,
  description,
  submitLabel,
  successMessage = "You're on the list — we'll be in touch soon.",
  theme = "dark",
  className,
  idPrefix = "waitlist",
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const light = theme === "light";
  const inputId = `${idPrefix}-email`;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Enter your email.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(typeof data?.error === "string" ? data.error : "Something went wrong. Try again.");
        return;
      }
      setStatus("success");
      setMessage(typeof data?.message === "string" ? data.message : successMessage);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <div className={cn(className)}>
      <h2
        className={cn(
          "font-serif text-xl md:text-2xl [font-family:var(--font-serif-display)]",
          light ? "text-foreground" : "text-white"
        )}
      >
        {title}
      </h2>
      <p className={cn("mt-2 text-sm max-w-md", light ? "text-muted-foreground" : "text-white/55")}>
        {description}
      </p>

      {status === "success" && message ? (
        <p
          className={cn("mt-6 text-sm", light ? "text-emerald-600 dark:text-emerald-400" : "text-emerald-300/90")}
          role="status"
        >
          {message}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md">
          <label htmlFor={inputId} className="sr-only">
            Email
          </label>
          <input
            id={inputId}
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={status === "loading"}
            className={cn(
              "flex-1 min-w-0 rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 disabled:opacity-60",
              light
                ? "border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring/30"
                : "border-white/15 bg-white/[0.06] text-white placeholder:text-white/35 focus:ring-violet-400/30"
            )}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className={cn(
              "shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60",
              light
                ? "bg-primary text-primary-foreground"
                : "bg-white text-[#0b0a0d]"
            )}
          >
            {status === "loading" ? "Joining…" : submitLabel}
          </button>
        </form>
      )}

      {status === "error" && message ? (
        <p
          className={cn("mt-3 text-sm", light ? "text-destructive" : "text-red-300/90")}
          role="alert"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
