import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const KEY_LEN = 64;

export async function hashPassword(password: string): Promise<{
  hash: string;
  salt: string;
}> {
  const salt = randomBytes(16).toString("base64url");
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return { hash: derived.toString("base64url"), salt };
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  try {
    const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
    const expected = Buffer.from(hash, "base64url");
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
