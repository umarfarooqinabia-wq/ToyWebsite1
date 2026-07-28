import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyMathCaptcha } from "@/lib/captcha";
import { createUser, findUserByEmail } from "@/lib/auth/users-db";
import {
  createUserSessionToken,
  userSessionCookieOptions,
} from "@/lib/auth/session";

const bodySchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(30).optional().default(""),
  password: z.string().min(8).max(128),
  captchaToken: z.string().min(10),
  captchaAnswer: z.string().min(1).max(10),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration details", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (!verifyMathCaptcha(parsed.data.captchaToken, parsed.data.captchaAnswer)) {
      return NextResponse.json(
        { error: "CAPTCHA failed. Please solve the challenge and try again." },
        { status: 400 },
      );
    }

    const existing = await findUserByEmail(parsed.data.email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const { captchaToken: _t, captchaAnswer: _a, ...userInput } = parsed.data;
    const user = await createUser(userInput);
    const token = await createUserSessionToken(user.id);
    const res = NextResponse.json({ user }, { status: 201 });
    const cookie = userSessionCookieOptions(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
