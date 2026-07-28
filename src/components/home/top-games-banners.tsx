"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types/commerce";
import { formatMoney, getProductPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type TopGameBanner = {
  product: Product;
  rank: number;
  blurb: string;
  genre: string;
  bannerImage: string;
};

export function TopGamesBanners({ banners }: { banners: TopGameBanner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = banners.length;

  const go = useCallback(
    (next: number) => {
      if (!total) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (paused || total < 2) return;
    const id = window.setInterval(() => go(index + 1), 5500);
    return () => window.clearInterval(id);
  }, [go, index, paused, total]);

  if (!banners.length) return null;

  const current = banners[index]!;
  const { price, compareAtPrice, discountPercent } = getProductPrice(current.product);

  return (
    <section
      className="border-y border-border/60 bg-bg-elevated/40 py-8 md:py-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Top toys banners"
    >
      <div className="container-px mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Top charts
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold md:text-3xl">
              Top Toys
            </h2>
            <p className="mt-1 text-sm text-muted">
              Pakistan&apos;s most loved toys, rotating spotlight.
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-accent hover:underline"
          >
            Browse all toys
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-bg shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="relative aspect-[16/10] sm:aspect-[21/9] md:aspect-[2.4/1]">
            {banners.map((banner, i) => (
              <Link
                key={banner.product.id}
                href={`/product/${banner.product.handle}`}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  i === index ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none",
                )}
                aria-hidden={i !== index}
                tabIndex={i === index ? 0 : -1}
              >
                <Image
                  src={banner.bannerImage}
                  alt={banner.product.title}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/75 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/20" />
              </Link>
            ))}

            <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col justify-end p-5 sm:p-8 md:p-10">
              <div className="pointer-events-auto max-w-xl">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-accent px-2 font-display text-sm font-bold text-[#04110e]">
                    #{current.rank}
                  </span>
                  <span className="rounded-lg border border-white/15 bg-black/35 px-2.5 py-1 text-xs text-muted backdrop-blur">
                    {current.genre}
                  </span>
                  {discountPercent ? (
                    <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-white">
                      -{discountPercent}%
                    </span>
                  ) : null}
                </div>
                <h3 className="font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                  {current.product.title.replace(/ —.*$/, "")}
                </h3>
                <p className="mt-2 line-clamp-2 max-w-md text-sm text-muted sm:text-base">
                  {current.blurb}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <p className="font-display text-xl font-bold text-accent sm:text-2xl">
                    {formatMoney(price)}
                  </p>
                  {compareAtPrice ? (
                    <p className="text-sm text-subtle line-through">
                      {formatMoney(compareAtPrice)}
                    </p>
                  ) : null}
                  <Link href={`/product/${current.product.handle}`}>
                    <Button size="lg" className="ml-1">
                      Shop toy
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label="Previous banner"
              onClick={() => go(index - 1)}
              className="absolute left-3 top-1/2 z-[3] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-text backdrop-blur transition hover:border-accent hover:bg-black/70 sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next banner"
              onClick={() => go(index + 1)}
              className="absolute right-3 top-1/2 z-[3] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-text backdrop-blur transition hover:border-accent hover:bg-black/70 sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-border bg-bg/80 p-3">
            {banners.map((banner, i) => (
              <button
                key={banner.product.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show banner ${banner.rank}: ${banner.product.title}`}
                aria-current={i === index}
                className={cn(
                  "relative h-16 w-28 shrink-0 overflow-hidden rounded-xl border transition sm:h-[4.5rem] sm:w-36",
                  i === index
                    ? "border-accent ring-2 ring-accent/40"
                    : "border-border opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={banner.bannerImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="144px"
                />
                <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 font-display text-[10px] font-bold text-accent">
                  #{banner.rank}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
