import path from "path";

/**
 * Local only: ./data
 *
 * On Vercel, operational JSON (orders, users, stock, …) is stored in
 * Vercel Blob via `@/lib/admin/json-store` — never use /tmp for durable data
 * (it resets on every deploy / cold start).
 */
export function getDataDir() {
  if (process.env.DATA_DIR) {
    return process.env.DATA_DIR;
  }
  return path.join(process.cwd(), "data");
}

export function isFsPermissionError(err: unknown) {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code?: string }).code)
      : "";
  return code === "EROFS" || code === "EACCES" || code === "EPERM";
}
