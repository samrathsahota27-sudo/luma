import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ArrowRight, Brain, Calendar, Link2, MessageSquareText, Sparkles, Users, Wand2 } from "lucide-react";
import { RelationshipMapHero } from "@/components/RelationshipMapHero";

type Step = {
  n: string;
  title: string;
  description: string;
  Icon: any;
};

const INDIVIDUAL_STEPS: Step[] = [
  {
    n: "01",
    title: "Choose a tone",
    description: "Satin or Steel.\nGentle or direct.",
    Icon: Sparkles,
  },
  {
    n: "02",
    title: "Pick images that feel right",
    description: "Fast. Instinct only.\nNo overthinking.",
    Icon: Wand2,
  },
  {
    n: "03",
    title: "Add a short thought (optional)",
    description: "In your own words.\nOne line is enough.",
    Icon: MessageSquareText,
  },
  {
    n: "04",
    title: "Receive your reflection",
    description: "A pattern.\nAn insight. An emotional theme.",
    Icon: Brain,
  },
];

const COUPLES_STEPS: Step[] = [
  {
    n: "01",
    title: "One partner starts",
    description: "They finish first.\nThey get a private invite link.",
    Icon: Link2,
  },
  {
    n: "02",
    title: "The other does theirs",
    description: "On their own device.\nIndependently.",
    Icon: Users,
  },
  {
    n: "03",
    title: "AI reads both sets",
    description: "It finds the pattern\nbetween you.",
    Icon: Wand2,
  },
  {
    n: "04",
    title: "You both receive the map",
    description: "Alignment, drift, tension.\nInsights you can name.",
    Icon: Sparkles,
  },
];

const CYCLE_STEPS = [
  {
    n: "01",
    title: "See it",
    desc: "Your choices reveal your pattern",
    src: "/demo/individual-hero.jpg",
    alt: "Visual reflection image selection",
    clipPath: "polygon(50% 50%, 0% 0%, 100% 0%)",
    labelStyle: { top: "10%", left: "50%", transform: "translateX(-50%)" } as React.CSSProperties,
  },
  {
    n: "02",
    title: "Understand it",
    desc: "We map how you connect",
    src: "/images/ex.png",
    alt: "Insight and pattern card",
    clipPath: "polygon(50% 50%, 100% 0%, 100% 100%)",
    labelStyle: { top: "50%", right: "5%", transform: "translateY(-50%)" } as React.CSSProperties,
  },
  {
    n: "03",
    title: "Work through it with tools",
    desc: "Small shifts over 28 days",
    src: "/demo/space-between.jpg",
    alt: "Ongoing reflection progress",
    clipPath: "polygon(50% 50%, 100% 100%, 0% 100%)",
    labelStyle: { bottom: "10%", left: "50%", transform: "translateX(-50%)" } as React.CSSProperties,
  },
  {
    n: "04",
    title: "See what changed",
    desc: "Watch your dynamic evolve",
    src: "/demo/partner-a.jpg",
    alt: "Before and after comparison",
    clipPath: "polygon(50% 50%, 0% 100%, 0% 0%)",
    labelStyle: { top: "50%", left: "5%", transform: "translateY(-50%)" } as React.CSSProperties,
  },
];

function FlowSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="relative mx-auto mt-10 w-full max-w-[720px]">
      <div
        aria-hidden
        className="pointer-events-none absolute left-6 top-6 hidden h-[calc(100%-3rem)] w-px bg-gradient-to-b from-white/0 via-white/12 to-white/0 sm:block md:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-[32px] hidden h-px bg-gradient-to-r from-white/0 via-white/12 to-white/0 md:block"
      />

      <ol className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-4 md:gap-5">
        {steps.map((s) => {
          const Icon = s.Icon;
          return (
            <li key={s.n} className="animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-7 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_0%,rgba(180,150,255,0.12),transparent),radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(255,210,160,0.06),transparent)] opacity-80"
                />
                <div className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center">
                  <div className="flex items-center gap-3 md:flex-col md:gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_0_32px_rgba(140,110,220,0.12)]">
                      <Icon className="h-5 w-5 text-white/90" strokeWidth={1.5} />
                    </div>
                    <div className="flex items-baseline gap-2 md:flex-col md:gap-1">
                      <span className="tabular-nums text-[11px] font-medium tracking-[0.22em] text-white/45">{s.n}</span>
                      <p className="text-[15px] font-medium text-white md:text-[16px]">{s.title}</p>
                    </div>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-white/55 md:mt-2">{s.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navigation />

      <main className="flex-1 pt-20">
        {/* WHAT YOU'RE WORKING WITH */}
        <section className="border-b border-white/10 px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50 text-center">
              WHAT YOU&apos;RE WORKING WITH
            </p>
            <h2 className="mt-3 font-serif text-[26px] md:text-[30px] text-center text-foreground [font-family:var(--font-serif-display)]">
              SEE → UNDERSTAND → CLICK
            </h2>
            <p className="mt-3 text-sm text-center text-white/55">
              A visual snapshot of alignment, drift, and tension.
            </p>

            <div className="mt-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <RelationshipMapHero
                size="lg"
                className="rounded-[28px] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_26px_120px_rgba(0,0,0,0.65)]"
                connection={58}
                distance={46}
                conflict={52}
                resolvedCount={3}
              />
            </div>

            <p className="mx-auto mt-5 max-w-[620px] text-center text-sm leading-relaxed text-white/60">
              This Relationship Map is functional inside your 28-day cycle, not just visual. Daily tool usage updates
              your live pattern signals (connection, drift, and tension), and each week Luma compiles those shifts into
              a report so you can see what improved, what repeated, and which actions are actually moving your dynamic.
            </p>
          </div>
        </section>

        {/* 1) HERO */}
        <section className="relative overflow-hidden px-4 py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(90,60,120,0.26),transparent),radial-gradient(ellipse_70%_50%_at_100%_85%,rgba(120,70,50,0.14),transparent),radial-gradient(ellipse_50%_40%_at_0%_55%,rgba(60,50,90,0.1),transparent)]"
          />
          <div className="relative max-w-[720px] mx-auto text-center animate-luma-fade-only" style={{ animationDuration: "0.8s" }}>
            <h1 className="font-serif text-[30px] md:text-[42px] leading-tight text-white [font-family:var(--font-serif-display)] tracking-tight">
              Here&apos;s exactly what happens.
            </h1>
            <p className="mt-4 text-base text-white/60 max-w-xl mx-auto">
              No guessing. No vague promises. Just this.
            </p>
          </div>
        </section>

        {/* 2) INDIVIDUAL FLOW */}
        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">Individual</p>
              <h2 className="mt-3 font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
                Start alone. Low friction.
              </h2>
              <p className="mt-3 text-sm text-white/55 max-w-xl mx-auto">
                Pick by instinct. Add words if you want. Then you see what you&apos;ve been doing.
              </p>
            </div>
          </div>
          <FlowSteps steps={INDIVIDUAL_STEPS} />
        </section>

        {/* 3) EXAMPLE INDIVIDUAL RESULT CARD */}
        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">Example</p>
              <h2 className="mt-3 font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
                Example Individual Reflection
              </h2>
            </div>
          </div>

          <div className="max-w-[960px] mx-auto mt-10 px-4">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_26px_120px_rgba(0,0,0,0.7)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(140,110,200,0.18),transparent_70%),radial-gradient(ellipse_55%_45%_at_100%_100%,rgba(90,130,200,0.10),transparent_70%)]"
              />
              <div className="relative p-6 sm:p-8 md:p-10">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/25" aria-hidden />
                      Example Individual Reflection
                    </div>
                    <h3 className="mt-5 font-serif text-[22px] text-white [font-family:var(--font-serif-display)] tracking-tight sm:text-[26px]">
                      Pattern: “Quiet Withdrawal”
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      When things get close, you go numb—then blame yourself for it.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:w-[360px]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Tone</p>
                      <p className="mt-2 text-lg font-semibold text-white">Soft</p>
                      <p className="mt-1 text-xs text-white/45">not dramatic</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Depth</p>
                      <p className="mt-2 text-lg font-semibold text-white">Medium</p>
                      <p className="mt-1 text-xs text-white/45">enough to name it</p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-4 md:mt-8 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Theme</p>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">
                      Safety. Protecting yourself.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">One line that sticks</p>
                    <p className="mt-3 text-sm leading-relaxed text-white/70">
                      You call it “peace” when it&apos;s actually avoidance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4) THE BRIDGE */}
        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <div className="relative overflow-hidden rounded-[40px] border border-white/12 bg-white/[0.02] px-6 py-12 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_140px_rgba(0,0,0,0.78)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(140,110,200,0.20),transparent_70%),radial-gradient(ellipse_60%_45%_at_100%_100%,rgba(120,70,50,0.14),transparent_70%)]"
              />
              <div className="relative">
                <h2 className="font-serif text-[26px] md:text-[30px] leading-tight text-white [font-family:var(--font-serif-display)]">
                  Then comes the real question.
                </h2>
                <p className="mt-5 text-sm md:text-base text-white/60 whitespace-pre-line">
                  Once you see your own pattern — you start wondering about theirs.
                  {"\n"}That&apos;s where Couple Mode begins.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5) COUPLES FLOW */}
        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">Couples</p>
              <h2 className="mt-3 font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
                Separate choices. Shared map.
              </h2>
              <p className="mt-3 text-sm text-white/55 max-w-xl mx-auto">
                You each do your own reflection. Luma shows you what forms between you.
              </p>
            </div>
          </div>
          <FlowSteps steps={COUPLES_STEPS} />
        </section>

        {/* 6) EXAMPLE COUPLES RESULT CARD */}
        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">Example</p>
              <h2 className="mt-3 font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
                Example Couple Reflection
              </h2>
            </div>
          </div>

          <div className="max-w-[960px] mx-auto mt-10 px-4">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_26px_120px_rgba(0,0,0,0.7)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(140,110,200,0.18),transparent_70%),radial-gradient(ellipse_55%_45%_at_100%_100%,rgba(90,130,200,0.10),transparent_70%)]"
              />
              <div className="relative p-6 sm:p-8 md:p-10">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-8">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/25" aria-hidden />
                      Example Couple Reflection
                    </div>
                    {(() => {
                      const innerWorldAImage = "/iwa.jpg"
                      const spaceBetweenImage = "/sbu.jpg"
                      const innerWorldBImage = "/iwb.jpg"

                      return (
                        <div className="flex items-center justify-between gap-3 mt-4 mb-4 overflow-x-auto flex-nowrap px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {[
                            { src: innerWorldAImage, label: "Inner World A", emphasis: "none" as const },
                            { src: spaceBetweenImage, label: "Space Between", emphasis: "primary" as const },
                            { src: innerWorldBImage, label: "Inner World B", emphasis: "none" as const },
                          ].map((item) => (
                            <div key={item.label} className="flex flex-col items-center flex-none">
                              <div
                                className={[
                                  "relative rounded-xl overflow-hidden border shadow-lg",
                                  "w-[90px] h-[90px] md:w-[110px] md:h-[110px]",
                                  item.emphasis === "primary"
                                    ? "scale-105 border-white/20 shadow-xl ring-1 ring-white/10"
                                    : "border-white/10",
                                ].join(" ")}
                              >
                                <img
                                  src={item.src}
                                  alt=""
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                              </div>
                              <p className="text-xs text-white/60 text-center mt-1">{item.label}</p>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                    <h3 className="mt-5 font-serif text-[22px] text-white [font-family:var(--font-serif-display)] tracking-tight sm:text-[26px]">
                      Shared pattern: “Soft Pursuit”
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      One reaches gently. The other goes quiet. Both feel rejected.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:w-[360px]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Drift</p>
                      <p className="mt-2 text-2xl font-semibold text-white tabular-nums">41%</p>
                      <p className="mt-1 text-xs text-white/45">rising slowly</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Tension</p>
                      <p className="mt-2 text-2xl font-semibold text-white tabular-nums">58%</p>
                      <p className="mt-1 text-xs text-white/45">hot/cold</p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">Alignment</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "64%",
                        background: "linear-gradient(90deg, rgba(140,110,200,0.9), rgba(230,230,235,0.8))",
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/55 tabular-nums">64% aligned</p>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">One shared insight</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    When one softens, the other follows—just a beat later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
                How the cycle works
              </h2>
            </div>

            <div className="relative mx-auto mt-10 w-full max-w-[320px] md:max-w-[440px]">
              {/* Slow-spinning decorative outer glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[-3px] rounded-full opacity-50"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0%, rgba(140,110,200,0.25) 25%, transparent 50%, rgba(255,210,160,0.15) 75%, transparent 100%)",
                  animation: "spin 50s linear infinite",
                }}
              />

              {/* Main circle */}
              <div className="relative aspect-square w-full overflow-hidden rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_30px_100px_rgba(0,0,0,0.6)]">
                {CYCLE_STEPS.map((step) => {
                  const boostClarity = step.n === "03" || step.n === "04";
                  return (
                    <div
                      key={step.n}
                      className="group absolute inset-0 cursor-default transition-all duration-500"
                      style={{ clipPath: step.clipPath }}
                    >
                      <Image
                        src={step.src}
                        alt={step.alt}
                        fill
                        sizes="(max-width: 768px) 320px, 440px"
                        className={[
                          "object-cover transition-transform duration-700 group-hover:scale-110",
                          boostClarity ? "filter-none brightness-[1.05] contrast-[1.05] group-hover:brightness-110" : "",
                        ].join(" ")}
                        style={{ imageRendering: "auto" }}
                      />
                      <div
                        className={[
                          "absolute inset-0 transition-colors duration-500",
                          boostClarity ? "bg-black/25 group-hover:bg-black/15" : "bg-black/50 group-hover:bg-black/30",
                        ].join(" ")}
                      />

                      <div
                        className="pointer-events-none absolute flex flex-col items-center gap-0.5 text-center"
                        style={step.labelStyle}
                      >
                        <span className="text-[9px] font-semibold tracking-[0.22em] text-white/45 md:text-[10px]">
                          {step.n}
                        </span>
                        <p className="text-[11px] font-semibold leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] md:text-[14px]">
                          {step.title}
                        </p>
                        <p className="mt-0.5 hidden text-[10px] leading-snug text-white/50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] md:block">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Diagonal separator lines */}
                <svg
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-[5]"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <line x1="50" y1="50" x2="0" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
                  <line x1="50" y1="50" x2="100" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
                  <line x1="50" y1="50" x2="100" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
                  <line x1="50" y1="50" x2="0" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
                </svg>

                {/* Center hub */}
                <div className="absolute left-1/2 top-1/2 z-10 flex h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/15 bg-[#0f0c15] shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] md:h-[96px] md:w-[96px]">
                  <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/50 md:text-[10px]">
                    28 Day
                  </span>
                  <span className="text-[15px] font-semibold text-white [font-family:var(--font-serif-display)] md:text-[18px]">
                    Cycle
                  </span>
                </div>
              </div>

              {/* Clockwise direction hint */}
              <div
                aria-hidden
                className="absolute -right-1 top-1/2 z-20 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0f0c15] md:-right-3 md:h-7 md:w-7"
              >
                <ArrowRight className="h-3 w-3 text-white/40" />
              </div>
            </div>

            {/* Mobile step descriptions */}
            <div className="mx-auto mt-8 grid max-w-[320px] grid-cols-2 gap-4 md:hidden">
              {CYCLE_STEPS.map((step) => (
                <div key={step.n} className="text-center">
                  <span className="text-[9px] font-medium tracking-[0.2em] text-white/35">{step.n}</span>
                  <p className="text-[12px] font-medium text-white/70">{step.title}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-white/40">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-4 max-w-[300px] text-center">
              <p className="text-[14px] leading-relaxed text-white/70 md:text-[16px]">
                A 28-day cycle where your patterns don&apos;t just reveal - they shift through the tools you use.
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/70 md:text-[16px]">
                Each reflection, conversation, and insight shapes how you evolve together.
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-white/60 md:text-[15px]">
                Weekly reports track your movement across connection, drift, and tension.
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/60 md:text-[15px]">
                You&apos;ll see which daily tools are lowering friction, where patterns repeated, and what to do next.
              </p>
            </div>
          </div>
        </section>

        {/* 7) WHAT ELSE IS IN COUPLE HUB */}
        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">Inside the couple hub</p>
              <h2 className="mt-3 font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
                What else is waiting.
              </h2>
            </div>

            <ul className="mt-10 space-y-4">
              {[
                { title: "Emotional Translator", line: "Turn a messy sentence into something safe." , Icon: MessageSquareText},
                { title: "AI Chat", line: "Talk through a moment without spiraling.", Icon: Brain },
                { title: "Date AI", line: "Get a date that fits what you actually need.", Icon: Calendar },
                { title: "Future Paths", line: "See where this goes if nothing changes.", Icon: ArrowRight },
                { title: "Calendar of Us", line: "A quiet record of how you&apos;ve been.", Icon: Sparkles },
              ].map(({ title, line, Icon }) => (
                <li key={title}>
                  <Link
                    href="/couple-hub"
                    className="group relative block overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_0%,rgba(180,150,255,0.10),transparent),radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(255,210,160,0.05),transparent)] opacity-80"
                    />
                    <div className="relative flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                        <Icon className="h-5 w-5 text-white/85" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{title}</p>
                        <p className="mt-1 text-sm text-white/55 leading-relaxed">{line}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 8) SCIENCE CALLOUT */}
        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_26px_120px_rgba(0,0,0,0.7)] backdrop-blur-xl">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(140,110,200,0.18),transparent_70%),radial-gradient(ellipse_55%_45%_at_100%_100%,rgba(90,130,200,0.10),transparent_70%)]"
              />
              <div className="relative">
                <p className="text-sm text-white/60 leading-relaxed">
                  Image selection bypasses rehearsed language. It shows what you reach for before you edit yourself.
                </p>
                <p className="mt-4 text-sm text-white/60 leading-relaxed">
                  When two people choose separately, the overlap and mismatch becomes obvious.
                </p>
                <div className="mt-8">
                  <Link
                    href="/science"
                    className="inline-flex items-center gap-2 text-sm font-medium text-white/85 underline underline-offset-4 decoration-white/25 hover:decoration-white/50 hover:text-white transition"
                  >
                    Read our approach →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9) FINAL CTA */}
        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-[720px] mx-auto">
            <div className="text-center">
              <h2 className="font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
                Ready when you are.
              </h2>
              <p className="mt-3 text-sm text-white/55">
                Start alone first. Bring them in after.
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center gap-5">
              <Link
                href="/test"
                className="w-full max-w-[420px] inline-flex items-center justify-center gap-2 rounded-[12px] bg-white text-[#0b0a0d] px-7 py-4 text-base font-medium shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_18px_70px_rgba(140,110,200,0.15)] hover:opacity-95 transition"
              >
                Start your reflection
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/couple-hub"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white/90 transition underline underline-offset-4 decoration-white/20 hover:decoration-white/40"
              >
                Start together
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
