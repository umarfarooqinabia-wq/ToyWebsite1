import { TOY_NAV_COLLECTIONS } from "@/lib/commerce/toycompany-collections";
import {
  fetchAllCollections,
  fetchCatalogPages,
  fetchCollectionProducts,
  fetchProductByHandle,
} from "@/lib/commerce/toycompany-client";
import {
  productMatchesAge,
  productMatchesAudience,
  resolveFinderCollection,
  type AgeRangeId,
  type AudienceId,
} from "@/lib/commerce/age-interest";
import {
  fuzzyMatches,
  scoreProductMatch,
  searchSuggestionsFromStore,
  searchToyCompanySuggest,
  typoVariants,
} from "@/lib/commerce/toycompany-search";
import { withToyVideo } from "@/lib/commerce/toy-video";
import type { CommerceProvider } from "@/lib/commerce/types";
import { getProductPrice, isInStock } from "@/lib/utils";
import type {
  PaginatedProducts,
  Product,
  ProductFilters,
  SortOption,
} from "@/types/commerce";

function enrich(product: Product): Product {
  return withToyVideo(product);
}

function enrichAll(products: Product[]): Product[] {
  return products.map(enrich);
}

function filterProducts(products: Product[], filters?: ProductFilters): Product[] {
  if (!filters) return products;

  return products.filter((product) => {
    if (filters.category) {
      const cat = filters.category.toLowerCase();
      const match =
        product.category === cat ||
        product.categoryPath.includes(cat) ||
        product.tags.some((t) => t.toLowerCase() === cat || t.toLowerCase().includes(cat)) ||
        product.handle.includes(cat);
      if (!match) return false;
    }

    if (filters.age) {
      if (!productMatchesAge(product, filters.age as AgeRangeId)) return false;
    }

    if (filters.audience) {
      if (!productMatchesAudience(product, filters.audience as AudienceId)) return false;
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
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q) && !fuzzyMatches(haystack, q)) return false;
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
      return sorted.sort(
        (a, b) => Number(b.bestSeller) - Number(a.bestSeller) || b.reviewCount - a.reviewCount,
      );
    case "featured":
    default:
      return sorted.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || Number(b.onDeal) - Number(a.onDeal),
      );
  }
}

