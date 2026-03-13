"use client";

/**
 * Displays progress through reflection rounds.
 */
export function ProgressBar({ currentRound, totalRounds, roundTitles }) {
  const total = totalRounds ?? 4;
  const current = Math.min(Math.max(1, currentRound), total);
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total} aria-label={`Round ${current} of ${total}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Round {current} of {total}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#E6E8F0] overflow-hidden">
        <div
          className="h-full bg-[#2F2F2F] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {Array.isArray(roundTitles) && roundTitles.length >= current && (
        <p className="mt-2 text-sm text-muted-foreground">
          {roundTitles[current - 1]}
        </p>
      )}
    </div>
  );
}
