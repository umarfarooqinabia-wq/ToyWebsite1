"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  Play,
} from "lucide-react";
import type { Product, ProductReview } from "@/types/commerce";
import {
  formatMoney,
  getProductPrice,
  isInStock,
  cn,
  FREE_SHIPPING_THRESHOLD,
  freeShippingRemaining,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import { GameDetailsPanel } from "@/components/product/game-details-panel";
import { ProductCoverImage } from "@/components/product/product-cover-image";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useRecentlyViewedStore } from "@/store/recently-viewed";
import { useRouter } from "next/navigation";
import { toast } from "@/store/toast";
import { useUiStore } from "@/store/ui";
import { TrustStrip } from "@/components/home/trust-strip";
import { youtubeEmbedSrc, videoWatchUrl } from "@/lib/commerce/toy-video";

const baseTabs = ["Description", "Specifications", "Compatibility", "Reviews", "Shipping"] as const;

export function ProductDetailClient({
  product,
  reviews,
}: {
  product: Product;
  reviews: ProductReview[];
}) {
  const tabs = product.video
    ? (["See it in action", ...baseTabs] as const)
    : baseTabs;
  const [activeImage, setActiveImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<string>(product.video ? "See it in action" : "Description");
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const openMiniCart = useUiStore((s) => s.openMiniCart);
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.id));
  const addRecent = useRecentlyViewedStore((s) => s.add);

  const { price, compareAtPrice, discountPercent } = getProductPrice(product);
  const inStock = isInStock(product);
  const qtyAvailable = product.variants[0]?.quantityAvailable ?? 0;
  const lowStock = inStock && qtyAvailable > 0 && qtyAvailable <= 5;
  const ytSrc = product.video ? youtubeEmbedSrc(product.video, true) : null;
  const ytSrcStatic = product.video ? youtubeEmbedSrc(product.video, false) : null;
  const watchUrl = product.video ? videoWatchUrl(product.video) : null;

  useEffect(() => {
    addRecent(product);
  }, [product, addRecent]);

  const addToCart = () => {
    if (!inStock || qtyAvailable <= 0) {
      toast({ tone: "error", title: "Out of stock", description: product.title });
      return;
    }
    addItem(product, qty);
    toast({
      tone: "success",
      title: "Added to cart",
      description: `${qty}× ${product.title}`,
    });
    openMiniCart();
  };
  const buyNow = () => {
    if (!inStock || qtyAvailable <= 0) {
      toast({ tone: "error", title: "Out of stock", description: product.title });
      return;
    }
    addItem(product, qty);
    router.push("/checkout");
  };

  const shippingLeft = freeShippingRemaining(price.amount * qty);
  return (
    <div className="grid min-w-0 gap-8 pb-24 lg:grid-cols-2 lg:gap-10 sm:pb-0">
      <div className="min-w-0">
        <div
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-surface sm:aspect-square"
        >
          {showVideo && product.video ? (
            product.video.src ? (
              <video
                title={product.video.title}
                src={product.video.src}
                controls
                autoPlay
                className="absolute inset-0 h-full w-full object-contain bg-black"
              />
            ) : product.video.tiktokId ? (
              <iframe
                title={product.video.title}
                src={`https://www.tiktok.com/embed/v2/${product.video.tiktokId}`}
                className="absolute inset-0 h-full w-full bg-black"
                allow="encrypted-media; fullscreen"
                allowFullScreen
              />
            ) : product.video.embedUrl ? (
              <iframe
                title={product.video.title}
                src={product.video.embedUrl}
                className="absolute inset-0 h-full w-full bg-black"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            ) : ytSrc ? (
              <iframe
                title={product.video.title}
                src={ytSrc}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : null
          ) : (
            <ProductCoverImage
              key={`${product.id}-${activeImage}`}
              images={[
                ...product.images.slice(activeImage),
                ...product.images.slice(0, activeImage),
              ]}
              alt={product.images[activeImage]?.alt ?? product.title}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          )}
          {discountPercent && !showVideo ? (
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 z-[1] sm:left-4 sm:top-4"
            >
              -{discountPercent}%
            </Badge>
          ) : null}
          {product.video && !showVideo ? (
            <button
              type="button"
              onClick={() => {
                setShowVideo(true);
                setTab("See it in action");
              }}
              className="absolute inset-0 z-[1] flex items-center justify-center bg-black/25 transition hover:bg-black/35"
              aria-label="Play demo video"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-[#04110e] shadow-lg animate-pulse-glow sm:h-16 sm:w-16">
                <Play className="h-6 w-6 fill-current sm:h-7 sm:w-7" />
              </span>
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {product.video ? (
            <button
              type="button"
              onClick={() => setShowVideo(true)}
              className={cn(
                "relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-bg sm:h-20 sm:w-20",
                showVideo ? "border-accent" : "border-border",
              )}
              aria-label="Watch demo video"
            >
              <Play className="h-5 w-5 text-accent sm:h-6 sm:w-6" />
            </button>
          ) : null}
          {product.images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => {
                setShowVideo(false);
                setActiveImage(i);
              }}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border sm:h-20 sm:w-20",
                !showVideo && i === activeImage ? "border-accent" : "border-border",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                unoptimized={img.url.endsWith(".svg")}
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
        {product.video ? (
          <p className="mt-3 text-xs text-subtle">
            Tap play to see this toy in action — demos help kids (and parents) decide faster.
          </p>
        ) : null}
      </div>

      <div className="min-w-0 pb-24 sm:pb-0">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">{product.brand}</p>
        <h1 className="mt-2 break-words font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
          {product.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
          <span className="text-sm text-subtle">SKU: {product.variants[0]?.sku}</span>
        </div>

        <div className="mt-6 flex items-end gap-3">
          <span className="font-display text-3xl font-bold">{formatMoney(price)}</span>
          {compareAtPrice ? (
            <span className="pb-1 text-lg text-subtle line-through">
              {formatMoney(compareAtPrice)}
            </span>
          ) : null}
        </div>

        <p className={cn("mt-3 text-sm font-medium", inStock ? "text-accent" : "text-danger")}>
          {!inStock
            ? "Out of stock"
            : lowStock
              ? `Low stock — only ${qtyAvailable} left`
              : `In stock (${qtyAvailable} available)`}
        </p>

        <p className="mt-2 text-sm text-muted">
          {shippingLeft > 0
            ? `Add ${formatMoney({ amount: shippingLeft, currencyCode: "PKR" })} more for free shipping (threshold ${formatMoney({ amount: FREE_SHIPPING_THRESHOLD, currencyCode: "PKR" })}).`
            : "This item unlocks free shipping on its own."}
        </p>

        <div className="mt-4">
          <TrustStrip compact />
        </div>

        <GameDetailsPanel product={product} />

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-12 items-center rounded-xl border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="px-3 text-muted hover:text-text"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-semibold tabular-nums">{qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="px-3 text-muted hover:text-text"
              onClick={() =>
                setQty((q) => Math.min(qtyAvailable || 0, q + 1))
              }
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 hidden gap-3 sm:flex">
          <Button size="lg" className="flex-1" onClick={addToCart} disabled={!inStock}>
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </Button>
          <Button size="lg" variant="secondary" className="flex-1" onClick={buyNow} disabled={!inStock}>
            <Zap className="h-4 w-4" /> Buy Now
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            variant="outline"
            className={cn("w-full sm:w-auto", inWishlist && "border-accent text-accent")}
            onClick={() => wishlistToggle(product)}
          >
            <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} /> Wishlist
          </Button>
        </div>

        {product.compatibility.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-surface p-4">
            <p className="mb-3 text-sm font-semibold">Compatible With</p>
            <div className="flex flex-wrap gap-2">
              {product.compatibility.map((c) => (
                <Badge key={c} variant="accent">
                  {c}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          <div className="flex gap-1 overflow-x-auto border-b border-border no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "whitespace-nowrap px-4 py-3 text-sm font-medium transition",
                  tab === t
                    ? "border-b-2 border-accent text-accent"
                    : "text-muted hover:text-text",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="py-5 text-sm leading-relaxed text-muted">
            {tab === "See it in action" && product.video ? (
              <div className="space-y-4">
                <p className="font-medium text-text">{product.video.title}</p>
                <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-black">
                  {product.video.src ? (
                    <video
                      title={product.video.title}
                      src={product.video.src}
                      controls
                      className="absolute inset-0 h-full w-full"
                    />
                  ) : product.video.tiktokId ? (
                    <iframe
                      title={product.video.title}
                      src={`https://www.tiktok.com/embed/v2/${product.video.tiktokId}`}
                      className="absolute inset-0 h-full w-full"
                      allow="encrypted-media; fullscreen"
                      allowFullScreen
                    />
                  ) : product.video.embedUrl ? (
                    <iframe
                      title={product.video.title}
                      src={product.video.embedUrl}
                      className="absolute inset-0 h-full w-full"
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                    />
                  ) : ytSrcStatic ? (
                    <iframe
                      title={product.video.title}
                      src={ytSrcStatic}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : null}
                </div>
                <p>
                  Watch demos before you buy — kids decide faster when they see the toy working.
                </p>
                {watchUrl ? (
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-accent hover:underline"
                  >
                    Open more demos
                  </a>
                ) : null}
              </div>
            ) : null}
            {tab === "Description" && (
              <p className="whitespace-pre-line">{product.description}</p>
            )}
            {tab === "Specifications" && (
              <dl className="space-y-3">
                {product.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-3 border-b border-border pb-2 sm:gap-4">
                    <dt className="shrink-0 text-subtle">{s.label}</dt>
                    <dd className="min-w-0 break-words text-right text-text">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {tab === "Compatibility" && (
              <ul className="list-inside list-disc space-y-1">
                {product.compatibility.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
            {tab === "Reviews" && (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border bg-bg p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-text">{r.author}</p>
                      <RatingStars rating={r.rating} />
                    </div>
                    <p className="mt-1 font-medium text-text">{r.title}</p>
                    <p className="mt-1">{r.body}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === "Shipping" && (
              <p>
                {product.shippingInfo ??
                  "Orders dispatch within 24 hours. Free shipping over Rs. 15,000. Track your package from your account dashboard."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky mobile ATC */}
      <div className="fixed inset-x-0 bottom-[var(--bottom-nav-height)] z-30 border-t border-border bg-bg/95 p-3 backdrop-blur sm:hidden">
        <div className="flex gap-2">
          <Button className="flex-1" onClick={addToCart} disabled={!inStock}>
            Add to Cart
          </Button>
          <Button variant="secondary" className="flex-1" onClick={buyNow} disabled={!inStock}>
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RecentlyViewed() {
  const items = useRecentlyViewedStore((s) => s.items);
  if (items.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="mb-6 font-display text-2xl font-bold">Recently Viewed</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {items.map((item) => (
          <Link
            key={item.productId}
            href={`/product/${item.handle}`}
            className="w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-surface"
          >
            <div className="relative aspect-square">
              <Image src={item.image} alt={item.title} fill className="object-cover" sizes="160px" />
            </div>
            <div className="p-2">
              <p className="line-clamp-2 text-xs">{item.title}</p>
              <p className="mt-1 text-sm font-semibold text-accent">
                {formatMoney({ amount: item.price, currencyCode: item.currencyCode })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
