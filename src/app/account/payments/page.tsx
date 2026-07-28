import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Payment Methods",
  robots: { index: false },
};

export default function PaymentsPage() {
  return (
    <div className="container-px mx-auto max-w-3xl py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Payments" },
        ]}
        className="mb-6"
      />
      <h1 className="mb-4 font-display text-3xl font-bold">Payment Methods</h1>
      <p className="mb-8 text-muted">
        Manage JazzCash, Easypaisa, and card methods. Secrets never touch the browser.
      </p>
      <div className="space-y-3">
        {[
          { label: "JazzCash", detail: "03XX-XXXXXXX" },
          { label: "Easypaisa", detail: "03XX-XXXXXXX" },
          { label: "Visa •••• 4242", detail: "Stripe · Expires 12/28" },
        ].map((m) => (
          <div
            key={m.label}
            className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4"
          >
            <div>
              <p className="font-medium">{m.label}</p>
              <p className="text-sm text-muted">{m.detail}</p>
            </div>
            <button type="button" className="text-sm text-accent">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
