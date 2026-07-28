"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/commerce";
import { getProductPrice } from "@/lib/utils";

interface RecentItem {
  productId: string;
  handle: string;
  title: string;
  image: string;
  price: number;
  currencyCode: string;
}

interface RecentlyViewedState {
  items: RecentItem[];
  add: (product: Product) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => {
        const { price } = getProductPrice(product);
        const next: RecentItem = {
          productId: product.id,
          handle: product.handle,
          title: product.title,
          image: product.images[0]?.url ?? "",
          price: price.amount,
          currencyCode: price.currencyCode,
        };
        const filtered = get().items.filter((i) => i.productId !== product.id);
        set({ items: [next, ...filtered].slice(0, 8) });
      },
    }),
    { name: "toycompany-recent" },
  ),
);
