/**
 * Shopify Storefront API client.
 * Maps Shopify products/collections into the shared commerce types.
 * Activate with COMMERCE_PROVIDER=shopify and valid storefront credentials.
 */

import type { CommerceProvider } from "@/lib/commerce/types";
import type { Money, Product, ProductImage, ProductVariant } from "@/types/commerce";
import { demoProvider } from "@/lib/commerce/demo-provider";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2025-01";

function isConfigured() {
  return Boolean(domain && token && !token.includes("your_"));
}

async function storefrontFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!isConfigured()) {
    throw new Error("Shopify Storefront API is not configured");
  }

  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token!,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront error: ${res.status}`);
  }

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }
  return json.data as T;
}

function mapMoney(m?: { amount: string; currencyCode: string } | null): Money | undefined {
  if (!m) return undefined;
  return { amount: Math.round(parseFloat(m.amount)), currencyCode: m.currencyCode };
}

function mapProduct(node: ShopifyProductNode): Product {
  const images: ProductImage[] = (node.images?.edges ?? []).map((e) => ({
    url: e.node.url,
    alt: e.node.altText ?? node.title,
    width: e.node.width,
    height: e.node.height,
  }));

  const variants: ProductVariant[] = (node.variants?.edges ?? []).map((e) => ({
    id: e.node.id,
    title: e.node.title,
    sku: e.node.sku ?? "",
    price: mapMoney(e.node.price)!,
    compareAtPrice: mapMoney(e.node.compareAtPrice),
    available: e.node.availableForSale,
    quantityAvailable: e.node.quantityAvailable ?? 0,
  }));

  const tags = node.tags ?? [];
  const platformTag = tags.find((t) => t.toLowerCase().startsWith("platform:"));
  const brand =
    node.vendor ||
    tags.find((t) => t.toLowerCase().startsWith("brand:"))?.split(":")[1] ||
    "ToyCompany";

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    brand,
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    category: node.productType || tags[0] || "accessories",
    categoryPath: [node.productType || "accessories"].map((s) =>
      s.toLowerCase().replace(/\s+/g, "-"),
    ),
    platform: platformTag ? [platformTag.split(":")[1]!] : [],
    tags,
    condition: tags.includes("pre-owned") ? "pre-owned" : "new",
    rating: 4.5,
    reviewCount: 0,
    images,
    variants,
    specs: [],
    compatibility: [],
    featured: tags.includes("featured"),
    bestSeller: tags.includes("best-seller"),
    newArrival: tags.includes("new-arrival"),
    onDeal: variants.some((v) => v.compareAtPrice && v.compareAtPrice.amount > v.price.amount),
    createdAt: node.createdAt,
  };
}

interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  createdAt: string;
  images?: {
    edges: {
      node: { url: string; altText?: string; width?: number; height?: number };
    }[];
  };
  variants?: {
    edges: {
      node: {
        id: string;
        title: string;
        sku?: string;
        availableForSale: boolean;
        quantityAvailable?: number;
        price: { amount: string; currencyCode: string };
        compareAtPrice?: { amount: string; currencyCode: string } | null;
      };
    }[];
  };
}

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  descriptionHtml
  vendor
  productType
  tags
  createdAt
  images(first: 8) {
    edges { node { url altText width height } }
  }
  variants(first: 20) {
    edges {
      node {
        id title sku availableForSale quantityAvailable
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
      }
    }
  }
`;

/**
 * Shopify-backed provider. Falls back to demo data for news/reviews
 * and any unimplemented enrichment until metafields are mapped.
 */
export const shopifyProvider: CommerceProvider = {
  async getProducts({ filters, sort = "featured", page = 1, pageSize = 12 } = {}) {
    if (!isConfigured()) return demoProvider.getProducts({ filters, sort, page, pageSize });

    try {
      const queryFilter = filters?.query ? `title:*${filters.query}*` : undefined;
      const data = await storefrontFetch<{
        products: { edges: { node: ShopifyProductNode }[] };
      }>(
        `query Products($first: Int!, $query: String) {
          products(first: $first, query: $query, sortKey: BEST_SELLING) {
            edges { node { ${PRODUCT_FIELDS} } }
          }
        }`,
        { first: 100, query: queryFilter },
      );

      let products = data.products.edges.map((e) => mapProduct(e.node));
      if (filters?.category) {
        const cat = filters.category.toLowerCase();
        products = products.filter(
          (p) =>
            p.category.toLowerCase().includes(cat) ||
            p.tags.some((t) => t.toLowerCase().includes(cat)),
        );
      }

      const total = products.length;
      const start = (page - 1) * pageSize;
      return {
        products: products.slice(start, start + pageSize),
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      };
    } catch {
      return demoProvider.getProducts({ filters, sort, page, pageSize });
    }
  },

  async getProductByHandle(handle) {
    if (!isConfigured()) return demoProvider.getProductByHandle(handle);
    try {
      const data = await storefrontFetch<{
        productByHandle: ShopifyProductNode | null;
      }>(
        `query Product($handle: String!) {
          productByHandle(handle: $handle) { ${PRODUCT_FIELDS} }
        }`,
        { handle },
      );
      return data.productByHandle ? mapProduct(data.productByHandle) : null;
    } catch {
      return demoProvider.getProductByHandle(handle);
    }
  },

  async getFeaturedProducts(limit = 8) {
    const { products } = await this.getProducts({
      filters: { tags: ["featured"] },
      pageSize: limit,
    });
    const featured = products.filter((p) => p.featured);
    return featured.length ? featured : products.slice(0, limit);
  },

  async getBestSellers(limit = 8) {
    const { products } = await this.getProducts({ sort: "best_selling", pageSize: limit });
    return products;
  },

  async getNewArrivals(limit = 8) {
    const { products } = await this.getProducts({ sort: "newest", pageSize: limit });
    return products;
  },

  async getDeals(limit = 8) {
    const { products } = await this.getProducts({ filters: { discount: true }, pageSize: limit });
    return products;
  },

  async getRelatedProducts(product, limit = 4) {
    return demoProvider.getRelatedProducts(product, limit);
  },

  async getCollections() {
    return demoProvider.getCollections();
  },

  async getCollectionByHandle(handle) {
    return demoProvider.getCollectionByHandle(handle);
  },

  async searchSuggestions(query, limit = 8) {
    return demoProvider.searchSuggestions(query, limit);
  },

  async getNews(limit = 4) {
    return demoProvider.getNews(limit);
  },

  async getProductReviews(productId) {
    return demoProvider.getProductReviews(productId);
  },

  async createCheckoutUrl(cartId) {
    if (!isConfigured()) return null;
    // Cart checkout URL is returned from Shopify cartCreate / cartLinesAdd mutations
    return `https://${domain}/cart/${cartId}`;
  },
};

export { isConfigured as isShopifyConfigured };
