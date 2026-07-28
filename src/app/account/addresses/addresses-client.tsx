"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useCurrentUser } from "@/hooks/use-current-user";

export function AddressesClient() {
  const { user, loading } = useCurrentUser();
  const addresses = user?.addresses ?? [];

  return (
    <div className="container-px mx-auto max-w-3xl py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Addresses" },
        ]}
        className="mb-6"
      />
      <h1 className="mb-8 font-display text-3xl font-bold">Saved Addresses</h1>
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-muted">No saved addresses yet.</p>
          <p className="mt-2 text-sm text-muted">
            Addresses are added when you complete checkout. You can also update your
            contact details in{" "}
            <Link href="/account/settings" className="text-accent hover:underline">
              Settings
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-2 flex items-center gap-2">
                <p className="font-semibold">{addr.fullName}</p>
                {addr.isDefault ? <Badge variant="accent">Default</Badge> : null}
              </div>
              <p className="text-sm text-muted">
                {addr.address1}
                <br />
                {addr.city}, {addr.province} {addr.postalCode}
                <br />
                {addr.country}
                <br />
                {addr.phone}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
