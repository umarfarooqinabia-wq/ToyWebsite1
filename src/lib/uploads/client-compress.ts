/**
 * Shrink phone photos before upload so total request stays under Vercel’s
 * ~4.5MB serverless body limit (common cause of live upload failures).
 */
export async function compressImageFile(
  file: File,
  options?: { maxBytes?: number; maxEdge?: number },
): Promise<File> {
  const maxBytes = options?.maxBytes ?? 3_200_000;
  const maxEdge = options?.maxEdge ?? 1600;

  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  // Already small enough — skip work
  if (file.size <= maxBytes && file.size <= 1_500_000) {
    return file;
  }

  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let quality = 0.85;
    let blob: Blob | null = null;
    while (quality >= 0.45) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
      });
      if (blob && blob.size <= maxBytes) break;
      quality -= 0.1;
    }

    if (!blob) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${base}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

export async function compressImageFiles(files: File[]): Promise<File[]> {
  const out: File[] = [];
  for (const file of files) {
    out.push(await compressImageFile(file));
  }
  return out;
}

/** Parse upload/API JSON errors; handle non-JSON (e.g. Vercel 413 HTML). */
export async function readApiError(
  res: Response,
  fallback = "Request failed",
): Promise<string> {
  const text = await res.text();
  if (res.status === 413) {
    return "Photo too large for upload. Try a smaller image (under 3MB).";
  }
  try {
    const data = JSON.parse(text) as { error?: string };
    if (data.error) return data.error;
  } catch {
    /* not JSON */
  }
  if (text && text.length < 200 && !text.trimStart().startsWith("<")) {
    return text;
  }
  return fallback;
}
