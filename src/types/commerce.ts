export type ProductCondition = "new" | "pre-owned" | "refurbished";

export type OrderStatus =
  | "placed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod =
  | "jazzcash"
  | "easypaisa"
  | "cod"
  | "bank_transfer"
  | "stripe"
  | "card";

/** Prepaid transfer payment verification (separate from fulfillment status). */
export type PaymentStatus = "unpaid" | "proof_submitted" | "paid";

export interface Money {
  amount: number;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ProductVideo {
  /** YouTube video id when hosted on YouTube */
  youtubeId?: string;
  /** TikTok video id */
  tiktokId?: string;
  /** Local or remote MP4/WebM URL for uploaded trailers */
  src?: string;
  /** Generic embed URL (Reels, Vimeo, etc.) */
  embedUrl?: string;
  /** YouTube search fallback — finds demos for this exact toy */
  searchQuery?: string;
  title: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: Money;
  compareAtPrice?: Money;
  available: boolean;
  quantityAvailable: number;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  brand: string;
  description: string;
  descriptionHtml?: string;
  category: string;
  categoryPath: string[];
  platform: string[];
  tags: string[];
  condition: ProductCondition;
  rating: number;
  reviewCount: number;
  images: ProductImage[];
  video?: ProductVideo;
  variants: ProductVariant[];
  specs: ProductSpec[];
  compatibility: string[];
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  onDeal?: boolean;
  dealEndsAt?: string;
  shippingInfo?: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: string;
  parentHandle?: string;
  children?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface CartLine {
  id: string;
  productId: string;
  variantId: string;
  handle: string;
  title: string;
  brand: string;
  image: string;
  price: Money;
  compareAtPrice?: Money;
  quantity: number;
  maxQuantity: number;
}

export interface Cart {
  id: string;
  lines: CartLine[];
  subtotal: Money;
  discount: Money;
  shipping: Money;
  total: Money;
  checkoutUrl?: string;
}

export interface WishlistItem {
  productId: string;
  handle: string;
  title: string;
  brand: string;
  image: string;
  price: Money;
  compareAtPrice?: Money;
  available: boolean;
  addedAt: string;
}

export interface CompareItem {
  productId: string;
  handle: string;
  title: string;
  brand: string;
  image: string;
  price: Money;
  platform: string[];
  compatibility: string[];
  rating: number;
  specs: ProductSpec[];
  features: string[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface OrderItem {
  title: string;
  quantity: number;
  price: Money;
  image: string;
  productId?: string;
  /** Snapshot of staff buy cost at sale time (for profit calc) */
  buyingPrice?: number;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  subtotal: Money;
  shipping: Money;
  total: Money;
  paymentMethod: PaymentMethod;
  /** Prepaid bank / wallet only — COD and cards leave this unset or paid at capture. */
  paymentStatus?: PaymentStatus;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
  paymentMarkedPaidAt?: string;
  shippingAddress: Address;
  trackingNumber?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  addresses: Address[];
  orders: Order[];
}

export interface ProductFilters {
  category?: string;
  platform?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition[];
  minRating?: number;
  availability?: "in_stock" | "out_of_stock" | "all";
  discount?: boolean;
  newArrival?: boolean;
  query?: string;
  tags?: string[];
  /** Shop-by-age: 0-2 | 3-5 | 6-8 | 9-12 | 13-plus */
  age?: string;
  /** Shop-by-interest: boy | girl | both | collector */
  audience?: string;
}

export type SortOption =
  | "featured"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "best_rated"
  | "best_selling";

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "releases" | "news" | "guides" | "reviews";
  image: string;
  publishedAt: string;
  /** Full article body — paragraphs separated by blank lines */
  body?: string;
  /** Related toy / product handles → /product/[handle] */
  productHandles?: string[];
  /** Admin-managed: false hides from storefront */
  published?: boolean;
  featured?: boolean;
}

export interface SearchSuggestion {
  type: "product" | "category" | "brand";
  label: string;
  href: string;
  image?: string;
}
