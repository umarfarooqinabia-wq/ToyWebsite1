import type { Product, ProductImage, ProductVideo } from "@/types/commerce";
import { buildGameCoverImages } from "@/lib/commerce/steam-covers";
import { getGameSeoDescription } from "@/lib/commerce/game-seo-descriptions";

const pkr = (amount: number) => ({ amount, currencyCode: "PKR" as const });

type TopEntry = {
  handle: string;
  title: string;
  brand: string;
  price: number;
  compareAt?: number;
  genre: string;
  blurb: string;
  rank: number;
  steamId?: string;
  youtubeId?: string;
  videoTitle?: string;
};

/**
 * Top PS4 physical discs most ordered across Pakistani markets
 * (value / last-gen demand — Lahore, Karachi, Islamabad shops).
 */
export const TOP_PS4_PAKISTAN_ENTRIES: TopEntry[] = [
  { rank: 1, handle: "gta-v-ps4", title: "Grand Theft Auto V — PS4 Disc", brand: "Rockstar", price: 4499, compareAt: 5999, genre: "Open World", blurb: "All-time #1 PS4 CD traded in Pakistan.", steamId: "271590", youtubeId: "QkkoHAzjnUs", videoTitle: "Grand Theft Auto V Trailer" },
  { rank: 2, handle: "fifa-23-ps4", title: "EA SPORTS FIFA 23 — PS4 Disc", brand: "EA", price: 3999, compareAt: 5999, genre: "Sports", blurb: "Last FIFA branding — still huge football demand.", steamId: "1811260", youtubeId: "TSi0iJYSQ24", videoTitle: "FIFA 23 Trailer" },
  { rank: 3, handle: "god-of-war-ps4", title: "God of War (2018) — PS4 Disc", brand: "Sony", price: 4999, compareAt: 6999, genre: "Action-Adventure", blurb: "Kratos exclusive that never leaves shop shelves.", steamId: "1593500", youtubeId: "K0u_kAWLJOA", videoTitle: "God of War Trailer" },
  { rank: 4, handle: "spiderman-ps4", title: "Marvel's Spider-Man — PS4 Disc", brand: "Sony", price: 5499, compareAt: 7499, genre: "Action-Adventure", blurb: "Miles & Peter favourite for first PS4 setups.", steamId: "1817070", youtubeId: "q4GdJVvdxss", videoTitle: "Spider-Man Trailer" },
  { rank: 5, handle: "last-of-us-part-ii-ps4", title: "The Last of Us Part II — PS4 Disc", brand: "Sony", price: 5999, compareAt: 7999, genre: "Action-Adventure", blurb: "Story exclusive — steady year-round CD sales.", steamId: "1888930", youtubeId: "II5UsqP4JCE", videoTitle: "The Last of Us Part II Trailer" },
  { rank: 6, handle: "red-dead-redemption-2-ps4", title: "Red Dead Redemption 2 — PS4 Disc", brand: "Rockstar", price: 4999, compareAt: 6999, genre: "Open World", blurb: "Western epic — top open-world PS4 disc.", steamId: "1174180", youtubeId: "eaW0tYpxyp0", videoTitle: "Red Dead Redemption 2 Trailer" },
  { rank: 7, handle: "uncharted-4-ps4", title: "UNCHARTED 4: A Thief's End — PS4 Disc", brand: "Sony", price: 3999, compareAt: 5499, genre: "Action-Adventure", blurb: "Nathan Drake classic — gift & trade staple.", steamId: "1659420", youtubeId: "hh5HV4iic1Y", videoTitle: "Uncharted 4 Trailer" },
  { rank: 8, handle: "ghost-of-tsushima-ps4", title: "Ghost of Tsushima — PS4 Disc", brand: "Sony", price: 5499, compareAt: 7499, genre: "Action-Adventure", blurb: "Samurai exclusive with strong resale value.", steamId: "2215430", youtubeId: "sc4_dXjkCl8", videoTitle: "Ghost of Tsushima Trailer" },
  { rank: 9, handle: "tekken-7-ps4", title: "TEKKEN 7 — PS4 Disc", brand: "Bandai Namco", price: 3499, compareAt: 4999, genre: "Fighting", blurb: "#1 café fighter disc across Pakistan.", steamId: "389730", youtubeId: "1QKW_EP7dDM", videoTitle: "TEKKEN 7 Trailer" },
  { rank: 10, handle: "mortal-kombat-11-ps4", title: "Mortal Kombat 11 — PS4 Disc", brand: "Warner Bros", price: 3999, compareAt: 5499, genre: "Fighting", blurb: "1v1 fighter still flying out of shops.", steamId: "976310", youtubeId: "7zwKP_Li-9k", videoTitle: "Mortal Kombat 11 Trailer" },
  { rank: 11, handle: "cod-modern-warfare-ps4", title: "Call of Duty: Modern Warfare (2019) — PS4 Disc", brand: "Activision", price: 4499, compareAt: 6499, genre: "FPS", blurb: "MW reboot — top FPS disc for PS4 owners.", steamId: "2000950", youtubeId: "bH0EcyOIV4E", videoTitle: "Modern Warfare Trailer" },
  { rank: 12, handle: "horizon-zero-dawn-ps4", title: "Horizon Zero Dawn — PS4 Disc", brand: "Sony", price: 3499, compareAt: 4999, genre: "Action RPG", blurb: "Aloy’s first hunt — value exclusive favourite.", steamId: "1151640", youtubeId: "u4-FCsiUL5Q", videoTitle: "Horizon Zero Dawn Trailer" },
  { rank: 13, handle: "days-gone-ps4", title: "Days Gone — PS4 Disc", brand: "Sony", price: 3299, compareAt: 4999, genre: "Action-Adventure", blurb: "Zombie open world — strong budget seller.", steamId: "1259420", youtubeId: "FKtaOY9lMvM", videoTitle: "Days Gone Trailer" },
  { rank: 14, handle: "bloodborne-ps4", title: "Bloodborne — PS4 Disc", brand: "Sony", price: 4499, compareAt: 5999, genre: "Action RPG", blurb: "FromSoftware cult classic for hardcore fans.", steamId: "ACCT-000019", youtubeId: "G9FGgwCQ22w", videoTitle: "Bloodborne Trailer" },
  { rank: 15, handle: "detroit-become-human-ps4", title: "Detroit: Become Human — PS4 Disc", brand: "Sony", price: 3999, compareAt: 5499, genre: "Adventure", blurb: "Story disc popular with streamers & gifts.", steamId: "1222140", youtubeId: "8a-kYpHgKPQ", videoTitle: "Detroit Become Human Trailer" },
  { rank: 16, handle: "fc-24-ps4", title: "EA SPORTS FC 24 — PS4 Disc", brand: "EA", price: 5499, compareAt: 7999, genre: "Sports", blurb: "Latest last-gen football disc for PS4 players.", steamId: "2669320", youtubeId: "TSi0iJYSQ24", videoTitle: "EA SPORTS FC Trailer" },
  { rank: 17, handle: "wwe-2k23-ps4", title: "WWE 2K23 — PS4 Disc", brand: "2K", price: 4499, compareAt: 6499, genre: "Sports / Fighting", blurb: "Wrestling favourite for local PS4 setups.", steamId: "2161490", youtubeId: "oYd6rXOrz7E", videoTitle: "WWE 2K Trailer" },
  { rank: 18, handle: "nba-2k24-ps4", title: "NBA 2K24 — PS4 Disc", brand: "2K", price: 4999, compareAt: 6999, genre: "Sports", blurb: "Seasonal basketball disc with MyCAREER demand.", steamId: "2338770", youtubeId: "Mh57YWNaQC4", videoTitle: "NBA 2K Trailer" },
  { rank: 19, handle: "assassins-creed-valhalla-ps4", title: "Assassin's Creed Valhalla — PS4 Disc", brand: "Ubisoft", price: 3999, compareAt: 5999, genre: "Action RPG", blurb: "Viking open world — long-tail PS4 seller.", steamId: "2208920", youtubeId: "ssrNcwxALS4", videoTitle: "Assassin's Creed Valhalla Trailer" },
  { rank: 20, handle: "resident-evil-2-ps4", title: "Resident Evil 2 — PS4 Disc", brand: "Capcom", price: 4499, compareAt: 5999, genre: "Survival Horror", blurb: "Remake horror disc — café & collector hit.", steamId: "883710", youtubeId: "u3wS-Q2KRTM", videoTitle: "Resident Evil 2 Remake Trailer" },
];

