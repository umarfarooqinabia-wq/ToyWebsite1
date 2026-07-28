import type { Metadata } from "next";
import Link from "next/link";
import { Package, Boxes } from "lucide-react";
import { listAdminOrders } from "@/lib/admin/orders-db";
import {
  buildAdminAwareCatalog,
  readInventory,
} from "@/lib/admin/stock-db";
import {
  calculateEarningsByMonth,
  currentMonthKey,
} from "@/lib/admin/revenue";
import { verifyDurablePersistence } from "@/lib/admin/json-store";
import { getBaseCatalog } from "@/lib/commerce/demo-provider";
import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AdminEarningsPanel } from "@/components/admin/admin-earnings-panel";

export const metadata: Metadata = {
  title: "Admin Overview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [orders, inv, persistence] = await Promise.all([
    listAdminOrders(),
    readInventory(),
    verifyDurablePersistence(),
  ]);
  const catalog = buildAdminAwareCatalog(getBaseCatalog(), inv);
  const units = catalog.reduce((s, p) => s + (p.variants[0]?.quantityAvailable ?? 0), 0);
  const lowStock = catalog.filter((p) => {
    const q = p.variants[0]?.quantityAvailable ?? 0;
    return q > 0 && q < 10;
  }).length;
  const outOfStock = catalog.filter((p) => (p.variants[0]?.quantityAvailable ?? 0) === 0).length;
  const openOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  ).length;

  const months = calculateEarningsByMonth(orders, inv.meta, catalog);
  const thisMonth =
    months.find((m) => m.key === currentMonthKey()) ?? {
      profit: 0,
      sales: 0,
      orderCount: 0,
    };
  const recent = orders.slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted">
          Sales desk overview — stock, orders, and monthly team profit from toys.
        </p>
      </div>

      <div
        className={
          persistence.ok
            ? "rounded-2xl border border-accent/30 bg-accent-dim/30 px-4 py-3 text-sm"
            : "rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        }
      >
        <p className="font-semibold">
          {persistence.ok
            ? "Lifetime data store connected"
            : "Lifetime data store not ready"}
        </p>
        <p className={persistence.ok ? "mt-1 text-muted" : "mt-1"}>
          {persistence.detail} Mode: {persistence.mode}. Users, orders, and stock persist
          across deploys when Blob is connected.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "This month profit",
            value: formatMoney({ amount: thisMonth.profit, currencyCode: "PKR" }),
          },
          {
            label: "This month sales",
            value: formatMoney({ amount: thisMonth.sales, currencyCode: "PKR" }),
          },
          { label: "Open orders", value: String(openOrders) },
          { label: "Toy units / low", value: `${units} / ${lowStock + outOfStock}` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <AdminEarningsPanel months={months} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/stock"
          className="group rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/50"
        >
          <Boxes className="h-8 w-8 text-accent" />
          <h2 className="mt-4 font-display text-xl font-semibold group-hover:text-accent">
            Toy stock
          </h2>
          <p className="mt-2 text-sm text-muted">
            {catalog.length} toy SKUs — set Buy / Sell prices so monthly profit is accurate.
          </p>
        </Link>
        <Link
          href="/admin/orders"
          className="group rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/50"
        >
          <Package className="h-8 w-8 text-accent" />
          <h2 className="mt-4 font-display text-xl font-semibold group-hover:text-accent">
            Placed orders
          </h2>
          <p className="mt-2 text-sm text-muted">
            Confirm COD, mark shipped, and add tracking for customers.
          </p>
        </Link>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-accent">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{o.number}</p>
                  <p className="text-xs text-muted">
                    {o.shippingAddress.fullName} · {o.shippingAddress.city}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-semibold">{formatMoney(o.total)}</span>
                  <Badge variant="accent">{o.status.replace(/_/g, " ")}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
