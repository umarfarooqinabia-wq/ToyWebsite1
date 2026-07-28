import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdminSessionToken,
  validateAdminCredentials,
} from "@/lib/admin/auth";
import { adminSessionCookieOptions } from "@/lib/admin/session";

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

    const { email, password } = parsed.data;
    if (!validateAdminCredentials(email, password)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createAdminSessionToken(email);
    const res = NextResponse.json({ ok: true });
    const cookie = adminSessionCookieOptions(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
