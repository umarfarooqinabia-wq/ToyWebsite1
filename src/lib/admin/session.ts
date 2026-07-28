import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "@/lib/admin/auth";

export async function getAdminSession() {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export function adminSessionCookieOptions(token: string) {
  return {
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}

export function clearAdminSessionCookieOptions() {
  return {
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export { createAdminSessionToken };
