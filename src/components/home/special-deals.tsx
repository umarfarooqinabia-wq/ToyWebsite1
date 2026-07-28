import Link from "next/link";
import type { Product } from "@/types/commerce";
import { formatMoney, getProductPrice } from "@/lib/utils";
import { CountdownTimer } from "@/components/product/countdown-timer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCoverImage } from "@/components/product/product-cover-image";

export function SpecialDeals({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="container-px mx-auto max-w-7xl py-12 sm:py-16">
      <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Toys on Sale</h2>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Stock clearance and limited-time discounts — grab them while they last.
          </p>
        </div>
        <Link href="/toys-on-sale" className="shrink-0 text-sm font-medium text-accent sm:inline">
          All Deals
        </Link>
      </div>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.slice(0, 3).map((product) => {
          const { price, compareAtPrice, discountPercent } = getProductPrice(product);
          return (
            <article
              key={product.id}
              className="flex min-w-0 overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="relative aspect-square w-24 shrink-0 bg-bg-elevated sm:w-36">
                <ProductCoverImage
                  images={product.images}
                  alt={product.images[0]?.alt ?? product.title}
                  sizes="144px"
                  className="object-cover object-center"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4">
                {discountPercent ? (
                  <Badge variant="secondary" className="w-fit text-[10px] sm:text-xs">
                    -{discountPercent}% OFF
                  </Badge>
                ) : null}
                <h3 className="line-clamp-2 break-words text-sm font-medium leading-snug sm:text-base">
                  {product.title}
                </h3>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-display text-base font-bold text-accent sm:text-lg">
                    {formatMoney(price)}
                  </span>
                  {compareAtPrice ? (
                    <span className="text-xs text-subtle line-through sm:text-sm">
                      {formatMoney(compareAtPrice)}
                    </span>
                  ) : null}
                </div>
                {product.dealEndsAt ? <CountdownTimer endsAt={product.dealEndsAt} /> : null}
                <Link href={`/product/${product.handle}`} className="mt-auto pt-1 sm:pt-2">
                  <Button size="sm" className="w-full">
                    Shop Deal
                  </Button>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
