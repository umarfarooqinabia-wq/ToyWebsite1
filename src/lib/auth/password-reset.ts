import { createHash, randomBytes } from "crypto";
import { mutateJson } from "@/lib/admin/json-store";

const TTL_MS = 1000 * 60 * 60; // 1 hour
const RESETS_FILE = "password-resets.json";

type ResetRecord = {
  email: string;
  tokenHash: string;
  expiresAt: number;
  createdAt: string;
};

type Store = { tokens: ResetRecord[] };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Create a one-time reset token for an email. Returns raw token for the email link. */
export async function createPasswordResetToken(email: string): Promise<string> {
  const key = email.trim().toLowerCase();
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();

  await mutateJson<Store>(RESETS_FILE, { tokens: [] }, (store) => {
    store.tokens = store.tokens.filter((t) => t.expiresAt > now && t.email !== key);
    store.tokens.push({
      email: key,
      tokenHash: hashToken(token),
      expiresAt: now + TTL_MS,
      createdAt: new Date().toISOString(),
    });
    return store;
  });

  return token;
}

export async function consumePasswordResetToken(
  token: string,
): Promise<string | null> {
  const now = Date.now();
  const hash = hashToken(token);
  let email: string | null = null;

  await mutateJson<Store>(RESETS_FILE, { tokens: [] }, (store) => {
    const idx = store.tokens.findIndex(
      (t) => t.tokenHash === hash && t.expiresAt > now,
    );
    if (idx < 0) {
      store.tokens = store.tokens.filter((t) => t.expiresAt > now);
      return store;
    }
    email = store.tokens[idx]!.email;
    store.tokens.splice(idx, 1);
    store.tokens = store.tokens.filter((t) => t.expiresAt > now);
    return store;
  });

  return email;
}
