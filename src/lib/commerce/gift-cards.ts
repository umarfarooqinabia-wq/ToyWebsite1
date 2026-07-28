import type { Product } from "@/types/commerce";

const pkr = (amount: number) => ({ amount, currencyCode: "PKR" as const });

type GiftCardEntry = {
  handle: string;
  title: string;
  brand: string;
  blurb: string;
  image: string;
  platform: string[];
  amounts: number[];
  featured?: boolean;
};

/**
 * Digital gift cards / wallet codes — delivered by chat after payment.
 * Images live in /public/gift-cards.
 */
export const GIFT_CARD_ENTRIES: GiftCardEntry[] = [
  {
    handle: "playstation-network-gift-card",
    title: "PlayStation Network Gift Card — Digital Code",
    brand: "Sony",
    blurb:
      "Top up your PSN wallet instantly. Redeem on PlayStation Store for games, DLC, and subscriptions.",
    image: "/gift-cards/psn.svg",
    platform: ["PlayStation 5", "PlayStation 4"],
    amounts: [2000, 5000, 10000, 15000],
    featured: true,
  },
  {
    handle: "steam-gift-card-usd",
    title: "Steam Gift Card (USD) — Digital Code",
    brand: "Valve",
    blurb:
      "USD Steam Wallet code for PC & Steam Deck. Buy games, DLC, and in-game content worldwide.",
    image: "/gift-cards/steam.svg",
    platform: ["PC"],
    amounts: [2800, 5600, 14000, 28000],
    featured: true,
  },
  {
    handle: "nintendo-eshop-gift-card",
    title: "Nintendo eShop Gift Card — Digital Code",
    brand: "Nintendo",
    blurb:
      "Add funds to your Nintendo Account for Switch games, DLC, and online membership.",
    image: "/gift-cards/nintendo-eshop.svg",
    platform: ["Nintendo Switch"],
    amounts: [3000, 6000, 10000, 15000],
    featured: true,
  },
  {
    handle: "roblox-gift-card",
    title: "Roblox Gift Card — Digital Code",
    brand: "Roblox",
    blurb:
      "Roblox credit for Robux, premium, and experiences. Perfect gift for kids & creators.",
    image: "/gift-cards/roblox.svg",
    platform: ["PC", "Mobile"],
    amounts: [1500, 3000, 5000, 10000],
    featured: true,
  },
  {
    handle: "fortnite-vbucks-gift-card",
    title: "Fortnite V-Bucks Gift Card — Digital Code",
    brand: "Epic Games",
    blurb:
      "V-Bucks codes for Battle Pass, skins, and item shop drops on supported platforms.",
    image: "/gift-cards/fortnite-vbucks.svg",
    platform: ["PlayStation 5", "Xbox Series X|S", "PC", "Nintendo Switch"],
    amounts: [2500, 4500, 8000, 12000],
    featured: true,
  },
];

export function buildGiftCardProducts(): Product[] {
  return GIFT_CARD_ENTRIES.map((e, index) => {
    const id = `gift-card-${index + 1}`;
    return {
      id,
      handle: e.handle,
      title: e.title,
      brand: e.brand,
      description: `${e.blurb} Digital delivery via WhatsApp after payment confirmation — no physical shipping required.`,
      category: "gift-cards",
      categoryPath: ["gift-cards", "digital-codes"],
      platform: e.platform,
      tags: ["gift-card", "digital-code", "instant-delivery", "gift-cards"],
      condition: "new" as const,
      rating: 4.8,
      reviewCount: 120 - index * 8,
      images: [
        {
          url: e.image,
          alt: `${e.title} artwork`,
          width: 800,
          height: 500,
        },
      ],
      variants: e.amounts.map((amount, i) => ({
        id: `var-${id}-${i + 1}`,
        title: `Rs. ${amount.toLocaleString("en-PK")}`,
        sku: `PTPK-GC-${String(index + 1).padStart(2, "0")}-${amount}`,
        price: pkr(amount),
        available: true,
        quantityAvailable: 999,
      })),
      specs: [
        { label: "Type", value: "Digital Code / Gift Card" },
        { label: "Delivery", value: "Instant via WhatsApp" },
        { label: "Region", value: "As specified on code" },
      ],
      compatibility: e.platform,
      featured: e.featured,
      bestSeller: index < 3,
      newArrival: true,
      shippingInfo:
        "Digital product — code sent on WhatsApp after payment. No physical delivery.",
      createdAt: new Date(Date.UTC(2026, 6, 22 - index)).toISOString(),
    };
  });
}

export const GIFT_CARD_HANDLES = new Set(GIFT_CARD_ENTRIES.map((e) => e.handle));
