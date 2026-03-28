import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  depthModeInstructions,
  futurePathsDepthSuffix,
  readDepthModeFromBody,
} from "@/lib/depthMode";

const SYSTEM = `You are Luma, a relationship pattern observer.

You do NOT predict the future.
You describe the direction based on behavior.

RULES:
- No absolute statements.
- No blaming either partner.
- No extreme outcomes. No dramatic breakups.
- Calm, observational tone.
- Short, sharp sentences. No long paragraphs.
- Never generic. Never robotic. Slightly uncomfortable (but safe).
- "Path A" can feel slightly heavy, but still realistic and quiet.
- "Path B" is effort-based and grounded. Not perfect.

Return ONLY valid JSON, no markdown fences, with exactly:
{"pathA":"...","pathB":"..."}`;

function clamp0to100(n: unknown, fallback: number) {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function parseJsonResponse(raw: string): { pathA: string; pathB: string } {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  }
  const parsed = JSON.parse(text) as Record<string, unknown>;
  const pathA = typeof parsed.pathA === "string" ? parsed.pathA.trim() : "";
  const pathB = typeof parsed.pathB === "string" ? parsed.pathB.trim() : "";
  if (!pathA || !pathB) throw new Error("Invalid JSON shape");
  return { pathA, pathB };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const depthMode = readDepthModeFromBody(body);
    const context = (body?.context as Record<string, unknown> | undefined) ?? undefined;

    const memory =
      context && typeof context === "object" && (context as any).memory && typeof (context as any).memory === "object"
        ? ((context as any).memory as Record<string, unknown>)
        : null;

    const scores = (memory?.scores as Record<string, unknown> | undefined) ?? {};
    const patterns = (memory?.patterns as Record<string, unknown> | undefined) ?? {};
    const conflicts = Array.isArray((memory as any)?.conflicts) ? ((memory as any).conflicts as unknown[]) : [];
    const timeline = Array.isArray((memory as any)?.timeline) ? ((memory as any).timeline as unknown[]) : [];

    const connection = clamp0to100((scores as any).connection, 50);
    const conflict = clamp0to100((scores as any).conflict, 50);
    const distance = clamp0to100((scores as any).distance, 50);

    const systemPrompt = `${SYSTEM}${depthModeInstructions(depthMode)}${futurePathsDepthSuffix(depthMode)}

DATA:

Connection: ${connection}
Conflict: ${conflict}
Distance: ${distance}

Patterns:
${JSON.stringify(patterns)}

Recent Conflicts:
${JSON.stringify(conflicts.slice(-3))}

Timeline:
${JSON.stringify(timeline.slice(-5))}

TASK:
Generate two paths:
1) PATH A — If nothing changes
2) PATH B — If patterns are interrupted`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("future-paths: Missing OPENAI_API_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate future paths" },
      ],
      max_tokens: depthMode === "steel" ? 420 : 780,
    });

    const raw = response.choices?.[0]?.message?.content?.trim?.() ?? "";
    if (!raw) throw new Error("Empty completion");

    const data = parseJsonResponse(raw);
    return NextResponse.json(data);
  } catch (error) {
    console.error("future-paths API error:", error);
    return NextResponse.json({ error: "Future paths failed" }, { status: 500 });
  }
}

