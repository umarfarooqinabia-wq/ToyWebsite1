import { NextResponse } from "next/server";
import { z } from "zod";
import { consumePasswordResetToken } from "@/lib/auth/password-reset";
import { findUserByEmail, updateUserPassword } from "@/lib/auth/users-db";

const bodySchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid reset payload (password must be at least 8 characters)" },
        { status: 400 },
      );
    }

    const email = await consumePasswordResetToken(parsed.data.token);
    if (!email) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Request a new one." },
        { status: 400 },
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const ok = await updateUserPassword(user.id, parsed.data.password);
    if (!ok) {
      return NextResponse.json({ error: "Could not update password" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Password updated. You can sign in now." });
  } catch {
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
