import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Money, Product } from "@/types/commerce";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(money: Money, locale = "en-PK"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: money.currencyCode,
      maximumFractionDigits: 0,
    }).format(money.amount);
  } catch {
    return `${money.currencyCode} ${money.amount.toLocaleString()}`;
  }
}

export function getProductPrice(product: Product): {
  price: Money;
  compareAtPrice?: Money;
  discountPercent?: number;
} {
  const variant = product.variants[0];
  const price = variant?.price ?? { amount: 0, currencyCode: "PKR" };
  const compareAtPrice = variant?.compareAtPrice;
  let discountPercent: number | undefined;

  if (compareAtPrice && compareAtPrice.amount > price.amount) {
    discountPercent = Math.round(
      ((compareAtPrice.amount - price.amount) / compareAtPrice.amount) * 100,
    );
  }

  return { price, compareAtPrice, discountPercent };
}

export function isInStock(product: Product): boolean {
  return product.variants.some((v) => v.available && v.quantityAvailable > 0);
}

export const LOW_STOCK_THRESHOLD = 5;

export function getStockLevel(product: Product): {
  qty: number;
  inStock: boolean;
  lowStock: boolean;
} {
  const qty = product.variants.reduce(
    (sum, v) => sum + Math.max(0, v.quantityAvailable),
    0,
  );
  const inStock = product.variants.some((v) => v.available && v.quantityAvailable > 0);
  return {
    qty,
    inStock,
    lowStock: inStock && qty > 0 && qty <= LOW_STOCK_THRESHOLD,
  };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Remove emoji / pictographs from storefront copy (Shopify descriptions often include them). */
export function stripEmojis(input: string): string {
  if (!input) return input;
  return input
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\p{Emoji_Presentation}/gu, "")
    .replace(/\uFE0F/g, "")
    .replace(/\u200D/g, "")
    .replace(/^[ \t]+/gm, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const FREE_SHIPPING_THRESHOLD = 15000;

export function freeShippingRemaining(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
}

export function freeShippingProgress(subtotal: number): number {
  return Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
}
