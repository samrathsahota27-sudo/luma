"use client";

import { forwardRef } from "react";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { appendTranscriptValue, useSpeechToText } from "@/hooks/useSpeechToText";

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
  const mic = useSpeechToText((transcript) => onChange(appendTranscriptValue(value, transcript)));

  return (
    <div className="relative">
      <textarea
        ref={ref}
        className={`w-full min-h-[140px] rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 pr-24 text-base text-foreground outline-none backdrop-blur-sm transition-[box-shadow,border-color] focus:border-white/15 focus:ring-2 focus:ring-ring/35 resize-y shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_12px_40px_rgba(0,0,0,0.25)] placeholder:text-muted-foreground ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={minRows}
        aria-label="Your reflection"
      />
      <SpeechMicButton
        isListening={mic.isListening}
        isSupported={mic.isSupported}
        disabled={disabled}
        onToggle={mic.toggle}
        className="absolute right-3 top-3"
      />
      {mic.error ? <p className="mt-2 text-xs text-[#c49a8c]">{mic.error}</p> : null}
    </div>
  );
});
