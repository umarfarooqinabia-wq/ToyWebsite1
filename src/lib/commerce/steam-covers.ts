import type { ProductImage } from "@/types/commerce";

/** Steam apps that often lack classic CDN library capsules (404). */
const STEAM_LIBRARY_UNRELIABLE = new Set([
  "3405690", // FC 26
  "3472040", // NBA 2K26
  "3059520", // F1 25
  "3595270", // MW III / related
]);

export function steamLibraryUrl(appId: string) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900_2x.jpg`;
}

export function steamHeaderUrl(appId: string) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

export function steamHeroUrl(appId: string) {
  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_hero.jpg`;
}

export function youtubeThumbUrl(youtubeId: string) {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

const DISC_FALLBACK =
  "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=600&h=900&q=80";

export type BuildCoverInput = {
  alt: string;
  steamId?: string;
  youtubeId?: string;
  /** Prefer this as primary when set (working store asset). */
  coverImage?: string;
  bannerImage?: string;
  preferHero?: boolean;
  discFallbackUrl?: string;
};

/**
 * Build a cover stack that prefers working portrait art.
 * Primary image is always the most reliable available URL.
 */
export function buildGameCoverImages(input: BuildCoverInput): ProductImage[] {
  const name = input.alt;
  const images: ProductImage[] = [];
  const seen = new Set<string>();

  const push = (url: string | undefined, alt: string, w?: number, h?: number) => {
    const u = url?.trim();
    if (!u || seen.has(u)) return;
    seen.add(u);
    images.push({ url: u, alt, width: w, height: h });
  };

  // 1) Explicit working cover first
  push(input.coverImage, `${name} — cover art`, 920, 430);

  // 2) Steam portrait library when known-good
  if (input.steamId && !STEAM_LIBRARY_UNRELIABLE.has(input.steamId)) {
    push(steamLibraryUrl(input.steamId), `${name} — official cover art`, 600, 900);
  }

  // 3) Banner / hero for newer titles without library art
  push(input.bannerImage, `${name} — key art`, 1920, 1080);
  if (input.steamId && (input.preferHero || STEAM_LIBRARY_UNRELIABLE.has(input.steamId))) {
    push(steamHeroUrl(input.steamId), `${name} — key art`, 1920, 620);
  }

  // 4) Steam header (wide but usually exists)
  if (input.steamId) {
    push(steamHeaderUrl(input.steamId), `${name} — store header`, 460, 215);
  }

  // 5) YouTube still
  if (input.youtubeId) {
    push(youtubeThumbUrl(input.youtubeId), `${name} — trailer still`, 480, 360);
  }

  // 6) Always end with a guaranteed Unsplash disc photo
  push(input.discFallbackUrl || DISC_FALLBACK, `${name} — physical disc edition`, 600, 900);

  return images;
}
