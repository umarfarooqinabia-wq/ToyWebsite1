import type { Product, ProductImage, ProductVideo } from "@/types/commerce";
import { buildGameCoverImages } from "@/lib/commerce/steam-covers";

const pkr = (amount: number) => ({ amount, currencyCode: "PKR" as const });

/** Official Nintendo CDN art — fill-crop landscape heroes into portrait for CD cases.
 *  (Padding with dark bars + object-top made covers look solid black in the case well.) */
function nswCover(nsuidPath: string) {
  return `https://assets.nintendo.com/image/upload/c_fill,g_center,w_600,h_900,f_jpg/q_auto/${nsuidPath}`;
}

type TopEntry = {
  handle: string;
  title: string;
  brand: string;
  price: number;
  compareAt?: number;
  genre: string;
  blurb: string;
  rank: number;
  youtubeId?: string;
  videoTitle?: string;
  /** Official Nintendo store product art */
  coverImage: string;
};

/**
 * Top Nintendo Switch physical carts most ordered in Pakistan
 * (family / travel / first-party demand).
 *
 * Covers come from assets.nintendo.com — YouTube thumbnails alone were
 * returning 404 for several titles and broke the CD case images.
 */
export const TOP_SWITCH_PAKISTAN_ENTRIES: TopEntry[] = [
  {
    rank: 1,
    handle: "mario-kart-8-deluxe-switch",
    title: "Mario Kart 8 Deluxe — Switch",
    brand: "Nintendo",
    price: 12999,
    compareAt: 14999,
    genre: "Racing",
    blurb: "Pakistan’s #1 Switch party cart for family nights.",
    youtubeId: "tKlRN2YpxRE",
    videoTitle: "Mario Kart 8 Deluxe Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000000153/de697f487a36d802dd9a5ff0341f717c8486221f2f1219b675af37aca63bc453",
    ),
  },
  {
    rank: 2,
    handle: "zelda-tears-of-the-kingdom-switch",
    title: "The Legend of Zelda: Tears of the Kingdom — Switch",
    brand: "Nintendo",
    price: 14999,
    genre: "Action-Adventure",
    blurb: "Hyrule open-world exclusive — top premium Switch sale.",
    youtubeId: "uHGShqcAHlQ",
    videoTitle: "Tears of the Kingdom Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000063714/fb30eab428df3fc993b41c76e20f72e4d76d49734d17d31996b5ab61c414b117",
    ),
  },
  {
    rank: 3,
    handle: "animal-crossing-new-horizons-switch",
    title: "Animal Crossing: New Horizons — Switch",
    brand: "Nintendo",
    price: 11999,
    compareAt: 13999,
    genre: "Life Sim",
    blurb: "Island life favourite for kids & chill gamers.",
    youtubeId: "WShCN-AYHqA",
    videoTitle: "Animal Crossing New Horizons Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000027619/9989957eae3a6b545194c42fec2071675c34aadacd65e6b33fdfe7b3b6a86c3a",
    ),
  },
  {
    rank: 4,
    handle: "super-smash-bros-ultimate-switch",
    title: "Super Smash Bros. Ultimate — Switch",
    brand: "Nintendo",
    price: 12999,
    genre: "Fighting",
    blurb: "Ultimate fighter for café & friend groups.",
    youtubeId: "WShCN-AYHqA",
    videoTitle: "Smash Bros Ultimate Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000012332/ac4d1fc9824876ce756406f0525d50c57ded4b2a666f6dfe40a6ac5c3563fad9",
    ),
  },
  {
    rank: 5,
    handle: "super-mario-odyssey-switch",
    title: "Super Mario Odyssey — Switch",
    brand: "Nintendo",
    price: 11999,
    compareAt: 13999,
    genre: "Platformer",
    blurb: "3D Mario classic — gift cart staple.",
    youtubeId: "5kcdRBHM7kM",
    videoTitle: "Super Mario Odyssey Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000001130/c42553b4fd0312c31e70ec7468c6c9bccd739f340152925b9600631f2d29f8b5",
    ),
  },
  {
    rank: 6,
    handle: "pokemon-scarlet-switch",
    title: "Pokémon Scarlet — Switch",
    brand: "Nintendo",
    price: 12999,
    genre: "RPG",
    blurb: "Open-world Pokémon with huge local demand.",
    youtubeId: "1rPxiXXxftE",
    videoTitle: "Pokémon Scarlet Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000053966/849c234de8df7265201d26d9d72f88eed3f32438d3dca12fc135beb4c3befc85",
    ),
  },
  {
    rank: 7,
    handle: "pokemon-violet-switch",
    title: "Pokémon Violet — Switch",
    brand: "Nintendo",
    price: 12999,
    genre: "RPG",
    blurb: "Companion Violet cart — twin seller with Scarlet.",
    youtubeId: "1rPxiXXxftE",
    videoTitle: "Pokémon Violet Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000053971/842b2784d91520d41a947dec17fac116fec889bb1f1db4023615af8429dae00d",
    ),
  },
  {
    rank: 8,
    handle: "zelda-breath-of-the-wild-switch",
    title: "The Legend of Zelda: Breath of the Wild — Switch",
    brand: "Nintendo",
    price: 11999,
    compareAt: 13999,
    genre: "Action-Adventure",
    blurb: "BOTW still flies off shelves years later.",
    youtubeId: "zw47_q9wbBE",
    videoTitle: "Breath of the Wild Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000000025/7137262b5a64d921e193653f8aa0b722925abc5680380ca0e18a5cfd91697f58",
    ),
  },
  {
    rank: 9,
    handle: "mario-party-superstars-switch",
    title: "Mario Party Superstars — Switch",
    brand: "Nintendo",
    price: 10999,
    genre: "Party",
    blurb: "Board-game nights — strong family cart.",
    youtubeId: "5kcdRBHM7kM",
    videoTitle: "Mario Party Superstars Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000042934/ae43ce2e25afbc4c069c2920075ead01a84f02dfe55b87876268409f6ccc0304",
    ),
  },
  {
    rank: 10,
    handle: "splatoon-3-switch",
    title: "Splatoon 3 — Switch",
    brand: "Nintendo",
    price: 11999,
    genre: "Shooter",
    blurb: "Ink shooter hit for teens & online play.",
    youtubeId: "wHMNQzLG_Jg",
    videoTitle: "Splatoon 3 Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000046395/94a4095cda06c4d85c637d1af451979f9933302b6b17174d97c45de7a68584a2",
    ),
  },
  {
    rank: 11,
    handle: "kirby-and-the-forgotten-land-switch",
    title: "Kirby and the Forgotten Land — Switch",
    brand: "Nintendo",
    price: 10999,
    genre: "Platformer",
    blurb: "Cute 3D Kirby — kids’ gift favourite.",
    youtubeId: "wHMNQzLG_Jg",
    videoTitle: "Kirby Forgotten Land Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000046405/d1cf83dea46094b85247f40ca30ea4557730a319be0bfe544a4fa929144cf6c2",
    ),
  },
  {
    rank: 12,
    handle: "super-mario-bros-wonder-switch",
    title: "Super Mario Bros. Wonder — Switch",
    brand: "Nintendo",
    price: 12999,
    genre: "Platformer",
    blurb: "2D Mario wonder — newest family exclusive.",
    youtubeId: "5kcdRBHM7kM",
    videoTitle: "Mario Bros Wonder Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000068688/87e8aa5f1fdc950b88eae7d7c62ed185c8a6373c845090bbdb2e2cf039b38da1",
    ),
  },
  {
    rank: 13,
    handle: "luigis-mansion-3-switch",
    title: "Luigi's Mansion 3 — Switch",
    brand: "Nintendo",
    price: 9999,
    compareAt: 11999,
    genre: "Adventure",
    blurb: "Co-op ghost hunt — seasonal gift cart.",
    youtubeId: "wHMNQzLG_Jg",
    videoTitle: "Luigi's Mansion 3 Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000001620/2b166fb3197dacfde1d939acd6a976b9fbe3b1a32c54f9f0d2c8d23efb22412d",
    ),
  },
  {
    rank: 14,
    handle: "metroid-dread-switch",
    title: "Metroid Dread — Switch",
    brand: "Nintendo",
    price: 10999,
    genre: "Action",
    blurb: "Side-scroller exclusive for action fans.",
    youtubeId: "wHMNQzLG_Jg",
    videoTitle: "Metroid Dread Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000042924/4f2c683f0196210ec212a2ab8bf6952223c0b88e827b820953407a2ba61c9cb2",
    ),
  },
  {
    rank: 15,
    handle: "fire-emblem-engage-switch",
    title: "Fire Emblem Engage — Switch",
    brand: "Nintendo",
    price: 10999,
    genre: "Strategy RPG",
    blurb: "Tactics RPG with loyal Switch collectors.",
    youtubeId: "5kcdRBHM7kM",
    videoTitle: "Fire Emblem Engage Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000058802/88b8db494399e659522af36331b7f588439bc4312af5c0ee57035c063651ab4a",
    ),
  },
  {
    rank: 16,
    handle: "pikmin-4-switch",
    title: "Pikmin 4 — Switch",
    brand: "Nintendo",
    price: 10999,
    genre: "Strategy",
    blurb: "Charming strategy cart for Switch households.",
    youtubeId: "wHMNQzLG_Jg",
    videoTitle: "Pikmin 4 Trailer",
    coverImage: nswCover(
      "store/software/switch/70010000005308/43af89ed5bd76ac5ec6b367b4b53092f8bf94a1d1312fdfc1d4664329fd5077b",
    ),
  },
];

