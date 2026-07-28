import { slugify } from "@/lib/utils";

export const CONTENT_TYPES = [
  { value: "news", label: "Gaming News", category: "news" },
  { value: "article", label: "Game Article", category: "news" },
  { value: "story", label: "Game Story", category: "guides" },
  { value: "review", label: "Game Review", category: "reviews" },
  { value: "guide", label: "Game Guide", category: "guides" },
  { value: "buying_guide", label: "Buying Guide", category: "guides" },
  { value: "seo_page", label: "SEO Page", category: "news" },
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number]["value"];
export type ArticleCategory = "releases" | "news" | "guides" | "reviews";

export type ContentFaq = { question: string; answer: string };

export type ContentArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  contentType: ContentType;
  category: ArticleCategory;
  image: string;
  imageAlt: string;
  tags: string[];
  relatedGame: string;
  relatedGameSlug: string;
  productHandles: string[];
  relatedArticleSlugs: string[];
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  faq: ContentFaq[];
  published: boolean;
  featured: boolean;
  publishedAt: string;
  updatedAt: string;
};

export type SeoChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
};

export function contentTypeMeta(type: ContentType) {
  return CONTENT_TYPES.find((t) => t.value === type) ?? CONTENT_TYPES[0];
}

export function buildSeoChecklist(
  article: Partial<ContentArticle> & { body?: string },
): SeoChecklistItem[] {
  const body = article.body ?? "";
  const hasInternalLinks =
    /\]\(\/(product|news|games|find|gift-finder|products|remote-control|educational-toys|die-cast|outdoor|toys-|baby-|swimming)/.test(
      body,
    ) ||
    (article.productHandles?.length ?? 0) > 0 ||
    (article.relatedArticleSlugs?.length ?? 0) > 0;

  return [
    { id: "seoTitle", label: "SEO Title", ok: Boolean(article.seoTitle?.trim()) },
    {
      id: "metaDescription",
      label: "Meta Description",
      ok: Boolean(article.metaDescription?.trim()),
    },
    { id: "image", label: "Featured Image", ok: Boolean(article.image?.trim()) },
    { id: "imageAlt", label: "Image Alt Text", ok: Boolean(article.imageAlt?.trim()) },
    { id: "focusKeyword", label: "Focus Keyword", ok: Boolean(article.focusKeyword?.trim()) },
    { id: "internalLinks", label: "Internal Links", ok: hasInternalLinks },
    {
      id: "relatedProducts",
      label: "Related Products",
      ok: (article.productHandles?.length ?? 0) > 0,
    },
    {
      id: "body",
      label: "Article Body (300+ chars)",
      ok: body.trim().length >= 300,
    },
  ];
}

/** Normalize game name → hub path segment */
export function gameHubSlug(name: string) {
  return slugify(name);
}
