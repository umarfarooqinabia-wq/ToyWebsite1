import type { Metadata } from "next";
import { CustomerRegisterForm } from "@/components/auth/customer-register-form";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false },
};

export default function AccountRegisterPage() {
  return <CustomerRegisterForm />;
}
