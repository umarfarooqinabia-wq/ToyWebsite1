import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
