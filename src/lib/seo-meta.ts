import { SITE } from "@/lib/constants";
import type { Product } from "@/types/commerce";
import { stripEmojis } from "@/lib/utils";

/** Absolute URL helper for metadata / JSON-LD. */
export function absoluteUrl(path = "/") {
  const base = SITE.url.replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function stripForSeo(text: string, max = 160): string {
  const cleaned = stripEmojis(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

export function productSeoTitle(product: Pick<Product, "title" | "brand">) {
  const brand =
    product.brand && product.brand !== SITE.name ? ` by ${product.brand}` : "";
  return `${product.title}${brand} | Buy Online in Pakistan`;
}

/**
 * Meta description for toy product pages.
 */
export function productSeoDescription(
  product: Pick<
    Product,
    "title" | "description" | "brand" | "condition" | "tags" | "category"
  >,
) {
  const base = stripForSeo(product.description || product.title, 110);

  const condition =
    product.condition === "pre-owned"
      ? "Pre-owned"
      : product.condition === "refurbished"
        ? "Refurbished"
        : "New";

  const category = product.category?.replace(/-/g, " ").trim();
  const categoryHint = category && category !== "default" && category !== "toys"
    ? ` ${category}`
    : " toy";

  const tail = ` ${condition}${categoryHint} at ${SITE.name}. COD & nationwide delivery in Pakistan.`;
  return stripForSeo(`${base}${tail}`, 160);
}

/** Meta keywords for toy product pages. */
export function productSeoKeywords(
  product: Pick<
    Product,
    "title" | "brand" | "tags" | "condition" | "category"
  >,
): string[] {
  const displayTitle = product.title.trim();
  const condition =
    product.condition === "pre-owned"
      ? "used"
      : product.condition === "refurbished"
        ? "refurbished"
        : "new";
  const category = product.category?.replace(/-/g, " ") ?? "toys";
  const tagWords = (product.tags ?? [])
    .filter((t) => t && t !== "toycompany" && !t.includes(":"))
    .slice(0, 6);

  const keywords = [
    displayTitle,
    product.brand,
    category,
    `buy ${displayTitle} Pakistan`,
    `${displayTitle} online`,
    `${displayTitle} ${SITE.name}`,
    condition === "used" ? `used ${displayTitle}` : `${condition} ${displayTitle}`,
    "kids toys Pakistan",
    "buy toys online Pakistan",
    "Cash on Delivery toys",
    SITE.name,
    "COD Pakistan",
    ...tagWords,
  ]
    .map((k) => k.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const k of keywords) {
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(k);
  }
  return unique.slice(0, 24);
}

export function categorySeoTitle(title: string) {
  return `${title} | Shop Online in Pakistan`;
}

export function categorySeoDescription(title: string, description?: string) {
  const base = description?.trim()
    ? stripForSeo(description, 110)
    : `Browse ${title} at ${SITE.name}.`;
  return stripForSeo(
    `${base} Quality toys, COD available, and nationwide delivery across Pakistan.`,
    160,
  );
}

export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE.name} — ${SITE.tagline}`,
} as const;
