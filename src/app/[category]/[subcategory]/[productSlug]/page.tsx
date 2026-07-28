import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { redirectMissingProduct } from "@/lib/safe-routes";
import { productSeoDescription, productSeoKeywords, productSeoTitle } from "@/lib/seo-meta";

type Params = Promise<{ category: string; subcategory: string; productSlug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { productSlug } = await params;
  const product = await commerce.getProductByHandle(productSlug);
  if (!product) return { title: "Searching…", robots: { index: false } };
  return {
    title: productSeoTitle(product),
    description: productSeoDescription(product),
    keywords: productSeoKeywords(product),
    alternates: { canonical: `/product/${product.handle}` },
    robots: { index: false },
  };
}

/**
 * SEO-friendly nested product URLs:
 * /playstation/ps5-games/astro-bot-ps5
 * Canonicalizes to /product/[slug] while preserving discoverable paths.
 */
export default async function NestedProductPage({ params }: { params: Params }) {
  const { productSlug } = await params;
  const product = await commerce.getProductByHandle(productSlug);
  if (!product) redirectMissingProduct(productSlug);
  redirect(`/product/${product.handle}`);
}
