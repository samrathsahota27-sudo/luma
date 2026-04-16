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

        <section className="border-t border-white/10 px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
              <h2 className="font-serif text-[26px] md:text-[30px] text-foreground [font-family:var(--font-serif-display)]">
                How the cycle works
              </h2>
            </div>

            <div className="relative mt-8 md:mt-10">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 hidden h-px w-[92%] -translate-x-1/2 bg-gradient-to-r from-white/0 via-white/18 to-white/0 md:block"
              />

              <div className="relative grid grid-cols-1 gap-6 md:grid-cols-4">
                {[
                  {
                    n: "01",
                    title: "See it",
                    text: "Choose what feels like you",
                    src: "/demo/individual-hero.jpg",
                    alt: "Visual reflection image selection",
                  },
                  {
                    n: "02",
                    title: "Understand it",
                    text: "We map your emotional patterns",
                    src: "/images/ex.png",
                    alt: "Insight and pattern card preview",
                  },
                  {
                    n: "03",
                    title: "Work through it",
                    text: "Small shifts over 28 days",
                    src: "/demo/space-between.jpg",
                    alt: "Ongoing reflection progress visual",
                  },
                  {
                    n: "04",
                    title: "See what changed",
                    text: "Watch your dynamic evolve",
                    src: "/demo/partner-a.jpg",
                    secondarySrc: "/demo/partner-b.jpg",
                    alt: "Before and after dynamic comparison",
                  },
                ].map((step, idx, arr) => (
                  <div key={step.n} className="relative">
                    <article className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 shadow-sm backdrop-blur-xl">
                      {step.secondarySrc ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                            <Image
                              src={step.src}
                              alt={`${step.alt} before`}
                              fill
                              sizes="(max-width: 768px) 48vw, 130px"
                              className="object-cover"
                            />
                          </div>
                          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                            <Image
                              src={step.secondarySrc}
                              alt={`${step.alt} after`}
                              fill
                              sizes="(max-width: 768px) 48vw, 130px"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                          <Image
                            src={step.src}
                            alt={step.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, 280px"
                            className="object-cover"
                          />
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                          />
                        </div>
                      )}
                      <div className="mt-4 flex items-start gap-3">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-white/15 bg-white/[0.06] px-1 text-[10px] font-medium tracking-[0.14em] text-white/70">
                          {step.n}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-serif text-[18px] leading-tight text-white [font-family:var(--font-serif-display)]">
                            {step.title}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-white/65">{step.text}</p>
                        </div>
                      </div>
                    </article>

                    {idx < arr.length - 1 ? (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-4 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0f0c15] text-white/55 md:bottom-auto md:left-auto md:right-[-16px] md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:-translate-x-0"
                      >
                        <ArrowRight className="h-3.5 w-3.5 rotate-90 md:rotate-0" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-center text-sm md:text-base text-white/75">
              ↺ continues
            </p>
          </div>
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
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">One shared insight</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    When one softens, the other follows—just a beat later.
                  </p>
                </div>
              </div>
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
                <li
                  key={title}
                  className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
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
