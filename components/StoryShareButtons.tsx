"use client";

import type { RefObject } from "react";
import {
  downloadStoryFromElement,
  shareStoryFromElement,
} from "@/lib/storyCardCapture";
import {
  downloadStoryCard,
  generateStoryCardBlob,
  shareOrDownloadStoryCard,
  type StoryCardOptions,
} from "@/lib/storyCard";

type Props = {
  targetRef: RefObject<HTMLElement | null>;
  loading: boolean;
  setLoading: (v: boolean) => void;
  filename?: string;
  /** Used if the DOM node is missing or capture throws. */
  canvasFallback: StoryCardOptions;
  className?: string;
  showShare?: boolean;
  /** Label for the download button (share label stays "Share Story"). */
  downloadLabel?: string;
};

export function StoryShareButtons({
  targetRef,
  loading,
  setLoading,
  filename = "luma-story.png",
  canvasFallback,
  className = "",
  showShare = true,
  downloadLabel = "Download Story",
}: Props) {
  const run = async (mode: "share" | "download") => {
    setLoading(true);
    try {
      const el = targetRef.current;
      if (el) {
        try {
          if (mode === "share") {
            await shareStoryFromElement(el, {
              filename,
              title: "My Luma result",
              text: "See what Luma revealed.",
            });
          } else {
            await downloadStoryFromElement(el, filename);
          }
          return;
        } catch (e) {
          console.warn("Story DOM export failed, using canvas fallback", e);
        }
      }

      const blob = await generateStoryCardBlob(canvasFallback);
      if (mode === "share") {
        await shareOrDownloadStoryCard(blob, filename);
      } else {
        downloadStoryCard(blob, filename);
      }
    } catch (e) {
      console.warn("Story canvas fallback failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      {showShare ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void run("share")}
          className="min-h-[44px] rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.08] disabled:opacity-60"
        >
          {loading ? "Preparing…" : "Share Story"}
        </button>
      ) : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => void run("download")}
        className="min-h-[44px] rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(120,90,180,0.2)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Preparing…" : downloadLabel}
      </button>
    </div>
  );
}
