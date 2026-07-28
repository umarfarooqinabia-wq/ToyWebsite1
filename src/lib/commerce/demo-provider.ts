import {
  DEMO_COLLECTIONS,
  DEMO_PRODUCTS,
  DEMO_REVIEWS,
} from "@/lib/commerce/demo-data";
import { productMatchesAnyPlatform } from "@/lib/commerce/catalog-filters";
import { withGameDetails } from "@/lib/commerce/game-details";
import { withPs5Media } from "@/lib/commerce/ps5-media";
import {
  buildTop50Ps5Products,
  TOP50_HANDLES,
} from "@/lib/commerce/ps5-top50-pakistan";
import {
  buildTopPs4Products,
  TOP_PS4_HANDLES,
} from "@/lib/commerce/ps4-top-pakistan";
import {
  buildTopSwitchProducts,
  TOP_SWITCH_HANDLES,
} from "@/lib/commerce/switch-top-pakistan";
import {
  buildTop50XboxProducts,
  TOP50_XBOX_HANDLES,
} from "@/lib/commerce/xbox-top50-pakistan";
import { buildGiftCardProducts } from "@/lib/commerce/gift-cards";
import { buildUsedGamesProducts, USED_GAME_HANDLES } from "@/lib/commerce/used-games";
import { readInventory, buildAdminAwareCatalog } from "@/lib/admin/stock-db";
import type { CommerceProvider } from "@/lib/commerce/types";
import { getProductPrice, isInStock } from "@/lib/utils";
import type {
  PaginatedProducts,
  Product,
  ProductFilters,
  SortOption,
} from "@/types/commerce";

/** Older demo SKUs replaced by platform top lists (same game, different handle). */
const SUPERSEDED_DEMO_HANDLES = new Set([
  "zelda-tears-of-the-kingdom", // kept as zelda-tears-of-the-kingdom-switch
]);

/** Demo catalog + Top discs + gift cards + used games. */
const CATALOG = [
  ...DEMO_PRODUCTS.filter(
    (p) =>
      !SUPERSEDED_DEMO_HANDLES.has(p.handle) &&
      !TOP50_HANDLES.has(p.handle) &&
      !TOP_PS4_HANDLES.has(p.handle) &&
      !TOP_SWITCH_HANDLES.has(p.handle) &&
      !TOP50_XBOX_HANDLES.has(p.handle) &&
      !USED_GAME_HANDLES.has(p.handle),
  ),
  ...buildTop50Ps5Products(),
  ...buildTopPs4Products(),
  ...buildTop50XboxProducts(),
  ...buildTopSwitchProducts(),
  ...buildGiftCardProducts(),
  ...buildUsedGamesProducts(),
]
  .map(withPs5Media)
  .map(withGameDetails);

async function catalogWithStock(): Promise<Product[]> {
  const inv = await readInventory();
  return buildAdminAwareCatalog(CATALOG, inv).map(withGameDetails);
}

export function getBaseCatalog(): Product[] {
  return CATALOG;
}

