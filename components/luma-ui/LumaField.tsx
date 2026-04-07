import type { ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Purpose: Grounded inputs that feel like a journal, not a CRM form.
 * Structure: Label → optional hint → textarea.
 * Styling: Hairline border, soft focus glow using `--ring`.
 * Behavior: Rounded `xl`; optional character tone via `hint` copy.
 */
export function LumaField({
  id,
  label,
  hint,
  className,
  ...textareaProps
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  hint?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </label>
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
      <textarea
        id={id}
        className={cn(
          "min-h-[120px] w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/55",
          "transition-[border-color,box-shadow] duration-200",
          "focus-visible:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        )}
        {...textareaProps}
      />
    </div>
  );
}
