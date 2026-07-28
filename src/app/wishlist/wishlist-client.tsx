"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { ShoppingCart, Trash2 } from "lucide-react";

export function WishlistClient() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Wishlist is empty"
        description="Tap the heart on any product to save it here."
        action={
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item.productId} className="overflow-hidden rounded-2xl border border-border bg-surface">
          <Link href={`/product/${item.handle}`} className="relative block aspect-square">
            <Image src={item.image} alt={item.title} fill className="object-cover" sizes="33vw" />
          </Link>
          <div className="space-y-2 p-4">
            <p className="text-xs uppercase tracking-wider text-subtle">{item.brand}</p>
            <Link href={`/product/${item.handle}`} className="line-clamp-2 font-medium hover:text-accent">
              {item.title}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display font-bold">{formatMoney(item.price)}</span>
              {item.compareAtPrice && item.compareAtPrice.amount > item.price.amount ? (
                <>
                  <span className="text-sm text-subtle line-through">
                    {formatMoney(item.compareAtPrice)}
                  </span>
                  <Badge variant="secondary">Price drop</Badge>
                </>
              ) : null}
            </div>
            <Badge variant={item.available ? "success" : "warning"}>
              {item.available ? "In stock" : "Out of stock"}
            </Badge>
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="flex-1"
                disabled={!item.available}
                onClick={() =>
                  addItem({
                    id: item.productId,
                    handle: item.handle,
                    title: item.title,
                    brand: item.brand,
                    description: "",
                    category: "",
                    categoryPath: [],
                    platform: [],
                    tags: [],
                    condition: "new",
                    rating: 0,
                    reviewCount: 0,
                    images: [{ url: item.image, alt: item.title }],
                    variants: [
                      {
                        id: `wish-${item.productId}`,
                        title: "Default",
                        sku: "",
                        price: item.price,
                        compareAtPrice: item.compareAtPrice,
                        available: item.available,
                        quantityAvailable: 10,
                      },
                    ],
                    specs: [],
                    compatibility: [],
                    createdAt: item.addedAt,
                  })
                }
              >
                <ShoppingCart className="h-4 w-4" /> Cart
              </Button>
              <Button size="sm" variant="outline" onClick={() => remove(item.productId)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
