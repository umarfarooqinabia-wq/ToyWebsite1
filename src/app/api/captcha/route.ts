import { NextResponse } from "next/server";
import { createMathCaptcha } from "@/lib/captcha";

export async function GET() {
  const challenge = createMathCaptcha();
  return NextResponse.json(challenge, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
