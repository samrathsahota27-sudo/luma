"use client";

import { forwardRef } from "react";

/**
 * Optional written reflection input for a round.
 */
export const ResponseInput = forwardRef(function ResponseInput(
  {
    value,
    onChange,
    placeholder = "Write your thoughts here...",
    minRows = 5,
    disabled,
    className = "",
  },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={`w-full min-h-[140px] rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-foreground outline-none backdrop-blur-sm transition-[box-shadow,border-color] focus:border-white/15 focus:ring-2 focus:ring-ring/35 resize-y shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_12px_40px_rgba(0,0,0,0.25)] placeholder:text-muted-foreground ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={minRows}
      aria-label="Your reflection"
    />
  );
});
