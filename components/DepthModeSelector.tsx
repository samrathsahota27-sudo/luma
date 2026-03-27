"use client";

import type { DepthMode } from "@/lib/depthMode";

const OPTIONS: { id: DepthMode; label: string }[] = [
  { id: "gentle", label: "Gentle" },
  { id: "balanced", label: "Balanced" },
  { id: "direct", label: "Direct" },
];

type Props = {
  value: DepthMode;
  onChange: (mode: DepthMode) => void;
  className?: string;
  disabled?: boolean;
  /** Cream/light surfaces (e.g. /test, /reflect) */
  variant?: "dark" | "light";
};

export function DepthModeSelector({
  value,
  onChange,
  className = "",
  disabled = false,
  variant = "dark",
}: Props) {
  const light = variant === "light";

  return (
    <div
      className={`flex flex-col gap-1.5 ${className}`}
      role="group"
      aria-label="Insight depth"
    >
      <span
        className={`text-[10px] font-medium uppercase tracking-[0.12em] ${light ? "text-[#7a7268]" : "text-[#6d6578]"}`}
      >
        Depth mode
      </span>
      <div
        className={`inline-flex rounded-xl border p-1 shadow-inner ${
          light
            ? "border-[#E8E3D9] bg-[#FDFCF9]/95"
            : "border-[#2e2a35]/90 bg-[#141218]/90"
        }`}
      >
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
                light
                  ? active
                    ? "bg-[#2F2F2F] text-white shadow-sm"
                    : "text-[#5a5a5a] hover:text-[#2F2F2F]"
                  : active
                    ? "bg-[#2a2635] text-[#f0ebe4] shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                    : "text-[#8a8278] hover:text-[#c9c0b4]",
                disabled ? "opacity-45 pointer-events-none" : "",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
