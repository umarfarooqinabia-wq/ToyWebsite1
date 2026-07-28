import type { Product, ProductImage, ProductVideo } from "@/types/commerce";
import { buildGameCoverImages } from "@/lib/commerce/steam-covers";

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
  /** When Steam portrait library art is missing */
  coverImage?: string;
  useSteamHero?: boolean;
};

/**
 * Top 50 Xbox Series X|S physical discs most ordered in Pakistan
 * (football, COD, fighters, Forza, Halo, multiplats — Lahore / Karachi / ISB).
 */
export const TOP50_XBOX_PAKISTAN_ENTRIES: TopEntry[] = [
  { rank: 1, handle: "fc-26-xbox", title: "EA SPORTS FC 26 — Xbox Series X|S", brand: "EA", price: 15999, genre: "Sports", blurb: "Pakistan’s #1 football disc on Xbox every season.", steamId: "3405690", youtubeId: "tKlRN2YpxRE", videoTitle: "EA SPORTS FC 26 Trailer", useSteamHero: true, coverImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3405690/64d362e71693f1ec7023f52ab94026f9a0d4fbed/header.jpg" },
  { rank: 2, handle: "gta-v-xbox", title: "Grand Theft Auto V — Xbox Series X|S", brand: "Rockstar", price: 6699, compareAt: 7999, genre: "Open World", blurb: "All-time most traded Xbox multiplat disc.", steamId: "271590", youtubeId: "QkkoHAzjnUs", videoTitle: "Grand Theft Auto V Trailer" },
  { rank: 3, handle: "forza-horizon-5-xbox", title: "Forza Horizon 5 — Xbox Series X|S", brand: "Xbox Game Studios", price: 9999, compareAt: 12999, genre: "Racing", blurb: "Mexico open-world racer — top Xbox exclusive seller.", steamId: "1551360", youtubeId: "FYH9n37B7cI", videoTitle: "Forza Horizon 5 Trailer" },
  { rank: 4, handle: "call-of-duty-black-ops-6-xbox", title: "Call of Duty: Black Ops 6 — Xbox Series X|S", brand: "Activision", price: 13999, genre: "FPS", blurb: "FPS staple — campaign + multiplayer on disc.", steamId: "2933080", youtubeId: "h0uxvKUjsj4", videoTitle: "Black Ops 6 Trailer" },
  { rank: 5, handle: "halo-infinite-xbox", title: "Halo Infinite — Xbox Series X|S", brand: "Xbox Game Studios", price: 7999, compareAt: 9999, genre: "FPS", blurb: "Master Chief exclusive — gift & Game Pass favourite.", steamId: "1240440", youtubeId: "PyMlV5_HRWk", videoTitle: "Halo Infinite Trailer" },
  { rank: 6, handle: "tekken-8-xbox", title: "TEKKEN 8 — Xbox Series X|S", brand: "Bandai Namco", price: 10999, genre: "Fighting", blurb: "#1 fighting disc for café & home Xbox setups.", steamId: "1778820", youtubeId: "_MM4clV2qjE", videoTitle: "TEKKEN 8 Trailer" },
  { rank: 7, handle: "wwe-2k26-xbox", title: "WWE 2K26 — Xbox Series X|S", brand: "2K", price: 15200, genre: "Sports / Fighting", blurb: "Top wrestling seller with huge local demand.", youtubeId: "oYd6rXOrz7E", videoTitle: "WWE 2K26 Trailer" },
  { rank: 8, handle: "nba-2k26-xbox", title: "NBA 2K26 — Xbox Series X|S", brand: "2K", price: 14999, genre: "Sports", blurb: "Seasonal basketball disc with MyCAREER demand.", steamId: "3472040", youtubeId: "Mh57YWNaQC4", videoTitle: "NBA 2K26 Trailer", useSteamHero: true },
  { rank: 9, handle: "mortal-kombat-1-xbox", title: "Mortal Kombat 1 — Xbox Series X|S", brand: "Warner Bros", price: 8950, compareAt: 9999, genre: "Fighting", blurb: "High-demand fighter for local 1v1 sessions.", steamId: "1971870", youtubeId: "UZ6eFEjFfJ0", videoTitle: "Mortal Kombat 1 Trailer" },
  { rank: 10, handle: "red-dead-redemption-2-xbox", title: "Red Dead Redemption 2 — Xbox Series X|S", brand: "Rockstar", price: 7499, compareAt: 8999, genre: "Open World", blurb: "Western epic still flying off shelves.", steamId: "1174180", youtubeId: "eaW0tYpxyp0", videoTitle: "Red Dead Redemption 2 Trailer" },
  { rank: 11, handle: "starfield-xbox", title: "Starfield — Xbox Series X|S", brand: "Bethesda", price: 11999, compareAt: 14999, genre: "RPG", blurb: "Xbox exclusive RPG — strong Series X disc interest.", steamId: "1716740", youtubeId: "pYqyVpKVOaI", videoTitle: "Starfield Trailer" },
  { rank: 12, handle: "sea-of-thieves-xbox", title: "Sea of Thieves — Xbox Series X|S", brand: "Xbox Game Studios", price: 5999, compareAt: 7999, genre: "Adventure", blurb: "Pirate co-op hit for friends & Game Pass fans.", steamId: "1172620", youtubeId: "ASi5xkEbFjE", videoTitle: "Sea of Thieves Trailer" },
  { rank: 13, handle: "assassin-creed-shadows-xbox", title: "Assassin's Creed Shadows — Xbox Series X|S", brand: "Ubisoft", price: 15999, genre: "Action-Adventure", blurb: "New AC open-world with heavy launch demand.", steamId: "3159330", youtubeId: "vovkzbtYBC8", videoTitle: "Assassin's Creed Shadows Trailer" },
  { rank: 14, handle: "fc-25-xbox", title: "EA SPORTS FC 25 — Xbox Series X|S", brand: "EA", price: 7999, compareAt: 9999, genre: "Sports", blurb: "Previous-season football disc — value king.", steamId: "2669320", youtubeId: "tKlRN2YpxRE", videoTitle: "EA SPORTS FC Trailer" },
  { rank: 15, handle: "cod-modern-warfare-iii-xbox", title: "Call of Duty: Modern Warfare III — Xbox Series X|S", brand: "Activision", price: 9999, compareAt: 12999, genre: "FPS", blurb: "MW series remains a top FPS disc order.", steamId: "3595270", youtubeId: "h0uxvKUjsj4", videoTitle: "Call of Duty Trailer" },
  { rank: 16, handle: "indiana-jones-great-circle-xbox", title: "Indiana Jones and the Great Circle — Xbox Series X|S", brand: "Bethesda", price: 12999, genre: "Action-Adventure", blurb: "Xbox exclusive adventure — cinematic disc buyers.", steamId: "1030830", youtubeId: "Zf_WGP5xq6o", videoTitle: "Indiana Jones Trailer" },
  { rank: 17, handle: "ufc-5-xbox", title: "EA Sports UFC 5 — Xbox Series X|S", brand: "EA", price: 10999, genre: "Sports / Fighting", blurb: "MMA disc popular with fighting fans nationwide.", youtubeId: "UZ6eFEjFfJ0", videoTitle: "UFC 5 Trailer" },
  { rank: 18, handle: "elden-ring-xbox", title: "Elden Ring — Xbox Series X|S", brand: "Bandai Namco", price: 8999, compareAt: 10999, genre: "Action RPG", blurb: "Soulsborne smash — steady premium disc sales.", steamId: "1245620", youtubeId: "E3Huy2cdih0", videoTitle: "Elden Ring Trailer" },
  { rank: 19, handle: "hogwarts-legacy-xbox", title: "Hogwarts Legacy — Xbox Series X|S", brand: "Warner Bros", price: 8499, compareAt: 9999, genre: "Action RPG", blurb: "Wizarding-world open world — strong teen demand.", steamId: "990080", youtubeId: "BtyBjOW8sGY", videoTitle: "Hogwarts Legacy Trailer" },
  { rank: 20, handle: "cyberpunk-2077-xbox", title: "Cyberpunk 2077 — Xbox Series X|S", brand: "CD PROJEKT RED", price: 6999, compareAt: 8999, genre: "RPG", blurb: "Next-gen update made this a hot Series X CD again.", steamId: "1091500", youtubeId: "8X2kIfS6fb8", videoTitle: "Cyberpunk 2077 Trailer" },
  { rank: 21, handle: "forza-motorsport-xbox", title: "Forza Motorsport — Xbox Series X|S", brand: "Xbox Game Studios", price: 10999, genre: "Racing", blurb: "Sim racing exclusive for wheel setups & GT fans.", steamId: "2440510", youtubeId: "5BdYrT0bZc4", videoTitle: "Forza Motorsport Trailer" },
  { rank: 22, handle: "gears-5-xbox", title: "Gears 5 — Xbox Series X|S", brand: "Xbox Game Studios", price: 4999, compareAt: 6999, genre: "Shooter", blurb: "Gears campaign + Horde — classic Xbox exclusive.", steamId: "1097840", youtubeId: "0up1dADokF0", videoTitle: "Gears 5 Trailer" },
  { rank: 23, handle: "microsoft-flight-simulator-xbox", title: "Microsoft Flight Simulator — Xbox Series X|S", brand: "Xbox Game Studios", price: 9999, genre: "Simulation", blurb: "Showcase exclusive for Series X power users.", steamId: "1250410", youtubeId: "epgt8Y8QG3w", videoTitle: "Flight Simulator Trailer" },
  { rank: 24, handle: "hi-fi-rush-xbox", title: "Hi-Fi RUSH — Xbox Series X|S", brand: "Bethesda", price: 5999, compareAt: 7999, genre: "Action", blurb: "Rhythm brawler exclusive — cult Xbox favourite.", steamId: "1817230", youtubeId: "5f6E0F6v8vY", videoTitle: "Hi-Fi RUSH Trailer" },
  { rank: 25, handle: "grounded-xbox", title: "Grounded — Xbox Series X|S", brand: "Xbox Game Studios", price: 5499, compareAt: 6999, genre: "Survival", blurb: "Co-op survival hit for friend groups.", steamId: "962130", youtubeId: "J7mVW3yvGVE", videoTitle: "Grounded Trailer" },
  { rank: 26, handle: "helldivers-2-xbox", title: "HELLDIVERS 2 — Xbox Series X|S", brand: "Sony", price: 9999, genre: "Co-op Shooter", blurb: "Co-op hit now on Xbox — booming café & friend groups.", steamId: "553850", youtubeId: "7jKLo37fZIU", videoTitle: "Helldivers 2 Trailer" },
  { rank: 27, handle: "black-myth-wukong-xbox", title: "Black Myth: Wukong — Xbox Series X|S", brand: "Game Science", price: 14999, genre: "Action RPG", blurb: "Viral action RPG — high import disc demand.", steamId: "2358720", youtubeId: "iBqM2gWAmZc", videoTitle: "Black Myth Wukong Trailer" },
  { rank: 28, handle: "dragon-ball-sparking-zero-xbox", title: "DRAGON BALL: Sparking! ZERO — Xbox Series X|S", brand: "Bandai Namco", price: 12999, genre: "Fighting", blurb: "Anime fighter flying out of Karachi shops.", steamId: "1790600", youtubeId: "VDSyBML8MY4", videoTitle: "Sparking ZERO Trailer" },
  { rank: 29, handle: "street-fighter-6-xbox", title: "Street Fighter 6 — Xbox Series X|S", brand: "Capcom", price: 8999, genre: "Fighting", blurb: "Competitive fighter for tournament circles.", steamId: "1364780", youtubeId: "1INU3FIXRHI", videoTitle: "Street Fighter 6 Trailer" },
  { rank: 30, handle: "resident-evil-4-xbox", title: "Resident Evil 4 — Xbox Series X|S", brand: "Capcom", price: 9999, genre: "Survival Horror", blurb: "Remake horror disc — steady year-round sales.", steamId: "2050650", youtubeId: "E69tKrfEQag", videoTitle: "Resident Evil 4 Remake Trailer" },
  { rank: 31, handle: "wwe-2k24-xbox", title: "WWE 2K24 — Xbox Series X|S", brand: "2K", price: 6999, compareAt: 9999, genre: "Sports / Fighting", blurb: "Previous WWE disc — budget wrestling pick.", steamId: "2315690", youtubeId: "oYd6rXOrz7E", videoTitle: "WWE 2K Trailer" },
  { rank: 32, handle: "assassin-creed-mirage-xbox", title: "Assassin's Creed Mirage — Xbox Series X|S", brand: "Ubisoft", price: 6999, compareAt: 8999, genre: "Action-Adventure", blurb: "Compact AC — popular mid-price disc.", steamId: "3035570", youtubeId: "x5uJHWnq7kI", videoTitle: "Assassin's Creed Mirage Trailer" },
  { rank: 33, handle: "assassin-creed-valhalla-xbox", title: "Assassin's Creed Valhalla — Xbox Series X|S", brand: "Ubisoft", price: 5999, compareAt: 7999, genre: "Action RPG", blurb: "Viking open world — long-tail bestseller.", steamId: "2208920", youtubeId: "ssrNcwxALS4", videoTitle: "Assassin's Creed Valhalla Trailer" },
  { rank: 34, handle: "far-cry-6-xbox", title: "Far Cry 6 — Xbox Series X|S", brand: "Ubisoft", price: 5499, compareAt: 7499, genre: "FPS / Open World", blurb: "Open-world shooter still in weekly top lists.", steamId: "2369390", youtubeId: "DMh0u8qz2EI", videoTitle: "Far Cry 6 Trailer" },
  { rank: 35, handle: "it-takes-two-xbox", title: "It Takes Two — Xbox Series X|S", brand: "EA", price: 6499, compareAt: 8499, genre: "Co-op Adventure", blurb: "Couples & friends co-op — gift disc favourite.", steamId: "1426210", youtubeId: "ohClxzjg91M", videoTitle: "It Takes Two Trailer" },
  { rank: 36, handle: "jedi-survivor-xbox", title: "STAR WARS Jedi: Survivor — Xbox Series X|S", brand: "EA", price: 8999, genre: "Action-Adventure", blurb: "Star Wars action with solid import demand.", steamId: "1774580", youtubeId: "VRjb9YFchcY", videoTitle: "Jedi Survivor Trailer" },
  { rank: 37, handle: "diablo-iv-xbox", title: "Diablo IV — Xbox Series X|S", brand: "Blizzard", price: 9999, compareAt: 12999, genre: "Action RPG", blurb: "Loot ARPG — strong seasonal disc interest.", steamId: "2344520", youtubeId: "9bRWId0iCdA", videoTitle: "Diablo IV Trailer" },
  { rank: 38, handle: "senua-hellblade-2-xbox", title: "Senua's Saga: Hellblade II — Xbox Series X|S", brand: "Xbox Game Studios", price: 8999, genre: "Action-Adventure", blurb: "Showcase exclusive for Series X cinematic fans.", steamId: "2461850", youtubeId: "XYtyeqVQnHI", videoTitle: "Hellblade II Trailer" },
  { rank: 39, handle: "avatar-frontiers-xbox", title: "Avatar: Frontiers of Pandora — Xbox Series X|S", brand: "Ubisoft", price: 8999, genre: "Action-Adventure", blurb: "Pandora open world — cinematic disc buyers.", steamId: "2840770", youtubeId: "d9Q5YwZvGk0", videoTitle: "Avatar Frontiers Trailer" },
  { rank: 40, handle: "monster-hunter-wilds-xbox", title: "Monster Hunter Wilds — Xbox Series X|S", brand: "Capcom", price: 14999, genre: "Action RPG", blurb: "Hunt co-op title with rising import demand.", steamId: "2246340", youtubeId: "EebTs3Kk6xg", videoTitle: "Monster Hunter Wilds Trailer" },
  { rank: 41, handle: "f1-25-xbox", title: "F1 25 — Xbox Series X|S", brand: "EA", price: 12999, genre: "Racing", blurb: "Formula 1 season disc for racing fans.", steamId: "3059520", youtubeId: "1tIzvOSZOjY", videoTitle: "F1 25 Trailer" },
  { rank: 42, handle: "need-for-speed-unbound-xbox", title: "Need for Speed Unbound — Xbox Series X|S", brand: "EA", price: 6499, compareAt: 8499, genre: "Racing", blurb: "Street racing disc popular with younger buyers.", steamId: "1846380", youtubeId: "K2V2m6pPw9c", videoTitle: "NFS Unbound Trailer" },
  { rank: 43, handle: "cricket-24-xbox", title: "Cricket 24 — Xbox Series X|S", brand: "Nacon", price: 9999, genre: "Sports", blurb: "Local cricket passion = consistent disc sales.", steamId: "2358260", youtubeId: "Mh57YWNaQC4", videoTitle: "Cricket 24 Trailer" },
  { rank: 44, handle: "pentiment-xbox", title: "Pentiment — Xbox Series X|S", brand: "Xbox Game Studios", price: 4499, compareAt: 5999, genre: "Adventure", blurb: "Narrative exclusive for story-driven Xbox fans.", steamId: "1205520", youtubeId: "n0n2QbW5eYw", videoTitle: "Pentiment Trailer" },
  { rank: 45, handle: "ori-will-of-wisps-xbox", title: "Ori and the Will of the Wisps — Xbox Series X|S", brand: "Xbox Game Studios", price: 3999, compareAt: 5499, genre: "Platformer", blurb: "Beautiful exclusive platformer — gift favourite.", steamId: "1057090", youtubeId: "2MwDs4Bn6kI", videoTitle: "Ori Will of the Wisps Trailer" },
  { rank: 46, handle: "state-of-decay-2-xbox", title: "State of Decay 2 — Xbox Series X|S", brand: "Xbox Game Studios", price: 3999, compareAt: 5499, genre: "Survival", blurb: "Zombie survival exclusive — value Xbox pick.", steamId: "495420", youtubeId: "vVTh3r0e4mE", videoTitle: "State of Decay 2 Trailer" },
  { rank: 47, handle: "gears-tactics-xbox", title: "Gears Tactics — Xbox Series X|S", brand: "Xbox Game Studios", price: 4499, compareAt: 5999, genre: "Strategy", blurb: "Turn-based Gears for strategy Xbox fans.", steamId: "1073440", youtubeId: "a0Q1lH0dZ0Q", videoTitle: "Gears Tactics Trailer" },
  { rank: 48, handle: "psychonauts-2-xbox", title: "Psychonauts 2 — Xbox Series X|S", brand: "Xbox Game Studios", price: 4999, compareAt: 6999, genre: "Platformer", blurb: "Cult platformer exclusive — collector interest.", steamId: "607060", youtubeId: "a-v4vSJyGec", videoTitle: "Psychonauts 2 Trailer" },
  { rank: 49, handle: "as-dusk-falls-xbox", title: "As Dusk Falls — Xbox Series X|S", brand: "Xbox Game Studios", price: 4499, compareAt: 5999, genre: "Adventure", blurb: "Cinematic choice story — streamer & gift disc.", steamId: "1601570", youtubeId: "8mGqN6kYQ0Y", videoTitle: "As Dusk Falls Trailer" },
  { rank: 50, handle: "age-of-empires-iv-xbox", title: "Age of Empires IV — Xbox Series X|S", brand: "Xbox Game Studios", price: 6999, compareAt: 8999, genre: "Strategy", blurb: "RTS classic revived — PC & Xbox strategy fans.", steamId: "1466860", youtubeId: "b_I4_4V8Q0Q", videoTitle: "Age of Empires IV Trailer" },
];

function mediaFor(entry: TopEntry): { images: ProductImage[]; video?: ProductVideo } {
  const name = entry.title.replace(/ —.*$/, "");
  return {
    images: buildGameCoverImages({
      alt: name,
      steamId: entry.steamId,
      youtubeId: entry.youtubeId,
      coverImage: entry.coverImage,
      preferHero: Boolean(entry.useSteamHero),
      discFallbackUrl:
        "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80",
    }),
    video:
      entry.youtubeId && entry.videoTitle
        ? { youtubeId: entry.youtubeId, title: entry.videoTitle }
        : undefined,
  };
}

export function buildTop50XboxProducts(): Product[] {
  return TOP50_XBOX_PAKISTAN_ENTRIES.map((e) => {
    const media = mediaFor(e);
    const id = `top-xbox-${e.rank}`;
    return {
      id,
      handle: e.handle,
      title: e.title,
      brand: e.brand,
      description: `${e.blurb} Original Xbox Series X|S Blu-ray disc edition — sealed stock for the Pakistani market.`,
      category: "xbox-games",
      categoryPath: ["games", "xbox-games", "best-sellers"],
      platform: ["Xbox Series X|S", "Xbox One"],
      tags: [
        "game",
        "xbox-cd",
        "top-pakistan",
        "top-xbox",
        "top-50",
        e.genre.toLowerCase().replace(/\s+/g, "-"),
      ],
      condition: "new" as const,
      rating: Math.max(4.2, 5 - e.rank * 0.01),
      reviewCount: Math.max(70, 3200 - e.rank * 45),
      images: media.images,
      video: media.video,
      variants: [
        {
          id: `var-top-xbox-${e.rank}`,
          title: "Physical Disc",
          sku: `PTPK-XBX-${String(e.rank).padStart(2, "0")}`,
          price: pkr(e.price),
          compareAtPrice: e.compareAt ? pkr(e.compareAt) : undefined,
          available: true,
          quantityAvailable: Math.max(22, 200 - e.rank * 3),
        },
      ],
      specs: [
        { label: "Genre", value: e.genre },
        { label: "Format", value: "Blu-ray Disc (Xbox Series X|S)" },
        { label: "Region", value: "Import / All region friendly*" },
        { label: "PK Market Rank", value: `#${e.rank} Xbox most ordered` },
      ],
      compatibility: ["Xbox Series X", "Xbox Series S", "Xbox One"],
      featured: e.rank <= 12,
      bestSeller: e.rank <= 30,
      newArrival: e.rank <= 8 || [13, 16, 27, 40].includes(e.rank),
      onDeal: Boolean(e.compareAt),
      dealEndsAt: e.compareAt
        ? new Date(Date.now() + 1000 * 60 * 60 * (14 + e.rank)).toISOString()
        : undefined,
      shippingInfo:
        "Original sealed Xbox Series X|S disc. Free shipping over Rs. 15,000. Dispatch within 24 hours across Pakistan.",
      createdAt: new Date(Date.UTC(2026, 6, 22 - Math.min(e.rank, 20))).toISOString(),
    };
  });
}

export const TOP50_XBOX_HANDLES = new Set(
  TOP50_XBOX_PAKISTAN_ENTRIES.map((e) => e.handle),
);
