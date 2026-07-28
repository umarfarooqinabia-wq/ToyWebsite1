"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Money, Product } from "@/types/commerce";
import { FREE_SHIPPING_THRESHOLD, getProductPrice } from "@/lib/utils";

export function cartSubtotal(lines: CartLine[]): Money {
  const amount = lines.reduce((sum, l) => sum + l.price.amount * l.quantity, 0);
  return { amount, currencyCode: "PKR" };
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function cartShipping(lines: CartLine[]): Money {
  const sub = cartSubtotal(lines).amount;
  return {
    amount: sub === 0 || sub >= FREE_SHIPPING_THRESHOLD ? 0 : 299,
    currencyCode: "PKR",
  };
}

export function cartTotal(lines: CartLine[]): Money {
  return {
    amount: cartSubtotal(lines).amount + cartShipping(lines).amount,
    currencyCode: "PKR",
  };
}

interface CartState {
  lines: CartLine[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addItem: (product, quantity = 1) => {
        const variant = product.variants[0];
        if (!variant) return;
        const available = Math.max(0, variant.quantityAvailable ?? 0);
        if (!variant.available || available <= 0) return;

        const { price, compareAtPrice } = getProductPrice(product);
        const existing = get().lines.find((l) => l.variantId === variant.id);
        const maxQuantity = available;

        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.variantId === variant.id
                ? {
                    ...l,
                    maxQuantity,
                    quantity: Math.min(l.quantity + quantity, maxQuantity),
                  }
                : l,
            ),
          });
          return;
        }

        const line: CartLine = {
          id: `line-${variant.id}`,
          productId: product.id,
          variantId: variant.id,
          handle: product.handle,
          title: product.title,
          brand: product.brand,
          image: product.images[0]?.url ?? "",
          price,
          compareAtPrice,
          quantity: Math.min(quantity, maxQuantity),
          maxQuantity,
        };
        set({ lines: [...get().lines, line] });
      },
      removeItem: (lineId) =>
        set({ lines: get().lines.filter((l) => l.id !== lineId) }),
      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineId);
          return;
        }
        set({
          lines: get().lines.map((l) =>
            l.id === lineId
              ? { ...l, quantity: Math.min(quantity, l.maxQuantity) }
              : l,
          ),
        });
      },
      clear: () => set({ lines: [] }),
    }),
    { name: "toycompany-cart" },
  ),
);
