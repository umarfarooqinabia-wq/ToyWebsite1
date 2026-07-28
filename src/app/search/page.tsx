import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { commerce } from "@/lib/commerce";
import { POPULAR_SEARCHES } from "@/lib/commerce/toycompany-search";

type SearchParams = Promise<{ q?: string; from?: string; page?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search toys",
    robots: { index: false },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", from, page: pageRaw } = await searchParams;
  const page = Number(pageRaw ?? "1") || 1;
  const result = q.trim()
    ? await commerce.getProducts({
        filters: { query: q },
        pageSize: 24,
        page,
        sort: "featured",
      })
    : { products: [], total: 0, page: 1, pageSize: 24, totalPages: 1 };

  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} className="mb-6" />
      {from === "missing" ? (
        <p className="mb-4 rounded-xl border border-accent/30 bg-accent-dim px-4 py-3 text-sm text-accent">
          That link was outdated or missing — here are the closest matches we could find.
        </p>
      ) : null}
      <h1 className="font-display text-3xl font-bold">
        {q ? (
          <>
            Results for <span className="text-accent">“{q}”</span>
          </>
        ) : (
          "Search toys"
        )}
      </h1>
      <p className="mt-2 text-muted">
        {q
          ? `${result.total} products found across the full catalog`
          : "Search 10,000+ toys — typos are OK."}
      </p>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-subtle">
          Popular searches
        </p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((item) => (
            <Link
              key={item.q}
              href={`/search?q=${encodeURIComponent(item.q)}`}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-accent hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {!q.trim() ? (
          <EmptyState
            title="What are you looking for?"
            description="Try Diecast, Remote Control, Dolls, or Swimming Pool."
            action={
              <Link href="/find">
                <Button variant="outline">Or shop by age</Button>
              </Link>
            }
          />
        ) : result.products.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Try a shorter word, check spelling, or browse by age."
            action={
              <div className="flex flex-col items-center gap-4">
                <Link href="/products">
                  <Button variant="outline">Browse all products</Button>
                </Link>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_SEARCHES.slice(0, 5).map((link) => (
                    <Link
                      key={link.q}
                      href={`/search?q=${encodeURIComponent(link.q)}`}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-accent hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {result.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {result.totalPages > 1 ? (
              <CatalogPagination
                page={result.page}
                totalPages={result.totalPages}
                hrefForPage={(n) =>
                  `/search?q=${encodeURIComponent(q)}&page=${n}`
                }
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
