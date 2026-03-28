"use client";

import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import { generateVsCardBlob, getVsCardContent, type VsCardSource } from "@/lib/vsCard";
import { downloadStoryCard, shareOrDownloadStoryCard } from "@/lib/storyCard";

export function VsCardShare({
  source,
  className = "",
}: {
  source: VsCardSource;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const content = getVsCardContent(source);

  const runExport = async (mode: "share" | "download") => {
    setLoading(true);
    try {
      const blob = await generateVsCardBlob(source);
      if (mode === "share") {
        await shareOrDownloadStoryCard(blob, "luma-vs-card.png");
      } else {
        downloadStoryCard(blob, "luma-vs-card.png");
      }
    } catch (e) {
      console.warn("VS card export failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={className} aria-label="VS comparison card">
      <div className="rounded-2xl border border-white/12 bg-gradient-to-b from-[#0c0b0e] to-[#050506] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] md:p-6">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">Share</p>
          <h3 className="mt-2 font-serif text-lg text-white [font-family:var(--font-serif-display)] md:text-xl">
            VS card
          </h3>
          <p className="mt-1.5 text-xs text-white/45 max-w-sm mx-auto leading-relaxed">
            Story-sized image for Instagram or WhatsApp — minimal, high contrast.
          </p>
        </div>

        <div className="mx-auto mt-5 w-full max-w-[280px] overflow-hidden rounded-xl border border-white/12 bg-[#050506] shadow-inner">
          <div className="flex items-center justify-center py-2 border-b border-white/[0.07]">
            <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/35">Luma</span>
            <span className="mx-3 text-lg font-light text-white/50">VS</span>
          </div>
          <div className="flex min-h-[180px]">
            <div className="flex w-1/2 flex-col border-r border-white/10 bg-violet-950/20 px-2.5 py-3">
              <p className="text-center text-[9px] font-semibold uppercase tracking-wider text-white/40 truncate">
                {content.labelA}
              </p>
              <div className="mt-2 flex flex-1 flex-col gap-1.5">
                {content.traitsA.map((t, i) => (
                  <p key={`a-${i}`} className="text-[10px] leading-snug text-white/[0.88]">
                    · {t}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex w-1/2 flex-col bg-sky-950/10 px-2.5 py-3">
              <p className="text-center text-[9px] font-semibold uppercase tracking-wider text-white/40 truncate">
                {content.labelB}
              </p>
              <div className="mt-2 flex flex-1 flex-col gap-1.5">
                {content.traitsB.map((t, i) => (
                  <p key={`b-${i}`} className="text-[10px] leading-snug text-white/[0.88]">
                    · {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-amber-400/20 bg-black/55 px-3 py-3">
            <p className="text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-amber-200/75">
              Brutal truth
            </p>
            <p className="mt-1.5 text-center text-[10px] leading-snug text-white/[0.9] line-clamp-6 text-pretty">
              {content.brutalLine}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => void runExport("share")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.1] disabled:opacity-50"
          >
            <Share2 className="h-4 w-4 opacity-80" aria-hidden />
            {loading ? "Preparing…" : "Share"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void runExport("download")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.22)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Download className="h-4 w-4 opacity-90" aria-hidden />
            {loading ? "Preparing…" : "Save image"}
          </button>
        </div>
      </div>
    </section>
  );
}
