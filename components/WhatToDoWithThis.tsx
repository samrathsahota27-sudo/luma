import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Sit with one insight for 10 minutes — journal about it.",
  "Share one section with someone you trust.",
  "Come back next week and see what shifts.",
] as const;

type Props = {
  variant?: "light" | "dark";
  className?: string;
};

export function WhatToDoWithThis({ variant = "light", className }: Props) {
  const dark = variant === "dark";

  return (
    <section
      className={cn(
        "rounded-2xl border p-5 md:p-6",
        dark
          ? "border-white/10 bg-white/[0.04]"
          : "border-border/80 bg-muted/30",
        className
      )}
      aria-labelledby="what-to-do-with-this-heading"
    >
      <h2
        id="what-to-do-with-this-heading"
        className={cn(
          "font-serif text-lg md:text-xl [font-family:var(--font-serif-display)]",
          dark ? "text-white" : "text-foreground"
        )}
      >
        What to do with this
      </h2>
      <p
        className={cn(
          "mt-2 text-sm leading-relaxed",
          dark ? "text-white/55" : "text-muted-foreground"
        )}
      >
        Pick one small next step — no pressure to do all three.
      </p>
      <ol className="mt-4 space-y-3 list-decimal list-inside text-sm leading-relaxed marker:font-medium">
        {SUGGESTIONS.map((line) => (
          <li
            key={line}
            className={cn("pl-1", dark ? "text-white/80" : "text-foreground/90")}
          >
            {line}
          </li>
        ))}
      </ol>
    </section>
  );
}
