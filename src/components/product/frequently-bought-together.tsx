"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/commerce";
import { formatMoney, getProductPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { toast } from "@/store/toast";
import { useUiStore } from "@/store/ui";

export function FrequentlyBoughtTogether({
  main,
  accessories,
}: {
  main: Product;
  accessories: Product[];
}) {
  const addItem = useCartStore((s) => s.addItem);
  const openMiniCart = useUiStore((s) => s.openMiniCart);
  const bundle = [main, ...accessories.slice(0, 2)];
  const total = bundle.reduce((sum, p) => sum + getProductPrice(p).price.amount, 0);

  if (accessories.length === 0) return null;

  return (
    <section className="mt-12 min-w-0 overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:mt-16 sm:rounded-3xl sm:p-5 md:p-8">
      <h2 className="font-display text-xl font-bold sm:text-2xl">Frequently Bought Together</h2>
      <p className="mt-1 text-sm text-muted">Complete your setup in one tap.</p>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto pb-1 no-scrollbar">
          {bundle.map((p, i) => {
            const { price } = getProductPrice(p);
            return (
              <div key={p.id} className="flex shrink-0 items-center gap-3">
                {i > 0 ? <span className="text-xl font-bold text-subtle">+</span> : null}
                <Link
                  href={`/product/${p.handle}`}
                  className="flex w-32 flex-col overflow-hidden rounded-xl border border-border bg-bg transition hover:border-accent/40 sm:w-36"
                >
                  <span className="relative aspect-square">
                    <Image
                      src={p.images[0]?.url ?? "/logo.png"}
                      alt={p.title}
                      fill
                      className="object-cover object-center"
                      sizes="144px"
                    />
                  </span>
                  <span className="space-y-1 p-2">
                    <span className="line-clamp-2 text-xs">{p.title}</span>
                    <span className="block text-sm font-semibold text-accent">
                      {formatMoney(price)}
                    </span>
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-bg p-4 lg:w-64">
          <p className="text-sm text-muted">Bundle total</p>
          <p className="font-display text-2xl font-bold">
            {formatMoney({ amount: total, currencyCode: "PKR" })}
          </p>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              bundle.forEach((p) => addItem(p));
              toast({
                tone: "success",
                title: "Bundle added to cart",
                description: `${bundle.length} items ready for checkout`,
              });
              openMiniCart();
            }}
          >
            Add all to cart
          </Button>
        </div>
      </div>
    </section>
  );
}
