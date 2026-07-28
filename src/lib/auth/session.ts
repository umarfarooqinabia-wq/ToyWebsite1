import { cookies } from "next/headers";
import {
  USER_COOKIE,
  createUserSessionToken,
  verifyUserSessionToken,
} from "@/lib/auth/token";
import { findUserById, toPublicUser } from "@/lib/auth/users-db";
import type { PublicUser } from "@/lib/auth/types";

export async function getUserSession(): Promise<{
  userId: string;
  exp: number;
} | null> {
  const jar = await cookies();
  return verifyUserSessionToken(jar.get(USER_COOKIE)?.value);
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await getUserSession();
  if (!session) return null;
  const user = await findUserById(session.userId);
  return user ? toPublicUser(user) : null;
}

export async function requireUserSession() {
  const session = await getUserSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export function userSessionCookieOptions(token: string) {
  return {
    name: USER_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  };
}

export function clearUserSessionCookieOptions() {
  return {
    name: USER_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export { createUserSessionToken, USER_COOKIE };