function paginate(products: Product[], page: number, pageSize: number): PaginatedProducts {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    products: products.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Resolve products for a request.
 * Text queries hit Shopify's full-catalog predictive search.
 * Category / age filters load matching collections.
 */
async function loadProducts(
  filters?: ProductFilters,
  pageSize = 12,
): Promise<Product[]> {
  const query = filters?.query?.trim();
  if (query) {
    let { products } = await searchToyCompanySuggest(query, 10);
    if (!products.length) {
      for (const variant of typoVariants(query)) {
        const retry = await searchToyCompanySuggest(variant, 10);
        if (retry.products.length) {
          products = retry.products;
          break;
        }
      }
    }
    // Merge with a wider local catalog slice for typo / partial matches beyond suggest limit
    const catalog = await fetchCatalogPages(12);
    const seen = new Set(products.map((p) => p.handle));
    for (const p of catalog) {
      if (seen.has(p.handle)) continue;
      if (scoreProductMatch(p, query) > 0 || fuzzyMatches(
        `${p.title} ${p.brand} ${p.tags.join(" ")}`,
        query,
      )) {
        products.push(p);
        seen.add(p.handle);
      }
    }
    products.sort((a, b) => scoreProductMatch(b, query) - scoreProductMatch(a, query));
    const { query: _q, ...rest } = filters ?? {};
    return filterProducts(products, Object.keys(rest).length ? rest : undefined);
  }

  const category =
    filters?.category?.trim() ||
    (filters?.age || filters?.audience
      ? resolveFinderCollection(filters.age, filters.audience)
      : undefined);

  if (category) {
    try {
      const need = Math.max(pageSize * 4, 80);
      const limitPerPage = Math.min(250, Math.max(need, 24));
      const maxPages = Math.min(3, Math.ceil(need / limitPerPage));
      const fromCollection = await fetchCollectionProducts(category, {
        maxPages,
        limitPerPage,
      });
      if (fromCollection.length) {
        const seededByFinder = Boolean(
          !filters?.category?.trim() && (filters?.age || filters?.audience),
        );
        const { category: _c, age: _age, audience: _audience, ...rest } =
          filters ?? {};
        // Collection already scopes age/audience — keep price/brand/etc.
        // Re-applying keyword age filters was wiping valid toys (or falling
        // back to an unfiltered collection when price was also set).
        const refine = seededByFinder
          ? rest
          : { ...rest, age: filters?.age, audience: filters?.audience };
        const hasRefine = Object.values(refine).some(
          (v) => v !== undefined && !(Array.isArray(v) && v.length === 0),
        );
        return filterProducts(fromCollection, hasRefine ? refine : undefined);
      }
    } catch {
      // fall through to catalog
    }
  }

  // Browse-all: larger slice when price filters need wider coverage
  const wantsPrice =
    filters?.minPrice != null || filters?.maxPrice != null;
  const catalog = await fetchCatalogPages(wantsPrice ? 40 : 20);
  return filterProducts(catalog, filters);
}

export const toycompanyProvider: CommerceProvider = {
  async getProducts({ filters, sort = "featured", page = 1, pageSize = 12 } = {}) {
    try {
      const products = enrichAll(
        sortProducts(await loadProducts(filters, pageSize), sort),
      );
      return paginate(products, page, pageSize);
    } catch (err) {
      console.error("[toycompany] getProducts failed", err);
      return paginate([], page, pageSize);
    }
  },

  async getProductByHandle(handle) {
    try {
      const product = await fetchProductByHandle(handle);
      return product ? enrich(product) : null;
    } catch (err) {
      console.error("[toycompany] getProductByHandle failed", err);
      return null;
    }
  },

  async getFeaturedProducts(limit = 8) {
    const { products } = await this.getProducts({
      filters: { category: "trending" },
      sort: "featured",
      pageSize: limit,
    });
    return products;
  },

  async getBestSellers(limit = 8) {
    const { products } = await this.getProducts({
      filters: { category: "trending" },
      sort: "best_selling",
      pageSize: limit,
    });
    return products;
  },

  async getNewArrivals(limit = 8) {
    const { products } = await this.getProducts({
      filters: { category: "new-arrival" },
      sort: "newest",
      pageSize: limit,
    });
    return products;
  },

  async getDeals(limit = 8) {
    const { products } = await this.getProducts({
      filters: { category: "toys-on-sale", discount: true },
      sort: "featured",
      pageSize: limit,
    });
    if (products.length) return products;
    const fallback = await this.getProducts({
      filters: { category: "stock-on-sale" },
      pageSize: limit,
    });
    return fallback.products;
  },

  async getRelatedProducts(product, limit = 4) {
    const tag = product.tags.find((t) => t && t !== "toycompany" && !t.includes(" "));
    const { products } = await this.getProducts({
      filters: tag ? { category: tag } : { query: product.brand },
      pageSize: limit + 8,
    });
    return products.filter((p) => p.id !== product.id).slice(0, limit);
  },

  async getCollections() {
    try {
      const remote = await fetchAllCollections();
      if (!remote.length) return TOY_NAV_COLLECTIONS;
      const curated = new Map(TOY_NAV_COLLECTIONS.map((c) => [c.handle, c]));
      const merged = remote.map((c) => {
        const local = curated.get(c.handle);
        return local ? { ...c, ...local, id: c.id, image: c.image || local.image } : c;
      });
      // Ensure curated nav collections always exist even if missing remotely
      for (const c of TOY_NAV_COLLECTIONS) {
        if (!merged.some((m) => m.handle === c.handle)) merged.unshift(c);
      }
      return merged;
    } catch {
      return TOY_NAV_COLLECTIONS;
    }
  },

  async getCollectionByHandle(handle) {
    const all = await this.getCollections();
    return all.find((c) => c.handle === handle) ?? null;
  },

  async searchSuggestions(query, limit = 8) {
    const q = query.trim();
    if (!q) return [];
    try {
      return await searchSuggestionsFromStore(q, limit);
    } catch {
      const { products } = await this.getProducts({
        filters: { query: q },
        pageSize: limit,
      });
      return products.map((p) => ({
        type: "product" as const,
        label: p.title,
        href: `/product/${p.handle}`,
        image: p.images[0]?.url,
      }));
    }
  },

  async getNews(limit = 4) {
    const { getPublishedNews } = await import("@/lib/admin/articles-db");
    return getPublishedNews(limit);
  },

  async getProductReviews() {
    return [];
  },
};
