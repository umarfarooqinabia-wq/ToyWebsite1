"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderTrackingPanel } from "@/components/orders/order-tracking-panel";
import type { OrderStatus } from "@/types/commerce";

type TrackedOrder = {
  id: string;
  number: string;
  status: OrderStatus;
  trackingNumber?: string;
  city?: string;
  itemCount: number;
  items: { title: string; quantity: number; image: string }[];
};

export function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const params = new URLSearchParams({
        order: orderNumber.trim(),
        phone: phone.trim(),
      });
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = (await res.json()) as { error?: string; order?: TrackedOrder };
      if (!res.ok || !data.order) {
        throw new Error(data.error ?? "Could not find order");
      }
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => void submit(e)}
        className="rounded-3xl border border-border bg-surface p-5 sm:p-8"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-text">
            Order number
            <Input
              className="mt-1.5"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. 20001"
              required
              autoComplete="off"
            />
          </label>
          <label className="block text-sm font-medium text-text">
            Phone used at checkout
            <Input
              className="mt-1.5"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XX XXXXXXX"
              required
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
        </div>
        <p className="mt-3 text-xs text-muted">
          We only show tracking if the phone matches the order — keeps your delivery details private.
        </p>
        {error ? (
          <p className="mt-3 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="mt-5" loading={loading}>
          Track order
        </Button>
      </form>

      {order ? (
        <div className="space-y-5">
          <OrderTrackingPanel
            orderNumber={order.number}
            status={order.status}
            trackingNumber={order.trackingNumber}
            city={order.city}
          />
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-text">
              {order.itemCount} item{order.itemCount === 1 ? "" : "s"} in this order
            </p>
            <ul className="mt-3 space-y-3">
              {order.items.map((item, i) => (
                <li key={`${item.title}-${i}`} className="flex items-center gap-3">
                  <span className="relative h-12 w-12 overflow-hidden rounded-lg border border-border">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{item.title}</p>
                    <p className="text-xs text-muted">Qty {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
