import { toPng } from "html-to-image";

const CAPTURE_OPTIONS = {
  cacheBust: true,
  pixelRatio: 2,
  backgroundColor: "#050508",
} as const;

export async function captureElementToPngDataUrl(el: HTMLElement): Promise<string> {
  return toPng(el, CAPTURE_OPTIONS);
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function triggerDownloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadStoryFromElement(
  el: HTMLElement,
  filename = "luma-story.png"
): Promise<void> {
  const dataUrl = await captureElementToPngDataUrl(el);
  triggerDownloadDataUrl(dataUrl, filename);
}

export type ShareStoryOptions = {
  filename?: string;
  title?: string;
  text?: string;
};

/**
 * Mobile-first: share PNG via Web Share API when file sharing is supported; otherwise text+URL share or download.
 */
export async function shareStoryFromElement(
  el: HTMLElement,
  options?: ShareStoryOptions
): Promise<void> {
  const filename = options?.filename ?? "luma-story.png";
  const title = options?.title ?? "My Luma result";
  const text = options?.text ?? "See what Luma revealed.";
  const dataUrl = await captureElementToPngDataUrl(el);
  const blob = await dataUrlToBlob(dataUrl);
  const file = new File([blob], filename, { type: "image/png" });

  const nav = typeof navigator !== "undefined" ? navigator : undefined;

  if (nav?.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title, text });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      console.warn("Share with files failed", e);
    }
  }

  if (nav?.share && typeof window !== "undefined") {
    try {
      await nav.share({
        title,
        text,
        url: window.location.href,
      });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
  }

  triggerDownloadDataUrl(dataUrl, filename);
}
