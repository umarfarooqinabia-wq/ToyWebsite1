"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, WishlistItem } from "@/types/commerce";
import { getProductPrice, isInStock } from "@/lib/utils";

interface WishlistState {
  items: WishlistItem[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  toggle: (product: Product) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => {
        if (get().has(product.id)) return;
        const { price, compareAtPrice } = getProductPrice(product);
        const item: WishlistItem = {
          productId: product.id,
          handle: product.handle,
          title: product.title,
          brand: product.brand,
          image: product.images[0]?.url ?? "",
          price,
          compareAtPrice,
          available: isInStock(product),
          addedAt: new Date().toISOString(),
        };
        set({ items: [...get().items, item] });
      },
      remove: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      toggle: (product) => {
        if (get().has(product.id)) get().remove(product.id);
        else get().add(product);
      },
      has: (productId) => get().items.some((i) => i.productId === productId),
      clear: () => set({ items: [] }),
    }),
    { name: "toycompany-wishlist" },
  ),
);
