import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";

/**
 * Local: write under public/uploads (served as /uploads/...).
 * Vercel: store is typically private — upload privately and serve via /api/media/*.
 */
export function usesBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()) || process.env.VERCEL === "1";
}

export function requireBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "Uploads on Vercel need Blob storage. In the Vercel dashboard: Storage → Create Blob store, then set BLOB_READ_WRITE_TOKEN on the project and redeploy.",
    );
  }
  return token;
}

/** Public site URL for a blob pathname (proxied — works with private stores). */
export function mediaPublicUrl(pathname: string) {
  const clean = pathname.replace(/^\/+/, "");
  return `/api/media/${clean}`;
}

export async function persistUpload(options: {
  /** Logical folder e.g. cds, sell-requests, payment-proofs */
  folder: string;
  filename: string;
  data: Buffer;
  contentType: string;
}): Promise<{ url: string }> {
  const { folder, filename, data, contentType } = options;
  const pathname = `uploads/${folder}/${filename}`;

  if (usesBlobStorage()) {
    const token = requireBlobToken();
    // sharp / native Buffers may be backed by SharedArrayBuffer — fetch rejects
    // those. Wrap a copied Uint8Array in a Blob (valid PutBody for the SDK).
    const body = new Blob([new Uint8Array(data)], { type: contentType });
    await put(pathname, body, {
      // Matches private Blob stores (default on Vercel Storage).
      access: "private",
      contentType,
      token,
      addRandomSuffix: false,
      allowOverwrite: true,
      // Long cache — media proxy already sets immutable Cache-Control.
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return { url: mediaPublicUrl(pathname) };
  }

  const absDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(absDir, { recursive: true });
  await fs.writeFile(path.join(absDir, filename), data);
  return { url: `/uploads/${folder}/${filename}` };
}
