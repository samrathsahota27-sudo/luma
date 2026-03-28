/**
 * Generates a 1080×1920 Instagram Story card from existing result content.
 * Individual: pastel background + text. Couple: existing Space Between image + text.
 */

const W = 1080;
const H = 1920;

export type StoryMode = "individual" | "couple";

/** For couple mode: which card to generate (relationship uses Space Between image). */
export type CoupleCardVariant = "relationship" | "partnerA" | "partnerB";

export type StoryCardOptions = {
  mode: StoryMode;
  imageUrl?: string | null;
  /** Individual: top title becomes "{userName}'s Inner World" (fallback: "Your Inner World") */
  userName?: string | null;
  /** Couple: Partner A name for titles (fallback: "Inner World of Partner") */
  nameA?: string | null;
  /** Couple: Partner B name for titles (fallback: "Inner World of Partner") */
  nameB?: string | null;
  /** Couple: which card to generate; default "relationship" */
  cardVariant?: CoupleCardVariant;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

function drawPastelBackground(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "#E6E8F0");
  gradient.addColorStop(0.5, "#E8E3D9");
  gradient.addColorStop(1, "#D8E3DC");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(W / iw, H / ih);
  const sw = iw * scale;
  const sh = ih * scale;
  const sx = (iw - W / scale) / 2;
  const sy = (ih - H / scale) / 2;
  ctx.drawImage(img, sx, sy, W / scale, H / scale, 0, 0, W, H);
}

function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  title: string,
  bottomLine: string,
  subtitle: string
) {
  const shadow = "0 2px 12px rgba(0,0,0,0.35)";
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Title — serif, large
  ctx.font = "600 72px 'Playfair Display', Georgia, serif";
  ctx.fillText(title, W / 2, 320);

  // Bottom: "Luma"
  ctx.font = "500 42px 'Inter', system-ui, sans-serif";
  ctx.fillText(bottomLine, W / 2, H - 220);

  // Subtitle
  ctx.font = "400 28px 'Inter', system-ui, sans-serif";
  ctx.fillText(subtitle, W / 2, H - 160);

  ctx.shadowBlur = 0;
}

function getIndividualTitle(userName: string | null | undefined): string {
  return userName && userName.trim() ? `${userName.trim()}'s Inner World` : "Your Inner World";
}

/** Display title for DOM story card (same copy as canvas export). */
export function getStoryCardTitle(
  options: Pick<StoryCardOptions, "mode" | "userName" | "nameA" | "nameB" | "cardVariant">
): string {
  if (options.mode === "individual") {
    return getIndividualTitle(options.userName);
  }
  return getCoupleTitle(options.cardVariant, options.nameA, options.nameB);
}

function getCoupleTitle(
  variant: CoupleCardVariant | undefined,
  nameA: string | null | undefined,
  nameB: string | null | undefined
): string {
  const a = nameA?.trim();
  const b = nameB?.trim();
  switch (variant) {
    case "partnerA":
      return a ? `${a}'s Inner World` : "Inner World of Partner";
    case "partnerB":
      return b ? `${b}'s Inner World` : "Inner World of Partner";
    default:
      return a && b ? `The Space Between ${a} & ${b}` : "The Space Between Us";
  }
}

/**
 * Returns a PNG blob (1080×1920) for the story card.
 * Bottom branding is always: "Luma" and "What does your inner world look like?"
 */
export function generateStoryCardBlob(options: StoryCardOptions): Promise<Blob> {
  const { mode, imageUrl, userName, nameA, nameB, cardVariant = "relationship" } = options;
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!canvas) return Promise.reject(new Error("Canvas not available"));

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("2d context not available"));

  const title =
    mode === "individual"
      ? getIndividualTitle(userName)
      : getCoupleTitle(cardVariant, nameA, nameB);
  const bottomLine = "Luma";
  const subtitle = "What does your inner world look like?";

  async function draw() {
    if (imageUrl && mode === "couple") {
      try {
        const img = await loadImage(imageUrl);
        drawImageCover(ctx, img);
      } catch {
        drawPastelBackground(ctx);
      }
    } else {
      drawPastelBackground(ctx);
    }
    drawTextOverlay(ctx, title, bottomLine, subtitle);
  }

  return draw().then(() => {
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
        "image/png",
        0.92
      );
    });
  });
}

/**
 * Trigger download of the story card.
 */
export function downloadStoryCard(blob: Blob, filename = "luma-story.png") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

/**
 * Share via Web Share API if available (e.g. mobile), else download.
 */
export async function shareOrDownloadStoryCard(blob: Blob, filename = "luma-story.png") {
  const file = new File([blob], filename, { type: "image/png" });
  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "Luma Reflection",
        text: "My reflection from Luma",
      });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
  }
  downloadStoryCard(blob, filename);
}

// --- Letter From Your Inner World story card (1080×1920) ---

const LETTER_STORY_W = 1080;
const LETTER_STORY_H = 1920;

function drawLetterPastelBackground(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, LETTER_STORY_W, LETTER_STORY_H);
  g.addColorStop(0, "#E6E8F0");
  g.addColorStop(0.5, "#E8E3D9");
  g.addColorStop(1, "#D8E3DC");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LETTER_STORY_W, LETTER_STORY_H);
}

/**
 * Wrap text to fit width (approx). Returns lines.
 */
function wrapLetterText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.replace(/\n/g, " \n ").split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if (w === "\n") {
      if (current) lines.push(current.trim());
      current = "";
      continue;
    }
    const next = current ? `${current} ${w}` : w;
    const m = ctx.measureText(next);
    if (m.width <= maxWidth) current = next;
    else {
      if (current) lines.push(current.trim());
      current = w;
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

/**
 * Generates a 1080×1920 story card for "A Letter From My Inner World".
 * Title at top, letter excerpt in center, "What does your inner world look like?" and "Luma" at bottom.
 */
export function generateLetterStoryBlob(letterText: string): Promise<Blob> {
  const canvas =
    typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!canvas) return Promise.reject(new Error("Canvas not available"));

  canvas.width = LETTER_STORY_W;
  canvas.height = LETTER_STORY_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("2d context not available"));

  drawLetterPastelBackground(ctx);

  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = "#2a2a2a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Top title
  ctx.font = "600 48px 'Playfair Display', Georgia, serif";
  ctx.fillText("A Letter From My Inner World", LETTER_STORY_W / 2, 280);

  // Center: excerpt (first ~300 chars or 4–5 lines)
  const excerpt = letterText.replace(/\n/g, " ").slice(0, 320).trim();
  ctx.font = "400 32px 'Playfair Display', Georgia, serif";
  ctx.fillStyle = "#3d3d3d";
  const maxLineWidth = LETTER_STORY_W - 120;
  const lines = wrapLetterText(ctx, excerpt, maxLineWidth);
  const lineHeight = 44;
  const startY = LETTER_STORY_H / 2 - (lines.length * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, LETTER_STORY_W / 2, startY + i * lineHeight);
  });

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#2a2a2a";

  // Bottom
  ctx.font = "400 28px 'Inter', system-ui, sans-serif";
  ctx.fillText("What does your inner world look like?", LETTER_STORY_W / 2, LETTER_STORY_H - 200);
  ctx.font = "500 38px 'Inter', system-ui, sans-serif";
  ctx.fillText("Luma", LETTER_STORY_W / 2, LETTER_STORY_H - 140);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      "image/png",
      0.92
    );
  });
}
