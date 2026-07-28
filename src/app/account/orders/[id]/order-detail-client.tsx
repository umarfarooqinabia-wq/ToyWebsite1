"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { useOrdersStore } from "@/store/orders";
import type { Order } from "@/types/commerce";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { toast } from "@/store/toast";
import { BankTransferDetails } from "@/components/checkout/bank-transfer-details";
import { OrderTrackingPanel } from "@/components/orders/order-tracking-panel";
import { isPrepaidTransferMethod, PAYMENT_PROOF_RULES } from "@/lib/bank-details";

export function OrderDetailClient({ orderId }: { orderId: string }) {
  const getOrder = useOrdersStore((s) => s.getOrder);
  const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
  const patchOrder = useOrdersStore((s) => s.patchOrder);
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => {
      setOrder(getOrder(orderId));
      setReady(true);
    };

    if (useOrdersStore.persist.hasHydrated()) {
      sync();
    }

    return useOrdersStore.persist.onFinishHydration(sync);
  }, [orderId, getOrder]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/orders/detail?id=${encodeURIComponent(orderId)}`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          order?: Partial<Order> & { id: string };
        };
        if (cancelled || !data.order) return;
        const updated = patchOrder(orderId, {
          status: data.order.status,
          trackingNumber: data.order.trackingNumber,
          paymentStatus: data.order.paymentStatus,
          paymentProofUrl: data.order.paymentProofUrl,
          paymentProofUploadedAt: data.order.paymentProofUploadedAt,
          paymentMarkedPaidAt: data.order.paymentMarkedPaidAt,
          updatedAt: data.order.updatedAt,
        });
        if (updated) setOrder(updated);
        else if (!getOrder(orderId) && data.order.id) {
          // Server has the order but local store doesn't — keep UI limited
        }
      } catch {
        /* ignore sync errors */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, orderId, patchOrder, getOrder]);

  const canCancel =
    order?.status === "placed" || order?.status === "processing";

  const cancelOrder = async () => {
    if (!order || !canCancel) return;
    if (
      !window.confirm(
        `Cancel order ${order.number}? This cannot be undone from your account.`,
      )
    ) {
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          reason: "Customer cancelled from account",
        }),
      });
      const data = (await res.json()) as { error?: string; order?: Order };
      if (!res.ok) throw new Error(data.error ?? "Cancel failed");
      const updated = updateOrderStatus(order.id, "cancelled");
      setOrder(updated ?? { ...order, status: "cancelled" });
      toast({
        tone: "success",
        title: "Order cancelled",
        description: "Your order has been cancelled successfully.",
      });
    } catch (err) {
      toast({
        tone: "error",
        title: "Could not cancel",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setCancelling(false);
    }
  };

  const uploadProof = async (file: File) => {
    if (!order) return;
    setUploadingProof(true);
    try {
      const body = new FormData();
      body.set("orderId", order.id);
      body.set("file", file);
      const res = await fetch("/api/orders/payment-proof", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { error?: string; order?: Order };
      if (!res.ok || !data.order) throw new Error(data.error ?? "Upload failed");
      const updated = patchOrder(order.id, {
        paymentStatus: data.order.paymentStatus,
        paymentProofUrl: data.order.paymentProofUrl,
        paymentProofUploadedAt: data.order.paymentProofUploadedAt,
      });
      setOrder(updated ?? { ...order, ...data.order });
      toast({
        tone: "success",
        title: "Proof uploaded",
        description: "We'll verify your payment and mark the order as paid.",
      });
    } catch (err) {
      toast({
        tone: "error",
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setUploadingProof(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!ready) {
    return (
      <div className="container-px mx-auto max-w-3xl py-8">
        <div className="skeleton h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-px mx-auto max-w-3xl py-8">
        <EmptyState
          title="Order not found"
          description={`We couldn't find order ${orderId}. Check your order history or place a new order.`}
          action={
            <Link href="/account/orders">
              <Button>View order history</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const prepaidMethod = isPrepaidTransferMethod(order.paymentMethod)
    ? order.paymentMethod
    : null;
  const paymentLabel = order.paymentStatus
    ? PAYMENT_STATUS_LABELS[order.paymentStatus]
    : null;

  return (
    <div className="container-px mx-auto max-w-3xl py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Orders", href: "/account/orders" },
          { label: order.number },
        ]}
        className="mb-6"
      />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{order.number}</h1>
          <p className="mt-1 text-muted">
            {ORDER_STATUS_LABELS[order.status]}
            {paymentLabel ? ` · ${paymentLabel}` : ""}
            {order.trackingNumber ? ` · Tracking ${order.trackingNumber}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canCancel ? (
            <Button
              variant="danger"
              size="sm"
              loading={cancelling}
              onClick={() => void cancelOrder()}
            >
              Cancel order
            </Button>
          ) : null}
          <Link href="/account/orders" className="text-sm text-accent">
            Back to orders
          </Link>
        </div>
      </div>

      {order.status !== "cancelled" ? (
        <div className="mb-8">
          <OrderTrackingPanel
            orderNumber={order.number}
            status={order.status}
            trackingNumber={order.trackingNumber}
            city={order.shippingAddress.city}
          />
        </div>
      ) : (
        <p className="mb-8 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          This order was cancelled.
        </p>
      )}

      <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        {order.items.map((item, i) => (
          <div key={i} className="flex gap-4">
            <span className="relative h-16 w-16 overflow-hidden rounded-xl">
              <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />
            </span>
            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted">
                Qty {item.quantity} · {formatMoney(item.price)}
              </p>
            </div>
          </div>
        ))}
        <dl className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatMoney(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>{formatMoney(order.shipping)}</dd>
          </div>
          <div className="flex justify-between font-bold">
            <dt>Total</dt>
            <dd>{formatMoney(order.total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Payment</dt>
            <dd className="capitalize">
              {order.paymentMethod === "bank_transfer"
                ? "Direct bank transfer"
                : order.paymentMethod === "easypaisa"
                  ? "Easypaisa"
                  : order.paymentMethod === "jazzcash"
                    ? "JazzCash"
                    : order.paymentMethod.replaceAll("_", " ")}
              {paymentLabel ? (
                <span className="mt-0.5 block text-xs font-normal normal-case text-muted">
                  {paymentLabel}
                </span>
              ) : null}
            </dd>
          </div>
        </dl>
        {prepaidMethod && order.status !== "cancelled" ? (
          <div className="space-y-4 border-t border-border pt-4">
            <BankTransferDetails
              orderNumber={order.number}
              paymentMethod={prepaidMethod}
              showUploadHint={false}
            />

            <div className="rounded-2xl border border-border bg-bg/50 p-4">
              <h3 className="font-display text-base font-semibold">
                Upload proof of payment
              </h3>
              <p className="mt-1 text-sm text-muted">
                Upload a clear screenshot of your transfer. We verify within{" "}
                {PAYMENT_PROOF_RULES.proofDeadlineHours} hours and mark the order paid.
                You can also WhatsApp {PAYMENT_PROOF_RULES.supportPhone}.
              </p>

              {order.paymentStatus === "paid" ? (
                <p className="mt-3 rounded-xl border border-accent/30 bg-accent-dim/40 px-3 py-2 text-sm font-medium text-accent">
                  Payment confirmed — thank you.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {order.paymentProofUrl ? (
                    <div className="flex flex-wrap items-start gap-3">
                      <a
                        href={order.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="relative block h-28 w-20 overflow-hidden rounded-lg border border-border"
                      >
                        <Image
                          src={order.paymentProofUrl}
                          alt="Payment proof"
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </a>
                      <p className="flex-1 text-sm text-muted">
                        Proof submitted
                        {order.paymentProofUploadedAt
                          ? ` · ${new Date(order.paymentProofUploadedAt).toLocaleString("en-PK")}`
                          : ""}
                        . You can replace it with a clearer screenshot if needed.
                      </p>
                    </div>
                  ) : null}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadProof(file);
                    }}
                  />
                  <Button
                    size="sm"
                    loading={uploadingProof}
                    onClick={() => fileRef.current?.click()}
                  >
                    {order.paymentProofUrl ? "Replace screenshot" : "Upload screenshot"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : null}
        <div className="border-t border-border pt-4 text-sm text-muted">
          <p className="font-medium text-text">Shipping to</p>
          <p className="mt-1">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.address1}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
            {order.shippingAddress.postalCode}
          </p>
        </div>
      </div>
    </div>
  );
}
