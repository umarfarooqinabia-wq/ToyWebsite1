import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import { findUserByEmail, toPublicUser } from "@/lib/auth/users-db";
import {
  createUserSessionToken,
  userSessionCookieOptions,
} from "@/lib/auth/session";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
    }

    const user = await findUserByEmail(parsed.data.email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const ok = await verifyPassword(
      parsed.data.password,
      user.passwordHash,
      user.passwordSalt,
    );
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createUserSessionToken(user.id);
    const res = NextResponse.json({ user: toPublicUser(user) });
    const cookie = userSessionCookieOptions(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
