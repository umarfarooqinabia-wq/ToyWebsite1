import { promises as fs } from "fs";
import path from "path";
import { get, list, put } from "@vercel/blob";
import { getDataDir, isFsPermissionError } from "@/lib/admin/data-dir";

const BLOB_PREFIX = "toycompany-data";
const MAX_MUTATE_RETRIES = 5;

/** In-process cache — cuts repeat get() on warm Hobby lambdas (simple ops). */
const READ_CACHE_TTL_MS = Math.max(
  1_000,
  Number(process.env.BLOB_READ_CACHE_TTL_MS ?? 8_000) || 8_000,
);
const readCache = new Map<string, { expires: number; data: unknown }>();

export type WriteJsonOptions = {
  /**
   * When false, fail if the file already exists (create-only).
   * Default true — overwrite.
   */
  overwrite?: boolean;
};

export function isAlreadyExistsError(err: unknown) {
  if (!err) return false;
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code?: unknown }).code)
      : "";
  if (code === "EEXIST") return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /already exists|cannot overwrite|file exists|precondition failed|conflict|409/i.test(
    msg,
  );
}

/**
 * Lifetime operational data files stored in Vercel Blob (private).
 * These survive deploys and are never written to /tmp.
 */
export const PERSISTED_DATA_FILES = [
  "users.json",
  "orders.json",
  "order-counter.json",
  "orders/", // per-order files (preferred; survives concurrent checkouts)
  "order-ids/", // permanent unique ID claims (payment reference safety)
  "sell-requests.json",
  "exchange-requests.json",
  "cd-inventory.json",
  "stock.json",
  "articles.json",
  "password-resets.json",
] as const;

/**
 * On Vercel, JSON DBs must live in Blob — filesystem is ephemeral.
 */
export function usesDurableBlobStore() {
  return (
    Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()) ||
    process.env.VERCEL === "1"
  );
}

function blobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "Persistent lifetime data on Vercel needs Blob storage. Create a Blob store (Storage → Blob), set BLOB_READ_WRITE_TOKEN, then redeploy. Without this, users / sell / exchange / orders reset on every deploy.",
    );
  }
  return token;
}

function blobPath(fileName: string) {
  return `${BLOB_PREFIX}/${fileName.replace(/^\/+/, "")}`;
}

function cacheKey(fileName: string) {
  return fileName.replace(/^\/+/, "");
}

function invalidateReadCache(fileName: string) {
  readCache.delete(cacheKey(fileName));
}

function isEtagMismatch(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return /precondition failed|etag mismatch/i.test(msg);
}

async function streamToString(
  stream: ReadableStream<Uint8Array> | null,
): Promise<string> {
  if (!stream) return "";
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const merged = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  return merged.toString("utf8");
}

type JsonMeta<T> = {
  data: T | null;
};

async function readJsonWithMeta<T>(fileName: string): Promise<JsonMeta<T>> {
  const key = cacheKey(fileName);
  const hit = readCache.get(key);
  if (hit && hit.expires > Date.now()) {
    return { data: hit.data as T | null };
  }

  if (usesDurableBlobStore()) {
    const token = blobToken();
    try {
      const result = await get(blobPath(fileName), {
        access: "private",
        token,
        // Cache hits avoid Simple Operation billing on Hobby.
        useCache: true,
      });
      if (!result?.stream) {
        readCache.set(key, { expires: Date.now() + READ_CACHE_TTL_MS, data: null });
        return { data: null };
      }
      const text = await streamToString(result.stream);
      if (!text.length) {
        readCache.set(key, { expires: Date.now() + READ_CACHE_TTL_MS, data: null });
        return { data: null };
      }
      try {
        const data = JSON.parse(text) as T;
        readCache.set(key, { expires: Date.now() + READ_CACHE_TTL_MS, data });
        return { data };
      } catch {
        readCache.set(key, { expires: Date.now() + READ_CACHE_TTL_MS, data: null });
        return { data: null };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/not found|404|NoSuchKey|does not exist/i.test(msg)) {
        readCache.set(key, { expires: Date.now() + READ_CACHE_TTL_MS, data: null });
        return { data: null };
      }
      throw new Error(`Failed to read ${fileName} from Blob: ${msg}`);
    }
  }

  try {
    const raw = await fs.readFile(path.join(getDataDir(), fileName), "utf8");
    const data = JSON.parse(raw) as T;
    readCache.set(key, { expires: Date.now() + READ_CACHE_TTL_MS, data });
    return { data };
  } catch {
    readCache.set(key, { expires: Date.now() + READ_CACHE_TTL_MS, data: null });
    return { data: null };
  }
}

/** Read a JSON text file. Returns null if it does not exist yet. */
export async function readJsonText(fileName: string): Promise<string | null> {
  const meta = await readJsonWithMeta<unknown>(fileName);
  if (meta.data == null) return null;
  return JSON.stringify(meta.data);
}

export async function readJson<T>(fileName: string): Promise<T | null> {
  const meta = await readJsonWithMeta<T>(fileName);
  return meta.data;
}

/**
 * Compact JSON for Blob — smaller transfers on Hobby.
 */
function encodeJson(data: unknown) {
  return JSON.stringify(data);
}

