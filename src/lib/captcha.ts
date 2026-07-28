import { createHmac, timingSafeEqual } from "crypto";

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const SEP = "|";

function secret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.AUTH_SECRET ??
    "toycompany-captcha-dev-secret"
  );
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export type CaptchaChallenge = {
  /** Human-readable question, e.g. "What is 4 + 7?" */
  question: string;
  /** Signed token embedding the correct answer + expiry */
  token: string;
};

/** Issue a simple math CAPTCHA (no third-party keys required). */
export function createMathCaptcha(): CaptchaChallenge {
  const a = 2 + Math.floor(Math.random() * 9); // 2–10
  const b = 1 + Math.floor(Math.random() * 9); // 1–9
  // Addition only — avoids negative answers that broke older "dot-separated" tokens
  const answer = a + b;
  const exp = Date.now() + TTL_MS;
  const payload = `${answer}${SEP}${exp}`;
  const token = `${payload}${SEP}${sign(payload)}`;
  return {
    question: `What is ${a} + ${b}?`,
    token,
  };
}

export function verifyMathCaptcha(token: string, answerRaw: string): boolean {
  if (!token || !answerRaw?.trim()) return false;

  // New format: answer|exp|sig
  let answerStr: string | undefined;
  let expStr: string | undefined;
  let sig: string | undefined;
  let payload: string | undefined;

  if (token.includes(SEP)) {
    const parts = token.split(SEP);
    if (parts.length !== 3) return false;
    [answerStr, expStr, sig] = parts;
    payload = `${answerStr}${SEP}${expStr}`;
  } else {
    // Legacy format: answer.exp.sig (kept during rollout)
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    [answerStr, expStr, sig] = parts;
    payload = `${answerStr}.${expStr}`;
  }

  if (!answerStr || !expStr || !sig || !payload) return false;

  const expectedSig = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const expected = Number(answerStr);
  const given = Number(String(answerRaw).trim());
  if (!Number.isFinite(expected) || !Number.isFinite(given)) return false;
  return expected === given;
}
