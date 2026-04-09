"use client";

import { useCallback, useState } from "react";
import { Share2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { publicSiteHost } from "@/lib/site";

function buildTweet(insightSnippet: string) {
  const host = publicSiteHost();
  const raw = insightSnippet.replace(/\s+/g, " ").trim();
  const x =
    raw.length > 0
      ? raw.length > 100
        ? `${raw.slice(0, 97)}…`
        : raw
      : "something surprisingly accurate about my inner patterns";
  return `Just did a reflection on @lumareflect — it revealed ${x}. Try it free: ${host}`;
}

type Props = {
  /** Short line from the result (e.g. pattern name or first insight). */
  insightSnippet?: string | null;
  className?: string;
};

export function ShareLumaFab({ insightSnippet, className }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const tweet = buildTweet(insightSnippet ?? "");

  const copyTweet = useCallback(() => {
    if (!navigator.clipboard?.writeText) return;
    void navigator.clipboard.writeText(tweet).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }, [tweet]);

  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-[140] flex flex-col items-end gap-2 max-w-[calc(100vw-2.5rem)]",
        className
      )}
    >
      {open ? (
        <div className="w-[min(100vw-2rem,18rem)] rounded-2xl border border-white/15 bg-[#0f0e12]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/50">Share Luma</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-white/50 hover:text-white/80 hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-white/45 line-clamp-4">{tweet}</p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={copyTweet}
              className="w-full min-h-[44px] rounded-xl bg-white/[0.1] border border-white/15 px-3 py-2.5 text-sm font-medium text-white hover:bg-white/[0.14]"
            >
              {copied ? "Copied tweet text" : "Copy tweet text"}
            </button>
            <a
              href={twitterHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] inline-flex items-center justify-center rounded-xl bg-white text-[#0b0a0d] px-3 py-2.5 text-sm font-semibold hover:opacity-95"
            >
              Share on X / Twitter
            </a>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-[linear-gradient(145deg,rgba(110,80,180,0.35),rgba(25,22,35,0.95))] text-white shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
        aria-expanded={open}
        aria-label={open ? "Close share menu" : "Share Luma"}
      >
        <Share2 className="h-5 w-5" />
      </button>
    </div>
  );
}
