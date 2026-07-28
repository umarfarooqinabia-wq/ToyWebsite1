import type { Product } from "@/types/commerce";
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
  /** Popularity rank in PK market (1 = most ordered) */
  rank: number;
  steamId?: string;
  youtubeId?: string;
  videoTitle?: string;
  /**
   * Wide promotional art when Steam `library_hero` is missing/placeholder
   * (e.g. FC 26 ships a blank geometric hero on the CDN).
   */
  bannerImage?: string;
  /** Portrait/cover override when `library_600x900` is unavailable */
  coverImage?: string;
};

/**
 * Top 50 PS5 physical discs most ordered across Pakistani markets
 * (Lahore / Karachi / Islamabad game shops — sports, fighters, COD, exclusives, open-world).
 */
export const TOP50_PS5_PAKISTAN_ENTRIES: TopEntry[] = [
  {
    rank: 1,
    handle: "fifa-26-ps5",
    title: "EA SPORTS FC 26 — PS5 Disc",
    brand: "EA",
    price: 15999,
    genre: "Sports",
    blurb: "Pakistan’s #1 football disc every season.",
    steamId: "3405690",
    youtubeId: "TSi0iJYSQ24",
    videoTitle: "EA SPORTS FC 26 — Official Reveal Trailer",
    // Steam library_hero for 3405690 is a blank placeholder — use real store art.
    bannerImage:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3405690/a14e10a7888f514ebc7d255a03101e710292bbe0/page_bg_raw.jpg",
    coverImage:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3405690/64d362e71693f1ec7023f52ab94026f9a0d4fbed/header.jpg",
  },
  { rank: 2, handle: "gta-v-ps5", title: "Grand Theft Auto V — PS5 Disc", brand: "Rockstar", price: 6699, compareAt: 7999, genre: "Open World", blurb: "All-time most traded PS5 CD in Pakistan.", steamId: "271590", youtubeId: "QkkoHAzjnUs", videoTitle: "Grand Theft Auto V Trailer" },
  { rank: 3, handle: "wwe-2k26-ps5", title: "WWE 2K26 — PS5 Disc", brand: "2K", price: 15200, genre: "Sports / Fighting", blurb: "Top wrestling seller with huge local demand.", youtubeId: "oYd6rXOrz7E", videoTitle: "WWE 2K26 — Official Announce Trailer" },
  { rank: 4, handle: "spiderman-2-ps5", title: "Marvel's Spider-Man 2 — PS5 Disc", brand: "Sony", price: 12999, compareAt: 14999, genre: "Action-Adventure", blurb: "Top exclusive disc across major cities.", steamId: "2651280", youtubeId: "ZRhJT2nmvA4", videoTitle: "Spider-Man 2 — Gameplay Reveal" },
  { rank: 5, handle: "tekken-8-ps5", title: "TEKKEN 8 — PS5 Disc", brand: "Bandai Namco", price: 10999, genre: "Fighting", blurb: "#1 fighting-game disc in arcade cafés & homes.", steamId: "1778820", youtubeId: "_MM4clV2qjE", videoTitle: "TEKKEN 8 — Official Launch Trailer" },
  { rank: 6, handle: "call-of-duty-black-ops-6-ps5", title: "Call of Duty: Black Ops 6 — PS5 Disc", brand: "Activision", price: 13999, genre: "FPS", blurb: "FPS staple — campaign + multiplayer on disc.", youtubeId: "h0uxvKUjsj4", videoTitle: "Black Ops 6 — Launch Gameplay Trailer" },
  { rank: 7, handle: "god-of-war-ragnarok-ps5", title: "God of War Ragnarök — PS5 Disc", brand: "Sony", price: 9999, compareAt: 11999, genre: "Action-Adventure", blurb: "Consistently top exclusive sales in Pakistan.", steamId: "2322010", youtubeId: "TXukPnO9IdY", videoTitle: "God of War Ragnarök — Gameplay Trailer" },
  { rank: 8, handle: "nba-2k26-ps5", title: "NBA 2K26 — PS5 Disc", brand: "2K", price: 14999, genre: "Sports", blurb: "Seasonal sports disc with strong MyCAREER demand.", steamId: "3472040", youtubeId: "Mh57YWNaQC4", videoTitle: "NBA 2K26 — Official Gameplay Trailer" },
  { rank: 9, handle: "mortal-kombat-1-ps5", title: "Mortal Kombat 1 — PS5 Disc", brand: "Warner Bros", price: 8950, compareAt: 9999, genre: "Fighting", blurb: "High-demand fighter for local 1v1 sessions.", steamId: "1971870", youtubeId: "UZ6eFEjFfJ0", videoTitle: "Mortal Kombat 1 — Official Trailer" },
  { rank: 10, handle: "red-dead-redemption-2-ps5", title: "Red Dead Redemption 2 — PS5 Disc", brand: "Rockstar", price: 7499, compareAt: 8999, genre: "Open World", blurb: "Western epic still flying off shelves.", steamId: "1174180", youtubeId: "eaW0tYpxyp0", videoTitle: "Red Dead Redemption 2 — Official Trailer" },
  { rank: 11, handle: "ghost-of-tsushima-directors-cut-ps5", title: "Ghost of Tsushima Director's Cut — PS5 Disc", brand: "Sony", price: 9999, compareAt: 12499, genre: "Action-Adventure", blurb: "Samurai favourite with strong disc resale value.", steamId: "2215430", youtubeId: "sc4_dXjkCl8", videoTitle: "Ghost of Tsushima Director's Cut Trailer" },
  { rank: 12, handle: "last-of-us-part-ii-remastered-ps5", title: "The Last of Us Part II Remastered — PS5 Disc", brand: "Sony", price: 11999, genre: "Action-Adventure", blurb: "Story exclusive that stays in top CD charts.", youtubeId: "-llaUBqovHw", videoTitle: "TLOU Part II Remastered — Launch Trailer" },
  { rank: 13, handle: "assassins-creed-shadows-ps5", title: "Assassin's Creed Shadows — PS5 Disc", brand: "Ubisoft", price: 15999, genre: "Action-Adventure", blurb: "New AC open-world with heavy launch demand.", steamId: "3159330", youtubeId: "vovkzbtYBC8", videoTitle: "Assassin's Creed Shadows Trailer" },
  { rank: 14, handle: "astro-bot-ps5", title: "ASTRO BOT — PS5 Physical Edition", brand: "Sony", price: 12999, genre: "Platformer", blurb: "Award-winning family exclusive — gift favourite.", youtubeId: "wHMNQzLG_Jg", videoTitle: "ASTRO BOT — Announcement Trailer" },
  { rank: 15, handle: "fc-25-ps5", title: "EA SPORTS FC 25 — PS5 Disc", brand: "EA", price: 7999, compareAt: 9999, genre: "Sports", blurb: "Previous-season football disc — value king.", steamId: "2669320", youtubeId: "TSi0iJYSQ24", videoTitle: "EA SPORTS FC Trailer" },
  { rank: 16, handle: "cod-modern-warfare-iii-ps5", title: "Call of Duty: Modern Warfare III — PS5 Disc", brand: "Activision", price: 9999, compareAt: 12999, genre: "FPS", blurb: "MW series remains a top FPS disc order.", steamId: "3595270", youtubeId: "h0uxvKUjsj4", videoTitle: "Call of Duty Gameplay Trailer" },
  { rank: 17, handle: "ufc-5-ps5", title: "EA Sports UFC 5 — PS5 Disc", brand: "EA", price: 10999, genre: "Sports / Fighting", blurb: "MMA disc popular with fighting fans nationwide.", youtubeId: "UZ6eFEjFfJ0", videoTitle: "UFC 5 Trailer" },
  { rank: 18, handle: "elden-ring-ps5", title: "Elden Ring — PS5 Disc", brand: "Bandai Namco", price: 8999, compareAt: 10999, genre: "Action RPG", blurb: "Soulsborne smash — steady premium disc sales.", steamId: "1245620", youtubeId: "E3Huy2cdih0", videoTitle: "Elden Ring — Official Trailer" },
  { rank: 19, handle: "hogwarts-legacy-ps5", title: "Hogwarts Legacy — PS5 Disc", brand: "Warner Bros", price: 8499, compareAt: 9999, genre: "Action RPG", blurb: "Wizarding-world open world — strong teen demand.", steamId: "990080", youtubeId: "BtyBjOW8sGY", videoTitle: "Hogwarts Legacy Trailer" },
  { rank: 20, handle: "cyberpunk-2077-ps5", title: "Cyberpunk 2077 — PS5 Disc", brand: "CD PROJEKT RED", price: 6999, compareAt: 8999, genre: "RPG", blurb: "Next-gen update made this a hot PS5 CD again.", steamId: "1091500", youtubeId: "8X2kIfS6fb8", videoTitle: "Cyberpunk 2077 Trailer" },
  { rank: 21, handle: "spiderman-miles-morales-ps5", title: "Marvel's Spider-Man: Miles Morales — PS5 Disc", brand: "Sony", price: 7999, compareAt: 9999, genre: "Action-Adventure", blurb: "Entry exclusive often bundled / gifted.", steamId: "1817190", youtubeId: "NTunTUOw62M", videoTitle: "Miles Morales Trailer" },
  { rank: 22, handle: "last-of-us-part-i-ps5", title: "The Last of Us Part I — PS5 Disc", brand: "Sony", price: 10999, genre: "Action-Adventure", blurb: "Remake disc for fans starting the saga.", steamId: "1888930", youtubeId: "CxLWJSzpXuw", videoTitle: "The Last of Us Part I Trailer" },
  { rank: 23, handle: "horizon-forbidden-west-ps5", title: "Horizon Forbidden West — PS5 Disc", brand: "Sony", price: 8999, compareAt: 11999, genre: "Action RPG", blurb: "Aloy’s sequel — reliable exclusive seller.", steamId: "2420110", youtubeId: "sU5lEfAkOGM", videoTitle: "Horizon Forbidden West Trailer" },
  { rank: 24, handle: "uncharted-legacy-ps5", title: "UNCHARTED: Legacy of Thieves Collection — PS5 Disc", brand: "Sony", price: 7499, compareAt: 9499, genre: "Action-Adventure", blurb: "Nathan Drake collection — classic gift disc.", steamId: "1659420", youtubeId: "AhplLMWBz7U", videoTitle: "Uncharted Legacy Trailer" },
  { rank: 25, handle: "gran-turismo-7-ps5", title: "Gran Turismo 7 — PS5 Disc", brand: "Sony", price: 9999, genre: "Racing", blurb: "Sim racing disc for wheel setups & GT fans.", youtubeId: "1tIzvOSZOjY", videoTitle: "Gran Turismo 7 Trailer" },
  { rank: 26, handle: "ratchet-clank-rift-apart-ps5", title: "Ratchet & Clank: Rift Apart — PS5 Disc", brand: "Sony", price: 8499, genre: "Platformer", blurb: "Showpiece exclusive for new PS5 owners.", steamId: "1895880", youtubeId: "ai3o0XtrnBk", videoTitle: "Ratchet & Clank Rift Apart Trailer" },
  { rank: 27, handle: "helldivers-2-ps5", title: "HELLDIVERS 2 — PS5 Disc", brand: "Sony", price: 9999, genre: "Co-op Shooter", blurb: "Co-op hit with booming café & friend groups.", steamId: "553850", youtubeId: "7jKLo37fZIU", videoTitle: "Helldivers 2 Trailer" },
  { rank: 28, handle: "black-myth-wukong-ps5", title: "Black Myth: Wukong — PS5 Disc", brand: "Game Science", price: 14999, genre: "Action RPG", blurb: "Viral action RPG — high import disc demand.", steamId: "2358720", youtubeId: "iBqM2gWAmZc", videoTitle: "Black Myth Wukong Trailer" },
  { rank: 29, handle: "dragon-ball-sparking-zero-ps5", title: "DRAGON BALL: Sparking! ZERO — PS5 Disc", brand: "Bandai Namco", price: 12999, genre: "Fighting", blurb: "Anime fighter flying out of Karachi shops.", steamId: "1790600", youtubeId: "VDSyBML8MY4", videoTitle: "Sparking ZERO Trailer" },
  { rank: 30, handle: "street-fighter-6-ps5", title: "Street Fighter 6 — PS5 Disc", brand: "Capcom", price: 8999, genre: "Fighting", blurb: "Competitive fighter for tournament circles.", steamId: "1364780", youtubeId: "1INU3FIXRHI", videoTitle: "Street Fighter 6 Trailer" },
  { rank: 31, handle: "resident-evil-4-ps5", title: "Resident Evil 4 — PS5 Disc", brand: "Capcom", price: 9999, genre: "Survival Horror", blurb: "Remake horror disc — steady year-round sales.", steamId: "2050650", youtubeId: "E69tKrfEQag", videoTitle: "Resident Evil 4 Remake Trailer" },
  { rank: 32, handle: "wwe-2k24-ps5", title: "WWE 2K24 — PS5 Disc", brand: "2K", price: 6999, compareAt: 9999, genre: "Sports / Fighting", blurb: "Previous WWE disc — budget wrestling pick.", steamId: "2315690", youtubeId: "oYd6rXOrz7E", videoTitle: "WWE 2K Trailer" },
  { rank: 33, handle: "assassins-creed-mirage-ps5", title: "Assassin's Creed Mirage — PS5 Disc", brand: "Ubisoft", price: 6999, compareAt: 8999, genre: "Action-Adventure", blurb: "Compact AC — popular mid-price disc.", steamId: "3035570", youtubeId: "x5uJHWnq7kI", videoTitle: "Assassin's Creed Mirage Trailer" },
  { rank: 34, handle: "assassins-creed-valhalla-ps5", title: "Assassin's Creed Valhalla — PS5 Disc", brand: "Ubisoft", price: 5999, compareAt: 7999, genre: "Action RPG", blurb: "Viking open world — long-tail bestseller.", steamId: "2208920", youtubeId: "ssrNcwxALS4", videoTitle: "Assassin's Creed Valhalla Trailer" },
  { rank: 35, handle: "far-cry-6-ps5", title: "Far Cry 6 — PS5 Disc", brand: "Ubisoft", price: 5499, compareAt: 7499, genre: "FPS / Open World", blurb: "Open-world shooter still in weekly top lists.", steamId: "2369390", youtubeId: "DMh0u8qz2EI", videoTitle: "Far Cry 6 Trailer" },
  { rank: 36, handle: "it-takes-two-ps5", title: "It Takes Two — PS5 Disc", brand: "EA", price: 6499, compareAt: 8499, genre: "Co-op Adventure", blurb: "Couples & friends co-op — gift disc favourite.", steamId: "1426210", youtubeId: "ohClxzjg91M", videoTitle: "It Takes Two Trailer" },
  { rank: 37, handle: "jedi-survivor-ps5", title: "STAR WARS Jedi: Survivor — PS5 Disc", brand: "EA", price: 8999, genre: "Action-Adventure", blurb: "Star Wars action with solid import demand.", steamId: "1774580", youtubeId: "VRjb9YFchcY", videoTitle: "Jedi Survivor Trailer" },
  { rank: 38, handle: "final-fantasy-xvi-ps5", title: "FINAL FANTASY XVI — PS5 Disc", brand: "Square Enix", price: 9999, genre: "Action RPG", blurb: "FF exclusive era disc for RPG collectors.", steamId: "2515020", youtubeId: "gV5n1V4s8f8", videoTitle: "FINAL FANTASY XVI Trailer" },
  { rank: 39, handle: "days-gone-ps5", title: "Days Gone — PS5 Disc", brand: "Sony", price: 4999, compareAt: 6999, genre: "Action-Adventure", blurb: "Zombie open world — strong value CD.", steamId: "1259420", youtubeId: "FKtaOY9lMvM", videoTitle: "Days Gone Trailer" },
  { rank: 40, handle: "death-stranding-dc-ps5", title: "Death Stranding Director's Cut — PS5 Disc", brand: "Sony", price: 6999, genre: "Action", blurb: "Kojima cult classic — collector disc sales.", steamId: "1850570", youtubeId: "tCI960As8R0", videoTitle: "Death Stranding Trailer" },
  { rank: 41, handle: "returnal-ps5", title: "Returnal — PS5 Disc", brand: "Sony", price: 7499, genre: "Roguelike Shooter", blurb: "Premium exclusive for hardcore PS5 owners.", steamId: "1649240", youtubeId: "iuKZT74bQ-4", videoTitle: "Returnal Trailer" },
  { rank: 42, handle: "sackboy-ps5", title: "Sackboy: A Big Adventure — PS5 Disc", brand: "Sony", price: 5999, compareAt: 7999, genre: "Platformer", blurb: "Family platformer — kids & gift market.", steamId: "1599660", youtubeId: "H2Jc2hJG5Qg", videoTitle: "Sackboy Trailer" },
  { rank: 43, handle: "until-dawn-ps5", title: "Until Dawn — PS5 Disc", brand: "Sony", price: 8999, genre: "Horror", blurb: "Horror remake demand among streamers.", steamId: "2172010", youtubeId: "4b-VYz1z8ps", videoTitle: "Until Dawn Trailer" },
  { rank: 44, handle: "silent-hill-2-ps5", title: "SILENT HILL 2 — PS5 Disc", brand: "Konami", price: 12999, genre: "Survival Horror", blurb: "Remake horror — premium collector orders.", steamId: "2124490", youtubeId: "YQJxrFdnUcI", videoTitle: "SILENT HILL 2 Trailer" },
  { rank: 45, handle: "cricket-24-ps5", title: "Cricket 24 — PS5 Disc", brand: "Nacon", price: 9999, genre: "Sports", blurb: "Local cricket passion = consistent disc sales.", steamId: "2358260", youtubeId: "Mh57YWNaQC4", videoTitle: "Cricket 24 Trailer" },
  { rank: 46, handle: "f1-25-ps5", title: "F1 25 — PS5 Disc", brand: "EA", price: 12999, genre: "Racing", blurb: "Formula 1 season disc for racing fans.", steamId: "3059520", youtubeId: "1tIzvOSZOjY", videoTitle: "F1 25 Trailer" },
  { rank: 47, handle: "need-for-speed-unbound-ps5", title: "Need for Speed Unbound — PS5 Disc", brand: "EA", price: 6499, compareAt: 8499, genre: "Racing", blurb: "Street racing disc popular with younger buyers.", steamId: "1846380", youtubeId: "K2V2m6pPw9c", videoTitle: "NFS Unbound Trailer" },
  { rank: 48, handle: "avatar-frontiers-ps5", title: "Avatar: Frontiers of Pandora — PS5 Disc", brand: "Ubisoft", price: 8999, genre: "Action-Adventure", blurb: "Pandora open world — cinematic disc buyers.", steamId: "2840770", youtubeId: "d9Q5YwZvGk0", videoTitle: "Avatar Frontiers Trailer" },
  { rank: 49, handle: "monster-hunter-wilds-ps5", title: "Monster Hunter Wilds — PS5 Disc", brand: "Capcom", price: 14999, genre: "Action RPG", blurb: "Hunt co-op title with rising import demand.", steamId: "2246340", youtubeId: "EebTs3Kk6xg", videoTitle: "Monster Hunter Wilds Trailer" },
  { rank: 50, handle: "stellar-blade-ps5", title: "Stellar Blade — PS5 Disc", brand: "Sony", price: 12999, genre: "Action", blurb: "Stylish exclusive — strong curiosity sales.", steamId: "3489700", youtubeId: "wHMNQzLG_Jg", videoTitle: "Stellar Blade Trailer" },
];

