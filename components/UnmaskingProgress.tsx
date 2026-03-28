"use client";

import { Check, CircleDashed, Loader2 } from "lucide-react";

export type UnmaskingSideStatus = "complete" | "pending" | "needs_action" | "sealed";

type Side = {
  label: string;
  status: UnmaskingSideStatus;
  /** Short line under the title */
  hint: string;
};

function StatusIcon({ status }: { status: UnmaskingSideStatus }) {
  if (status === "complete") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/10">
        <Check className="h-5 w-5 text-emerald-400" strokeWidth={2} aria-hidden />
      </div>
    );
  }
  if (status === "sealed") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-200/90">···</span>
      </div>
    );
  }
  if (status === "needs_action") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/35 bg-amber-500/10">
        <CircleDashed className="h-5 w-5 animate-spin text-amber-300/90 [animation-duration:2.5s]" aria-hidden />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04]">
      <Loader2 className="h-5 w-5 animate-spin text-white/50 [animation-duration:1.15s]" aria-hidden />
    </div>
  );
}

function isSideDone(s: Side) {
  return s.status === "complete" || s.status === "sealed";
}

function OverallProgressBar({ you, partner }: { you: Side; partner: Side }) {
  const done = (isSideDone(you) ? 1 : 0) + (isSideDone(partner) ? 1 : 0);
  const pct = done === 0 ? 8 : done === 1 ? 50 : 100;
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <span>Unmasking</span>
        <span className="tabular-nums text-foreground/80">{done}/2</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]" aria-hidden>
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500/80 to-fuchsia-400/70 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SideCard({ side, position }: { side: Side; position: "top" | "bottom" }) {
  const border =
    position === "top" ? "rounded-t-2xl border-b-0 md:border-b md:rounded-b-none" : "rounded-b-2xl md:rounded-t-none md:border-t-0";

  return (
    <div
      className={`relative border border-white/10 bg-white/[0.03] px-5 py-6 md:px-7 md:py-7 ${border} backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{side.label}</p>
          <p className="mt-3 text-base font-medium leading-snug text-foreground">{side.hint}</p>
        </div>
        <StatusIcon status={side.status} />
      </div>
    </div>
  );
}

/**
 * Vertical split (mobile-first): two stacked panels with clear progress ticks.
 * Used for Connect “Unmasking” — anticipation before both reflections meet.
 */
export function UnmaskingProgress({
  you,
  partner,
  className = "",
  showOverallBar = true,
}: {
  you: Side;
  partner: Side;
  className?: string;
  showOverallBar?: boolean;
}) {
  return (
    <div className={className}>
      {showOverallBar ? <OverallProgressBar you={you} partner={partner} /> : null}
      <div className="flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:flex-row md:rounded-2xl md:overflow-hidden md:shadow-none">
        <div className="flex-1 min-w-0">
          <SideCard side={you} position="top" />
        </div>
        <div
          className="hidden md:block w-px shrink-0 bg-gradient-to-b from-transparent via-white/12 to-transparent"
          aria-hidden
        />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/12 to-transparent md:hidden" aria-hidden />
        <div className="flex-1 min-w-0">
          <SideCard side={partner} position="bottom" />
        </div>
      </div>
    </div>
  );
}
