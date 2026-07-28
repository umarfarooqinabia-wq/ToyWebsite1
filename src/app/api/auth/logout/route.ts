import { NextResponse } from "next/server";
import { clearUserSessionCookieOptions } from "@/lib/auth/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const cookie = clearUserSessionCookieOptions();
  res.cookies.set(cookie.name, cookie.value, cookie);
  return res;
}
