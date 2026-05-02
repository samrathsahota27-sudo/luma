import Link from "next/link";
import { CalendarCheck2, ChartLine, Compass, Flag, MoonStar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const JOURNEY_STEPS = [
  {
    label: "Week 1",
    title: "Discover your core patterns",
    body: "You start seeing repeat emotional signatures like Quiet Withdrawal or Soft Pursuit.",
    Icon: Compass,
  },
  {
    label: "Week 2",
    title: "See how they show up daily",
    body: "Your daily entries reveal timing: where drift rises, where tension spikes, and what steadies you.",
    Icon: CalendarCheck2,
  },
  {
    label: "Week 3",
    title: "Start guided actions",
    body: "Tonight's Question introduces small pattern-specific actions you can actually do the same day.",
    Icon: MoonStar,
  },
  {
    label: "Day 28",
    title: "Transformation view",
    body: "You get an Emotional Shift summary with trend lines across alignment, drift, and tension.",
    Icon: Flag,
  },
];

export function Home28DayJourney() {
  return (
    <section className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(62,47,96,0.14),rgba(8,7,12,0.98))] px-4 py-14 md:py-20">
      <div className="max-w-[960px] mx-auto">
        <div className="text-center max-w-[700px] mx-auto">
          <h2 className="font-serif text-[26px] md:text-[32px] text-white [font-family:var(--font-serif-display)]">
            Your 28-Day Mirror Journey
          </h2>
          <p className="mt-3 text-sm md:text-[15px] text-white/65 leading-relaxed">
            A clear emotional progression from first pattern awareness to a measurable shift by Day 28.
          </p>
        </div>

        <div className="mt-10 relative">
          <div
            aria-hidden
            className="absolute left-6 right-6 top-7 hidden h-px bg-gradient-to-r from-white/20 via-violet-300/35 to-white/20 md:block"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {JOURNEY_STEPS.map((step) => (
              <Card key={step.label} className="border-white/10 bg-white/[0.04] text-white shadow-[0_12px_36px_rgba(0,0,0,0.25)]">
                <CardHeader className="pb-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.16em] text-violet-200/80">{step.label}</span>
                    <span className="rounded-full border border-white/15 bg-white/[0.05] p-2 text-white/75">
                      <step.Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-snug">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-white/70">{step.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-full border border-white/15 bg-white/[0.05] p-2 text-violet-200/85">
              <ChartLine className="h-4 w-4" />
            </span>
            <p className="text-sm leading-relaxed text-white/75">
              Your Inner Journey calendar tracks these changes visually, including drift and tension trend shifts over time.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/choose-mode"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0f0d14] transition hover:opacity-95"
          >
            Start your journey free
          </Link>
        </div>
      </div>
    </section>
  );
}
