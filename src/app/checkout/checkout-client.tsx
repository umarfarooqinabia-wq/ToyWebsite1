"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { PAYMENT_METHODS } from "@/lib/constants";
import { useCartStore, cartSubtotal, cartShipping, cartTotal } from "@/store/cart";
import { useOrdersStore } from "@/store/orders";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/states";
import { BankTransferDetails } from "@/components/checkout/bank-transfer-details";
import { isPrepaidTransferMethod } from "@/lib/bank-details";
import { sendOwnerOrderAlertFromBrowser } from "@/lib/notifications/web3forms-client";
import type { PaymentMethod } from "@/types/commerce";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Phone number required"),
  address: z.string().min(5, "Address required"),
  city: z.string().min(2, "City required"),
  province: z.string().min(2, "Province required"),
  postalCode: z.string().min(4, "Postal code required"),
  paymentMethod: z.string().min(1),
});

export function CheckoutClient() {
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const placeOrder = useOrdersStore((s) => s.placeOrder);
  const { user } = useCurrentUser();
  const subtotal = cartSubtotal(lines);
  const shipping = cartShipping(lines);
  const total = cartTotal(lines);
  const didPrefill = useRef(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    paymentMethod: "cod" as PaymentMethod,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [placedPayment, setPlacedPayment] = useState<PaymentMethod | null>(null);
  const [placedTotal, setPlacedTotal] = useState<{
    amount: number;
    currencyCode: string;
  } | null>(null);
  const [alertHints, setAlertHints] = useState<{
    customerEmail?: boolean;
    ownerEmail?: boolean;
  }>({});
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonMethod, setComingSoonMethod] = useState("");

  const showComingSoon = (label: string) => {
    setComingSoonMethod(label);
    setComingSoonOpen(true);
  };

  useEffect(() => {
    if (!user || didPrefill.current) return;
    didPrefill.current = true;
    const primary =
      user.addresses.find((a) => a.isDefault) ?? user.addresses[0];
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || user.fullName || "",
      email: prev.email || user.email || "",
      phone: prev.phone || user.phone || "",
      address: prev.address || primary?.address1 || "",
      city: prev.city || primary?.city || "",
      province: prev.province || primary?.province || "",
      postalCode: prev.postalCode || primary?.postalCode || "",
    }));
  }, [user]);

  if (orderId) {
    const prepaid =
      placedPayment && isPrepaidTransferMethod(placedPayment) ? placedPayment : null;
    const paymentTitle =
      prepaid === "bank_transfer"
        ? "Direct bank transfer"
        : prepaid === "easypaisa"
          ? "Easypaisa"
          : prepaid === "jazzcash"
            ? "JazzCash"
            : (placedPayment ?? "").replaceAll("_", " ");

    return (
      <div className="mx-auto max-w-lg space-y-5">
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Order confirmed
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Thanks for your order!</h1>
          <dl className="mt-6 space-y-3 text-left text-sm">
            <div className="border-b border-border pb-3">
              <dt className="text-muted">Order number:</dt>
              <dd className="mt-0.5 font-display text-xl font-bold text-text">{orderId}</dd>
            </div>
            <div className="border-b border-border pb-3">
              <dt className="text-muted">Date:</dt>
              <dd className="mt-0.5 font-semibold text-text">
                {new Date().toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </dd>
            </div>
            {placedTotal ? (
              <div className="border-b border-border pb-3">
                <dt className="text-muted">Total:</dt>
                <dd className="mt-0.5 font-semibold text-text">{formatMoney(placedTotal)}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted">Payment method:</dt>
              <dd className="mt-0.5 font-semibold capitalize text-text">{paymentTitle}</dd>
            </div>
          </dl>
          {alertHints.customerEmail ? (
            <p className="mt-4 text-sm text-muted">
              A confirmation email was sent to your inbox with order details
              {prepaid ? " and payment instructions" : ""}.
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Save your order number. You can track this order anytime from your account.
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/account/orders/${orderId}`}>
              <Button>
                {prepaid ? "Upload payment proof" : "Track Order"}
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
        {prepaid ? (
          <BankTransferDetails orderNumber={orderId} paymentMethod={prepaid} />
        ) : null}
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        title="Nothing to checkout"
        description="Add products to your cart before checking out."
        action={
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        }
      />
    );
  }

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        next[String(issue.path[0])] = issue.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    if (form.paymentMethod === "stripe" || form.paymentMethod === "card") {
      showComingSoon(
        form.paymentMethod === "stripe" ? "Stripe" : "Credit / Debit Card",
      );
      return;
    }
    if (lines.some((l) => l.maxQuantity <= 0 || l.quantity > l.maxQuantity)) {
      setErrors({
        form: "A cart item is out of stock or exceeds available quantity. Update your cart.",
      });
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          lines: lines.map((l) => ({
            variantId: l.variantId,
            quantity: l.quantity,
            title: l.title,
            handle: l.handle,
            productId: l.productId,
          })),
        }),
      });
      const data = (await res.json()) as {
        orderId?: string;
        error?: string;
        alerts?: { customerEmail?: boolean; ownerEmail?: boolean; whatsapp?: boolean };
        totals?: {
          subtotal: { amount: number; currencyCode: string };
          shipping: { amount: number; currencyCode: string };
          total: { amount: number; currencyCode: string };
        };
      };
      if (!res.ok || !data.orderId) throw new Error(data.error ?? "Checkout failed");
      const confirmedOrderId = data.orderId;
      const pricedSubtotal = data.totals?.subtotal ?? subtotal;
      const pricedShipping = data.totals?.shipping ?? shipping;
      const pricedTotal = data.totals?.total ?? total;

      // Web3Forms free tier only works from the browser (server gets HTTP 403).
      const browserAlert = await sendOwnerOrderAlertFromBrowser({
        orderId: confirmedOrderId,
        customer: form,
        lines: lines.map((l) => ({
          title: l.title,
          quantity: l.quantity,
          price: l.price,
        })),
        total: pricedTotal,
      });
      if (!browserAlert.ok) {
        console.warn("[checkout] browser owner email alert failed", browserAlert);
      }

      placeOrder({
        orderId: confirmedOrderId,
        lines,
        subtotal: pricedSubtotal,
        shipping: pricedShipping,
        total: pricedTotal,
        paymentMethod: form.paymentMethod,
        customer: form,
      });
      flushSync(() => {
        setOrderId(confirmedOrderId);
        setPlacedPayment(form.paymentMethod);
        setPlacedTotal(pricedTotal);
        setAlertHints({
          customerEmail: data.alerts?.customerEmail,
          ownerEmail: browserAlert.ok || data.alerts?.ownerEmail,
        });
      });
      clear();
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Unable to place order",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-8">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">Customer Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(
              [
                ["fullName", "Full Name", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone Number", "tel"],
                ["address", "Address", "text"],
                ["city", "City", "text"],
                ["province", "Province", "text"],
                ["postalCode", "Postal Code", "text"],
              ] as const
            ).map(([key, label, type]) => (
              <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                <Label htmlFor={key}>{label}</Label>
                <Input
                  id={key}
                  type={type}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  autoComplete={key === "fullName" ? "name" : key}
                />
                {errors[key] ? (
                  <p className="mt-1 text-xs text-danger">{errors[key]}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-semibold">Payment Method</h2>
          <div className="mt-4 space-y-6">
            <div>
              <p className="mb-3 text-sm font-medium text-muted">Pakistan</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PAYMENT_METHODS.pakistan.map((m) => (
                  <label
                    key={m.id}
                    className={`cursor-pointer rounded-xl border p-3 transition ${
                      form.paymentMethod === m.id
                        ? "border-accent bg-accent-dim"
                        : "border-border hover:border-border-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="sr-only"
                      checked={form.paymentMethod === m.id}
                      onChange={() => set("paymentMethod", m.id)}
                    />
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="text-xs text-muted">{m.description}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-muted">International</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PAYMENT_METHODS.international.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => showComingSoon(m.label)}
                    className="rounded-xl border border-border p-3 text-left transition hover:border-border-strong"
                  >
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="text-xs text-muted">{m.description}</span>
                  </button>
                ))}
              </div>
            </div>
            {form.paymentMethod === "bank_transfer" ? (
              <div className="rounded-xl border border-dashed border-accent/40 bg-accent-dim/30 p-4 text-sm text-muted">
                After checkout we show Meezan / Nayapay / Easypaisa details. Transfer the
                total, use your <span className="font-semibold text-text">order number</span>{" "}
                as reference, and WhatsApp payment proof within{" "}
                <span className="font-semibold text-text">48 hours</span>. Unpaid orders may
                be cancelled after <span className="font-semibold text-text">72 hours</span>.
              </div>
            ) : null}
            {form.paymentMethod === "easypaisa" ? (
              <div className="rounded-xl border border-dashed border-accent/40 bg-accent-dim/30 p-4 text-sm text-muted">
                Send to Easypaisa <span className="font-semibold text-text">+92-3322235956</span>{" "}
                (Muhammad Umar Farooq). Use your order number as reference and WhatsApp
                proof within <span className="font-semibold text-text">48 hours</span>. Unpaid
                orders may be cancelled after{" "}
                <span className="font-semibold text-text">72 hours</span>.
              </div>
            ) : null}
            {form.paymentMethod === "jazzcash" ? (
              <div className="rounded-xl border border-dashed border-accent/40 bg-accent-dim/30 p-4 text-sm text-muted">
                Send to JazzCash <span className="font-semibold text-text">+92-3322235956</span>{" "}
                (Muhammad Umar Farooq). Use your order number as reference and WhatsApp
                proof within <span className="font-semibold text-text">48 hours</span>. Unpaid
                orders may be cancelled after{" "}
                <span className="font-semibold text-text">72 hours</span>.
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-28">
        <h2 className="font-display text-lg font-semibold">Order Summary</h2>
        <ul className="mt-4 max-h-64 space-y-3 overflow-auto">
          {lines.map((line) => (
            <li key={line.id} className="flex gap-3">
              <span className="relative h-14 w-14 overflow-hidden rounded-lg">
                <Image src={line.image} alt="" fill className="object-cover" sizes="56px" />
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="line-clamp-2 break-words">{line.title}</span>
                <span className="mt-0.5 block text-muted">
                  ×{line.quantity} · {formatMoney(line.price)}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>{shipping.amount === 0 ? "Free" : formatMoney(shipping)}</dd>
          </div>
          <div className="flex justify-between font-display text-base font-bold">
            <dt>Total</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
        </dl>
        {errors.form ? <p className="mt-3 text-sm text-danger">{errors.form}</p> : null}
        <Button type="submit" size="lg" className="mt-6 w-full" loading={submitting}>
          Place Secure Order
        </Button>
        <p className="mt-3 text-center text-xs text-subtle">
          Payments are processed securely. Never share OTPs.
        </p>
      </aside>

      {comingSoonOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setComingSoonOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="coming-soon-title"
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              Coming soon
            </p>
            <h2 id="coming-soon-title" className="mt-2 font-display text-xl font-bold">
              {comingSoonMethod || "This payment method"}
            </h2>
            <p className="mt-3 text-sm text-muted">
              This method will be available in the future. Our team is working on it.
              Please use a Pakistan payment option for now (COD, JazzCash, Easypaisa, or
              bank transfer).
            </p>
            <Button className="mt-5 w-full" onClick={() => setComingSoonOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
