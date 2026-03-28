"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { TimelineBar, COUPLE_MAIN_PADDING_TOP } from "@/components/TimelineBar";
import { ArrowLeft, CalendarHeart, ChevronRight, Languages, MessagesSquare } from "lucide-react";
import {
  readRewritePathHintFromBrowser,
  REWRITE_PATH_HINT_FALLBACK,
} from "@/lib/narrative/rewritePathHint";

const ACTIONS = [
  {
    href: "/translator",
    title: "Decode a message",
    sub: "Turn confusion into clarity",
    Icon: Languages,
  },
  {
    href: "/chat",
    title: "Fix a conversation",
    sub: "Get help navigating tension",
    Icon: MessagesSquare,
  },
  {
    href: "/date",
    title: "Do something together",
    sub: "Rebuild connection in real life",
    Icon: CalendarHeart,
  },
] as const;

export default function RewriteThisPathPage() {
  const [hint, setHint] = useState<string>(REWRITE_PATH_HINT_FALLBACK);

  useEffect(() => {
    const personalized = readRewritePathHintFromBrowser();
    if (personalized) setHint(personalized);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[#e8e4df]">
      <Navigation />
      <TimelineBar />

      <main className={`flex-1 ${COUPLE_MAIN_PADDING_TOP} pb-24 px-5 md:px-6 relative overflow-hidden`}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(120,95,180,0.16),transparent)]"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-lg">
          <Link
            href="/couple-hub"
            className="mb-10 inline-flex items-center gap-2 text-sm text-[#8a8278] transition-colors hover:text-[#c9c0b4]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Back
          </Link>

          <header className="mb-10 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#6d6578]">Rewrite this path</p>
            <p
              className="mx-auto mt-5 max-w-md rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-3.5 text-[15px] leading-snug text-[#d4cdc3] shadow-[0_0_40px_rgba(120,95,180,0.08)]"
              role="note"
            >
              {hint}
            </p>
            <h1 className="mt-6 font-serif text-[1.65rem] leading-tight text-[#f5f1ec] [font-family:var(--font-serif-display)] tracking-tight md:text-[1.85rem]">
              Start shifting this pattern
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm font-light leading-relaxed text-[#9a9288]">
              Pick one step. Small moves count.
            </p>
          </header>

          <ul className="flex flex-col gap-4">
            {ACTIONS.map(({ href, title, sub, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="rewrite-action-card group flex w-full min-h-[5.25rem] items-center gap-4 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-5 py-5 text-left shadow-[0_8px_40px_rgba(0,0,0,0.35)] transition-colors hover:border-white/[0.14] hover:bg-white/[0.06] motion-safe:active:scale-[0.99]"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-[#c4b8e8]"
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-[#f0ebe4]">{title}</span>
                    <span className="mt-1 block text-sm font-light leading-snug text-[#8f877c]">{sub}</span>
                  </span>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-[#6d6578] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#a89cc4]"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes rewriteActionGlow {
          0%,
          100% {
            box-shadow:
              0 8px 40px rgba(0, 0, 0, 0.35),
              0 0 0 1px rgba(255, 255, 255, 0.06),
              0 0 28px rgba(120, 95, 180, 0.08);
          }
          50% {
            box-shadow:
              0 10px 44px rgba(0, 0, 0, 0.42),
              0 0 0 1px rgba(255, 255, 255, 0.09),
              0 0 36px rgba(150, 130, 210, 0.14);
          }
        }
        .rewrite-action-card {
          animation: rewriteActionGlow 4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .rewrite-action-card {
            animation: none;
            box-shadow:
              0 8px 40px rgba(0, 0, 0, 0.35),
              0 0 0 1px rgba(255, 255, 255, 0.08),
              0 0 24px rgba(120, 95, 180, 0.1);
          }
        }
      `}</style>
    </div>
  );
}
