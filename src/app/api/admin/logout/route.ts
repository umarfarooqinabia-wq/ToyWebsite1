import { NextResponse } from "next/server";
import { clearAdminSessionCookieOptions } from "@/lib/admin/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const cookie = clearAdminSessionCookieOptions();
  res.cookies.set(cookie.name, cookie.value, cookie);
  return res;
}
