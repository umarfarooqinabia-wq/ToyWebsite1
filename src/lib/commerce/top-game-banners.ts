import { commerce } from "@/lib/commerce";
import { TOP50_PS5_PAKISTAN_ENTRIES } from "@/lib/commerce/ps5-top50-pakistan";
import type { TopGameBanner } from "@/components/home/top-games-banners";

function bannerImageFor(entry: (typeof TOP50_PS5_PAKISTAN_ENTRIES)[number], fallback: string) {
  if (entry.bannerImage) return entry.bannerImage;
  if (entry.steamId) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${entry.steamId}/library_hero.jpg`;
  }
  if (entry.youtubeId) {
    return `https://i.ytimg.com/vi/${entry.youtubeId}/maxresdefault.jpg`;
  }
  return fallback;
}

/** Build ordered Top 10 game banners for the home carousel. */
export async function getTopGameBanners(limit = 10): Promise<TopGameBanner[]> {
  const topEntries = [...TOP50_PS5_PAKISTAN_ENTRIES]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit);

  const products = await Promise.all(
    topEntries.map((e) => commerce.getProductByHandle(e.handle)),
  );

  return topEntries.flatMap((entry, i) => {
    const product = products[i];
    if (!product) return [];
    const fallback = product.images[0]?.url ?? "/logo.png";
    return [
      {
        product,
        rank: entry.rank,
        blurb: entry.blurb,
        genre: entry.genre,
        bannerImage: bannerImageFor(entry, fallback),
      },
    ];
  });
}
