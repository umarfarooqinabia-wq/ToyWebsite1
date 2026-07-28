"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ProductImage } from "@/types/commerce";
import { cn } from "@/lib/utils";

const LOCAL_FALLBACK = "/logo.png";

type Props = {
  images: ProductImage[];
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
};

function shouldUnoptimize(src: string) {
  return (
    src.endsWith(".svg") ||
    src.startsWith("/uploads/") ||
    src.startsWith("/api/media/") ||
    src.startsWith("/news/") ||
    src.includes("upload.wikimedia.org") ||
    src.includes("assets.nintendo.com") ||
    src.includes("cdn.shopify.com") ||
    src.includes("steamstatic.com") ||
    src.includes("ytimg.com") ||
    src.includes("images.unsplash.com")
  );
}

/**
 * Tries each product image URL in order when one fails to load
 * (common with missing Steam library capsules).
 */
export function ProductCoverImage({
  images,
  alt,
  className,
  sizes,
  priority,
  fill = true,
  width,
  height,
}: Props) {
  const candidates = useMemo(() => {
    const urls = images.map((i) => i.url).filter(Boolean);
    if (!urls.includes(LOCAL_FALLBACK)) urls.push(LOCAL_FALLBACK);
    return urls.length ? urls : [LOCAL_FALLBACK];
  }, [images]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [candidates]);

  const src = candidates[Math.min(index, candidates.length - 1)] ?? LOCAL_FALLBACK;
  const unoptimized = shouldUnoptimize(src);

  const onError = () => {
    setIndex((i) => (i + 1 < candidates.length ? i + 1 : i));
  };

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={unoptimized}
        onError={onError}
        className={cn(className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 600}
      height={height ?? 900}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      onError={onError}
      className={cn(className)}
    />
  );
}
