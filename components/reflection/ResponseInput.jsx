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
      className={`w-full min-h-[140px] rounded-[16px] bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#2F2F2F]/20 focus:border-[#E8E3D9] border border-[#E8E3D9] resize-y shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={minRows}
      aria-label="Your reflection"
    />
  );
});
