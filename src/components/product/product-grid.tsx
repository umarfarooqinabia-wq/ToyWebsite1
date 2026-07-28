import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/commerce";
import { ArrowRight } from "lucide-react";

export function ProductGrid({
  products,
  title,
  href,
  embedded = false,
}: {
  products: Product[];
  title?: string;
  href?: string;
  /** Skip outer container when nested inside another padded page */
  embedded?: boolean;
}) {
  return (
    <section
      className={
        embedded ? "min-w-0" : "container-px mx-auto max-w-7xl min-w-0"
      }
    >
      {title ? (
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 className="min-w-0 font-display text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            {title}
          </h2>
          {href ? (
            <Link
              href={href}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent transition hover:text-accent-hover"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
