import type { ContentArticle } from "@/lib/admin/content-types";
import { TOP_50_POPULAR_TOYS_PAKISTAN } from "./top-50-popular-toys-pakistan";
import { PRODUCT_GUIDE_ARTICLES } from "./product-guides";

/** SEO articles — toy buying guides only. */
export const SEO_ARTICLES = [
  TOP_50_POPULAR_TOYS_PAKISTAN,
  ...PRODUCT_GUIDE_ARTICLES,
] as ContentArticle[];

export function getSeoArticleBySlug(slug: string): ContentArticle | undefined {
  return SEO_ARTICLES.find((a) => a.slug === slug);
}
