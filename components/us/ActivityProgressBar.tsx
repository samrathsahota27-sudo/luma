"use client";

import { Progress } from "@/components/ui/progress";

type ActivityProgressBarProps = {
  label: string;
  value: number;
  hint?: string;
  tone?: "green" | "purple" | "orange";
};

const TONE_CLASS: Record<NonNullable<ActivityProgressBarProps["tone"]>, string> = {
  green: "[&>div]:bg-emerald-300",
  purple: "[&>div]:bg-violet-300",
  orange: "[&>div]:bg-amber-300",
};

export function ActivityProgressBar({ label, value, hint, tone = "purple" }: ActivityProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-2">
        <p className="text-[13px] font-medium text-white/90">{label}</p>
        <p className="text-xs text-white/60">{safeValue}%</p>
      </div>
      <Progress
        value={safeValue}
        className={`h-2.5 bg-white/12 transition-all duration-500 ${TONE_CLASS[tone]}`}
      />
      {hint ? <p className="text-xs text-white/55">{hint}</p> : null}
    </div>
  );
}
