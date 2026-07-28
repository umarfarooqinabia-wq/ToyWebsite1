"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CompareItem, Product } from "@/types/commerce";
import { getProductPrice } from "@/lib/utils";

const MAX_COMPARE = 4;

interface CompareState {
  items: CompareItem[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  toggle: (product: Product) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

function toCompareItem(product: Product): CompareItem {
  const { price } = getProductPrice(product);
  return {
    productId: product.id,
    handle: product.handle,
    title: product.title,
    brand: product.brand,
    image: product.images[0]?.url ?? "",
    price,
    platform: product.platform,
    compatibility: product.compatibility,
    rating: product.rating,
    specs: product.specs,
    features: product.tags,
  };
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => {
        if (get().has(product.id)) return;
        const items = get().items;
        if (items.length >= MAX_COMPARE) {
          set({ items: [...items.slice(1), toCompareItem(product)] });
          return;
        }
        set({ items: [...items, toCompareItem(product)] });
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
    { name: "toycompany-compare" },
  ),
);
