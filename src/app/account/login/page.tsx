import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerLoginForm } from "@/components/auth/customer-login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function AccountLoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading…</div>}>
      <CustomerLoginForm />
    </Suspense>
  );
}
