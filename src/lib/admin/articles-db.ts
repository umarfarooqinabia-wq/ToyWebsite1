import type { NewsArticle } from "@/types/commerce";
import { readJson, writeJson } from "@/lib/admin/json-store";
import { slugify } from "@/lib/utils";
import {
  buildSeoChecklist,
  CONTENT_TYPES,
  contentTypeMeta,
  type ContentArticle,
  type ContentFaq,
  type ContentType,
} from "@/lib/admin/content-types";

export {
  buildSeoChecklist,
  CONTENT_TYPES,
  type ContentArticle,
  type ContentFaq,
  type ContentType,
  type SeoChecklistItem,
} from "@/lib/admin/content-types";

type Store = { articles: ContentArticle[] };

const ARTICLES_FILE = "articles.json";

function normalizeArticle(raw: Partial<ContentArticle> & { category?: string }): ContentArticle {
  const contentType = (raw.contentType ??
    (raw.category === "reviews"
      ? "review"
      : raw.category === "guides"
        ? "guide"
        : raw.category === "releases"
          ? "article"
          : "news")) as ContentType;
  const meta = contentTypeMeta(contentType);
  const relatedGame = (raw.relatedGame ?? "").trim();
  return {
    id: raw.id ?? `article-${Date.now().toString(36)}`,
    slug: raw.slug ?? "untitled",
    title: raw.title ?? "Untitled",
    excerpt: raw.excerpt ?? "",
    body: raw.body ?? "",
    contentType,
    category: meta.category,
    image:
      raw.image ??
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=80",
    imageAlt: raw.imageAlt ?? raw.title ?? "",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    relatedGame,
    relatedGameSlug: raw.relatedGameSlug || (relatedGame ? slugify(relatedGame) : ""),
    productHandles: Array.isArray(raw.productHandles) ? raw.productHandles : [],
    relatedArticleSlugs: Array.isArray(raw.relatedArticleSlugs)
      ? raw.relatedArticleSlugs
      : [],
    seoTitle: raw.seoTitle ?? "",
    metaDescription: raw.metaDescription ?? "",
    focusKeyword: raw.focusKeyword ?? "",
    faq: Array.isArray(raw.faq) ? raw.faq : [],
    published: raw.published !== false,
    featured: Boolean(raw.featured),
    publishedAt: raw.publishedAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

async function readStore(): Promise<Store> {
  try {
    const parsed = await readJson<Store>(ARTICLES_FILE);
    if (!parsed) return { articles: [] };
    const articles = Array.isArray(parsed.articles)
      ? parsed.articles.map((a) => normalizeArticle(a))
      : [];
    return { articles };
  } catch {
    return { articles: [] };
  }
}

/** CMS/admin articles plus catalog SEO seed (admin wins on slug collision). */
async function readMergedArticles(): Promise<ContentArticle[]> {
  const store = await readStore();
  const { SEO_ARTICLES } = await import("@/lib/commerce/seo-articles");
  const bySlug = new Map<string, ContentArticle>();
  for (const raw of SEO_ARTICLES) {
    bySlug.set(raw.slug, normalizeArticle(raw));
  }
  for (const article of store.articles) {
    const seo = bySlug.get(article.slug);
    if (seo) {
      const usingPackImage =
        article.image.includes("images.unsplash.com") ||
        article.image.startsWith("/news/articles/");
      if (usingPackImage) {
        bySlug.set(article.slug, {
          ...article,
          image: seo.image,
          imageAlt: seo.imageAlt || article.imageAlt,
        });
        continue;
      }
    }
    bySlug.set(article.slug, article);
  }
  return [...bySlug.values()];
}

/**
 * Persist missing SEO seed articles into articles.json so they appear in Admin CMS.
 * Does not overwrite existing article bodies; refreshes featured images for matching slugs.
 */
export async function seedSeoArticlesToStore(): Promise<{ added: number; total: number }> {
  const store = await readStore();
  const { SEO_ARTICLES } = await import("@/lib/commerce/seo-articles");
  const bySlug = new Map(store.articles.map((a) => [a.slug, a]));
  let added = 0;
  for (const raw of SEO_ARTICLES) {
    const normalized = normalizeArticle(raw);
    const existing = bySlug.get(normalized.slug);
    if (!existing) {
      store.articles.push(normalized);
      bySlug.set(normalized.slug, normalized);
      added += 1;
      continue;
    }
    // Keep CMS edits, but refresh pack artwork + SEO image alt when still using seed IDs
    // or when the image still points at Unsplash placeholders.
    const usingPackImage =
      existing.image.includes("images.unsplash.com") ||
      existing.image.startsWith("/news/articles/");
    if (usingPackImage) {
      existing.image = normalized.image;
      existing.imageAlt = normalized.imageAlt || existing.imageAlt;
      existing.updatedAt = new Date().toISOString();
    }
  }
  await writeStore(store);
  return { added, total: store.articles.length };
}

async function writeStore(store: Store) {
  await writeJson(ARTICLES_FILE, store);
}

function uniqueSlug(base: string, existing: ContentArticle[], exceptId?: string) {
  let slug = slugify(base) || `article-${Date.now()}`;
  let n = 1;
  while (existing.some((a) => a.slug === slug && a.id !== exceptId)) {
    slug = `${slugify(base)}-${n}`;
    n += 1;
  }
  return slug;
}

export async function listArticles(options?: {
  publishedOnly?: boolean;
  contentType?: ContentType;
  gameSlug?: string;
  /** When true, only articles persisted in CMS storage (skip SEO seed merge). */
  storedOnly?: boolean;
}): Promise<ContentArticle[]> {
  let list = options?.storedOnly
    ? [...(await readStore()).articles]
    : await readMergedArticles();
  if (options?.publishedOnly) list = list.filter((a) => a.published !== false);
  if (options?.contentType) list = list.filter((a) => a.contentType === options.contentType);
  if (options?.gameSlug) {
    const g = options.gameSlug.toLowerCase();
    list = list.filter(
      (a) =>
        a.relatedGameSlug === g ||
        a.tags.some((t) => slugify(t) === g) ||
        a.focusKeyword.toLowerCase().includes(g.replace(/-/g, " ")),
    );
  }
  return list.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function listGameHubSlugs(): Promise<string[]> {
  const all = await listArticles({ publishedOnly: true });
  return [...new Set(all.map((a) => a.relatedGameSlug).filter(Boolean))];
}

export async function getArticleBySlug(slug: string): Promise<ContentArticle | null> {
  const articles = await readMergedArticles();
  return articles.find((a) => a.slug === slug) ?? null;
}

export async function getArticleById(id: string): Promise<ContentArticle | null> {
  const articles = await readMergedArticles();
  return articles.find((a) => a.id === id) ?? null;
}

export async function getArticlesForProduct(handle: string, limit = 6) {
  const all = await listArticles({ publishedOnly: true });
  return all
    .filter(
      (a) =>
        a.productHandles.includes(handle) || a.body.includes(`/product/${handle}`),
    )
    .slice(0, limit);
}

export async function getRelatedArticles(article: ContentArticle, limit = 4) {
  const all = await listArticles({ publishedOnly: true });
  const bySlug = new Set(article.relatedArticleSlugs);
  const scored = all
    .filter((a) => a.id !== article.id)
    .map((a) => {
      let score = 0;
      if (bySlug.has(a.slug)) score += 10;
      if (article.relatedGameSlug && a.relatedGameSlug === article.relatedGameSlug) score += 5;
      if (article.contentType === a.contentType) score += 1;
      const sharedTags = a.tags.filter((t) => article.tags.includes(t)).length;
      score += sharedTags * 2;
      const sharedProducts = a.productHandles.filter((h) =>
        article.productHandles.includes(h),
      ).length;
      score += sharedProducts * 3;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score);
  return scored.slice(0, limit).map((x) => x.a);
}

export type UpsertArticleInput = {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  body?: string;
  contentType: ContentType;
  image: string;
  imageAlt?: string;
  tags?: string[];
  relatedGame?: string;
  productHandles?: string[];
  relatedArticleSlugs?: string[];
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  faq?: ContentFaq[];
  published?: boolean;
  featured?: boolean;
  publishedAt?: string;
};

export async function upsertArticle(
  input: UpsertArticleInput,
): Promise<ContentArticle> {
  const store = await readStore();
  const now = new Date().toISOString();
  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  const body = (input.body ?? "").trim();
  const image =
    input.image.trim() ||
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=80";
  const handles = [
    ...new Set((input.productHandles ?? []).map((h) => h.trim()).filter(Boolean)),
  ];
  const relatedArticleSlugs = [
    ...new Set((input.relatedArticleSlugs ?? []).map((s) => s.trim()).filter(Boolean)),
  ];
  const tags = [
    ...new Set((input.tags ?? []).map((t) => t.trim()).filter(Boolean)),
  ];
  const relatedGame = (input.relatedGame ?? "").trim();
  const meta = contentTypeMeta(input.contentType);
  const faq = (input.faq ?? [])
    .map((f) => ({
      question: f.question.trim(),
      answer: f.answer.trim(),
    }))
    .filter((f) => f.question && f.answer);

  if (input.id) {
    const idx = store.articles.findIndex((a) => a.id === input.id);
    const slug = uniqueSlug(
      input.slug?.trim() || title,
      store.articles,
      input.id,
    );
    const next = normalizeArticle({
      id: input.id,
      title,
      slug,
      excerpt,
      body,
      contentType: input.contentType,
      category: meta.category,
      image,
      imageAlt: (input.imageAlt ?? title).trim(),
      tags,
      relatedGame,
      relatedGameSlug: relatedGame ? slugify(relatedGame) : "",
      productHandles: handles,
      relatedArticleSlugs,
      seoTitle: (input.seoTitle ?? "").trim(),
      metaDescription: (input.metaDescription ?? "").trim(),
      focusKeyword: (input.focusKeyword ?? "").trim(),
      faq,
      published: input.published ?? (idx >= 0 ? store.articles[idx]!.published : true),
      featured: input.featured ?? (idx >= 0 ? store.articles[idx]!.featured : false),
      publishedAt:
        input.publishedAt?.trim() ||
        (idx >= 0 ? store.articles[idx]!.publishedAt : now),
      updatedAt: now,
    });
    if (idx >= 0) {
      store.articles[idx] = next;
    } else {
      // Promote seed / external article into durable CMS storage.
      store.articles.unshift(next);
    }
    await writeStore(store);
    return next;
  }

  const slug = uniqueSlug(input.slug?.trim() || title, store.articles);
  const article = normalizeArticle({
    id: `article-${Date.now().toString(36)}`,
    title,
    slug,
    excerpt,
    body,
    contentType: input.contentType,
    category: meta.category,
    image,
    imageAlt: (input.imageAlt ?? title).trim(),
    tags,
    relatedGame,
    relatedGameSlug: relatedGame ? slugify(relatedGame) : "",
    productHandles: handles,
    relatedArticleSlugs,
    seoTitle: (input.seoTitle ?? "").trim(),
    metaDescription: (input.metaDescription ?? "").trim(),
    focusKeyword: (input.focusKeyword ?? "").trim(),
    faq,
    published: input.published ?? false,
    featured: input.featured ?? false,
    publishedAt: input.publishedAt?.trim() || now,
    updatedAt: now,
  });
  store.articles.unshift(article);
  await writeStore(store);
  return article;
}

export async function deleteArticle(id: string): Promise<boolean> {
  const store = await readStore();
  const next = store.articles.filter((a) => a.id !== id);
  if (next.length === store.articles.length) return false;
  store.articles = next;
  await writeStore(store);
  return true;
}

export function toNewsArticle(article: ContentArticle): NewsArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    image: article.image,
    publishedAt: article.publishedAt,
    body: article.body,
    productHandles: article.productHandles,
    published: article.published,
    featured: article.featured,
  };
}

/** Storefront list: featured first, then by date, then demo fillers. */
export async function getPublishedNews(limit = 12): Promise<NewsArticle[]> {
  const published = await listArticles({ publishedOnly: true });
  const { DEMO_NEWS } = await import("@/lib/commerce/demo-data");
  const knownSlugs = new Set(published.map((a) => a.slug));
  const sorted = [...published].sort((a, b) => {
    if (Boolean(a.featured) !== Boolean(b.featured)) {
      return a.featured ? -1 : 1;
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  const merged: NewsArticle[] = [
    ...sorted.map(toNewsArticle),
    ...DEMO_NEWS.filter((d) => !knownSlugs.has(d.slug)),
  ];
  return merged.slice(0, limit);
}

/** Homepage / CMS-only feed — published admin articles, no demo fillers. */
export async function getCmsHomepageArticles(limit = 8): Promise<ContentArticle[]> {
  const admin = await listArticles({ publishedOnly: true });
  return [...admin]
    .sort((a, b) => {
      if (Boolean(a.featured) !== Boolean(b.featured)) {
        return a.featured ? -1 : 1;
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    })
    .slice(0, limit);
}
