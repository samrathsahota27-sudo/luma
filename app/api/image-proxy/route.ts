import { NextResponse } from "next/server";

function isSafeHttpUrl(raw: string) {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const target = isSafeHttpUrl(rawUrl);
  if (!target) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  // Basic SSRF guard: block localhost/private networks.
  const host = target.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".local")
  ) {
    return NextResponse.json({ error: "Blocked host" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(target.toString(), {
      // Allow upstream caches; we'll also set cache headers below.
      redirect: "follow",
      headers: {
        "User-Agent": "luma-image-proxy",
        Accept: "image/*,*/*;q=0.8",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("image/")) {
    return NextResponse.json({ error: "Not an image" }, { status: 415 });
  }

  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // Cache on CDN/browser; safe because image URLs are immutable-ish.
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      // Helpful for some consumers.
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}

