import { NextResponse } from "next/server";
import { buildDeterministicDemoInsight, isValidDemoImageId } from "@/lib/demoReflectionFlow";

type DemoRequestBody = {
  selectedImageIds?: unknown;
};

export async function POST(req: Request) {
  try {
    const payload = ((await req.json().catch(() => ({}))) ?? {}) as DemoRequestBody;
    const ids = Array.isArray(payload.selectedImageIds) ? payload.selectedImageIds : [];
    const normalized = ids
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
    const uniqueIds = Array.from(new Set(normalized));

    if (uniqueIds.length < 4 || uniqueIds.length > 6) {
      return NextResponse.json(
        { error: "Select between 4 and 6 images." },
        { status: 400 }
      );
    }

    if (!uniqueIds.every((id) => isValidDemoImageId(id))) {
      return NextResponse.json(
        { error: "Invalid image selection." },
        { status: 400 }
      );
    }

    const insight = buildDeterministicDemoInsight(uniqueIds);
    return NextResponse.json(insight);
  } catch (error) {
    console.error("Demo reflection error", error);
    return NextResponse.json(
      { error: "Unable to generate demo insight." },
      { status: 500 }
    );
  }
}
