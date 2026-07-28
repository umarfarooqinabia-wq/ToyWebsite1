import type { Product, ProductVideo } from "@/types/commerce";

function extractFromText(text: string): Partial<ProductVideo> | null {
  if (!text) return null;

  const yt =
    text.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i,
    )?.[1] || text.match(/youtube:([A-Za-z0-9_-]{6,})/i)?.[1];
  if (yt) return { youtubeId: yt };

  const tiktok =
    text.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/i)?.[1] ||
    text.match(/tiktok:(\d+)/i)?.[1];
  if (tiktok) return { tiktokId: tiktok };

  const reel = text.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/i)?.[1];
  if (reel) {
    return {
      embedUrl: `https://www.instagram.com/reel/${reel}/embed`,
    };
  }

  return null;
}

function haystack(product: Product): string {
  return [
    product.title,
    product.handle,
    product.category,
    ...product.tags,
    product.descriptionHtml ?? "",
    product.description.slice(0, 500),
  ].join(" ");
}

/**
 * Ensure every toy product has a playable demo:
 * 1) Explicit YouTube / TikTok / Reels from description or tags
 * 2) YouTube search embed for this product title (kids see it working)
 */
export function resolveToyVideo(product: Product): ProductVideo {
  if (
    product.video?.youtubeId ||
    product.video?.tiktokId ||
    product.video?.src ||
    product.video?.embedUrl ||
    product.video?.searchQuery
  ) {
    return product.video;
  }

  const extracted = extractFromText(haystack(product));
  if (extracted?.youtubeId || extracted?.tiktokId || extracted?.embedUrl) {
    return {
      title: `${product.title} — demo`,
      ...extracted,
    };
  }

  return {
    title: `${product.title} — see it in action`,
    searchQuery: `${product.title} toy review demo`,
  };
}

export function withToyVideo<T extends Product>(product: T): T {
  return { ...product, video: resolveToyVideo(product) };
}

export function youtubeEmbedSrc(video: ProductVideo, autoplay = false): string | null {
  if (video.youtubeId) {
    const ap = autoplay ? "1" : "0";
    return `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=${ap}&rel=0`;
  }
  if (video.searchQuery) {
    return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(video.searchQuery)}`;
  }
  return null;
}

export function videoWatchUrl(video: ProductVideo): string | null {
  if (video.youtubeId) return `https://www.youtube.com/watch?v=${video.youtubeId}`;
  if (video.tiktokId) return `https://www.tiktok.com/video/${video.tiktokId}`;
  if (video.searchQuery) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`;
  }
  if (video.embedUrl) return video.embedUrl;
  return null;
}
