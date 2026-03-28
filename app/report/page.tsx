"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { ArrowLeft, Headphones, Loader2, RefreshCw } from "lucide-react";
import { DepthModeSelector } from "@/components/DepthModeSelector";
import { useDepthMode } from "@/hooks/useDepthMode";
import { buildRelationshipContext, recordFeatureUse } from "@/lib/relationshipContext";
import { reportSubtitle } from "@/lib/depthUiMicrocopy";

export type WeatherTheme = "storm" | "fog" | "clear" | "heat" | "calm";

type WeatherReport = {
  label: string;
  weather: string;
  cause: string;
  shift: string;
  next: string;
  theme: WeatherTheme;
};

/** Simulated weekly inputs until tools persist usage server-side */
const MOCK_WEEKLY_INPUT = {
  chats:
    "Several late-night exchanges where one partner went quiet after the other raised plans for the weekend. One message read as short; the other read it as dismissal.",
  translatorUsage:
    "Two decoding sessions on messages about 'fine' and 'whatever' — both carried more irritation than the literal words suggested.",
  mood: "Tired but trying; more guarded than last week; small moments of warmth after arguments.",
} as const;

const INITIAL_PAUSE_MS = 480;
const STAGGER_MS = 180;

const THEME_BACKDROPS: Record<
  WeatherTheme,
  { a: string; b: string; headlineGlow: string; headlineClass: string }
> = {
  storm: {
    a: "rgba(55,45,95,0.35)",
    b: "rgba(30,40,90,0.2)",
    headlineGlow: "0 0 80px rgba(120,140,220,0.25), 0 0 40px rgba(80,60,140,0.2)",
    headlineClass: "text-[#e2e4ff]",
  },
  fog: {
    a: "rgba(95,95,110,0.22)",
    b: "rgba(70,72,82,0.18)",
    headlineGlow: "0 0 60px rgba(200,200,215,0.12)",
    headlineClass: "text-[#d8d6e0]",
  },
  clear: {
    a: "rgba(180,150,95,0.18)",
    b: "rgba(120,140,160,0.12)",
    headlineGlow: "0 0 70px rgba(255,220,160,0.18)",
    headlineClass: "text-[#f5ecd8]",
  },
  heat: {
    a: "rgba(150,70,45,0.22)",
    b: "rgba(120,50,40,0.15)",
    headlineGlow: "0 0 70px rgba(255,120,80,0.2)",
    headlineClass: "text-[#ffd8c8]",
  },
  calm: {
    a: "rgba(70,110,100,0.2)",
    b: "rgba(50,70,85,0.14)",
    headlineGlow: "0 0 55px rgba(140,190,180,0.15)",
    headlineClass: "text-[#d8ebe4]",
  },
};

function normalizeTheme(t: string): WeatherTheme {
  const x = t?.toLowerCase?.() ?? "";
  if (x === "storm" || x === "fog" || x === "clear" || x === "heat" || x === "calm") return x;
  return "calm";
}

