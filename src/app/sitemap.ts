import type { MetadataRoute } from "next";
import { commerce } from "@/lib/commerce";
import { SITE } from "@/lib/constants";
import { getPublishedNews } from "@/lib/admin/articles-db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [collections, page1, articles] = await Promise.all([
    commerce.getCollections(),
    commerce.getProducts({ pageSize: 100, page: 1 }),
    getPublishedNews(100),
  ]);

  const allProducts = [...page1.products];
  for (let page = 2; page <= page1.totalPages; page += 1) {
    const next = await commerce.getProducts({ pageSize: 100, page });
    allProducts.push(...next.products);
  }

  const now = new Date();
  const base = SITE.url.replace(/\/$/, "");

  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/products", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/find", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/gift-finder", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/new-arrival", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/toys-on-sale", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/toys-for-boys", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/toys-for-girls", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/baby-toys", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/die-cast-scale-models", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/remote-control", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/outdoor-play", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/swimming-pools", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/educational-toys", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/news", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/track", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "monthly" as const },
    { path: "/refund-policy", priority: 0.35, changeFrequency: "monthly" as const },
    { path: "/shipping-policy", priority: 0.4, changeFrequency: "monthly" as const },
  ].map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const gamingHandles = new Set([
    "playstation",
    "xbox",
    "nintendo",
    "games",
    "consoles",
    "accessories",
    "gift-cards",
    "pre-owned-games",
    "ps5-games",
    "ps4-games",
    "xbox-games",
    "nintendo-switch-games",
  ]);

  const categoryRoutes = collections
    .filter((c) => !gamingHandles.has(c.handle))
    .map((c) => ({
      url: `${base}/${c.handle}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const productRoutes = allProducts.map((p) => ({
    url: `${base}/product/${p.handle}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${base}/news/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.55,
  }));

  const seen = new Set<string>();
  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...articleRoutes].filter(
    (entry) => {
      if (seen.has(entry.url)) return false;
      seen.add(entry.url);
      return true;
    },
  );
}
