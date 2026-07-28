import { ADMIN_PUBLIC } from "@/lib/admin/public";

const ADMIN_COOKIE = "toycompany_admin_session";

export { ADMIN_COOKIE, ADMIN_PUBLIC };

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "abc@123456";

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.AUTH_SECRET ??
    "toycompany-admin-dev-secret"
  );
}

function toBase64UrlBytes(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function toBase64UrlString(input: string) {
  const bytes = new TextEncoder().encode(input);
  return toBase64UrlBytes(bytes);
}

function fromBase64Url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

async function sign(payload: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return toBase64UrlBytes(new Uint8Array(sig));
}

export async function createAdminSessionToken(
  email: string,
  ttlMs = 1000 * 60 * 60 * 12,
) {
  const exp = Date.now() + ttlMs;
  const payload = `${email.toLowerCase()}|${exp}`;
  const signature = await sign(payload);
  return `${toBase64UrlString(payload)}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null,
): Promise<{ email: string; exp: number } | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    const payload = fromBase64Url(encoded);
    const expected = await sign(payload);
    if (!timingSafeEqual(signature, expected)) return null;

    const [email, expRaw] = payload.split("|");
    const exp = Number(expRaw);
    if (!email || !Number.isFinite(exp) || Date.now() > exp) return null;
    if (
      email.toLowerCase() !==
      (process.env.ADMIN_EMAIL ?? ADMIN_PUBLIC.email).toLowerCase()
    ) {
      return null;
    }
    return { email, exp };
  } catch {
    return null;
  }
}

export function validateAdminCredentials(email: string, password: string) {
  const expectedEmail = (
    process.env.ADMIN_EMAIL ?? ADMIN_PUBLIC.email
  ).toLowerCase();
  return (
    email.trim().toLowerCase() === expectedEmail && password === ADMIN_PASSWORD
  );
}