export default function WeeklyReportPage() {
  const { depthMode, setDepthMode } = useDepthMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WeatherReport | null>(null);
  const [audioHint, setAudioHint] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAudioHint(false);

    try {
      recordFeatureUse("report");
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...MOCK_WEEKLY_INPUT,
          depthMode,
          context: buildRelationshipContext("report"),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError("Couldn't load your report. Try again.");
        return;
      }

      if (
        data &&
        typeof data.label === "string" &&
        typeof data.weather === "string" &&
        typeof data.cause === "string" &&
        typeof data.shift === "string" &&
        typeof data.next === "string"
      ) {
        await new Promise((r) => setTimeout(r, INITIAL_PAUSE_MS));
        setResult({
          label: data.label,
          weather: data.weather,
          cause: data.cause,
          shift: data.shift,
          next: data.next,
          theme: normalizeTheme(typeof data.theme === "string" ? data.theme : ""),
        });
      } else {
        setError("Couldn't load your report. Try again.");
      }
    } catch {
      setError("Couldn't load your report. Try again.");
    } finally {
      setLoading(false);
    }
  }, [depthMode]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const themeStyle = useMemo(() => {
    const t = result?.theme ?? "calm";
    return THEME_BACKDROPS[t] ?? THEME_BACKDROPS.calm;
  }, [result?.theme]);

  const sections: {
    id: string;
    title: string;
    body: string;
    accent?: boolean;
  }[] =
    result === null
      ? []
      : [
          { id: "weather", title: "This Week’s Weather", body: result.weather },
          { id: "cause", title: "What’s Causing It", body: result.cause },
          { id: "shift", title: "What’s Shifting", body: result.shift },
          { id: "next", title: "What To Do Next", body: result.next, accent: true },
        ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a090c] text-[#e8e4df] transition-[background] duration-700">
      <Navigation />
      <TimelineBar />

      <main className={`flex-1 ${COUPLE_MAIN_PADDING_TOP} pb-24 px-6 relative overflow-hidden`}>
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse 85% 50% at 50% -20%, ${themeStyle.a}, transparent), radial-gradient(ellipse 55% 42% at 100% 95%, ${themeStyle.b}, transparent)`,
          }}
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[640px]">
          <Link
            href="/couple-hub"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[#8a8278] transition-colors hover:text-[#c9c0b4]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to hub
          </Link>

          <header className="mb-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#6d6578] font-medium">
              Relationship weather
            </p>
            <h1 className="mt-4 font-serif text-[1.55rem] md:text-[1.85rem] text-[#f5f1ec] [font-family:var(--font-serif-display)] tracking-tight leading-tight">
              Your Weekly Reflection
            </h1>
            <p className="mt-2 text-[#9a9288] text-base font-light leading-relaxed">
              {reportSubtitle(depthMode)}
            </p>
          </header>

          {result && (
            <div className="mb-10 text-center animate-in fade-in zoom-in-95 duration-700 [animation-fill-mode:both]">
              <p
                className={`font-serif text-2xl md:text-[2.35rem] leading-snug tracking-tight [font-family:var(--font-serif-display)] motion-safe:animate-pulse motion-safe:[animation-duration:4s] ${themeStyle.headlineClass}`}
                style={{ textShadow: themeStyle.headlineGlow }}
              >
                {result.label}
              </p>
            </div>
          )}

          <div className="mb-8 flex flex-col items-center gap-3">
            <DepthModeSelector
              value={depthMode}
              onChange={setDepthMode}
              disabled={loading}
              className="w-full max-w-[280px] items-center"
            />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fetchReport()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3d3848] bg-[#1c191f] px-6 py-3 text-sm font-medium text-[#ece8e2] shadow-[0_0_28px_-6px_rgba(100,85,130,0.2)] transition-all duration-300 hover:border-[#524a60] hover:bg-[#25222c] hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-45"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reading the forecast…
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 opacity-80" />
                    Refresh forecast
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setAudioHint(true)}
                disabled={!result || loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3a4550]/90 bg-[#151822]/90 px-5 py-3 text-sm font-medium text-[#c9c4bc] transition-all duration-300 hover:border-[#4a5568] hover:bg-[#1a2030] disabled:pointer-events-none disabled:opacity-35"
              >
                <Headphones className="h-4 w-4 opacity-85" />
                Listen to this week
              </button>
            </div>
            {audioHint && (
              <p className="text-center text-xs text-[#7a7288] font-light">
                Audio for your forecast is coming soon.
              </p>
            )}
            {error && (
              <p className="text-center text-sm text-[#c49a8c]" role="alert">
                {error}
              </p>
            )}
          </div>

          {loading && !result && (
            <div className="flex justify-center py-16">
              <div className="flex flex-col items-center gap-4 text-[#6d6578]">
                <Loader2 className="h-8 w-8 animate-spin opacity-60" />
                <p className="text-sm font-light">Pulling in the emotional front…</p>
              </div>
            </div>
          )}

          {sections.length > 0 && (
            <div className="space-y-5">
              {sections.map((s, i) => (
                <section
                  key={s.id}
                  className={[
                    "rounded-2xl border p-6 md:p-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-fill-mode:both]",
                    s.accent
                      ? "border-[#5c4a40]/55 bg-gradient-to-br from-[#1a1512]/95 via-[#14101a]/92 to-[#110e14]/95 shadow-[0_20px_56px_rgba(0,0,0,0.48),0_0_40px_-12px_rgba(160,110,80,0.12)]"
                      : "border-[#2e2a35]/90 bg-[#131118]/82 shadow-[0_16px_48px_rgba(0,0,0,0.42)]",
                  ].join(" ")}
                  style={{ animationDelay: `${i * STAGGER_MS}ms` }}
                >
                  <h2
                    className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                      s.accent ? "text-[#c9a87c]" : "text-[#7a7288]"
                    }`}
                  >
                    {s.title}
                  </h2>
                  <p className="mt-4 text-[15px] md:text-[16px] leading-relaxed text-[#c9c0b4] font-light">
                    {s.body}
                  </p>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
