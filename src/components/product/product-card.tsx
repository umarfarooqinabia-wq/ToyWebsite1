"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/types/commerce";
import { formatMoney, getProductPrice, cn, getStockLevel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { Button } from "@/components/ui/button";
import { ProductCoverImage } from "@/components/product/product-cover-image";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { toast } from "@/store/toast";
import { useUiStore } from "@/store/ui";

export function ProductCard({ product }: { product: Product }) {
  const { price, compareAtPrice, discountPercent } = getProductPrice(product);
  const { inStock, lowStock, qty } = getStockLevel(product);
  const addItem = useCartStore((s) => s.addItem);
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.id));
  const openMiniCart = useUiStore((s) => s.openMiniCart);
  const isGiftCard = product.tags.includes("gift-card");

  const cover = (
    <ProductCoverImage
      images={product.images}
      alt={product.images[0]?.alt ?? product.title}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className={cn(
        "transition duration-500 group-hover:scale-105",
        !inStock && "opacity-55",
        isGiftCard ? "object-contain p-3" : "object-cover object-center",
      )}
    />
  );

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
      <div className="relative aspect-square w-full overflow-hidden bg-bg-elevated">
        <Link href={`/product/${product.handle}`} className="absolute inset-0 block">
          {cover}
        </Link>
        <div className="pointer-events-none absolute left-2 top-2 z-[1] flex max-w-[calc(100%-3.5rem)] flex-col gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
          {!inStock ? (
            <Badge className="border-danger bg-bg text-[10px] text-danger shadow-sm sm:text-xs">
              Out of stock
            </Badge>
          ) : lowStock ? (
            <Badge className="border-warning bg-bg text-[10px] text-warning shadow-sm sm:text-xs">
              Only {qty} left
            </Badge>
          ) : null}
          {discountPercent ? (
            <Badge className="border-secondary bg-bg text-[10px] text-secondary shadow-sm sm:text-xs">
              -{discountPercent}%
            </Badge>
          ) : null}
          {product.newArrival ? (
            <Badge className="border-accent bg-bg text-[10px] text-accent shadow-sm sm:text-xs">
              New
            </Badge>
          ) : null}
          {product.video ? (
            <Badge className="border-accent bg-bg text-[10px] text-accent shadow-sm sm:text-xs">
              Video
            </Badge>
          ) : null}
          {product.condition === "pre-owned" ? (
            <Badge className="border-border bg-bg text-[10px] text-muted shadow-sm sm:text-xs">
              Used
            </Badge>
          ) : null}
        </div>
        <div className="absolute right-2 top-2 z-[1] flex flex-col gap-1.5 sm:right-3 sm:top-3 sm:gap-2 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <button
            type="button"
            aria-label="Wishlist"
            onClick={() => {
              wishlistToggle(product);
              toast({
                tone: "info",
                title: inWishlist ? "Removed from wishlist" : "Saved to wishlist",
                description: product.title,
              });
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-bg/80 backdrop-blur transition hover:border-accent sm:h-9 sm:w-9 sm:rounded-xl",
              inWishlist && "border-accent text-accent",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", inWishlist && "fill-current")} />
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <p className="truncate text-[10px] font-medium uppercase tracking-wider text-subtle sm:text-xs">
          {product.brand}
        </p>
        <Link
          href={`/product/${product.handle}`}
          className="line-clamp-2 break-words text-sm font-medium leading-snug text-text transition hover:text-accent sm:text-base"
        >
          {product.title}
        </Link>
        <div className="hidden sm:block">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1 sm:pt-2">
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-text sm:text-lg">
              {formatMoney(price)}
            </p>
            {compareAtPrice ? (
              <p className="text-[10px] text-subtle line-through sm:text-xs">
                {formatMoney(compareAtPrice)}
              </p>
            ) : null}
          </div>
          <Button
            size="icon"
            aria-label={inStock ? "Add to cart" : "Out of stock"}
            disabled={!inStock}
            onClick={() => {
              if (!inStock) return;
              addItem(product);
              toast({
                tone: "success",
                title: "Added to cart",
                description: product.title,
              });
              openMiniCart();
            }}
            className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
