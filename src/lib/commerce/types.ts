import type {
  Collection,
  NewsArticle,
  PaginatedProducts,
  Product,
  ProductFilters,
  ProductReview,
  SearchSuggestion,
  SortOption,
} from "@/types/commerce";

export interface CommerceProvider {
  getProducts(params?: {
    filters?: ProductFilters;
    sort?: SortOption;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedProducts>;
  getProductByHandle(handle: string): Promise<Product | null>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getBestSellers(limit?: number): Promise<Product[]>;
  getNewArrivals(limit?: number): Promise<Product[]>;
  getDeals(limit?: number): Promise<Product[]>;
  getRelatedProducts(product: Product, limit?: number): Promise<Product[]>;
  getCollections(): Promise<Collection[]>;
  getCollectionByHandle(handle: string): Promise<Collection | null>;
  searchSuggestions(query: string, limit?: number): Promise<SearchSuggestion[]>;
  getNews(limit?: number): Promise<NewsArticle[]>;
  getProductReviews(productId: string): Promise<ProductReview[]>;
  createCheckoutUrl?(cartId: string): Promise<string | null>;
}
