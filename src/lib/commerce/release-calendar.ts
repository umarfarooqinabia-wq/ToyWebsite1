import { whatsappUrl } from "@/lib/constants";

export type ReleasePlatform = "PS5" | "Xbox" | "Nintendo Switch" | "PC";

export type ReleasePeriodFilter = "this-month" | "next-month" | "2026" | "all";

export type UpcomingRelease = {
  id: string;
  title: string;
  platforms: ReleasePlatform[];
  /** ISO date YYYY-MM-DD */
  releaseDate: string;
  genre: string;
  publisher: string;
  blurb: string;
  coverImage: string;
  /** Store product path when we already stock / pre-order the title */
  preorderHref?: string;
};

/**
 * Curated upcoming releases for Pakistan storefront SEO + retention.
 * Dates are announced / expected windows — update as publishers firm them up.
 */
export const UPCOMING_RELEASES: UpcomingRelease[] = [
  {
    id: "rel-mafia-the-old-country",
    title: "Mafia: The Old Country",
    platforms: ["PS5", "Xbox", "PC"],
    releaseDate: "2026-08-08",
    genre: "Action-Adventure",
    publisher: "2K",
    blurb: "Origin story set in early 1900s Sicily — expected strong local disc demand.",
    coverImage:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rel-ghost-of-yotei",
    title: "Ghost of Yōtei",
    platforms: ["PS5"],
    releaseDate: "2026-10-02",
    genre: "Action-Adventure",
    publisher: "Sony Interactive",
    blurb: "Sucker Punch exclusive follow-up — premium PS5 disc pre-order favourite.",
    coverImage:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    preorderHref: "/products?category=ps5-games&q=ghost",
  },
  {
    id: "rel-marvel-wolverine",
    title: "Marvel's Wolverine",
    platforms: ["PS5"],
    releaseDate: "2026-09-17",
    genre: "Action",
    publisher: "Sony Interactive",
    blurb: "Insomniac exclusive — high pre-order intent across Pakistani PS5 owners.",
    coverImage:
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rel-gta-vi",
    title: "Grand Theft Auto VI",
    platforms: ["PS5", "Xbox"],
    releaseDate: "2026-11-19",
    genre: "Open World",
    publisher: "Rockstar",
    blurb: "The year’s biggest multiplatform drop — expect sell-outs on day one.",
    coverImage:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    preorderHref: "/products?q=gta",
  },
  {
    id: "rel-resident-evil-requiem",
    title: "Resident Evil Requiem",
    platforms: ["PS5", "Xbox", "PC"],
    releaseDate: "2026-02-27",
    genre: "Survival Horror",
    publisher: "Capcom",
    blurb: "Next mainline RE — strong physical demand for horror collectors.",
    coverImage:
      "https://images.unsplash.com/photo-1551103782-8ab6077b8ce6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rel-pokemon-legends-z-a",
    title: "Pokémon Legends: Z-A",
    platforms: ["Nintendo Switch"],
    releaseDate: "2026-10-16",
    genre: "RPG",
    publisher: "Nintendo / TPC",
    blurb: "Switch exclusive with huge gift & collector cart interest in Pakistan.",
    coverImage:
      "https://images.unsplash.com/photo-1578303517154-48091adcdb15?auto=format&fit=crop&w=800&q=80",
    preorderHref: "/products?category=nintendo-switch-games&q=pokemon",
  },
  {
    id: "rel-metroid-prime-4",
    title: "Metroid Prime 4: Beyond",
    platforms: ["Nintendo Switch"],
    releaseDate: "2026-12-04",
    genre: "Action",
    publisher: "Nintendo",
    blurb: "Long-awaited first-party Switch exclusive for action fans.",
    coverImage:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rel-assassin-creed-codename-hexe",
    title: "Assassin's Creed (Codename Hexe)",
    platforms: ["PS5", "Xbox", "PC"],
    releaseDate: "2026-11-06",
    genre: "Action-Adventure",
    publisher: "Ubisoft",
    blurb: "Witch-hunt era AC — likely a strong import disc seller.",
    coverImage:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rel-fable",
    title: "Fable",
    platforms: ["Xbox", "PC"],
    releaseDate: "2026-09-25",
    genre: "Action RPG",
    publisher: "Xbox Game Studios",
    blurb: "Xbox exclusive reboot — Series X physical editions expected.",
    coverImage:
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&w=800&q=80",
    preorderHref: "/products?category=xbox-games&q=fable",
  },
  {
    id: "rel-perfect-dark",
    title: "Perfect Dark",
    platforms: ["Xbox", "PC"],
    releaseDate: "2026-12-11",
    genre: "FPS",
    publisher: "Xbox Game Studios",
    blurb: "Classic spy shooter reboot for Xbox Series fans.",
    coverImage:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rel-okami-2",
    title: "Ōkami 2",
    platforms: ["PS5", "Nintendo Switch", "PC"],
    releaseDate: "2026-08-28",
    genre: "Adventure",
    publisher: "Capcom",
    blurb: "Beloved wolf adventure sequel — niche but loyal pre-order crowd.",
    coverImage:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rel-death-stranding-2",
    title: "Death Stranding 2: On the Beach",
    platforms: ["PS5"],
    releaseDate: "2026-07-30",
    genre: "Action",
    publisher: "Sony Interactive",
    blurb: "Kojima exclusive still rolling out physical stock waves this month.",
    coverImage:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80",
    preorderHref: "/products?category=ps5-games&q=death+stranding",
  },
  {
    id: "rel-witcher-4",
    title: "The Witcher 4",
    platforms: ["PS5", "Xbox", "PC"],
    releaseDate: "2026-12-18",
    genre: "Action RPG",
    publisher: "CD PROJEKT RED",
    blurb: "Next-gen Witcher saga — massive awareness for late-2026 pre-orders.",
    coverImage:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rel-super-mario-galaxy-movie-tie",
    title: "Super Mario Party Jamboree DLC Wave",
    platforms: ["Nintendo Switch"],
    releaseDate: "2026-07-24",
    genre: "Party",
    publisher: "Nintendo",
    blurb: "Family Switch content drop — great add-on for gift-season traffic.",
    coverImage:
      "https://images.unsplash.com/photo-1578303517154-48091adcdb15?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rel-call-of-duty-2026",
    title: "Call of Duty 2026",
    platforms: ["PS5", "Xbox", "PC"],
    releaseDate: "2026-10-23",
    genre: "FPS",
    publisher: "Activision",
    blurb: "Annual COD disc cycle — reliably tops FPS charts in Pakistan.",
    coverImage:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    preorderHref: "/products?category=ps5-games&q=call+of+duty",
  },
  {
    id: "rel-ea-fc-27",
    title: "EA SPORTS FC 27",
    platforms: ["PS5", "Xbox", "Nintendo Switch", "PC"],
    releaseDate: "2026-09-25",
    genre: "Sports",
    publisher: "EA",
    blurb: "Next football season disc — Pakistan’s most ordered sports title yearly.",
    coverImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    preorderHref: "/products?q=fc+26",
  },
  {
    id: "rel-wwe-2k27",
    title: "WWE 2K27",
    platforms: ["PS5", "Xbox", "PC"],
    releaseDate: "2026-03-13",
    genre: "Sports / Fighting",
    publisher: "2K",
    blurb: "Wrestling season opener — consistent disc seller for café & home play.",
    coverImage:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "rel-nba-2k27",
    title: "NBA 2K27",
    platforms: ["PS5", "Xbox", "Nintendo Switch", "PC"],
    releaseDate: "2026-09-11",
    genre: "Sports",
    publisher: "2K",
    blurb: "Seasonal basketball disc with strong MyCAREER demand.",
    coverImage:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
  },
];

