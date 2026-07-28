import path from "path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { ALLOWED_IMAGE_TYPES, saveProcessedImage } from "@/lib/uploads/save-image";
import { persistUpload } from "@/lib/uploads/storage";

const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const MAX_IMAGE = 8 * 1024 * 1024;
const MAX_VIDEO = 80 * 1024 * 1024;

function safeExt(name: string, mime: string) {
  const fromName = path.extname(name).toLowerCase().replace(/[^\w.]/g, "");
  if (fromName && fromName.length <= 5) return fromName;
  if (mime === "video/mp4") return ".mp4";
  if (mime === "video/webm") return ".webm";
  if (mime === "video/quicktime") return ".mov";
  return "";
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const kind = String(form.get("kind") ?? "image");
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    /** Prefer portrait CD covers for stock photos (own product photos). */
    const coverMode = String(form.get("cover") ?? "1") !== "0";

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploaded: { url: string; kind: "image" | "video"; name: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const mime = file.type || "application/octet-stream";
      const isImage = ALLOWED_IMAGE_TYPES.has(mime);
      const isVideo = VIDEO_TYPES.has(mime);

      if (kind === "image" && !isImage) {
        return NextResponse.json(
          { error: `Unsupported image type: ${mime || file.name}` },
          { status: 400 },
        );
      }
      if (kind === "video" && !isVideo) {
        return NextResponse.json(
          { error: `Unsupported video type: ${mime || file.name}` },
          { status: 400 },
        );
      }
      if (!isImage && !isVideo) {
        return NextResponse.json(
          { error: `Unsupported file type: ${mime || file.name}` },
          { status: 400 },
        );
      }

      if (isVideo) {
        if (file.size > MAX_VIDEO) {
          return NextResponse.json(
            { error: `${file.name} is too large (max 80MB)` },
            { status: 400 },
          );
        }
        const ext = safeExt(file.name, mime);
        const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const filename = `vid-${stamp}${ext}`;
        const { url } = await persistUpload({
          folder: "cds",
          filename,
          data: Buffer.from(new Uint8Array(await file.arrayBuffer())),
          contentType: mime,
        });
        uploaded.push({
          url,
          kind: "video",
          name: file.name,
        });
        continue;
      }

      const saved = await saveProcessedImage({
        file,
        folder: "cds",
        filenamePrefix: "img",
        preset: coverMode && i === 0 ? "cdCover" : "product",
        maxBytes: MAX_IMAGE,
      });
      uploaded.push({ url: saved.url, kind: "image", name: saved.name });
    }

    return NextResponse.json({ files: uploaded });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    const status =
      message.includes("Unsupported") || message.includes("too large") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
