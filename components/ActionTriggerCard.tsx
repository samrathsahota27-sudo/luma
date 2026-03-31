"use client";

export function ActionTriggerCard({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <section
      className={[
        "mx-auto w-full max-w-[420px] rounded-3xl p-5 border border-white/10 bg-white/[0.04] backdrop-blur-xl",
        "shadow-[0_0_40px_rgba(255,255,255,0.03)] transition-all duration-300 hover:border-white/20",
        className,
      ].join(" ")}
    >
      <p className="text-sm text-white/70">What shifts this</p>
      <p className="mt-3 text-sm text-white/80 leading-relaxed line-clamp-2">{text}</p>
    </section>
  );
}

