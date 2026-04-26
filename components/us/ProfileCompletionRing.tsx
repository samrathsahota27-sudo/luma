"use client";

type ProfileCompletionRingProps = {
  value: number;
  size?: number;
  trackColor?: string;
  fillColor?: string;
};

export function ProfileCompletionRing({
  value,
  size = 64,
  trackColor = "rgba(255,255,255,0.22)",
  fillColor = "rgba(255,255,255,0.94)",
}: ProfileCompletionRingProps) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  const inset = Math.max(5, Math.round(size * 0.08));

  return (
    <div
      className="relative flex items-center justify-center rounded-full border border-white/30 bg-white/10 transition-all duration-500"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `conic-gradient(${fillColor} ${safe * 3.6}deg, ${trackColor} 0deg)`,
      }}
      aria-label={`Profile completion ${safe}%`}
      role="img"
    >
      <div className="absolute rounded-full bg-[#7fa9ff]/25" style={{ inset: `${inset}px` }} />
      <span className="relative z-10 text-sm font-semibold text-white">{safe}%</span>
    </div>
  );
}