function mediaFor(entry: TopEntry): { images: ProductImage[]; video?: ProductVideo } {
  const name = entry.title.replace(/ —.*$/, "");
  return {
    images: buildGameCoverImages({
      alt: name,
      steamId: entry.steamId,
      youtubeId: entry.youtubeId,
    }),
    video:
      entry.youtubeId && entry.videoTitle
        ? { youtubeId: entry.youtubeId, title: entry.videoTitle }
        : undefined,
  };
}

export function buildTopPs4Products(): Product[] {
  return TOP_PS4_PAKISTAN_ENTRIES.map((e) => {
    const media = mediaFor(e);
    const id = `top-ps4-${e.rank}`;
    const seo = getGameSeoDescription(e.title);
    return {
      id,
      handle: e.handle,
      title: e.title,
      brand: e.brand,
      description:
        seo ??
        `${e.blurb} Original PS4 Blu-ray disc edition — sealed stock popular across Pakistani last-gen buyers.`,
      category: "ps4-games",
      categoryPath: ["games", "ps4-games", "best-sellers"],
      platform: ["PlayStation 4"],
      tags: [
        "game",
        "ps4-cd",
        "top-pakistan",
        "top-ps4",
        e.genre.toLowerCase().replace(/\s+/g, "-"),
      ],
      condition: "new" as const,
      rating: Math.max(4.2, 5 - e.rank * 0.015),
      reviewCount: Math.max(60, 2800 - e.rank * 50),
      images: media.images,
      video: media.video,
      variants: [
        {
          id: `var-top-ps4-${e.rank}`,
          title: "Physical Disc",
          sku: `PTPK-PS4-${String(e.rank).padStart(2, "0")}`,
          price: pkr(e.price),
          compareAtPrice: e.compareAt ? pkr(e.compareAt) : undefined,
          available: true,
          quantityAvailable: Math.max(20, 180 - e.rank * 4),
        },
      ],
      specs: [
        { label: "Genre", value: e.genre },
        { label: "Format", value: "Blu-ray Disc (PS4)" },
        { label: "Region", value: "Import / All region friendly*" },
        { label: "PK Market Rank", value: `#${e.rank} PS4 most ordered` },
      ],
      compatibility: ["PlayStation 4", "PlayStation 4 Slim", "PlayStation 4 Pro"],
      featured: e.rank <= 8,
      bestSeller: e.rank <= 15,
      newArrival: e.rank <= 5,
      onDeal: Boolean(e.compareAt),
      dealEndsAt: e.compareAt
        ? new Date(Date.now() + 1000 * 60 * 60 * (18 + e.rank)).toISOString()
        : undefined,
      shippingInfo:
        "Original sealed PS4 disc. Free shipping over Rs. 15,000. Dispatch within 24 hours across Pakistan.",
      createdAt: new Date(Date.UTC(2026, 6, 20 - Math.min(e.rank, 15))).toISOString(),
    };
  });
}

export const TOP_PS4_HANDLES = new Set(TOP_PS4_PAKISTAN_ENTRIES.map((e) => e.handle));