export function buildTop50Ps5Products(): Product[] {
  return TOP50_PS5_PAKISTAN_ENTRIES.map((e) => {
    const id = `top50-${e.rank}`;
    const seo = getGameSeoDescription(e.title);
    return {
      id,
      handle: e.handle,
      title: e.title,
      brand: e.brand,
      description:
        seo ??
        `${e.blurb} Original PS5 Blu-ray disc edition — sealed stock for the Pakistani market with trade-in friendly physical media.`,
      category: "ps5-games",
      categoryPath: ["games", "ps5-games", "best-sellers"],
      platform: ["PlayStation 5"],
      tags: [
        "game",
        "ps5-cd",
        "top-pakistan",
        "top-50",
        e.genre.toLowerCase().replace(/\s+/g, "-"),
      ],
      condition: "new" as const,
      rating: Math.max(4.2, 5 - e.rank * 0.01),
      reviewCount: Math.max(80, 3500 - e.rank * 40),
      images: [
        {
          url: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=800&q=80",
          alt: `${e.title} disc`,
          width: 800,
          height: 800,
        },
      ],
      variants: [
        {
          id: `var-top50-${e.rank}`,
          title: "Physical Disc",
          sku: `PTPK-T50-${String(e.rank).padStart(2, "0")}`,
          price: pkr(e.price),
          compareAtPrice: e.compareAt ? pkr(e.compareAt) : undefined,
          available: true,
          quantityAvailable: Math.max(25, 220 - e.rank * 3),
        },
      ],
      specs: [
        { label: "Genre", value: e.genre },
        { label: "Format", value: "Blu-ray Disc (PS5)" },
        { label: "Region", value: "Import / All region friendly*" },
        { label: "PK Market Rank", value: `#${e.rank} most ordered` },
      ],
      compatibility: ["PlayStation 5", "PlayStation 5 Slim", "PlayStation 5 Pro"],
      featured: e.rank <= 12,
      bestSeller: e.rank <= 30,
      newArrival: e.rank <= 8 || [13, 28, 49, 50].includes(e.rank),
      onDeal: Boolean(e.compareAt),
      dealEndsAt: e.compareAt
        ? new Date(Date.now() + 1000 * 60 * 60 * (12 + e.rank)).toISOString()
        : undefined,
      shippingInfo:
        "Original sealed PS5 disc. Free shipping over Rs. 15,000. Dispatch within 24 hours across Pakistan.",
      createdAt: new Date(Date.UTC(2026, 6, 23 - Math.min(e.rank, 20))).toISOString(),
    };
  });
}

export const TOP50_HANDLES = new Set(TOP50_PS5_PAKISTAN_ENTRIES.map((e) => e.handle));
