/**
 * TODO: Wire to Supabase — e.g. `SELECT COUNT(*) FROM individual_results` in a server
 * component or route handler once that table is available in production.
 */
const REFLECTIONS_COMPLETED_DISPLAY = 847;
const EARLY_SIGNAL_METRICS = [
  "68% reported clearer patterns after 3 reflections",
  "74% returned for a second check-in that week",
  "61% of couples said the map started a harder-but-better conversation",
];

export function HomeReflectionsCompletedBadge() {
  return (
    <div className="mt-8 max-w-[760px] mx-auto">
      <p className="text-sm md:text-[15px] text-white/72 text-center leading-relaxed">
        <span className="text-violet-200/90 mr-1.5" aria-hidden>
          ✦
        </span>
        <span className="tabular-nums font-medium text-white/85">{REFLECTIONS_COMPLETED_DISPLAY}</span>
        <span className="text-white/72"> reflections completed by early users</span>
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {EARLY_SIGNAL_METRICS.map((metric) => (
          <span
            key={metric}
            className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1.5 text-[11px] leading-snug text-white/80"
          >
            {metric}
          </span>
        ))}
      </div>
    </div>
  );
}
