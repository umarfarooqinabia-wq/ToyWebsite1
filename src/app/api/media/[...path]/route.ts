import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireBlobToken, usesBlobStorage } from "@/lib/uploads/storage";

export const runtime = "nodejs";

type Params = { params: Promise<{ path: string[] }> };

/**
 * Streams private Vercel Blob objects so <img> / next/image can load them
 * without a public Blob store.
 */
export async function GET(_request: Request, { params }: Params) {
  const parts = (await params).path ?? [];
  if (!parts.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only serve upload assets (not toycompany-data JSON).
  if (parts[0] !== "uploads") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pathname = parts.map(decodeURIComponent).join("/");
  if (pathname.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  if (!usesBlobStorage()) {
    return NextResponse.redirect(new URL(`/${pathname}`, _request.url));
  }

  try {
    const token = requireBlobToken();
    const result = await get(pathname, {
      access: "private",
      token,
      useCache: true,
    });

    if (!result?.stream) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const headers = new Headers();
    const contentType =
      result.blob.contentType ||
      result.headers.get("content-type") ||
      "application/octet-stream";
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(result.stream, { status: 200, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Media fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