function mediaFor(entry: TopEntry): { images: ProductImage[]; video?: ProductVideo } {
  const name = entry.title.replace(/ —.*$/, "");
  return {
    images: buildGameCoverImages({
      alt: name,
      coverImage: entry.coverImage,
      youtubeId: entry.youtubeId,
    }),
    video:
      entry.youtubeId && entry.videoTitle
        ? { youtubeId: entry.youtubeId, title: entry.videoTitle }
        : undefined,
  };
}

export function buildTopSwitchProducts(): Product[] {
  return TOP_SWITCH_PAKISTAN_ENTRIES.map((e) => {
    const media = mediaFor(e);
    const id = `top-switch-${e.rank}`;
    return {
      id,
      handle: e.handle,
      title: e.title,
      brand: e.brand,
      description: `${e.blurb} Original Nintendo Switch physical cartridge — sealed stock for Pakistan.`,
      category: "nintendo-switch-games",
      categoryPath: ["games", "nintendo-games", "nintendo-switch-games"],
      platform: ["Nintendo Switch"],
      tags: [
        "game",
        "switch-game",
        "top-pakistan",
        "top-switch",
        e.genre.toLowerCase().replace(/\s+/g, "-"),
      ],
      condition: "new" as const,
      rating: Math.max(4.3, 5 - e.rank * 0.02),
      reviewCount: Math.max(50, 2200 - e.rank * 60),
      images: media.images,
      video: media.video,
      variants: [
        {
          id: `var-top-switch-${e.rank}`,
          title: "Physical Cart",
          sku: `PTPK-NSW-${String(e.rank).padStart(2, "0")}`,
          price: pkr(e.price),
          compareAtPrice: e.compareAt ? pkr(e.compareAt) : undefined,
          available: true,
          quantityAvailable: Math.max(18, 160 - e.rank * 5),
        },
      ],
      specs: [
        { label: "Genre", value: e.genre },
        { label: "Format", value: "Nintendo Switch Game Card" },
        { label: "Region", value: "Import / Region free*" },
        { label: "PK Market Rank", value: `#${e.rank} Switch most ordered` },
      ],
      compatibility: ["Nintendo Switch", "Nintendo Switch OLED", "Nintendo Switch Lite"],
      featured: e.rank <= 8,
      bestSeller: e.rank <= 12,
      newArrival: e.rank <= 6,
      onDeal: Boolean(e.compareAt),
      dealEndsAt: e.compareAt
        ? new Date(Date.now() + 1000 * 60 * 60 * (20 + e.rank)).toISOString()
        : undefined,
      shippingInfo:
        "Original sealed Switch cartridge. Free shipping over Rs. 15,000. Dispatch within 24 hours across Pakistan.",
      createdAt: new Date(Date.UTC(2026, 6, 18 - Math.min(e.rank, 12))).toISOString(),
    };
  });
}

export const TOP_SWITCH_HANDLES = new Set(
  TOP_SWITCH_PAKISTAN_ENTRIES.map((e) => e.handle),
);
