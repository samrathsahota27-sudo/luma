import { Mic, MicOff } from "lucide-react";

export function SpeechMicButton({
  isListening,
  isSupported,
  disabled,
  onToggle,
  className = "",
}: {
  isListening: boolean;
  isSupported: boolean;
  disabled?: boolean;
  onToggle: () => void;
  className?: string;
}) {
  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      className={[
        "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
        isListening
          ? "border-rose-400/45 bg-rose-500/15 text-rose-200"
          : "border-white/15 bg-black/20 text-white/65 hover:border-white/30 hover:text-white/85",
        "disabled:opacity-40 disabled:pointer-events-none",
        className,
      ].join(" ")}
    >
      {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
      <span>{isListening ? "Listening..." : "Mic"}</span>
    </button>
  );
}

