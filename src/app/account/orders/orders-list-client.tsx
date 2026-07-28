"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { useOrdersStore } from "@/store/orders";
import type { Order } from "@/types/commerce";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";

export function OrdersListClient() {
  const allOrders = useOrdersStore((s) => s.allOrders);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setOrders(allOrders());
      setReady(true);
    };

    if (useOrdersStore.persist.hasHydrated()) {
      sync();
    }

    const unsub = useOrdersStore.persist.onFinishHydration(sync);
    return unsub;
  }, [allOrders]);

  // Re-read when new orders are placed
  const persisted = useOrdersStore((s) => s.orders);
  useEffect(() => {
    if (ready) setOrders(allOrders());
  }, [persisted, allOrders, ready]);

  if (!ready) {
    return <div className="skeleton h-40 w-full rounded-2xl" />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you check out, your orders will show up here for tracking."
        action={
          <Link href="/products">
            <Button>Start shopping</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.id}`}
          className="block rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/40"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg font-semibold">{order.number}</p>
              <p className="text-sm text-muted">
                Placed {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                order.status === "cancelled"
                  ? "bg-danger/15 text-danger"
                  : "bg-accent-dim text-accent"
              }`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="mt-3 line-clamp-2 break-words text-sm text-muted">
            {order.items.map((i) => `${i.title} ×${i.quantity}`).join(" · ")}
          </p>
          <p className="mt-2 font-semibold">{formatMoney(order.total)}</p>
        </Link>
      ))}
    </div>
  );
}
