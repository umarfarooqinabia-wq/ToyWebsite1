export const SITE = {
  name: "ToyCompany",
  tagline: "Pakistan's Favourite Online Toy Store",
  description:
    "Buy kids toys, diecast models, RC cars, baby gear, educational toys and swimming pools online in Pakistan. Cash on Delivery, free shipping over Rs 4,999, and easy returns.",
  /** Production storefront URL — override with NEXT_PUBLIC_SITE_URL in .env */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.toycompany.pk",
  supportEmail: "playtimepk1@gmail.com",
  supportPhone: "+92-3322235956",
  /** Digits only for wa.me links */
  whatsappNumber: "923322235956",
  currency: "PKR",
  locale: "en-PK",
  /** Physical shop — Nagan Chowrangi, Karachi */
  address: {
    line1: "Nagan Chowrangi",
    city: "Karachi",
    region: "Sindh",
    country: "Pakistan",
    countryCode: "PK",
  },
} as const;

export function shopAddressText() {
  const a = SITE.address;
  return `${a.line1}, ${a.city}, ${a.region}, ${a.country}`;
}

/** Google Maps search / pin for the shop */
export function shopMapsSearchUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${SITE.name} ${shopAddressText()}`,
  )}`;
}

export function shopMapsEmbedUrl() {
  return `https://www.google.com/maps?q=${encodeURIComponent(shopAddressText())}&z=16&output=embed`;
}

/** “Write a review” — uses public Place ID / review URL when set. */
export function googleReviewWriteUrl() {
  const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID?.trim();
  const custom = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim();
  if (custom) return custom;
  if (placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
  }
  return shopMapsSearchUrl();
}

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

export const NAV_LINKS = [
  { label: "Shop by Age", href: "/find" },
  { label: "Gift Finder", href: "/gift-finder" },
  { label: "New Arrival", href: "/new-arrival" },
  { label: "Boys", href: "/toys-for-boys" },
  { label: "Girls", href: "/toys-for-girls" },
  { label: "Baby", href: "/baby-toys" },
  { label: "Diecast", href: "/die-cast-scale-models" },
  { label: "Remote Control", href: "/remote-control" },
  { label: "Outdoor", href: "/outdoor-play" },
  { label: "Sale", href: "/toys-on-sale" },
] as const;

export const BOTTOM_NAV = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Browse", href: "/products", icon: "grid" },
  { label: "Track", href: "/track", icon: "tag" },
  { label: "Wishlist", href: "/wishlist", icon: "heart" },
  { label: "Account", href: "/account", icon: "user" },
] as const;

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "best_rated", label: "Best Rated" },
  { value: "best_selling", label: "Best Selling" },
] as const;

export const PLATFORM_OPTIONS = [
  "Boys",
  "Girls",
  "Baby",
  "Outdoor",
  "Educational",
  "Collectibles",
] as const;

export const BRAND_OPTIONS = [
  "ToyCompany",
  "Intex",
  "Bburago",
  "Maisto",
  "Kinsmart",
  "Hot Wheels",
  "Barbie",
  "WinFun",
  "Street Machine",
] as const;

export const PAYMENT_METHODS = {
  pakistan: [
    { id: "cod", label: "Cash on Delivery", description: "Pay when you receive" },
    { id: "bank_transfer", label: "Bank Transfer", description: "Save 5% with code BANK5" },
    { id: "jazzcash", label: "JazzCash", description: "Mobile wallet transfer" },
    { id: "easypaisa", label: "Easypaisa", description: "Mobile wallet transfer" },
  ],
  international: [
    { id: "stripe", label: "Stripe", description: "Secure card payments" },
    { id: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, Amex" },
  ],
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  placed: "Order placed",
  processing: "Preparing your toys",
  shipped: "On the way",
  out_for_delivery: "Out for delivery today",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Awaiting payment",
  proof_submitted: "Proof submitted",
  paid: "Paid",
};
