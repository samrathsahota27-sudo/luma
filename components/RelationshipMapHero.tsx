"use client";

import { useMemo } from "react";
import { interpretRelationshipMapHeroState } from "@/lib/psychologicalArchetypes";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function clamp0to100(n: unknown, fallback: number) {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(0, Math.min(100, Math.round(x)));
}

export function RelationshipMapHero({
  connection,
  distance,
  conflict,
  resolvedCount = 0,
  variant = "dark",
  size = "md",
  className = "",
  showArchetypeRead = true,
}: {
  connection: number;
  distance: number;
  conflict: number;
  resolvedCount?: number;
  variant?: "dark" | "light";
  size?: "md" | "lg";
  className?: string;
  /** Short lines tying on-screen visuals to emotional patterns (mobile: 2–3 lines). */
  showArchetypeRead?: boolean;
}) {
  const c = clamp0to100(connection, 50);
  const d = clamp0to100(distance, 40);
  const f = clamp0to100(conflict, 45);

  const overlap = useMemo(() => clamp01((c / 100) * 0.55 + 0.15), [c]);
  const sep = useMemo(() => clamp01((d / 100) * 0.65 + 0.12), [d]);
  const crack = useMemo(() => clamp01(f / 100), [f]);
  const fog = useMemo(() => clamp01((d / 100) * 0.85), [d]);

  const leftX = 50 - sep * 22;
  const rightX = 50 + sep * 22;

  const stones = useMemo(() => {
    const n = Math.max(0, Math.min(10, Math.floor(resolvedCount)));
    return Array.from({ length: n }, (_, i) => i);
  }, [resolvedCount]);

  const archetypeLines = useMemo(
    () =>
      showArchetypeRead
        ? interpretRelationshipMapHeroState({
            connection: c,
            distance: d,
            conflict: f,
            resolvedCount,
          })
        : [],
    [showArchetypeRead, c, d, f, resolvedCount]
  );

  const readMuted =
    variant === "dark" ? "text-white/65" : "text-muted-foreground";

  return (
    <section
      className={[
        "relative overflow-hidden rounded-3xl backdrop-blur-2xl",
        variant === "dark"
          ? "border border-white/10 bg-white/[0.035] shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
          : "border border-white/10 bg-white/[0.05] shadow-[0_18px_70px_rgba(31,26,23,0.10)]",
        className,
      ].join(" ")}
    >
      <div
        aria-hidden
        className={
          variant === "dark"
            ? "absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-10%,rgba(180,150,255,0.12),transparent),radial-gradient(ellipse_45%_35%_at_85%_105%,rgba(255,210,160,0.08),transparent)]"
            : "absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_-10%,rgba(140,110,220,0.14),transparent),radial-gradient(ellipse_45%_35%_at_85%_105%,rgba(200,160,110,0.10),transparent)]"
        }
      />

      {/* Fog layer */}
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: fog * 0.9,
          background:
            "radial-gradient(ellipse 60% 40% at 50% 45%, rgba(220,220,235,0.10), transparent), radial-gradient(ellipse 90% 55% at 50% 110%, rgba(210,210,230,0.08), transparent)",
          filter: "blur(10px)",
        }}
      />

      <div className="relative px-6 py-8 md:px-8 md:py-10">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={`text-[10px] uppercase tracking-[0.22em] font-medium ${
                variant === "dark" ? "text-white/50" : "text-muted-foreground"
              }`}
            >
              Relationship map
            </p>
            <h2
              className={`mt-3 font-serif text-[22px] md:text-[26px] [font-family:var(--font-serif-display)] tracking-tight ${
                variant === "dark" ? "text-white" : "text-foreground"
              }`}
            >
              SEE → UNDERSTAND → CLICK
            </h2>
          </div>
          <div className={`hidden sm:flex items-center gap-2 text-[11px] ${variant === "dark" ? "text-white/55" : "text-[#6a6560]"}`}>
            <span className={`rounded-full px-3 py-1.5 ${variant === "dark" ? "border border-white/10 bg-white/[0.03]" : "border border-white/10 bg-white/60"}`}>
              Drift {d}%
            </span>
            <span className={`rounded-full px-3 py-1.5 ${variant === "dark" ? "border border-white/10 bg-white/[0.03]" : "border border-white/10 bg-white/60"}`}>
              Tension {f}%
            </span>
          </div>
        </div>

        <div
          className={[
            "mt-7 md:mt-8 relative",
            size === "lg" ? "h-[320px] md:h-[360px]" : "h-[240px] md:h-[280px]",
          ].join(" ")}
        >
          {/* connection overlap glow */}
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              opacity: overlap,
              background:
                "radial-gradient(circle at 50% 50%, rgba(180,255,220,0.14), rgba(140,200,180,0.06), transparent 70%)",
              filter: "blur(2px)",
            }}
          />

          {/* conflict jagged lines */}
          <svg
            aria-hidden
            className="absolute inset-0"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ opacity: 0.25 + crack * 0.55 }}
          >
            <path
              d="M10 52 L18 45 L27 58 L36 42 L44 55 L53 38 L61 62 L70 46 L78 58 L90 48"
              stroke={variant === "dark" ? "rgba(255,120,120,0.55)" : "rgba(180,70,70,0.45)"}
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 60 L20 54 L28 66 L37 50 L46 64 L54 48 L63 72 L72 56 L80 68 L92 58"
              stroke={variant === "dark" ? "rgba(255,170,120,0.25)" : "rgba(190,120,90,0.20)"}
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Orbs */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${leftX}%`, transform: "translate(-50%, -50%)" }}
          >
            <div
              className="relative h-28 w-28 md:h-32 md:w-32 rounded-full animate-[luma-breathe_5s_ease-in-out_infinite]"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), rgba(140,110,220,0.22), rgba(40,30,60,0.35) 62%, rgba(0,0,0,0.0) 78%)",
                boxShadow:
                  "0 0 40px rgba(160,130,255,0.22), 0 0 80px rgba(120,90,200,0.12)",
              }}
            />
            <div className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-white/45">
              Person A
            </div>
          </div>

          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${rightX}%`, transform: "translate(-50%, -50%)" }}
          >
            <div
              className="relative h-28 w-28 md:h-32 md:w-32 rounded-full animate-[luma-breathe_5s_ease-in-out_infinite] [animation-delay:0.6s]"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), rgba(240,190,120,0.18), rgba(50,40,30,0.34) 62%, rgba(0,0,0,0.0) 78%)",
                boxShadow:
                  "0 0 40px rgba(255,210,160,0.16), 0 0 80px rgba(200,140,90,0.10)",
              }}
            />
            <div className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-white/45">
              Person B
            </div>
          </div>

          {/* Particles */}
          <div aria-hidden className="absolute inset-0 opacity-55">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-white/60 blur-[0.5px] animate-[luma-float_7s_ease-in-out_infinite]"
                style={{
                  left: `${(i * 7) % 100}%`,
                  top: `${(i * 11) % 100}%`,
                  animationDelay: `${(i % 7) * 0.55}s`,
                  opacity: 0.15 + ((i % 5) / 10),
                }}
              />
            ))}
          </div>

          {/* Conflict graveyard stones */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-center gap-2">
            {stones.map((i) => (
              <span
                key={i}
                title="Resolved conflict"
                className={`h-2.5 w-2.5 rounded-full ${
                  variant === "dark"
                    ? "border border-white/10 bg-white/[0.06] shadow-[0_0_16px_rgba(180,150,255,0.14)]"
                    : "border border-white/10 bg-white/[0.05] shadow-[0_0_16px_rgba(140,110,220,0.10)]"
                }`}
                style={{ opacity: 0.35 + (i / Math.max(1, stones.length)) * 0.45 }}
              />
            ))}
          </div>
        </div>

        {archetypeLines.length > 0 && (
          <div
            className="mt-5 md:mt-6 space-y-2 px-0.5"
            role="note"
            aria-label="How to read this map"
          >
            {archetypeLines.map((line, i) => (
              <p
                key={i}
                className={`text-center text-[13px] md:text-sm leading-snug text-balance ${readMuted}`}
              >
                {line}
              </p>
            ))}
          </div>
        )}

        <div className={`mt-7 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] ${
          variant === "dark" ? "text-white/45" : "text-[#7a7268]"
        }`}>
          <span className={`rounded-full px-3 py-1.5 ${variant === "dark" ? "border border-white/10 bg-white/[0.03]" : "border border-white/10 bg-white/60"}`}>
            {c >= 60 ? "Aligned" : c >= 35 ? "Unsteady" : "Drifting"}
          </span>
          <span className={`rounded-full px-3 py-1.5 ${variant === "dark" ? "border border-white/10 bg-white/[0.03]" : "border border-white/10 bg-white/60"}`}>
            {f >= 60 ? "Tension rising" : f >= 35 ? "Friction" : "Calm"}
          </span>
          <span className={`rounded-full px-3 py-1.5 ${variant === "dark" ? "border border-white/10 bg-white/[0.03]" : "border border-white/10 bg-white/60"}`}>
            {d >= 60 ? "Fog" : d >= 35 ? "Distance" : "Clear"}
          </span>
        </div>
      </div>

      {/* local keyframes */}
      <style jsx>{`
        @keyframes luma-breathe {
          0% {
            transform: scale(0.98);
            filter: saturate(1.05);
          }
          50% {
            transform: scale(1.03);
            filter: saturate(1.15);
          }
          100% {
            transform: scale(0.98);
            filter: saturate(1.05);
          }
        }
        @keyframes luma-float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </section>
  );
}