/**
 * Write JSON in Blob/local FS.
 * Intentionally does NOT use ifMatch/ETag — Vercel Blob often returns
 * "Precondition failed: ETag mismatch" even for single writers, which
 * broke checkout and sell/exchange submits in production.
 */
async function writeJsonText(
  fileName: string,
  contents: string,
  options?: WriteJsonOptions,
): Promise<void> {
  const overwrite = options?.overwrite !== false;
  invalidateReadCache(fileName);

  if (usesDurableBlobStore()) {
    const token = blobToken();
    try {
      const body = new Blob([contents], { type: "application/json" });
      await put(blobPath(fileName), body, {
        access: "private",
        token,
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: overwrite,
        // Longer CDN cache for private get(useCache) — we invalidate via memory cache on write.
        cacheControlMaxAge: 60 * 60,
      });
      return;
    } catch (err) {
      if (!overwrite && isAlreadyExistsError(err)) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      // Rare CDN race — one retry (only when overwrites are allowed)
      if (overwrite && isEtagMismatch(err)) {
        const body = new Blob([contents], { type: "application/json" });
        await put(blobPath(fileName), body, {
          access: "private",
          token,
          contentType: "application/json",
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60 * 60,
        });
        return;
      }
      throw new Error(`Failed to save ${fileName} to Blob: ${msg}`);
    }
  }

  const abs = path.join(getDataDir(), fileName);
  try {
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, contents, {
      encoding: "utf8",
      flag: overwrite ? "w" : "wx",
    });
  } catch (err) {
    if (!overwrite && isAlreadyExistsError(err)) throw err;
    if (isFsPermissionError(err)) {
      throw new Error(
        "Cannot write local data directory. On Vercel, set BLOB_READ_WRITE_TOKEN so data persists in Blob storage for the lifetime of the store.",
      );
    }
    throw err;
  }
}

/** Full replace (prefer mutateJson for read-modify-write). */
export async function writeJson(
  fileName: string,
  data: unknown,
  options?: WriteJsonOptions,
): Promise<void> {
  await writeJsonText(fileName, encodeJson(data), options);
}

/**
 * List JSON file paths under a relative prefix (e.g. "orders/").
 * Returns paths relative to the data root (same style as readJson/writeJson).
 */
export async function listJsonPaths(prefix: string): Promise<string[]> {
  const normalized = prefix.replace(/^\/+/, "").replace(/\/*$/, "") + "/";

  if (usesDurableBlobStore()) {
    const token = blobToken();
    const paths: string[] = [];
    let cursor: string | undefined;
    do {
      const result = await list({
        prefix: blobPath(normalized),
        token,
        cursor,
        limit: 1000,
      });
      for (const blob of result.blobs) {
        const full = blob.pathname;
        const relative = full.startsWith(`${BLOB_PREFIX}/`)
          ? full.slice(BLOB_PREFIX.length + 1)
          : full;
        if (relative.endsWith(".json")) paths.push(relative);
      }
      cursor = result.hasMore ? result.cursor : undefined;
    } while (cursor);
    return paths;
  }

  const absDir = path.join(getDataDir(), normalized);
  try {
    const entries = await fs.readdir(absDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".json"))
      .map((e) => `${normalized}${e.name}`);
  } catch {
    return [];
  }
}

/**
 * Read-modify-write for JSON stores.
 * Re-reads on failure so concurrent checkouts/sells still land when possible.
 */
export async function mutateJson<T>(
  fileName: string,
  fallback: T,
  mutator: (current: T) => T | Promise<T>,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_MUTATE_RETRIES; attempt++) {
    try {
      // Bypass stale memory cache for RMW — need latest before put.
      invalidateReadCache(fileName);
      const { data } = await readJsonWithMeta<T>(fileName);
      const current = (data ?? fallback) as T;
      const next = await mutator(structuredClone(current));
      await writeJsonText(fileName, encodeJson(next));
      return next;
    } catch (err) {
      lastError = err;
      if (isEtagMismatch(err) && attempt < MAX_MUTATE_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Could not save ${fileName} after concurrent updates`);
}

/** Quick check that Blob persistence is configured and writable. */
export async function verifyDurablePersistence(): Promise<{
  ok: boolean;
  mode: "blob" | "local";
  detail: string;
}> {
  if (!usesDurableBlobStore()) {
    return {
      ok: true,
      mode: "local",
      detail: "Using ./data (local). On Vercel, Blob is required for lifetime persistence.",
    };
  }
  try {
    blobToken();
    const probe = `toycompany-data/_health.json`;
    await writeJson("_health.json", {
      ok: true,
      checkedAt: new Date().toISOString(),
    });
    const read = await readJson<{ ok?: boolean }>("_health.json");
    if (!read?.ok) {
      return { ok: false, mode: "blob", detail: "Blob write succeeded but read-back failed." };
    }
    return {
      ok: true,
      mode: "blob",
      detail: `Lifetime durable store OK (${probe}). Users, sell, exchange, orders survive deploys.`,
    };
  } catch (err) {
    return {
      ok: false,
      mode: "blob",
      detail: err instanceof Error ? err.message : "Blob persistence check failed",
    };
  }
}
