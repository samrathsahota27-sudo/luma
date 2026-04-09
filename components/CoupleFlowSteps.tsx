import { Fragment } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  { step: 1 as const, title: "Partner A selects" },
  { step: 2 as const, title: "Partner B selects" },
  { step: 3 as const, title: "See your results" },
];

type Props = {
  activeStep: 1 | 2 | 3;
  className?: string;
};

export function CoupleFlowSteps({ activeStep, className }: Props) {
  return (
    <nav
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:px-4 sm:py-3.5",
        className
      )}
      aria-label="Couple reflection steps"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-2 sm:gap-y-2 text-[11px] sm:text-xs">
        {STEPS.map((s, i) => {
          const isCurrent = activeStep === s.step;
          const isDone = activeStep > s.step;
          return (
            <Fragment key={s.step}>
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1 font-semibold tabular-nums",
                    isCurrent && "bg-violet-500/25 text-violet-100 ring-1 ring-violet-400/35",
                    isDone && !isCurrent && "bg-emerald-500/15 text-emerald-100/90",
                    !isCurrent && !isDone && "bg-white/[0.06] text-white/40"
                  )}
                >
                  Step {s.step}
                </span>
                <span
                  className={cn(
                    "text-white/55",
                    isCurrent && "text-white/90 font-medium",
                    isDone && "text-white/70"
                  )}
                >
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 ? (
                <span className="hidden sm:inline text-white/25 px-0.5 select-none self-center" aria-hidden>
                  →
                </span>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}