export const PERIOD_FILTERS: { id: ReleasePeriodFilter; label: string }[] = [
  { id: "this-month", label: "This Month" },
  { id: "next-month", label: "Next Month" },
  { id: "2026", label: "2026" },
  { id: "all", label: "All Upcoming" },
];

export const PLATFORM_FILTERS: { id: ReleasePlatform; label: string }[] = [
  { id: "PS5", label: "PS5" },
  { id: "Xbox", label: "Xbox" },
  { id: "Nintendo Switch", label: "Nintendo Switch" },
];

function startOfMonth(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function endOfMonth(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59));
}

export function parseReleaseDate(iso: string) {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, day!));
}

export function formatReleaseDate(iso: string) {
  return parseReleaseDate(iso).toLocaleDateString("en-PK", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function getPreorderHref(release: UpcomingRelease) {
  if (release.preorderHref) return release.preorderHref;
  return whatsappUrl(
    `Hi ToyCompany! I want to pre-order "${release.title}" (${release.platforms.join(", ")}) releasing ${release.releaseDate}.`,
  );
}

export function isExternalPreorder(href: string) {
  return href.startsWith("http");
}

export function filterUpcomingReleases(options: {
  period?: ReleasePeriodFilter | string | null;
  platform?: ReleasePlatform | string | null;
  now?: Date;
}): UpcomingRelease[] {
  const now = options.now ?? new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const period = (options.period as ReleasePeriodFilter) || "all";
  const platform = options.platform || null;

  let start: Date | null = null;
  let end: Date | null = null;

  if (period === "this-month") {
    start = startOfMonth(todayUtc);
    end = endOfMonth(todayUtc);
  } else if (period === "next-month") {
    const next = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth() + 1, 1));
    start = startOfMonth(next);
    end = endOfMonth(next);
  } else if (period === "2026") {
    start = new Date(Date.UTC(2026, 0, 1));
    end = new Date(Date.UTC(2026, 11, 31, 23, 59, 59));
  } else {
    // all upcoming from today
    start = todayUtc;
    end = null;
  }

  return [...UPCOMING_RELEASES]
    .filter((r) => {
      const date = parseReleaseDate(r.releaseDate);
      if (start && date < start) return false;
      if (end && date > end) return false;
      if (platform && !r.platforms.includes(platform as ReleasePlatform)) return false;
      return true;
    })
    .sort(
      (a, b) =>
        parseReleaseDate(a.releaseDate).getTime() - parseReleaseDate(b.releaseDate).getTime(),
    );
}

export function groupReleasesByMonth(releases: UpcomingRelease[]) {
  const groups = new Map<string, UpcomingRelease[]>();
  for (const r of releases) {
    const d = parseReleaseDate(r.releaseDate);
    const key = d.toLocaleDateString("en-PK", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    const list = groups.get(key) ?? [];
    list.push(r);
    groups.set(key, list);
  }
  return [...groups.entries()];
}

export function upcomingReleasesJsonLd(releases: UpcomingRelease[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Upcoming Game Releases",
    url: pageUrl,
    numberOfItems: releases.length,
    itemListElement: releases.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "VideoGame",
        name: r.title,
        genre: r.genre,
        gamePlatform: r.platforms,
        datePublished: r.releaseDate,
        publisher: { "@type": "Organization", name: r.publisher },
        description: r.blurb,
        image: r.coverImage.startsWith("http")
          ? r.coverImage
          : undefined,
      },
    })),
  };
}
