"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

function clamp0to100(n: unknown, fallback: number) {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(0, Math.min(100, Math.round(x)));
}

export function FutureProjectionPanel({
  connection,
  distance,
  conflict,
  variant: _variant = "dark",
  className = "",
}: {
  connection: number;
  distance: number;
  conflict: number;
  /** @deprecated All surfaces use dark glass; prop kept for compatibility. */
  variant?: "dark" | "light";
  className?: string;
}) {
  const c = clamp0to100(connection, 50);
  const d = clamp0to100(distance, 50);
  const f = clamp0to100(conflict, 50);

  const driftRisk = useMemo(() => {
    // Heavier weight on distance + conflict, softened by connection.
    const raw = d * 0.55 + f * 0.35 - c * 0.25 + 25;
    return clamp0to100(raw, 50);
  }, [c, d, f]);

  const [unlocked, setUnlocked] = useState(false);

  return (
    <section
      className={[
        "relative overflow-hidden rounded-3xl backdrop-blur-2xl",
        "border border-white/10 bg-white/[0.035] shadow-[0_24px_90px_rgba(0,0,0,0.55)]",
        className,
      ].join(" ")}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_-10%,rgba(140,110,220,0.14),transparent)]"
      />

      <div className="relative px-6 py-8 md:px-8 md:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
              Future projection
            </p>
            <h2 className="mt-3 font-serif text-[22px] tracking-tight text-white md:text-[26px] [font-family:var(--font-serif-display)]">
              Direction
            </h2>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Drift risk</p>
            <p className="mt-2 font-serif text-3xl tabular-nums text-white md:text-4xl [font-family:var(--font-serif-display)]">
              {driftRisk}%
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {/* LEFT: default path */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-6 md:p-7">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
              If nothing changes
            </p>
            <div className="relative mt-5 h-[150px] overflow-hidden rounded-xl border border-[#3a1a1a]/40 bg-gradient-to-b from-[#0b0a0d] via-[#0b0a0d] to-[#110a0c]">
              <div aria-hidden className="absolute inset-0 opacity-70">
                <div className="absolute left-[24%] top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[#7b6aa8]/18 blur-md animate-[fp-drift_6s_ease-in-out_infinite]" />
                <div className="absolute right-[24%] top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[#c9a87c]/12 blur-md animate-[fp-drift_6s_ease-in-out_infinite] [animation-delay:0.8s]" />
              </div>
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_40%,rgba(255,255,255,0.06),transparent)]"
              />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <p className="mt-4 text-xs text-white/55">Drifting. Small misses compound.</p>
          </div>

          {/* RIGHT: growth path */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-6 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
                If you act
              </p>
              {!unlocked && (
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/55">
                  Locked
                </span>
              )}
            </div>

            <div className="relative mt-5 h-[150px] overflow-hidden rounded-xl border border-[#1d3a32]/40 bg-gradient-to-b from-[#0b0a0d] via-[#0a0e14] to-[#071012]">
              <div aria-hidden className="absolute inset-0 opacity-80">
                <div className="absolute left-[26%] top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[#7b6aa8]/22 blur-md animate-[fp-sync_5.5s_ease-in-out_infinite]" />
                <div className="absolute right-[26%] top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[#8de0c4]/18 blur-md animate-[fp-sync_5.5s_ease-in-out_infinite] [animation-delay:0.7s]" />
              </div>

              {!unlocked && (
                <div className="absolute inset-0 bg-black/35 backdrop-blur-[10px]" aria-hidden />
              )}
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setUnlocked(true)}
                className="rounded-xl bg-white px-4 py-2 text-xs font-medium text-[#0b0a0d] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_28px_rgba(120,90,180,0.2)] transition hover:opacity-95 disabled:opacity-40"
              >
                Engage
              </button>
              <Link
                href="/future-paths"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/[0.05] hover:text-white"
              >
                View paths
              </Link>
            </div>
            <p className="mt-3 text-xs text-white/55">Aligned. Effort changes the direction.</p>
          </div>
        </div>

        <Link
          href="/rewrite-this-path"
          className="rewrite-path-cta group mt-10 flex w-full min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.07] px-6 py-4 text-center text-base font-semibold text-white transition-colors hover:bg-white/[0.11] hover:border-white/25 motion-safe:active:scale-[0.99] md:mx-auto md:max-w-xl"
        >
          Rewrite This Path
          <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
            →
          </span>
        </Link>
      </div>

      <style jsx>{`
        @keyframes fp-drift {
          0% {
            transform: translateY(-50%) translateX(0px) scale(0.98);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-50%) translateX(18px) scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-50%) translateX(0px) scale(0.98);
            opacity: 0.5;
          }
        }
        @keyframes fp-sync {
          0% {
            transform: translateY(-50%) scale(0.98);
            opacity: 0.55;
          }
          50% {
            transform: translateY(-50%) scale(1.08);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-50%) scale(0.98);
            opacity: 0.55;
          }
        }
        @keyframes rewritePathGlow {
          0%,
          100% {
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.08),
              0 8px 32px rgba(0, 0, 0, 0.45),
              0 0 24px rgba(140, 110, 220, 0.22),
              0 0 48px rgba(120, 90, 180, 0.12);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.14),
              0 10px 40px rgba(0, 0, 0, 0.5),
              0 0 36px rgba(170, 150, 255, 0.38),
              0 0 64px rgba(130, 100, 210, 0.22);
          }
        }
        .rewrite-path-cta {
          animation: rewritePathGlow 3.2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

