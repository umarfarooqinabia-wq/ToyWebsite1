import { demoProvider } from "@/lib/commerce/demo-provider";
import { shopifyProvider } from "@/lib/commerce/shopify-provider";
import { toycompanyProvider } from "@/lib/commerce/toycompany-provider";
import type { CommerceProvider } from "@/lib/commerce/types";

/**
 * Commerce facade — swap backends via COMMERCE_PROVIDER without touching UI.
 * Supported: "toycompany" | "demo" | "shopify"
 */
export function getCommerceProvider(): CommerceProvider {
  const provider = process.env.COMMERCE_PROVIDER ?? "toycompany";
  if (provider === "shopify") return shopifyProvider;
  if (provider === "demo") return demoProvider;
  return toycompanyProvider;
}

export const commerce = {
  getProducts: (...args: Parameters<CommerceProvider["getProducts"]>) =>
    getCommerceProvider().getProducts(...args),
  getProductByHandle: (...args: Parameters<CommerceProvider["getProductByHandle"]>) =>
    getCommerceProvider().getProductByHandle(...args),
  getFeaturedProducts: (...args: Parameters<CommerceProvider["getFeaturedProducts"]>) =>
    getCommerceProvider().getFeaturedProducts(...args),
  getBestSellers: (...args: Parameters<CommerceProvider["getBestSellers"]>) =>
    getCommerceProvider().getBestSellers(...args),
  getNewArrivals: (...args: Parameters<CommerceProvider["getNewArrivals"]>) =>
    getCommerceProvider().getNewArrivals(...args),
  getDeals: (...args: Parameters<CommerceProvider["getDeals"]>) =>
    getCommerceProvider().getDeals(...args),
  getRelatedProducts: (...args: Parameters<CommerceProvider["getRelatedProducts"]>) =>
    getCommerceProvider().getRelatedProducts(...args),
  getCollections: (...args: Parameters<CommerceProvider["getCollections"]>) =>
    getCommerceProvider().getCollections(...args),
  getCollectionByHandle: (...args: Parameters<CommerceProvider["getCollectionByHandle"]>) =>
    getCommerceProvider().getCollectionByHandle(...args),
  searchSuggestions: (...args: Parameters<CommerceProvider["searchSuggestions"]>) =>
    getCommerceProvider().searchSuggestions(...args),
  getNews: (...args: Parameters<CommerceProvider["getNews"]>) =>
    getCommerceProvider().getNews(...args),
  getProductReviews: (...args: Parameters<CommerceProvider["getProductReviews"]>) =>
    getCommerceProvider().getProductReviews(...args),
};