function filterProducts(products: Product[], filters?: ProductFilters): Product[] {
  if (!filters) return products;

  return products.filter((product) => {
    if (filters.category) {
      const cat = filters.category.toLowerCase();
      const match =
        product.category === cat ||
        product.categoryPath.includes(cat) ||
        product.tags.includes(cat);
      if (!match) return false;
    }

    if (filters.platform?.length) {
      if (!productMatchesAnyPlatform(product, filters.platform)) return false;
    }

    if (filters.brand?.length) {
      if (!filters.brand.includes(product.brand)) return false;
    }

    if (filters.condition?.length) {
      if (!filters.condition.includes(product.condition)) return false;
    }

    if (filters.minRating && product.rating < filters.minRating) return false;

    const { price, discountPercent } = getProductPrice(product);
    if (filters.minPrice != null && price.amount < filters.minPrice) return false;
    if (filters.maxPrice != null && price.amount > filters.maxPrice) return false;

    if (filters.discount && !discountPercent && !product.onDeal) return false;

    if (filters.newArrival && !product.newArrival) return false;

    if (filters.availability === "in_stock" && !isInStock(product)) return false;
    if (filters.availability === "out_of_stock" && isInStock(product)) return false;

    if (filters.query) {
      const q = filters.query.toLowerCase();
      const haystack = [
        product.title,
        product.brand,
        product.description,
        product.category,
        ...product.platform,
        ...product.tags,
        ...product.compatibility,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (filters.tags?.length) {
      if (!filters.tags.every((t) => product.tags.includes(t))) return false;
    }

    return true;
  });
}

function sortProducts(products: Product[], sort: SortOption = "featured"): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "price_asc":
      return sorted.sort(
        (a, b) => getProductPrice(a).price.amount - getProductPrice(b).price.amount,
      );
    case "price_desc":
      return sorted.sort(
        (a, b) => getProductPrice(b).price.amount - getProductPrice(a).price.amount,
      );
    case "best_rated":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "best_selling":
      return sorted.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller) || b.reviewCount - a.reviewCount);
    case "featured":
    default:
      return sorted.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
      );
  }
}

export const demoProvider: CommerceProvider = {
  async getProducts({ filters, sort = "featured", page = 1, pageSize = 12 } = {}) {
    const catalog = await catalogWithStock();
    const filtered = sortProducts(filterProducts(catalog, filters), sort);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const products = filtered.slice(start, start + pageSize);

    return { products, total, page, pageSize, totalPages } satisfies PaginatedProducts;
  },

  async getProductByHandle(handle) {
    const catalog = await catalogWithStock();
    return catalog.find((p) => p.handle === handle) ?? null;
  },

  async getFeaturedProducts(limit = 8) {
    const catalog = await catalogWithStock();
    return catalog.filter((p) => p.featured).slice(0, limit);
  },

  async getBestSellers(limit = 8) {
    const catalog = await catalogWithStock();
    return catalog.filter((p) => p.bestSeller).slice(0, limit);
  },

  async getNewArrivals(limit = 8) {
    const catalog = await catalogWithStock();
    return [...catalog]
      .filter((p) => p.newArrival)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  async getDeals(limit = 8) {
    const catalog = await catalogWithStock();
    return catalog.filter((p) => p.onDeal).slice(0, limit);
  },

  async getRelatedProducts(product, limit = 4) {
    const catalog = await catalogWithStock();
    return catalog.filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category ||
          p.platform.some((plat) => product.platform.includes(plat))),
    ).slice(0, limit);
  },

  async getCollections() {
    return DEMO_COLLECTIONS;
  },

  async getCollectionByHandle(handle) {
    return DEMO_COLLECTIONS.find((c) => c.handle === handle) ?? null;
  },

  async searchSuggestions(query, limit = 8) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const catalog = await catalogWithStock();

    const products = catalog
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)),
      )
      .slice(0, limit)
      .map((p) => ({
        type: "product" as const,
        label: p.title,
        href: `/product/${p.handle}`,
        image: p.images[0]?.url,
      }));

    const categories = DEMO_COLLECTIONS.filter((c) =>
      c.title.toLowerCase().includes(q),
    )
      .slice(0, 3)
      .map((c) => ({
        type: "category" as const,
        label: c.title,
        href: `/${c.handle}`,
      }));

    const brands = [...new Set(catalog.map((p) => p.brand))]
      .filter((b) => b.toLowerCase().includes(q))
      .slice(0, 3)
      .map((b) => ({
        type: "brand" as const,
        label: b,
        href: `/products?brand=${encodeURIComponent(b)}`,
      }));

    return [...products, ...categories, ...brands].slice(0, limit);
  },

  async getNews(limit = 4) {
    const { getPublishedNews } = await import("@/lib/admin/articles-db");
    return getPublishedNews(limit);
  },

  async getProductReviews() {
    return DEMO_REVIEWS;
  },
};
