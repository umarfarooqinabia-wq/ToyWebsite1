import {
  processUploadImage,
  type ImageProcessPreset,
} from "@/lib/uploads/image-process";
import { persistUpload } from "@/lib/uploads/storage";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ALLOWED_IMAGE_TYPES = IMAGE_TYPES;

export async function saveProcessedImage(options: {
  file: File;
  /** Logical folder under uploads/ e.g. cds, sell-requests */
  folder: string;
  filenamePrefix: string;
  preset?: ImageProcessPreset;
  maxBytes?: number;
}): Promise<{ url: string; name: string; width: number; height: number }> {
  const {
    file,
    folder,
    filenamePrefix,
    preset = "product",
    maxBytes = 3.5 * 1024 * 1024,
  } = options;

  const mime = file.type || "application/octet-stream";
  if (!IMAGE_TYPES.has(mime)) {
    throw new Error(`Unsupported image type: ${mime || file.name}`);
  }
  if (file.size > maxBytes) {
    throw new Error(
      `${file.name} is too large (max ${Math.round(maxBytes / (1024 * 1024))}MB)`,
    );
  }

  const raw = Buffer.from(new Uint8Array(await file.arrayBuffer()));
  const processed = await processUploadImage(raw, preset);
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const filename = `${filenamePrefix}-${stamp}${processed.ext}`;
  const { url } = await persistUpload({
    folder,
    filename,
    data: processed.buffer,
    contentType: processed.mime,
  });

  return {
    url,
    name: file.name,
    width: processed.width,
    height: processed.height,
  };
}
