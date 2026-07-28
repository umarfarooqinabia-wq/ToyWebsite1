import sharp from "sharp";

/** Standard used / physical disc cover (Steam library portrait). */
export const CD_COVER = { width: 600, height: 900 } as const;

export type ImageProcessPreset =
  | "product" // keep aspect, max edge 1600
  | "cdCover" // 600×900 cover crop for consistent used-CD tiles
  | "proof"; // payment screenshots — max 1600, keep aspect

export interface ProcessedImage {
  buffer: Buffer;
  ext: ".webp" | ".jpg";
  mime: "image/webp" | "image/jpeg";
  width: number;
  height: number;
}

/**
 * Compress and optionally normalize product / proof uploads with sharp.
 * GIFs are converted to a single WebP frame (animation not preserved).
 */
export async function processUploadImage(
  input: Buffer,
  preset: ImageProcessPreset = "product",
): Promise<ProcessedImage> {
  // Copy so sharp never receives a SharedArrayBuffer-backed view from File/Blob.
  const safeInput = Buffer.from(Uint8Array.from(input));
  const image = sharp(safeInput, { failOn: "none" }).rotate();

  let pipeline = image;
  if (preset === "cdCover") {
    pipeline = pipeline.resize(CD_COVER.width, CD_COVER.height, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    });
  } else {
    const max = preset === "proof" ? 1600 : 1600;
    pipeline = pipeline.resize({
      width: max,
      height: max,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const quality = preset === "proof" ? 82 : 80;
  const rawOut = await pipeline.webp({ quality, effort: 4 }).toBuffer();
  // Copy out of sharp's pool — avoids SharedArrayBuffer on Vercel Blob upload.
  const buffer = Buffer.from(Uint8Array.from(rawOut));
  const meta = await sharp(buffer).metadata();

  return {
    buffer,
    ext: ".webp",
    mime: "image/webp",
    width: meta.width ?? (preset === "cdCover" ? CD_COVER.width : maxDimFallback(preset)),
    height: meta.height ?? (preset === "cdCover" ? CD_COVER.height : maxDimFallback(preset)),
  };
}

function maxDimFallback(preset: ImageProcessPreset) {
  return preset === "cdCover" ? CD_COVER.height : 1600;
}
