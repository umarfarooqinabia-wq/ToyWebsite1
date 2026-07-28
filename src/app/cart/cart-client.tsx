"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, cartSubtotal, cartShipping, cartTotal } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { formatMoney, freeShippingProgress, freeShippingRemaining } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/utils";

export function CartClient() {
  const lines = useCartStore((s) => s.lines);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const wishlistAdd = useWishlistStore((s) => s.add);

  const subtotal = cartSubtotal(lines);
  const shipping = cartShipping(lines);
  const total = cartTotal(lines);

  if (lines.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse consoles, games, and accessories to start building your setup."
        action={
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        }
      />
    );
  }

  const remaining = freeShippingRemaining(subtotal.amount);
  const progress = freeShippingProgress(subtotal.amount);
  const hasUnavailable = lines.some((l) => l.maxQuantity <= 0 || l.quantity > l.maxQuantity);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm text-muted">
            {remaining > 0
              ? `Add ${formatMoney({ amount: remaining, currencyCode: "PKR" })} more to unlock free shipping.`
              : "You've unlocked free shipping!"}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-subtle">
            Free shipping threshold: {formatMoney({ amount: FREE_SHIPPING_THRESHOLD, currencyCode: "PKR" })}
          </p>
        </div>

        {lines.map((line) => (
          <article
            key={line.id}
            className="flex min-w-0 gap-3 rounded-2xl border border-border bg-surface p-3 sm:gap-4 sm:p-4"
          >
            <Link href={`/product/${line.handle}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
              <Image src={line.image} alt={line.title} fill className="object-cover" sizes="96px" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-subtle">{line.brand}</p>
                  <Link href={`/product/${line.handle}`} className="line-clamp-2 break-words font-medium hover:text-accent">
                    {line.title}
                  </Link>
                </div>
                <p className="shrink-0 font-display font-bold">{formatMoney(line.price)}</p>
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-3">
                <div className="flex h-9 items-center rounded-lg border border-border">
                  <button
                    type="button"
                    className="px-2"
                    aria-label="Decrease"
                    onClick={() => updateQuantity(line.id, line.quantity - 1)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm tabular-nums">{line.quantity}</span>
                  <button
                    type="button"
                    className="px-2"
                    aria-label="Increase"
                    onClick={() => updateQuantity(line.id, line.quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
                  onClick={() => {
                    wishlistAdd({
                      id: line.productId,
                      handle: line.handle,
                      title: line.title,
                      brand: line.brand,
                      description: "",
                      category: "",
                      categoryPath: [],
                      platform: [],
                      tags: [],
                      condition: "new",
                      rating: 0,
                      reviewCount: 0,
                      images: [{ url: line.image, alt: line.title }],
                      variants: [
                        {
                          id: line.variantId,
                          title: "Default",
                          sku: "",
                          price: line.price,
                          compareAtPrice: line.compareAtPrice,
                          available: true,
                          quantityAvailable: line.maxQuantity,
                        },
                      ],
                      specs: [],
                      compatibility: [],
                      createdAt: new Date().toISOString(),
                    });
                  }}
                >
                  <Heart className="h-3.5 w-3.5" /> Wishlist
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-danger"
                  onClick={() => removeItem(line.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-28">
        <h2 className="font-display text-lg font-semibold">Order Summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd>{shipping.amount === 0 ? "Free" : formatMoney(shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Discount</dt>
            <dd>{formatMoney({ amount: 0, currencyCode: "PKR" })}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-display text-base font-bold">
            <dt>Total</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
        </dl>
        {hasUnavailable ? (
          <p className="mt-4 text-sm text-danger">
            Some items are out of stock or exceed available quantity. Update your cart
            before checkout.
          </p>
        ) : null}
        <Link
          href={hasUnavailable ? "#" : "/checkout"}
          className="mt-6 block"
          onClick={(e) => {
            if (hasUnavailable) e.preventDefault();
          }}
        >
          <Button className="w-full" size="lg" disabled={hasUnavailable}>
            Proceed to Checkout
          </Button>
        </Link>
        <Link href="/products" className="mt-3 block">
          <Button variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </aside>
    </div>
  );
}
