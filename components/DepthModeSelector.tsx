"use client";

import type { DepthMode } from "@/lib/depthMode";
import { depthToneHint } from "@/lib/depthUiMicrocopy";

const OPTIONS: { id: DepthMode; label: string }[] = [
  { id: "satin", label: "Satin" },
  { id: "steel", label: "Steel" },
];

type Props = {
  value: DepthMode;
  onChange: (mode: DepthMode) => void;
  className?: string;
  disabled?: boolean;
  /** @deprecated Kept for API compatibility; styling is always dark glass. */
  variant?: "dark" | "light";
};

export function DepthModeSelector({
  value,
  onChange,
  className = "",
  disabled = false,
  variant: _variant = "dark",
}: Props) {
  return (
    <div
      className={`flex flex-col gap-1.5 ${className}`}
      role="group"
      aria-label="Depth tone"
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Depth tone
      </span>
      <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] backdrop-blur-sm">
        {OPTIONS.map(({ id, label }) => {
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(id)}
              className={[
                "relative rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 md:px-4 md:text-[13px]",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(120,90,180,0.2)]"
                  : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
                disabled ? "pointer-events-none opacity-45" : "",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 max-w-[20rem] self-center text-center text-xs leading-snug text-muted-foreground/85 md:mt-3 md:text-[13px] md:leading-relaxed">
        {depthToneHint(value)}
      </p>
    </div>
  );
}
