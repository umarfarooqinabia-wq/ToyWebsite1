"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { toast } from "@/store/toast";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/commerce";
import type { AdminOrder } from "@/lib/admin/orders-db";
import { isPrepaidTransferMethod } from "@/lib/bank-details";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "placed", label: "Placed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function statusVariant(status: OrderStatus): "default" | "success" | "warning" | "accent" | "secondary" {
  switch (status) {
    case "delivered":
      return "success";
    case "cancelled":
      return "secondary";
    case "shipped":
    case "out_for_delivery":
      return "accent";
    case "processing":
      return "warning";
    default:
      return "default";
  }
}

function paymentLabel(method: PaymentMethod) {
  return method.replace(/_/g, " ").toUpperCase();
}

export function AdminOrdersClient() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [draftStatus, setDraftStatus] = useState<OrderStatus>("placed");
  const [draftTracking, setDraftTracking] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [markingPaid, setMarkingPaid] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = (await res.json()) as { orders?: AdminOrder[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load orders");
      setOrders(data.orders ?? []);
    } catch (err) {
      toast({
        tone: "error",
        title: "Orders load failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        o.id,
        o.number,
        o.shippingAddress.fullName,
        o.shippingAddress.phone,
        o.customerEmail ?? "",
        o.customerPhone ?? "",
        o.shippingAddress.city,
        ...o.items.map((i) => i.title),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [orders, query, statusFilter]);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) return;
    setDraftStatus(selected.status);
    setDraftTracking(selected.trackingNumber ?? "");
    setDraftNotes(selected.adminNotes ?? "");
  }, [selected]);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          status: draftStatus,
          trackingNumber: draftTracking,
          adminNotes: draftNotes,
        }),
      });
      const data = (await res.json()) as { order?: AdminOrder; error?: string };
      if (!res.ok || !data.order) throw new Error(data.error ?? "Update failed");
      setOrders((prev) => prev.map((o) => (o.id === data.order!.id ? data.order! : o)));
      toast({ tone: "success", title: "Order updated" });
    } catch (err) {
      toast({
        tone: "error",
        title: "Could not update order",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async () => {
    if (!selected) return;
    setMarkingPaid(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          paymentStatus: "paid" satisfies PaymentStatus,
        }),
      });
      const data = (await res.json()) as { order?: AdminOrder; error?: string };
      if (!res.ok || !data.order) throw new Error(data.error ?? "Update failed");
      setOrders((prev) => prev.map((o) => (o.id === data.order!.id ? data.order! : o)));
      setDraftStatus(data.order.status);
      toast({ tone: "success", title: "Marked as paid" });
    } catch (err) {
      toast({
        tone: "error",
        title: "Could not mark paid",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setMarkingPaid(false);
    }
  };

  const cancelOrder = async () => {
    if (!selected) return;
    const reason = window.prompt(
      "Cancel reason (optional) — shown in sales notes:",
      "Customer requested cancel",
    );
    if (reason === null) return;
    if (
      !window.confirm(
        `Cancel order ${selected.number}? Stock will be restored when possible.`,
      )
    ) {
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selected.id, reason }),
      });
      const data = (await res.json()) as {
        order?: AdminOrder;
        error?: string;
      };
      if (!res.ok || !data.order) throw new Error(data.error ?? "Cancel failed");
      setOrders((prev) => prev.map((o) => (o.id === data.order!.id ? data.order! : o)));
      setDraftStatus("cancelled");
      toast({ tone: "success", title: "Order cancelled" });
    } catch (err) {
      toast({
        tone: "error",
        title: "Could not cancel order",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setCancelling(false);
    }
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    STATUS_OPTIONS.forEach((s) => {
      map[s.value] = orders.filter((o) => o.status === s.value).length;
    });
    return map;
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <p className="mt-2 text-muted">
          Lifetime sales archive — every order stays here forever, including cancelled.
          Update status, tracking, and notes as you fulfill COD and prepaid orders.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`rounded-xl px-3 py-1.5 text-sm ${
            statusFilter === "all"
              ? "bg-accent font-semibold text-[#04110e]"
              : "border border-border text-muted"
          }`}
        >
          All ({counts.all ?? 0})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatusFilter(s.value)}
            className={`rounded-xl px-3 py-1.5 text-sm ${
              statusFilter === s.value
                ? "bg-accent font-semibold text-[#04110e]"
                : "border border-border text-muted"
            }`}
          >
            {s.label} ({counts[s.value] ?? 0})
          </button>
        ))}
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <Input
          className="pl-9"
          placeholder="Search order ID, customer, phone, city, product…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-bg/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Pay</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted">
                      Loading orders…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr
                      key={o.id}
                      className={`cursor-pointer border-b border-border/70 last:border-0 transition hover:bg-bg/50 ${
                        selectedId === o.id ? "bg-accent-dim" : ""
                      }`}
                      onClick={() => setSelectedId(o.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{o.number}</p>
                        <p className="text-xs text-muted">
                          {new Date(o.createdAt).toLocaleString("en-PK")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{o.shippingAddress.fullName}</p>
                        <p className="text-xs text-muted">
                          {o.shippingAddress.city} · {o.shippingAddress.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-display font-semibold">
                        {formatMoney(o.total)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        <p>{paymentLabel(o.paymentMethod)}</p>
                        {o.paymentStatus ? (
                          <p
                            className={
                              o.paymentStatus === "paid"
                                ? "text-accent"
                                : o.paymentStatus === "proof_submitted"
                                  ? "text-warning"
                                  : ""
                            }
                          >
                            {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(o.status)}>
                          {o.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-surface p-4 lg:sticky lg:top-28">
          {!selected ? (
            <p className="text-sm text-muted">
              Select an order to update status, tracking, and sales notes.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Managing</p>
                <h2 className="font-display text-lg font-bold">{selected.number}</h2>
              </div>

              <div className="space-y-2 rounded-xl border border-border bg-bg p-3 text-sm">
                <p>
                  <span className="text-muted">Customer: </span>
                  {selected.shippingAddress.fullName}
                </p>
                <p>
                  <span className="text-muted">Phone: </span>
                  <a
                    className="text-accent"
                    href={`tel:${selected.customerPhone ?? selected.shippingAddress.phone}`}
                  >
                    {selected.customerPhone ?? selected.shippingAddress.phone}
                  </a>
                </p>
                {selected.customerEmail ? (
                  <p>
                    <span className="text-muted">Email: </span>
                    {selected.customerEmail}
                  </p>
                ) : null}
                <p>
                  <span className="text-muted">Ship to: </span>
                  {selected.shippingAddress.address1}, {selected.shippingAddress.city},{" "}
                  {selected.shippingAddress.province} {selected.shippingAddress.postalCode}
                </p>
              </div>

              <ul className="space-y-2">
                {selected.items.map((item, i) => (
                  <li key={`${item.title}-${i}`} className="flex gap-2 text-sm">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-bg">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill className="object-cover" sizes="40px" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2">{item.title}</p>
                      <p className="text-xs text-muted">
                        ×{item.quantity} · {formatMoney(item.price)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {isPrepaidTransferMethod(selected.paymentMethod) ? (
                <div className="space-y-3 rounded-xl border border-border bg-bg p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-text">Payment proof</p>
                    <span className="text-xs text-muted">
                      {selected.paymentStatus
                        ? PAYMENT_STATUS_LABELS[selected.paymentStatus]
                        : "Awaiting payment"}
                    </span>
                  </div>
                  {selected.paymentProofUrl ? (
                    <a
                      href={selected.paymentProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="relative block h-36 w-24 overflow-hidden rounded-lg border border-border"
                    >
                      <Image
                        src={selected.paymentProofUrl}
                        alt="Payment proof"
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </a>
                  ) : (
                    <p className="text-xs text-muted">No screenshot uploaded yet.</p>
                  )}
                  {selected.paymentStatus !== "paid" ? (
                    <Button
                      className="w-full"
                      variant="secondary"
                      loading={markingPaid}
                      onClick={() => void markPaid()}
                    >
                      Mark as paid
                    </Button>
                  ) : (
                    <p className="text-xs text-accent">
                      Paid
                      {selected.paymentMarkedPaidAt
                        ? ` · ${new Date(selected.paymentMarkedPaidAt).toLocaleString("en-PK")}`
                        : ""}
                    </p>
                  )}
                </div>
              ) : null}

              <div>
                <label className="mb-1.5 block text-sm text-muted">Status</label>
                <Select
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value as OrderStatus)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-muted">Tracking number</label>
                <Input
                  value={draftTracking}
                  onChange={(e) => setDraftTracking(e.target.value)}
                  placeholder="TCS / Leopards / etc."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-muted">Sales notes</label>
                <Textarea
                  rows={3}
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  placeholder="Call attempts, COD confirmation, courier…"
                />
              </div>

              <Button className="w-full" loading={saving} onClick={() => void save()}>
                Save changes
              </Button>

              {selected.status !== "cancelled" && selected.status !== "delivered" ? (
                <Button
                  className="w-full"
                  variant="danger"
                  loading={cancelling}
                  onClick={() => void cancelOrder()}
                >
                  Cancel order
                </Button>
              ) : null}

              {selected.status === "cancelled" ? (
                <div className="rounded-xl border border-border bg-bg p-3 text-sm text-muted">
                  <p className="font-medium text-text">Cancelled</p>
                  {selected.cancelledAt ? (
                    <p className="mt-1 text-xs">
                      {new Date(selected.cancelledAt).toLocaleString("en-PK")}
                      {selected.cancelledBy ? ` · by ${selected.cancelledBy}` : ""}
                    </p>
                  ) : null}
                  {selected.cancelReason ? (
                    <p className="mt-2">{selected.cancelReason}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
