import type { ProductImage, ProductVideo } from "@/types/commerce";
import { TOP50_PS5_PAKISTAN_ENTRIES } from "@/lib/commerce/ps5-top50-pakistan";
import { buildGameCoverImages } from "@/lib/commerce/steam-covers";

function buildMediaForEntry(entry: (typeof TOP50_PS5_PAKISTAN_ENTRIES)[number]): {
  images: ProductImage[];
  video?: ProductVideo;
} {
  const name = entry.title.replace(/ —.*$/, "");

  return {
    images: buildGameCoverImages({
      alt: name,
      steamId: entry.steamId,
      youtubeId: entry.youtubeId,
      coverImage: entry.coverImage,
      bannerImage: entry.bannerImage,
      preferHero: Boolean(entry.steamId && ["3405690", "3472040"].includes(entry.steamId)),
    }),
    video:
      entry.youtubeId && entry.videoTitle
        ? { youtubeId: entry.youtubeId, title: entry.videoTitle }
        : undefined,
  };
}

export const PS5_GAME_MEDIA: Record<
  string,
  { images: ProductImage[]; video?: ProductVideo }
> = Object.fromEntries(
  TOP50_PS5_PAKISTAN_ENTRIES.map((e) => [e.handle, buildMediaForEntry(e)]),
);

/** Used Spider-Man 2 shares media with the new disc listing */
PS5_GAME_MEDIA["spiderman-2-preowned-ps5"] = PS5_GAME_MEDIA["spiderman-2-ps5"]!;

export function withPs5Media<
  T extends { handle: string; images: ProductImage[]; video?: ProductVideo },
>(product: T): T {
  const mediaPack = PS5_GAME_MEDIA[product.handle];
  if (!mediaPack) return product;
  return {
    ...product,
    images: mediaPack.images,
    video: mediaPack.video,
  };
}
