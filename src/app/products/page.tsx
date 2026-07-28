import { CatalogSidebar, CatalogToolbar } from "@/components/catalog/catalog-controls";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { commerce } from "@/lib/commerce";
import { filtersFromSearchParams } from "@/lib/commerce/catalog-filters";
import type { SortOption } from "@/types/commerce";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Toys — Kids Toys, Diecast, RC & Baby Gear",
  description:
    "Browse kids toys, diecast models, remote control cars, baby gear, educational toys and pools online in Pakistan. Cash on Delivery and nationwide delivery.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "All Toys | ToyCompany",
    description:
      "Shop toys online in Pakistan — new arrivals, diecast, RC, baby toys and more.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Number(first(sp.page) ?? "1") || 1;
  const sort = (first(sp.sort) as SortOption) || "featured";
  const category = first(sp.category);
  const filters = {
    ...filtersFromSearchParams(sp),
    category: category || undefined,
  };

  const result = await commerce.getProducts({
    page,
    pageSize: 12,
    sort,
    filters,
  });

  return (
    <div className="container-px mx-auto max-w-7xl min-w-0 py-6 sm:py-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Products" }]}
        className="mb-4 sm:mb-6"
      />
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">All Toys</h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Filter by brand, price, and more — or try{" "}
          <Link href="/find" className="text-accent hover:underline">
            Shop by Age
          </Link>{" "}
          and{" "}
          <Link href="/gift-finder" className="text-accent hover:underline">
            Gift Finder
          </Link>
          .
        </p>
      </div>

      <div className="grid min-w-0 gap-8 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">
          <Suspense fallback={null}>
            <CatalogSidebar />
          </Suspense>
        </aside>

        <div className="min-w-0">
          <Suspense fallback={null}>
            <CatalogToolbar total={result.total} />
          </Suspense>

          {result.products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting filters or search for something else."
              action={
                <Link href="/products">
                  <Button variant="outline">Clear filters</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3">
              {result.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {result.products.length > 0 ? (
            <CatalogPagination
              page={result.page}
              totalPages={result.totalPages}
              hrefForPage={(n) => {
                const params = new URLSearchParams();
                Object.entries(sp).forEach(([k, v]) => {
                  const val = first(v);
                  if (val) params.set(k, val);
                });
                params.set("page", String(n));
                return `/products?${params.toString()}`;
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
