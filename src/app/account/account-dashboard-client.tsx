"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  MapPin,
  Package,
  CreditCard,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useOrdersStore } from "@/store/orders";
import type { Order } from "@/types/commerce";

const links = [
  { href: "/account/orders", label: "Orders", icon: Package, desc: "Track and review purchases" },
  { href: "/wishlist", label: "Wishlist", icon: Heart, desc: "Saved products" },
  { href: "/account/addresses", label: "Addresses", icon: MapPin, desc: "Shipping locations" },
  { href: "/account/payments", label: "Payment methods", icon: CreditCard, desc: "Saved wallets & cards" },
  { href: "/account/settings", label: "Settings", icon: Settings, desc: "Profile & preferences" },
];

export function AccountDashboardClient() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const allOrders = useOrdersStore((s) => s.allOrders);
  const persisted = useOrdersStore((s) => s.orders);
  const [recent, setRecent] = useState<Order[]>([]);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setRecent(allOrders().slice(0, 2));
  }, [allOrders, persisted]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/account/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="container-px mx-auto max-w-7xl py-16 text-center text-muted">
        Loading account…
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Account" }]} className="mb-6" />
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-dim text-accent">
            <User className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold">
              {user?.fullName ?? "Account"}
            </h1>
            <p className="break-all text-muted">{user?.email}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          loading={signingOut}
          onClick={() => void signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/40"
          >
            <Icon className="mb-3 h-6 w-6 text-accent" />
            <h2 className="font-display text-lg font-semibold">{label}</h2>
            <p className="mt-1 text-sm text-muted">{desc}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent Orders</h2>
          <Link href="/account/orders" className="text-sm text-accent">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {recent.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface px-5 py-8 text-center text-sm text-muted">
              No orders yet. Browse the store to place your first order.
            </p>
          ) : (
            recent.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-4 transition hover:border-accent/40 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="font-medium">{order.number}</p>
                  <p className="text-sm text-muted">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length}{" "}
                    item(s)
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-accent-dim px-3 py-1 text-xs font-semibold capitalize text-accent">
                  {order.status.replaceAll("_", " ")}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
