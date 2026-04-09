/**
 * Shareable 9:16 "VS" comparison card (Person A vs Person B).
 * Dark, high-contrast, story-export via canvas.
 */

export type ConflictRow = { personA?: string; personB?: string; mismatch?: string };

export type VsCardSource = {
  nameA?: string | null;
  nameB?: string | null;
  brutalTruth?: string | null;
  conflictFrictionPoints?: ConflictRow[] | null;
  mapReadInnerA?: string | null;
  mapReadInnerB?: string | null;
  emotionalTag?: string | null;
  /** Connect flow: short excerpts if no friction rows */
  reflectionExcerptA?: string | null;
  reflectionExcerptB?: string | null;
};

const W = 1080;
const H = 1920;

function clip(s: string, max = 58): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length <= max ? t : `${t.slice(0, max - 1).trim()}…`;
}

function normalizeLine(raw: string, max = 58): string {
  const cleaned = String(raw ?? "")
    .replace(/^[•·\-\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";
  return clip(cleaned, max);
}

function sentencesFromMap(text: string | null | undefined, maxLines: number): string[] {
  if (!text?.trim()) return [];
  const normalized = text.replace(/\s+/g, " ").trim();
  const parts = normalized.split(/(?<=[.!?])\s+/).map((p) => p.trim()).filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    if (out.length >= maxLines) break;
    const c = clip(p, 68);
    if (c.length > 14) out.push(c);
  }
  return out;
}

export function buildVsCardTraits(source: VsCardSource): { traitsA: string[]; traitsB: string[] } {
  const traitsA: string[] = [];
  const traitsB: string[] = [];
  const points = source.conflictFrictionPoints;

  if (Array.isArray(points) && points.length > 0) {
    for (let i = 0; i < Math.min(3, points.length); i++) {
      const p = points[i];
      if (p?.personA) traitsA.push(clip(p.personA));
      if (p?.personB) traitsB.push(clip(p.personB));
    }
  }

  for (const line of sentencesFromMap(source.mapReadInnerA, 3)) {
    if (traitsA.length >= 3) break;
    if (!traitsA.includes(line)) traitsA.push(line);
  }
  for (const line of sentencesFromMap(source.mapReadInnerB, 3)) {
    if (traitsB.length >= 3) break;
    if (!traitsB.includes(line)) traitsB.push(line);
  }

  const exA = source.reflectionExcerptA?.replace(/\n/g, " ").trim() ?? "";
  const exB = source.reflectionExcerptB?.replace(/\n/g, " ").trim() ?? "";
  if (traitsA.length < 2 && exA.length > 20) traitsA.push(clip(exA, 72));
  if (traitsB.length < 2 && exB.length > 20) traitsB.push(clip(exB, 72));

  if (source.emotionalTag?.trim() && traitsA.length < 2) {
    traitsA.push(clip(`Shared mood read: ${source.emotionalTag.trim()}`, 58));
  }
  if (source.emotionalTag?.trim() && traitsB.length < 2) {
    traitsB.push(clip(`How it lands between you: ${source.emotionalTag.trim()}`, 58));
  }

  while (traitsA.length < 2) {
    traitsA.push("How you lean when closeness gets real.");
  }
  while (traitsB.length < 2) {
    traitsB.push("How you answer when closeness gets real.");
  }

  const cleanA = traitsA.map((t) => normalizeLine(t, 64)).filter(Boolean);
  const cleanB = traitsB.map((t) => normalizeLine(t, 64)).filter(Boolean);
  return { traitsA: cleanA.slice(0, 3), traitsB: cleanB.slice(0, 3) };
}

export function getVsCardContent(source: VsCardSource) {
  const { traitsA, traitsB } = buildVsCardTraits(source);
  const labelA = source.nameA?.trim() || "Person A";
  const labelB = source.nameB?.trim() || "Person B";
  const raw =
    source.brutalTruth?.replace(/\s+/g, " ").trim() || "Two truths in one room—naming the gap is where the work starts.";
  const brutalLine = raw.length > 240 ? `${raw.slice(0, 237).trim()}…` : raw;
  const tensionLine =
    source.emotionalTag?.trim() ||
    source.conflictFrictionPoints?.find((x) => typeof x?.mismatch === "string" && x.mismatch.trim())?.mismatch?.trim() ||
    "Different protection styles can look like rejection.";
  const toneA = normalizeLine(traitsA[0] || "Moves inward before reconnecting.", 52);
  const toneB = normalizeLine(traitsB[0] || "Seeks contact quickly for reassurance.", 52);
  return { traitsA, traitsB, labelA, labelB, brutalLine, tensionLine: clip(tensionLine, 84), toneA, toneB };
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth) line = next;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * PNG 1080×1920 for Instagram / WhatsApp stories.
 */
export function generateVsCardBlob(source: VsCardSource): Promise<Blob> {
  const canvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!canvas) return Promise.reject(new Error("Canvas not available"));

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("2d context not available"));

  const { traitsA, traitsB, labelA, labelB, brutalLine } = getVsCardContent(source);

  // Base
  ctx.fillStyle = "#050506";
  ctx.fillRect(0, 0, W, H);

  // Split panels (subtle tint)
  ctx.fillStyle = "rgba(124, 58, 237, 0.07)";
  ctx.fillRect(0, 220, W / 2, 900);
  ctx.fillStyle = "rgba(14, 165, 233, 0.06)";
  ctx.fillRect(W / 2, 220, W / 2, 900);

  // Center divider + VS
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2, 200);
  ctx.lineTo(W / 2, 1120);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "300 52px system-ui, -apple-system, sans-serif";
  ctx.fillText("VS", W / 2, 165);

  ctx.font = "600 22px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("LUMA", W / 2, 95);

  // Names
  ctx.fillStyle = "#fafafa";
  ctx.font = "700 38px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  const nameY = 255;
  ctx.fillText(labelA.length > 18 ? `${labelA.slice(0, 17)}…` : labelA, W * 0.25, nameY);
  ctx.fillText(labelB.length > 18 ? `${labelB.slice(0, 17)}…` : labelB, W * 0.75, nameY);

  // Traits (dynamic vertical flow per column)
  ctx.textAlign = "left";
  ctx.font = "500 28px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  const traitStartY = 330;
  const rowGap = 28;
  const leftPad = 52;
  const colW = W / 2 - leftPad * 2;

  let yLeft = traitStartY;
  for (const t of traitsA) {
    const lines = wrapLines(ctx, `· ${t}`, colW);
    lines.forEach((ln, j) => {
      ctx.fillText(ln, leftPad, yLeft + j * 36);
    });
    yLeft += lines.length * 36 + rowGap;
  }

  let yRight = traitStartY;
  for (const t of traitsB) {
    const lines = wrapLines(ctx, `· ${t}`, colW);
    lines.forEach((ln, j) => {
      ctx.fillText(ln, W / 2 + leftPad, yRight + j * 36);
    });
    yRight += lines.length * 36 + rowGap;
  }

  // Brutal truth panel
  const panelY = 1180;
  const panelH = 520;
  const panelPad = 48;
  ctx.fillStyle = "#0e0e10";
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.fillRect(panelPad, panelY, W - panelPad * 2, panelH);
  ctx.strokeRect(panelPad + 0.5, panelY + 0.5, W - panelPad * 2 - 1, panelH - 1);

  ctx.fillStyle = "rgba(253, 230, 138, 0.95)";
  ctx.font = "700 20px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BRUTAL TRUTH", W / 2, panelY + 52);

  ctx.fillStyle = "#f5f5f4";
  ctx.font = "500 32px Georgia, 'Times New Roman', serif";
  const bodyLines = wrapLines(ctx, brutalLine, W - panelPad * 2 - 64);
  const bodyStart = panelY + 100;
  const bodyLineHeight = 44;
  bodyLines.slice(0, 6).forEach((ln, i) => {
    ctx.fillText(ln, W / 2, bodyStart + i * bodyLineHeight);
  });

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "500 24px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("luma", W / 2, H - 72);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      "image/png",
      0.95
    );
  });
}
