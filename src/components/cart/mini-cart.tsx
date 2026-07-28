"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  useCartStore,
  cartSubtotal,
  cartShipping,
  cartTotal,
  cartItemCount,
} from "@/store/cart";
import { useUiStore } from "@/store/ui";
import {
  formatMoney,
  freeShippingProgress,
  freeShippingRemaining,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function MiniCart() {
  const open = useUiStore((s) => s.miniCartOpen);
  const close = useUiStore((s) => s.closeMiniCart);
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const count = cartItemCount(lines);
  const subtotal = cartSubtotal(lines);
  const shipping = cartShipping(lines);
  const total = cartTotal(lines);
  const remaining = freeShippingRemaining(subtotal.amount);
  const progress = freeShippingProgress(subtotal.amount);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close cart"
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-bg-elevated shadow-2xl animate-fade-up"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Your cart</h2>
            <p className="text-xs text-muted">
              {count} {count === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border transition hover:border-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface">
              <ShoppingBag className="h-7 w-7 text-muted" />
            </div>
            <div>
              <p className="font-display font-semibold">Cart is empty</p>
              <p className="mt-1 text-sm text-muted">
                Add games, consoles, or accessories to get started.
              </p>
            </div>
            <Link href="/products" onClick={close}>
              <Button>Browse products</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-4 py-3">
              <p className="text-xs text-muted">
                {remaining > 0
                  ? `Add ${formatMoney({ amount: remaining, currencyCode: "PKR" })} for free shipping`
                  : "Free shipping unlocked"}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 space-y-3 overflow-auto px-4 py-4">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-3 rounded-xl border border-border bg-surface p-3"
                >
                  <Link
                    href={`/product/${line.handle}`}
                    onClick={close}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"
                  >
                    <Image
                      src={line.image}
                      alt={line.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${line.handle}`}
                      onClick={close}
                      className="line-clamp-2 text-sm font-medium hover:text-accent"
                    >
                      {line.title}
                    </Link>
                    <p className="mt-0.5 text-sm font-display font-bold">
                      {formatMoney(line.price)}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex h-8 items-center rounded-lg border border-border">
                        <button
                          type="button"
                          className="px-2"
                          aria-label="Decrease"
                          onClick={() =>
                            updateQuantity(line.id, line.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="px-2"
                          aria-label="Increase"
                          onClick={() =>
                            updateQuantity(line.id, line.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label="Remove"
                        className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                        onClick={() => removeItem(line.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-border bg-bg/80 px-4 py-4">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Shipping</span>
                <span>
                  {shipping.amount === 0 ? "Free" : formatMoney(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-display text-base font-bold">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
              <div className="grid gap-2 pt-1">
                <Link href="/checkout" onClick={close}>
                  <Button className="w-full">Checkout</Button>
                </Link>
                <Link href="/cart" onClick={close}>
                  <Button variant="outline" className="w-full">
                    View full cart
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
