import { CatalogSidebar, CatalogToolbar } from "@/components/catalog/catalog-controls";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import {
  filtersFromSearchParams,
  mergeCollectionFilters,
} from "@/lib/commerce/catalog-filters";
import { commerce } from "@/lib/commerce";
import { SITE } from "@/lib/constants";
import { redirectMissingCategory, resolveCollectionHandle } from "@/lib/safe-routes";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import {
  categorySeoDescription,
  categorySeoTitle,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo-meta";
import type { ProductFilters, SortOption } from "@/types/commerce";
import { ProductCard } from "@/components/product/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateCategoryMetadata(handle: string): Promise<Metadata> {
  const collection = await resolveCollectionHandle(handle);
  if (!collection) return { title: "Shop", robots: { index: false } };
  const title = categorySeoTitle(collection.seoTitle ?? collection.title);
  const description = categorySeoDescription(
    collection.title,
    collection.seoDescription ?? collection.description,
  );
  return {
    title,
    description,
    alternates: { canonical: `/${collection.handle}` },
    openGraph: {
      title,
      description,
      siteName: SITE.name,
      locale: "en_PK",
      images: collection.image
        ? [{ url: collection.image, alt: collection.title }]
        : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: collection.image ? [collection.image] : [DEFAULT_OG_IMAGE.url],
    },
  };
}

export async function CategoryView({
  handle,
  parentPath = [],
  searchParams,
}: {
  handle: string;
  parentPath?: string[];
  searchParams: SearchParams;
}) {
  const resolved = await resolveCollectionHandle(handle);
  if (!resolved) {
    await redirectMissingCategory(handle);
  }
  const collection = resolved!;
  if (collection.handle !== handle) {
    const prefix = parentPath.length ? `/${parentPath.join("/")}` : "";
    redirect(`${prefix}/${collection.handle}`);
  }

  const sp = await searchParams;
  const sort = (first(sp.sort) as SortOption) || "featured";
  const page = Number(first(sp.page) ?? "1") || 1;
  const fromUrl = filtersFromSearchParams(sp);

  const baseFilters: ProductFilters =
    collection.handle === "deals"
      ? { discount: true }
      : collection.handle === "new-arrivals"
        ? { newArrival: true }
        : collection.handle === "pre-owned-games"
          ? { condition: ["pre-owned"] }
          : { category: collection.handle };

  const filters = mergeCollectionFilters(baseFilters, fromUrl);

  const result = await commerce.getProducts({
    page,
    pageSize: 12,
    sort: collection.handle === "new-arrivals" ? "newest" : sort,
    filters,
  });

  const allCollections = await commerce.getCollections();
  const children = (collection.children ?? [])
    .map((h) => allCollections.find((c) => c.handle === h))
    .filter(Boolean);

  const crumbs = [
    { label: "Home", href: "/" },
    ...parentPath.map((p, i) => {
      const col = allCollections.find((c) => c.handle === p);
      return {
        label: col?.title ?? p,
        href: `/${parentPath.slice(0, i + 1).join("/")}`,
      };
    }),
    { label: collection.title },
  ];

  const basePath = `/${[...parentPath, handle].join("/")}`;

  return (
    <div className="container-px mx-auto max-w-7xl min-w-0 py-6 sm:py-8">
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs
            .filter((c) => c.href)
            .map((c) => ({ name: c.label, url: `${SITE.url}${c.href}` })),
        )}
      />
      <Breadcrumbs items={crumbs} className="mb-4 sm:mb-6" />
      <div className="mb-6 max-w-3xl sm:mb-8">
        <h1 className="break-words font-display text-2xl font-bold sm:text-3xl md:text-4xl">
          {collection.title}
        </h1>
        <p className="mt-2 text-sm text-muted sm:mt-3 sm:text-base">{collection.description}</p>
      </div>

      {children.length > 0 ? (
        <div className="mb-10 flex flex-wrap gap-2">
          {children.map((child) =>
            child ? (
              <Link
                key={child.handle}
                href={`/${[...parentPath, handle, child.handle].join("/")}`}
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-accent"
              >
                {child.title}
              </Link>
            ) : null,
          )}
        </div>
      ) : null}

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
              description="Try adjusting filters or clear them to see all items in this category."
              action={
                <Link href={basePath}>
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
                if (sort) params.set("sort", sort);
                return `${basePath}?${params.toString()}`;
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
