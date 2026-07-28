import type {
  Collection,
  Money,
  Product,
  ProductImage,
  ProductVariant,
} from "@/types/commerce";

export const TOYCOMPANY_STORE_URL =
  process.env.TOYCOMPANY_STORE_URL?.replace(/\/$/, "") ?? "https://www.toycompany.pk";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface ShopifyAjaxImage {
  id?: number;
  src: string;
  alt?: string | null;
  width?: number;
  height?: number;
}

interface ShopifyAjaxVariant {
  id: number;
  title: string;
  sku?: string | null;
  price: string;
  compare_at_price?: string | null;
  available: boolean;
  inventory_quantity?: number;
}

export interface ShopifyAjaxProduct {
  id: number;
  handle: string;
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string[] | string;
  created_at: string;
  published_at?: string;
  variants: ShopifyAjaxVariant[];
  images: ShopifyAjaxImage[];
}

interface ShopifyAjaxCollection {
  id: number;
  handle: string;
  title: string;
  description?: string;
  image?: { src?: string; alt?: string | null } | null;
  products_count?: number;
}

function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTags(tags?: string[] | string): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => t.trim()).filter(Boolean);
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pkr(amount: number): Money {
  return { amount: Math.round(amount), currencyCode: "PKR" };
}

export async function toycompanyFetch<T>(path: string): Promise<T> {
  const url = path.startsWith("http") ? path : `${TOYCOMPANY_STORE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": UA,
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`ToyCompany fetch failed (${res.status}): ${url}`);
  }
  return res.json() as Promise<T>;
}

export function mapAjaxProduct(raw: ShopifyAjaxProduct): Product {
  const tags = normalizeTags(raw.tags);
  const images: ProductImage[] = (raw.images ?? []).map((img) => ({
    url: img.src,
    alt: img.alt || raw.title,
    width: img.width,
    height: img.height,
  }));

  const variants: ProductVariant[] = (raw.variants ?? []).map((v) => {
    const price = parseFloat(v.price) || 0;
    const compare = v.compare_at_price ? parseFloat(v.compare_at_price) : NaN;
    const shopifyQty =
      typeof v.inventory_quantity === "number" && Number.isFinite(v.inventory_quantity)
        ? Math.max(0, Math.floor(v.inventory_quantity))
        : null;
    // Prefer Shopify qty when present; otherwise keep a small sellable default
    // so OOS Shopify flags don't empty the storefront. Admin stock overrides
    // (cd-inventory) win later via applyStockOverrides.
    const quantityAvailable = shopifyQty ?? 2;
    return {
      id: String(v.id),
      title: v.title || "Default",
      sku: v.sku ?? "",
      price: pkr(price),
      compareAtPrice: Number.isFinite(compare) && compare > price ? pkr(compare) : undefined,
      available: quantityAvailable > 0,
      quantityAvailable,
    };
  });

  const typeSlug = slugify(raw.product_type || tags[0] || "toys");
  const tagSlugs = tags.map(slugify);
  const html = raw.body_html ?? "";
  const description = stripHtml(html) || raw.title;
  const onDeal = variants.some(
    (v) => v.compareAtPrice && v.compareAtPrice.amount > v.price.amount,
  );

  return {
    id: `tc-${raw.id}`,
    handle: raw.handle,
    title: raw.title,
    brand: raw.vendor?.trim() || "ToyCompany",
    description,
    descriptionHtml: html || undefined,
    category: typeSlug || "toys",
    categoryPath: [typeSlug || "toys", ...tagSlugs.slice(0, 4)],
    platform: [],
    tags: [...tags, ...tagSlugs, "toycompany"],
    condition: tags.some((t) => /pre-?owned|used|damaged/i.test(t)) ? "pre-owned" : "new",
    rating: 4.6,
    reviewCount: 0,
    images,
    variants,
    specs: [],
    compatibility: [],
    featured: tags.some((t) => /featured|trending|best/i.test(t)),
    bestSeller: tags.some((t) => /best.?seller|trending/i.test(t)),
    newArrival: tags.some((t) => /new.?arrival/i.test(t)),
    onDeal: onDeal || tags.some((t) => /sale|clearance|stock-on-sale/i.test(t)),
    shippingInfo: "Nationwide delivery across Pakistan. Free shipping on orders over Rs 4,999.",
    createdAt: raw.created_at || raw.published_at || new Date().toISOString(),
  };
}

export function mapAjaxCollection(raw: ShopifyAjaxCollection): Collection {
  return {
    id: `tc-col-${raw.id}`,
    handle: raw.handle,
    title: raw.title,
    description: stripHtml(raw.description ?? "") || raw.title,
    image: raw.image?.src,
    seoTitle: `${raw.title} | ToyCompany`,
    seoDescription:
      stripHtml(raw.description ?? "").slice(0, 155) ||
      `Shop ${raw.title} online at ToyCompany Pakistan.`,
  };
}

/** Fetch products from a collection. Shopify AJAX allows up to 250 per page. */
export async function fetchCollectionProducts(
  handle: string,
  options: { maxPages?: number; limitPerPage?: number } | number = 2,
): Promise<Product[]> {
  const maxPages = typeof options === "number" ? options : (options.maxPages ?? 2);
  const limitPerPage =
    typeof options === "number" ? 250 : Math.min(Math.max(options.limitPerPage ?? 250, 1), 250);
  const products: Product[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const data = await toycompanyFetch<{ products: ShopifyAjaxProduct[] }>(
      `/collections/${encodeURIComponent(handle)}/products.json?limit=${limitPerPage}&page=${page}`,
    );
    const batch = data.products ?? [];
    if (!batch.length) break;
    products.push(...batch.map(mapAjaxProduct));
    if (batch.length < limitPerPage) break;
  }
  return products;
}

export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  try {
    const data = await toycompanyFetch<{ product: ShopifyAjaxProduct }>(
      `/products/${encodeURIComponent(handle)}.json`,
    );
    return data.product ? mapAjaxProduct(data.product) : null;
  } catch {
    return null;
  }
}

export async function fetchAllCollections(): Promise<Collection[]> {
  const data = await toycompanyFetch<{ collections: ShopifyAjaxCollection[] }>(
    "/collections.json?limit=250",
  );
  return (data.collections ?? []).map(mapAjaxCollection);
}

/** Broad catalog pages from /products.json (used for browse / fuzzy search merge). */
export async function fetchCatalogPages(maxPages = 4): Promise<Product[]> {
  const pageNumbers = Array.from({ length: maxPages }, (_, i) => i + 1);
  const settled = await Promise.all(
    pageNumbers.map(async (page) => {
      try {
        const data = await toycompanyFetch<{ products: ShopifyAjaxProduct[] }>(
          `/products.json?limit=250&page=${page}`,
        );
        return data.products ?? [];
      } catch {
        return [] as ShopifyAjaxProduct[];
      }
    }),
  );

  const products: Product[] = [];
  const seen = new Set<string>();
  for (const batch of settled) {
    if (!batch.length) continue;
    for (const raw of batch) {
      if (seen.has(raw.handle)) continue;
      seen.add(raw.handle);
      products.push(mapAjaxProduct(raw));
    }
  }
  return products;
}
