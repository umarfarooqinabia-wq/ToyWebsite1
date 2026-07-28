import type { Product, ProductImage, ProductVideo } from "@/types/commerce";
import { inferGameBrand } from "@/lib/commerce/catalog-filters";
import { PS5_GAME_MEDIA } from "@/lib/commerce/ps5-media";
import { buildGameCoverImages } from "@/lib/commerce/steam-covers";
import { getGameSeoDescription } from "@/lib/commerce/game-seo-descriptions";

const pkr = (amount: number) => ({ amount, currencyCode: "PKR" as const });

type UsedEntry = {
  handle: string;
  title: string;
  brand: string;
  price: number;
  /** Shown as struck-through MRP when higher than price */
  compareAt?: number;
  platform: string[];
  categoryHint: "ps5-games" | "ps4-games" | "xbox-games" | "nintendo-switch-games";
  blurb: string;
  steamId?: string;
  youtubeId?: string;
  /** Reuse PS5 media pack by new-disc handle when available */
  mediaFrom?: string;
  coverImage?: string;
  /** Stock units — defaults to a demo quantity when omitted */
  quantity?: number;
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Compact used disc rows with optional cover media. */
type UsedDiscRow = {
  title: string;
  price: number;
  compareAt?: number;
  steamId?: string;
  coverImage?: string;
  youtubeId?: string;
  mediaFrom?: string;
};

function buildPs4UsedEntries(rows: UsedDiscRow[]): UsedEntry[] {
  return rows.map((row) => ({
    handle: `${slugify(row.title)}-used-ps4`,
    title: `${row.title} (Used) — PS4`,
    brand: inferGameBrand(row.title),
    price: row.price,
    compareAt: row.compareAt,
    platform: ["PlayStation 4"],
    categoryHint: "ps4-games" as const,
    blurb: "Used PS4 disc — inspected, case included, ready to play.",
    quantity: 2,
    steamId: row.steamId,
    coverImage: row.coverImage,
    youtubeId: row.youtubeId,
  }));
}

function buildPs5UsedEntries(rows: UsedDiscRow[]): UsedEntry[] {
  return rows.map((row) => ({
    handle: `${slugify(row.title)}-used-ps5`,
    title: `${row.title} (Used) — PS5`,
    brand: inferGameBrand(row.title),
    price: row.price,
    compareAt: row.compareAt,
    platform: ["PlayStation 5"],
    categoryHint: "ps5-games" as const,
    blurb: "Used PS5 disc — inspected, case included, ready to play.",
    quantity: 2,
    steamId: row.steamId,
    coverImage: row.coverImage,
    youtubeId: row.youtubeId,
    mediaFrom: row.mediaFrom,
  }));
}

const USED_ENTRIES: UsedEntry[] = [
  {
    handle: "god-of-war-ragnarok-used-ps5",
    title: "God of War Ragnarök (Used) — PS5",
    brand: "Sony",
    price: 7000,
    platform: ["PlayStation 5"],
    categoryHint: "ps5-games",
    blurb: "Tested used disc — excellent condition, case included.",
    mediaFrom: "god-of-war-ragnarok-ps5",
    steamId: "2322010",
    youtubeId: "TXukPnO9IdY",
    quantity: 2,
  },
  {
    handle: "gta-v-used-ps5",
    title: "Grand Theft Auto V (Used) — PS5",
    brand: "Rockstar",
    price: 3999,
    compareAt: 6699,
    platform: ["PlayStation 5"],
    categoryHint: "ps5-games",
    blurb: "Certified used PS5 disc — Pakistan’s most traded open-world title.",
    mediaFrom: "gta-v-ps5",
    steamId: "271590",
    youtubeId: "QkkoHAzjnUs",
  },
  {
    handle: "fc-25-used-ps5",
    title: "EA Sports FC 25 (Used) — PS5",
    brand: "EA",
    price: 5500,
    platform: ["PlayStation 5"],
    categoryHint: "ps5-games",
    blurb: "Previous-season football disc — used value pick.",
    mediaFrom: "fc-25-ps5",
    steamId: "2669320",
    youtubeId: "tKlRN2YpxRE",
    quantity: 2,
  },
  {
    handle: "tekken-8-used-ps5",
    title: "TEKKEN 8 (Used) — PS5",
    brand: "Bandai Namco",
    price: 6999,
    compareAt: 10999,
    platform: ["PlayStation 5"],
    categoryHint: "ps5-games",
    blurb: "Used fighter disc for café & home 1v1 sessions.",
    mediaFrom: "tekken-8-ps5",
    steamId: "1778820",
    youtubeId: "_MM4clV2qjE",
  },
  {
    handle: "rdr2-used-ps4",
    title: "Red Dead Redemption 2 (Used) — PS4",
    brand: "Rockstar",
    price: 2999,
    compareAt: 4999,
    platform: ["PlayStation 4"],
    categoryHint: "ps4-games",
    blurb: "Used PS4 western epic — strong last-gen demand.",
    steamId: "1174180",
    youtubeId: "eaW0tYpxyp0",
  },
  {
    handle: "forza-horizon-5-used-xbox",
    title: "Forza Horizon 5 (Used) — Xbox Series X|S",
    brand: "Xbox Game Studios",
    price: 5499,
    compareAt: 9999,
    platform: ["Xbox Series X|S", "Xbox One"],
    categoryHint: "xbox-games",
    blurb: "Used Xbox racing exclusive — tested and wiped.",
    steamId: "1551360",
    youtubeId: "FYH9n37B7cI",
  },
  {
    handle: "halo-infinite-used-xbox",
    title: "Halo Infinite (Used) — Xbox Series X|S",
    brand: "Xbox Game Studios",
    price: 3999,
    compareAt: 7999,
    platform: ["Xbox Series X|S", "Xbox One"],
    categoryHint: "xbox-games",
    blurb: "Used Master Chief disc — great Series X starter.",
    steamId: "1240440",
    youtubeId: "PyMlV5_HRWk",
  },
  {
    handle: "zelda-botw-used-switch",
    title: "The Legend of Zelda: Breath of the Wild (Used) — Switch",
    brand: "Nintendo",
    price: 6999,
    compareAt: 11999,
    platform: ["Nintendo Switch"],
    categoryHint: "nintendo-switch-games",
    blurb: "Used Switch cart — still one of Pakistan’s top Hyrule sellers.",
    youtubeId: "zw47_q9wbBE",
    coverImage:
      "https://assets.nintendo.com/image/upload/c_fill,g_center,w_600,h_900,f_jpg/q_auto/store/software/switch/70010000000025/7137262b5a64d921e193653f8aa0b722925abc5680380ca0e18a5cfd91697f58",
  },
  {
    handle: "mario-kart-8-used-switch",
    title: "Mario Kart 8 Deluxe (Used) — Switch",
    brand: "Nintendo",
    price: 7499,
    compareAt: 12999,
    platform: ["Nintendo Switch"],
    categoryHint: "nintendo-switch-games",
    blurb: "Used party cart — family favourite at a better price.",
    youtubeId: "tKlRN2YpxRE",
    coverImage:
      "https://assets.nintendo.com/image/upload/c_fill,g_center,w_600,h_900,f_jpg/q_auto/store/software/switch/70010000000153/de697f487a36d802dd9a5ff0341f717c8486221f2f1219b675af37aca63bc453",
  },
  ...buildPs4UsedEntries([
    { title: "Agents of Mayhem", price: 2000, steamId: "304530" },
    {
      title: "Alan Wake Remastered",
      price: 5000,
      steamId: "108710",
      coverImage: "https://upload.wikimedia.org/wikipedia/en/1/1f/Alan_Wake_Game_Cover.jpg",
    },
    { title: "Alekhine's Gun", price: 2500, steamId: "406720" },
    { title: "Arkanoid – Eternal Battle", price: 3000, steamId: "1717270" },
    { title: "Assassin's Creed Mirage", price: 6000, compareAt: 6500, steamId: "3035570" },
    { title: "Assassin's Creed Odyssey", price: 2700, compareAt: 3000, steamId: "812140" },
    { title: "Assassin's Creed Valhalla", price: 3500, steamId: "2208920" },
    { title: "Aven Colony", price: 2500, steamId: "484900" },
    { title: "Back 4 Blood", price: 3500, steamId: "924970" },
    { title: "Batman: The Enemy Within", price: 2500, steamId: "675260" },
    { title: "Batman: The Telltale Series", price: 3500, steamId: "498240" },
    { title: "Battlefield 1", price: 1500, compareAt: 2000, steamId: "1238840" },
    { title: "Battlefield 2042", price: 3500, compareAt: 4000, steamId: "1517290" },
    { title: "Battlefield V", price: 3000, steamId: "1238810" },
    { title: "BIG BASH BOOM", price: 2500, steamId: "979720" },
    { title: "Biomutant", price: 4500, compareAt: 5000, steamId: "597820" },
    { title: "Blood Bowl 2", price: 1500, compareAt: 2000, steamId: "236690" },
    {
      title: "Bloodborne",
      price: 2500,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/6/68/Bloodborne_Cover_Wallpaper.jpg",
      youtubeId: "G9FGgwCQ22w",
    },
    { title: "Borderlands 3", price: 3000, steamId: "397540" },
    {
      title: "Borderlands: The Handsome Collection",
      price: 2500,
      steamId: "49520",
      coverImage: "https://upload.wikimedia.org/wikipedia/en/d/d8/Borderlands_THC.jpg",
    },
    { title: "Call of Duty: Advanced Warfare", price: 2000, steamId: "209650" },
    { title: "Call of Duty: Black Ops Cold War", price: 4500, compareAt: 5000, steamId: "1985810" },
    {
      title: "Call of Duty: Black Ops IV",
      price: 2500,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/1/1c/Call_of_Duty_Black_Ops_4_official_box_art.jpg",
    },
    { title: "Call of Duty: Modern Warfare", price: 3500, compareAt: 4000, steamId: "2000950" },
    { title: "Call of Duty: Modern Warfare III", price: 8000, steamId: "3595270" },
    { title: "Call of Duty: Vanguard", price: 5500, steamId: "1985820" },
    { title: "Call of Duty: WWII", price: 2700, compareAt: 3000, steamId: "476600" },
    { title: "Code Vein", price: 3000, steamId: "678960" },
    { title: "Control", price: 3500, compareAt: 4000, steamId: "870780" },
    { title: "Cricket 19", price: 3500, compareAt: 4000, steamId: "1028630" },
    { title: "CRICKET 22", price: 5000, steamId: "1701380" },
    {
      title: "Crimes & Punishments: Sherlock Holmes",
      price: 2500,
      steamId: "241260",
    },
    { title: "Crysis Remastered Trilogy", price: 4000, compareAt: 4500, steamId: "2103140" },
    { title: "Cyberpunk 2077", price: 4500, steamId: "1091500" },
    { title: "Darksiders III", price: 3500, steamId: "606280" },
    { title: "Dead by Daylight", price: 2500, steamId: "381210" },
    { title: "Dead Rising 4: Frank's Big Package", price: 2000, steamId: "543460" },
    { title: "Deadlight: Director's Cut", price: 2500, steamId: "423950" },
    { title: "Death Stranding", price: 2500, steamId: "1850570" },
    {
      title: "Destiny",
      price: 1000,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/0/06/Destiny_XBO.jpg",
    },
    { title: "Destiny 2", price: 2000, steamId: "1085660" },
    {
      title: "Destiny: The Taken King",
      price: 1500,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/2/2c/Destiny_The_Taken_King_cover.png",
    },
    { title: "Detroit: Become Human", price: 4000, steamId: "1222140" },
    { title: "Deus Ex: Mankind Divided", price: 1500, steamId: "337000" },
    { title: "Devil May Cry 5 – DMC 5", price: 3000, steamId: "601150" },
    {
      title: "Diablo III: Reaper of Souls",
      price: 2500,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/a/a2/Diablo_III_RoS_Cover.jpg",
    },
    {
      title: "Digimon Story: Cyber Sleuth – Hacker's Memory",
      price: 3500,
      compareAt: 4000,
      steamId: "1042550",
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/9/97/Digimon_Story_Cyber_Sleuth_Hacker%27s_Memory.jpg",
    },
    { title: "Digimon Story: Cyber Sleuth", price: 3000, steamId: "1042550" },
    {
      title: "Disney Classic Games: Aladdin and The Lion King",
      price: 3000,
      steamId: "1126190",
    },
    { title: "Disney Infinity 3.0 Edition", price: 6000, steamId: "541670" },
    { title: "Don Bradman Cricket", price: 1500, steamId: "216260" },
    { title: "Don Bradman Cricket 17", price: 2000, steamId: "464850" },
    { title: "DOOM", price: 2000, steamId: "379720" },
    { title: "DOOM Eternal", price: 3500, steamId: "782330" },
    { title: "Doom Slayers Collection", price: 3000, compareAt: 3500, steamId: "782330" },
    { title: "Dragon Ball FighterZ", price: 3000, steamId: "678950" },
    { title: "DRAGON BALL Z: KAKAROT", price: 3500, steamId: "851850" },
    {
      title: "DRAGON QUEST XI Echoes of an Elusive Age",
      price: 3000,
      compareAt: 3500,
      steamId: "1295510",
    },
    {
      title: "Dreams",
      price: 3000,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/3/3f/Dreams_cover_art.jpg",
    },
    {
      title: "DriveClub",
      price: 2000,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/6/6f/Driveclub_box_art.jpg",
    },
    {
      title: "Dying Light 2 Stay Human",
      price: 5500,
      compareAt: 6500,
      steamId: "534380",
    },
    {
      title: "Dying Light: The Following – Enhanced Edition",
      price: 2500,
      steamId: "239140",
    },
    { title: "DYNASTY WARRIORS 8 Empires", price: 3500, steamId: "322520" },
    { title: "Dynasty Warriors 9", price: 3500, steamId: "730310" },
    {
      title: "EA SPORTS FC 24",
      price: 4500,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/b/b3/EA_FC24_Cover.jpg",
    },
    { title: "EA SPORTS FC 25", price: 5500, compareAt: 6000, steamId: "2669320" },
    {
      title: "EA Sports UFC 4",
      price: 4500,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/3/35/UFC_4_cover_art.png",
    },
    { title: "Elite Dangerous", price: 2500, steamId: "359320" },
    {
      title: "Evil Dead: The Game",
      price: 4500,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/1/1b/Evil_Dead_The_Game_Cover_Art.jpg",
    },
    { title: "Evil West", price: 6000, steamId: "1065310" },
    { title: "Far Cry 4", price: 2500, steamId: "298110" },
    { title: "Far Cry 6", price: 4500, steamId: "2369390" },
    { title: "Far Cry New Dawn", price: 2700, compareAt: 3000, steamId: "939960" },
    { title: "Far Cry Primal", price: 2500, steamId: "371660" },
    {
      title: "FIFA 20",
      price: 2000,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/2/21/FIFA_20_Standard_Edition_Cover.jpg",
    },
    {
      title: "FIFA 21",
      price: 2500,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/b/bb/FIFA_21_Standard_Edition_Cover.jpg",
    },
    {
      title: "FIFA 21 CHAMPIONS EDITION",
      price: 2500,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/b/bb/FIFA_21_Standard_Edition_Cover.jpg",
    },
    { title: "Final Fantasy XV", price: 2000, steamId: "637650" },
    { title: "For Honor", price: 1500, steamId: "304390" },
    { title: "Ghostbusters: Spirits Unleashed", price: 5000, steamId: "2383990" },
    { title: "God of War 2018", price: 3000, steamId: "1593500" },
    {
      title: "Gran Turismo 7",
      price: 6500,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/1/14/Gran_Turismo_7_cover_art.jpg",
    },
    {
      title: "Gran Turismo Sports GT Sports",
      price: 2500,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/9/96/GT_Sport_cover_art.jpg",
    },
    { title: "GreedFall", price: 2500, steamId: "606880" },
    { title: "Grid Legends", price: 4000, steamId: "1307710" },
    { title: "Hellblade: Senua's Sacrifice", price: 4500, steamId: "414340" },
    { title: "HITMAN II", price: 3000, steamId: "863550" },
    {
      title: "Hitman The Complete First Season SteelBook Edition",
      price: 2500,
      steamId: "236870",
      coverImage: "https://upload.wikimedia.org/wikipedia/en/8/84/Hitman_2015.jpg",
    },
    { title: "Hogwarts Legacy", price: 6000, steamId: "990080" },
    { title: "Homefront: The Revolution", price: 2000, steamId: "223100" },
    { title: "Horizon Forbidden West", price: 6000, steamId: "2420110" },
    { title: "Hotel Transylvania 3 Monsters Overboard", price: 4000, steamId: "757600" },
    {
      title: "Ice Age: Scrat's Nutty Adventure",
      price: 3000,
      compareAt: 3500,
      steamId: "751060",
    },
    {
      title: "Immortals Fenyx Rising",
      price: 3500,
      compareAt: 4000,
      steamId: "2221920",
    },
    { title: "Injustice 2", price: 2500, steamId: "627270" },
    { title: "It Takes Two", price: 5000, steamId: "1426210" },
    {
      title: "Jump Force",
      price: 3500,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/0/0c/Jumpforcegame.jpg",
    },
    {
      title: "Jurassic World Evolution",
      price: 3000,
      compareAt: 3500,
      steamId: "648350",
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/e/e6/Jurassic_World_Evolution_cover_art.jpg",
    },
    { title: "Jurassic World Evolution 2", price: 5500, steamId: "1244460" },
    { title: "Just Cause 4", price: 3000, steamId: "517630" },
    { title: "Just Cause 4 SteelBook Edition", price: 4000, steamId: "517630" },
    {
      title: "Just Dance 2018",
      price: 1500,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/3/3b/Just_Dance_2018_Switch_cover.jpg",
    },
    {
      title: "Kena: Bridge of Spirits",
      price: 5500,
      compareAt: 6000,
      steamId: "1954200",
    },
    {
      title: "Killzone Shadow Fall",
      price: 1500,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/1/1e/Killzone_Shadow_Fall_Box.jpg",
    },
    {
      title: "Knack",
      price: 2000,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/f/f2/Knack_%28game_box_art%29.jpg",
    },
    { title: "LEGO Batman 3: Beyond Gotham", price: 2500, steamId: "313690" },
    { title: "LEGO DC Super-Villains", price: 3000, steamId: "829110" },
    { title: "Lego Jurassic World", price: 2500, steamId: "352400" },
    { title: "LEGO Marvel Super Heroes 2", price: 2500, steamId: "647830" },
    { title: "LEGO Marvel's Avengers", price: 2500, steamId: "405310" },
    { title: "LEGO Star Wars: The Skywalker Saga", price: 4500, steamId: "920210" },
    { title: "LEGO Worlds", price: 2500, steamId: "332310" },
    { title: "Lies of P", price: 8500, steamId: "1627720" },
    { title: "Lost Judgment", price: 5000, steamId: "2058190" },
    {
      title: "Madden NFL 23",
      price: 3000,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/7/71/Madden_23_cover.jpeg",
    },
    { title: "Mafia II: Definitive Edition", price: 3000, steamId: "1030830" },
    { title: "Mafia III", price: 2500, steamId: "360430" },
    {
      title: "Mafia: Definitive Edition",
      price: 3500,
      compareAt: 4000,
      steamId: "1030840",
    },
    {
      title: "Marvel Avengers",
      price: 3000,
      compareAt: 3500,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/c/c0/Avengers_2020_cover_art.png",
    },
    { title: "Marvel vs. Capcom: Infinite", price: 3000, steamId: "493840" },
  ]),
  ...buildPs5UsedEntries([
    { title: "A Plague Tale Requiem", price: 7000, steamId: "1182900" },
    { title: "AEW Fight Forever", price: 7500, steamId: "1913210" },
    {
      title: "Alan Wake II Deluxe Edition",
      price: 10000,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/e/ed/Alan_Wake_2_box_art.jpg",
    },
    {
      title: "Alan Wake Remastered",
      price: 5000,
      compareAt: 5500,
      steamId: "108710",
      coverImage: "https://upload.wikimedia.org/wikipedia/en/1/1f/Alan_Wake_Game_Cover.jpg",
    },
    { title: "Aliens: Dark Descent", price: 8000, steamId: "1150440" },
    { title: "Aliens: Fireteam Elite", price: 7000, steamId: "1549970" },
    { title: "Alone in the Dark", price: 8500, compareAt: 9000, steamId: "1310410" },
    { title: "Armored Core VI Fires of Rubicon", price: 6000, steamId: "1888160" },
    { title: "Assassin's Creed Mirage", price: 6000, steamId: "3035570" },
    { title: "Assassin's Creed Shadows", price: 8000, steamId: "3159330" },
    { title: "Assassin's Creed Valhalla", price: 4000, compareAt: 4500, steamId: "2208920" },
    { title: "Assetto Corsa Competizione", price: 5000, steamId: "805550" },
    {
      title: "ASTRO BOT",
      price: 11000,
      compareAt: 11500,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/a/a9/Astro_Bot_cover_art.jpg",
      mediaFrom: "astro-bot-ps5",
    },
    { title: "Atomic Heart", price: 7000, steamId: "668580" },
    {
      title: "Avatar The Last Airbender: Quest for Balance",
      price: 6000,
      steamId: "1620030",
    },
    { title: "Avatar: Frontiers of Pandora", price: 8000, compareAt: 8500, steamId: "2840770" },
    { title: "Baldur's Gate 3", price: 18500, steamId: "1086940" },
    { title: "Banishers: Ghosts of New Eden", price: 8000, steamId: "1493640" },
    { title: "Battlefield 6", price: 10500, steamId: "2807960" },
    { title: "Black Myth: Wukong", price: 11500, steamId: "2358720" },
    { title: "Borderlands 4", price: 10000, steamId: "1285190" },
    { title: "Call of Duty: Black Ops 6", price: 8500, steamId: "2933080" },
    { title: "Clair Obscur: Expedition 33", price: 10000, steamId: "1903340" },
    { title: "Control Ultimate Edition", price: 5500, steamId: "870780" },
    { title: "Cricket 22", price: 5000, compareAt: 5500, steamId: "1701380" },
    { title: "Cricket 24 (Indian Edition)", price: 6500, compareAt: 7000, steamId: "2358260" },
    { title: "Cricket 24", price: 6500, steamId: "2358260" },
    {
      title: "Crisis Core: Final Fantasy VII REUNION",
      price: 7500,
      steamId: "1608070",
    },
    { title: "Cyberpunk 2077: Ultimate Edition", price: 7000, steamId: "1091500" },
    { title: "Dead Island 2", price: 6500, compareAt: 7000, steamId: "934700" },
    { title: "Dead Rising Deluxe Remaster", price: 9000, compareAt: 9500, steamId: "2527390" },
    {
      title: "DEAD SPACE",
      price: 7000,
      compareAt: 7500,
      steamId: "1693980",
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/3/36/Dead_Space_2022_Teaser_Art.jpg",
    },
    { title: "Death Stranding 2: On the Beach", price: 11000, steamId: "3280350" },
    { title: "Deathloop", price: 3500, steamId: "1252330" },
    {
      title: "Demon Slayer -Kimetsu no Yaiba- The Hinokami Chronicles",
      price: 6000,
      steamId: "1490890",
    },
    {
      title: "Demon's Souls",
      price: 5000,
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/1/11/Demons_Souls_remake_cover_art.jpg",
    },
    { title: "Diablo IV", price: 7500, steamId: "2344520" },
    { title: "Doom: The Dark Ages", price: 10500, compareAt: 11000, steamId: "3017860" },
    { title: "Dragon Age: The Veilguard", price: 10000, steamId: "1845910" },
    { title: "Dragon Ball Z: Kakarot", price: 5000, steamId: "851850" },
    {
      title: "Dragon Ball: Sparking! Zero",
      price: 8000,
      compareAt: 8500,
      steamId: "1790600",
    },
    { title: "Dragon's Dogma 2", price: 10000, compareAt: 11000, steamId: "2054970" },
    {
      title: "EA SPORTS FC 24",
      price: 4000,
      compareAt: 4500,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/b/b3/EA_FC24_Cover.jpg",
    },
    // FC 25 + God of War Ragnarök already listed above with matching prices
    { title: "EA Sports FC 26", price: 7000, steamId: "3405690" },
    {
      title: "EA Sports UFC 5",
      price: 6000,
      compareAt: 6500,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/8/84/Ufc_5.jpg",
    },
    { title: "EA Sports WRC 24", price: 6000, steamId: "1849250" },
    { title: "Elden Ring", price: 6500, steamId: "1245620" },
    { title: "ELEX II", price: 6000, compareAt: 7000, steamId: "900040" },
    { title: "Far Cry 6", price: 4500, compareAt: 5000, steamId: "2369390" },
    { title: "Farming Simulator 25", price: 7000, steamId: "2300320" },
    { title: "FIFA 22", price: 3000, compareAt: 3500, steamId: "1506830" },
    {
      title: "FIFA 23",
      price: 3000,
      steamId: "1811260",
      coverImage: "https://upload.wikimedia.org/wikipedia/en/a/a6/FIFA_23_Cover.jpg",
    },
    {
      title: "Final Fantasy VII Rebirth",
      price: 8500,
      compareAt: 9000,
      steamId: "2909400",
    },
    { title: "Final Fantasy XVI", price: 7000, compareAt: 7500, steamId: "2515020" },
    { title: "ForSpoken", price: 7000, compareAt: 8000, steamId: "1680880" },
    { title: "Gears of War: Reloaded", price: 8000, steamId: "2523720" },
    { title: "Ghostwire: Tokyo", price: 5000, compareAt: 5200, steamId: "1475810" },
    { title: "Gotham Knights", price: 5500, compareAt: 6000, steamId: "1496790" },
    {
      title: "Gotham Knights Steelbook",
      price: 8500,
      steamId: "1496790",
      coverImage: "https://upload.wikimedia.org/wikipedia/en/a/a1/Gotham_Knights_Cover.jpg",
    },
    { title: "Granblue Fantasy: Relink", price: 7500, steamId: "881020" },
    { title: "Grid Legends", price: 5000, compareAt: 5500, steamId: "1307710" },
    {
      title: "Hades",
      price: 5500,
      steamId: "1145360",
      coverImage: "https://upload.wikimedia.org/wikipedia/en/c/cc/Hades_cover_art.jpg",
    },
    { title: "Hell Is Us", price: 9500, steamId: "1620730" },
    { title: "Hitman III", price: 5500, steamId: "1659040" },
    { title: "Hogwarts Legacy", price: 6000, steamId: "990080" },
    { title: "Horizon Forbidden West", price: 5500, steamId: "2420110" },
    { title: "Jurassic World Evolution 2", price: 6000, steamId: "1244460" },
    { title: "Kingdom Come: Deliverance II", price: 10000, steamId: "1771300" },
    { title: "Lego Horizon Adventures", price: 6000, steamId: "2428810" },
    {
      title: "LEGO Star Wars: The Skywalker Saga",
      price: 5000,
      compareAt: 6000,
      steamId: "920210",
    },
    { title: "Lies of P", price: 8500, steamId: "1627720" },
    { title: "Life is Strange: Double Exposure", price: 9500, steamId: "1874000" },
    { title: "Like a Dragon: Ishin!", price: 8000, steamId: "1805480" },
    { title: "Little Nightmares III", price: 8500, steamId: "1392860" },
    { title: "Lords of the Fallen", price: 10500, compareAt: 11000, steamId: "1501750" },
    { title: "LOST JUDGMENT", price: 5000, compareAt: 5500, steamId: "2058190" },
    {
      title: "Madden NFL 23",
      price: 5000,
      compareAt: 6000,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/7/71/Madden_23_cover.jpeg",
    },
    {
      title: "Marvel Avengers",
      price: 4500,
      compareAt: 5000,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/c/c0/Avengers_2020_cover_art.png",
    },
    {
      title: "Marvel's Guardians of the Galaxy",
      price: 5000,
      compareAt: 5500,
      steamId: "1088850",
    },
    { title: "Marvel's Midnight Suns", price: 7000, steamId: "368260" },
    {
      title: "METAL GEAR SOLID Δ: SNAKE EATER",
      price: 10000,
      compareAt: 10500,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/0/08/MetalGearSolidDelta.jpg",
    },
    { title: "Metro Exodus: Complete Edition", price: 5000, compareAt: 5500, steamId: "412020" },
    { title: "MindsEye", price: 8500, steamId: "3265250" },
    { title: "Minecraft Legends", price: 5500, steamId: "1928870" },
    { title: "Monster Hunter Wilds", price: 8500, steamId: "2246340" },
    { title: "Mortal Kombat 1", price: 6500, steamId: "1971870" },
    { title: "Mortal Kombat 11 Ultimate", price: 4000, steamId: "976310" },
    {
      title: "Naruto X Boruto Ultimate Ninja Storm Connections",
      price: 9000,
      steamId: "1020790",
    },
    {
      title: "NBA 2K23",
      price: 5500,
      compareAt: 6000,
      coverImage: "https://upload.wikimedia.org/wikipedia/en/d/d7/NBA_2K23_cover_art.jpg",
    },
    { title: "NBA 2K25", price: 7000, steamId: "2878980" },
    { title: "Need for Speed Unbound", price: 5500, steamId: "1846380" },
    { title: "NINJA GAIDEN 2 Black", price: 13500, compareAt: 14000, steamId: "3287520" },
    { title: "Oddworld: Soulstorm", price: 6500, compareAt: 7000, steamId: "619390" },
    { title: "Outriders", price: 3500, steamId: "680420" },
    { title: "PAYDAY 3", price: 5500, compareAt: 6000, steamId: "1272080" },
    { title: "Persona 3 Reload", price: 9000, steamId: "2161700" },
    {
      title: "Pragmata",
      price: 12000,
      steamId: "3357650",
      coverImage: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Pragmata_cover.jpg",
    },
    {
      title: "Prince of Persia The Lost Crown",
      price: 7500,
      compareAt: 8000,
      steamId: "2751000",
    },
    {
      title: "Ratchet & Clank: Rift Apart",
      price: 5000,
      compareAt: 5500,
      steamId: "1895880",
    },
    { title: "Remnant II", price: 9000, compareAt: 10000, steamId: "1282100" },
    { title: "Resident Evil 4", price: 6500, steamId: "2050650" },
    {
      title: "Resident Evil Requiem",
      price: 12500,
      steamId: "3764200",
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/1/15/Resident_Evil_Requiem_Cover_Art.jpg",
    },
    {
      title: "Resident Evil Requiem Lenticular Edition",
      price: 14000,
      steamId: "3764200",
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/1/15/Resident_Evil_Requiem_Cover_Art.jpg",
    },
    { title: "Resident Evil Village", price: 5500, steamId: "1196590" },
    { title: "Returnal", price: 5000, compareAt: 5500, steamId: "1649240" },
    { title: "Riders Republic", price: 5000, steamId: "2290180" },
    { title: "Rise of the Ronin", price: 8500, steamId: "1340990" },
    {
      title: "RoboCop: Rogue City",
      price: 8000,
      steamId: "1681430",
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/5/5d/RoboCop_Rogue_City_cover_art.jpg",
    },
    {
      title: "Saints Row",
      price: 5000,
      compareAt: 5500,
      steamId: "742420",
      coverImage:
        "https://upload.wikimedia.org/wikipedia/en/b/b5/Saints_Row_2022_Cover_Art.jpeg",
    },
    { title: "SCARLET NEXUS", price: 4500, steamId: "775500" },
    { title: "Sifu", price: 5500, steamId: "2138710" },
    { title: "Sniper Elite 5", price: 5500, compareAt: 6000, steamId: "1029690" },
    { title: "Sniper Elite: Resistance", price: 10500, steamId: "2169200" },
    { title: "STAR WARS Jedi: Fallen Order", price: 4500, steamId: "1172380" },
    { title: "Star Wars Jedi: Survivor", price: 6500, steamId: "1774580" },
    { title: "Stray", price: 5500, compareAt: 6000, steamId: "1332010" },
    {
      title: "Street Fighter 6 Years 1-2 Fighters Edition",
      price: 8500,
      steamId: "1364780",
    },
    {
      title: "Suicide Squad: Kill the Justice League",
      price: 9000,
      steamId: "315210",
    },
  ]),
];

function mediaFor(entry: UsedEntry): { images: ProductImage[]; video?: ProductVideo } {
  const name = entry.title.replace(/ \(Used\).*$/, "");
  const images = buildGameCoverImages({
    alt: name,
    steamId: entry.steamId,
    youtubeId: entry.youtubeId,
    coverImage: entry.coverImage,
    discFallbackUrl:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=600&h=900&q=80",
  });

  if (entry.mediaFrom && PS5_GAME_MEDIA[entry.mediaFrom]) {
    for (const img of PS5_GAME_MEDIA[entry.mediaFrom]!.images) {
      if (images.some((i) => i.url === img.url)) continue;
      images.push(img);
    }
  }

  return {
    images,
    video: entry.youtubeId
      ? { youtubeId: entry.youtubeId, title: `${name} Trailer` }
      : entry.mediaFrom && PS5_GAME_MEDIA[entry.mediaFrom]?.video
        ? PS5_GAME_MEDIA[entry.mediaFrom]!.video
        : undefined,
  };
}

/** Extra certified used discs so /pre-owned-games always has a full grid. */
export function buildUsedGamesProducts(): Product[] {
  return USED_ENTRIES.map((e, index) => {
    const media = mediaFor(e);
    const id = `used-game-${index + 1}`;
    return {
      id,
      handle: e.handle,
      title: e.title,
      brand: e.brand,
      description:
        getGameSeoDescription(e.title) ??
        `${e.blurb} Certified used physical edition from ToyCompany — inspected before dispatch.`,
      category: "pre-owned-games",
      categoryPath: ["games", "pre-owned-games", e.categoryHint],
      platform: e.platform,
      tags: ["game", "pre-owned", "used-games", e.categoryHint],
      condition: "pre-owned" as const,
      rating: 4.5,
      reviewCount: 40 + index * 7,
      images: media.images,
      video: media.video,
      variants: [
        {
          id: `var-${id}`,
          title: "Used Disc",
          sku: `PTPK-USED-${String(index + 1).padStart(2, "0")}`,
          price: pkr(e.price),
          compareAtPrice: e.compareAt && e.compareAt > e.price ? pkr(e.compareAt) : undefined,
          available: true,
          quantityAvailable: e.quantity ?? Math.max(4, 18 - index),
        },
      ],
      specs: [
        { label: "Condition", value: "Used — Excellent" },
        { label: "Includes", value: "Game media + case" },
        { label: "Format", value: "Physical" },
      ],
      compatibility: e.platform,
      onDeal: Boolean(e.compareAt && e.compareAt > e.price),
      featured: index < 4,
      bestSeller: index < 6,
      dealEndsAt:
        e.compareAt && e.compareAt > e.price
          ? new Date(Date.now() + 1000 * 60 * 60 * (24 + index)).toISOString()
          : undefined,
      shippingInfo:
        "Used disc inspected before dispatch. Free shipping over Rs. 15,000 across Pakistan.",
      createdAt: new Date(Date.UTC(2026, 6, 10 - index)).toISOString(),
    };
  });
}

export const USED_GAME_HANDLES = new Set(USED_ENTRIES.map((e) => e.handle));
