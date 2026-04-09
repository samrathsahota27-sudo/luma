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

function decodeMaybe(value: string | null) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isExpiredBlobSignature(target: URL) {
  if (!target.hostname.includes(".blob.core.windows.net")) return false;
  const seRaw = target.searchParams.get("se");
  if (!seRaw) return false;
  const se = new Date(decodeMaybe(seRaw));
  if (!Number.isFinite(se.getTime())) return false;
  return se.getTime() <= Date.now();
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
  if (isExpiredBlobSignature(target)) {
    return NextResponse.json({ error: "Signed image URL expired" }, { status: 410 });
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
      cache: "no-store",
      headers: {
        Accept: "image/*,*/*;q=0.8",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }

  // Some signed hosts are sensitive to request shape; retry once with a minimal request.
  if (!res.ok) {
    try {
      const retry = await fetch(target.toString(), {
        redirect: "follow",
        cache: "no-store",
      });
      res = retry;
    } catch {
      // Keep original response for the error path below.
    }
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json(
        { error: "Upstream rejected signed URL", upstreamStatus: res.status },
        { status: 410 }
      );
    }
    return NextResponse.json(
      { error: "Upstream error", upstreamStatus: res.status },
      { status: 502 }
    );
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

