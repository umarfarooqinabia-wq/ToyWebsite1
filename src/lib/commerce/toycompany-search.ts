import {
  mapAjaxProduct,
  toycompanyFetch,
  type ShopifyAjaxProduct,
} from "@/lib/commerce/toycompany-client";
import type { Product, SearchSuggestion } from "@/types/commerce";

interface SuggestProduct {
  id?: number;
  handle: string;
  title: string;
  url?: string;
  price?: string | number;
  image?: string;
  featured_image?: { url?: string };
  vendor?: string;
  available?: boolean;
  body?: string;
  tags?: string[];
}

interface SuggestResponse {
  resources?: {
    results?: {
      products?: SuggestProduct[];
      collections?: { handle: string; title: string }[];
    };
  };
}

/** Levenshtein distance for short typo tolerance. */
export function editDistance(a: string, b: string): number {
  const s = a.toLowerCase();
  const t = b.toLowerCase();
  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const prev = new Array<number>(t.length + 1);
  const cur = new Array<number>(t.length + 1);
  for (let j = 0; j <= t.length; j++) prev[j] = j;
  for (let i = 1; i <= s.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1]! + 1, prev[j]! + 1, prev[j - 1]! + cost);
    }
    for (let j = 0; j <= t.length; j++) prev[j] = cur[j]!;
  }
  return prev[t.length]!;
}

/** Simple typo-aware match: substring OR close token edit distance. */
export function fuzzyMatches(haystack: string, query: string): boolean {
  const h = haystack.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return true;
  if (h.includes(q)) return true;

  const hTokens = h.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  const qTokens = q.split(/[^a-z0-9]+/).filter(Boolean);
  if (!qTokens.length) return false;

  return qTokens.every((qt) => {
    if (h.includes(qt)) return true;
    const maxDist = qt.length <= 4 ? 1 : qt.length <= 7 ? 2 : 3;
    return hTokens.some((ht) => {
      if (Math.abs(ht.length - qt.length) > maxDist) return false;
      return editDistance(ht, qt) <= maxDist;
    });
  });
}

export function scoreProductMatch(product: Product, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const title = product.title.toLowerCase();
  const tags = product.tags.join(" ").toLowerCase();
  let score = 0;
  if (title === q) score += 100;
  if (title.startsWith(q)) score += 50;
  if (title.includes(q)) score += 30;
  if (tags.includes(q)) score += 15;
  if (product.handle.includes(q.replace(/\s+/g, "-"))) score += 20;
  if (fuzzyMatches(`${title} ${tags} ${product.brand}`, q)) score += 10;
  return score;
}

export const POPULAR_SEARCHES = [
  { label: "Diecast", q: "diecast" },
  { label: "Drift Car", q: "drift car" },
  { label: "Dolls", q: "dolls" },
  { label: "Remote Control", q: "remote control" },
  { label: "Swimming Pool", q: "swimming pool" },
  { label: "Baby Toys", q: "baby toys" },
  { label: "Scooter", q: "scooter" },
  { label: "Educational", q: "educational" },
] as const;

function suggestToProduct(item: SuggestProduct): Product {
  const imageUrl = item.featured_image?.url || item.image || "";
  const price =
    typeof item.price === "number"
      ? String(item.price)
      : String(item.price ?? "0").replace(/[^\d.]/g, "") || "0";

  const raw: ShopifyAjaxProduct = {
    id: item.id ?? Math.abs(hashCode(item.handle)),
    handle: item.handle,
    title: item.title,
    body_html: item.body ?? "",
    vendor: item.vendor ?? "ToyCompany",
    product_type: "",
    tags: item.tags ?? [],
    created_at: new Date().toISOString(),
    variants: [
      {
        id: (item.id ?? Math.abs(hashCode(item.handle))) + 1,
        title: "Default",
        price,
        available: item.available ?? true,
      },
    ],
    images: imageUrl ? [{ src: imageUrl, alt: item.title }] : [],
  };
  return mapAjaxProduct(raw);
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

/**
 * Live Shopify predictive search — covers the full store catalog (~10k+),
 * not just locally cached product pages.
 */
export async function searchToyCompanySuggest(
  query: string,
  limit = 24,
): Promise<{ products: Product[]; collections: { handle: string; title: string }[] }> {
  const q = query.trim();
  if (!q) return { products: [], collections: [] };

  const params = new URLSearchParams({
    q,
    "resources[type]": "product,collection",
    "resources[limit]": String(Math.min(Math.max(limit, 1), 10)),
    "resources[options][unavailable_products]": "last",
    "resources[options][fields]": "title,product_type,variants.title,vendor,tag",
  });

  try {
    const data = await toycompanyFetch<SuggestResponse>(
      `/search/suggest.json?${params.toString()}`,
    );
    const products = (data.resources?.results?.products ?? []).map(suggestToProduct);
    const collections = (data.resources?.results?.collections ?? []).map((c) => ({
      handle: c.handle,
      title: c.title,
    }));
    return { products, collections };
  } catch (err) {
    console.error("[toycompany] suggest search failed", err);
    return { products: [], collections: [] };
  }
}

export async function searchSuggestionsFromStore(
  query: string,
  limit = 8,
): Promise<SearchSuggestion[]> {
  const { products, collections } = await searchToyCompanySuggest(query, Math.min(limit, 10));
  const productSuggestions: SearchSuggestion[] = products.slice(0, limit).map((p) => ({
    type: "product" as const,
    label: p.title,
    href: `/product/${p.handle}`,
    image: p.images[0]?.url,
  }));
  const categorySuggestions: SearchSuggestion[] = collections.slice(0, 3).map((c) => ({
    type: "category" as const,
    label: c.title,
    href: `/${c.handle}`,
  }));
  return [...productSuggestions, ...categorySuggestions].slice(0, limit);
}

/** Generate close typo variants to retry when the first query is empty. */
export function typoVariants(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (q.length < 4) return [];
  const variants = new Set<string>();
  // swap adjacent
  for (let i = 0; i < q.length - 1; i++) {
    const chars = q.split("");
    [chars[i], chars[i + 1]] = [chars[i + 1]!, chars[i]!];
    variants.add(chars.join(""));
  }
  // drop one char
  for (let i = 0; i < q.length; i++) {
    variants.add(q.slice(0, i) + q.slice(i + 1));
  }
  return [...variants].slice(0, 6);
}
