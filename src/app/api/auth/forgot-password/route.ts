import { NextResponse } from "next/server";
import { z } from "zod";
import { SITE } from "@/lib/constants";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { findUserByEmail } from "@/lib/auth/users-db";
import { sendEmail } from "@/lib/notifications/mail";
import { verifyMathCaptcha } from "@/lib/captcha";

const bodySchema = z.object({
  email: z.string().email(),
  captchaToken: z.string().min(10),
  captchaAnswer: z.string().min(1).max(10),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!verifyMathCaptcha(parsed.data.captchaToken, parsed.data.captchaAnswer)) {
      return NextResponse.json(
        { error: "CAPTCHA failed. Please try again." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await findUserByEmail(email);

    // Always return success to avoid email enumeration
    const generic = {
      ok: true,
      message:
        "If an account exists for that email, we sent a password reset link. Check your inbox.",
    };

    if (!user) {
      return NextResponse.json(generic);
    }

    const token = await createPasswordResetToken(email);
    const resetUrl = `${SITE.url}/account/reset-password?token=${encodeURIComponent(token)}`;

    const mail = await sendEmail({
      to: email,
      subject: `${SITE.name} — Reset your password`,
      text: [
        `Hi ${user.fullName},`,
        ``,
        `We received a request to reset your ${SITE.name} password.`,
        `Open this link within 1 hour:`,
        resetUrl,
        ``,
        `If you did not request this, you can ignore this email.`,
        ``,
        `— ${SITE.name}`,
      ].join("\n"),
    });

    if (!mail.ok && process.env.NODE_ENV !== "production") {
      console.info("[password-reset] email failed:", mail.detail, "link:", resetUrl);
    }

    return NextResponse.json({
      ...generic,
      // Dev-only hint when Resend is missing
      ...(process.env.NODE_ENV !== "production" && !mail.ok
        ? { devResetUrl: resetUrl, mailError: mail.detail }
        : {}),
    });
  } catch {
    return NextResponse.json({ error: "Could not start reset" }, { status: 500 });
  }
}
