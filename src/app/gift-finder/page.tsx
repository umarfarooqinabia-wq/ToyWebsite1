import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { GiftFinderForm } from "@/components/find/gift-finder-form";
import { commerce } from "@/lib/commerce";
import { getAgeRange } from "@/lib/commerce/age-interest";
import {
  effectiveGiftAge,
  getOccasion,
} from "@/lib/commerce/gift-finder";
import { getProductPrice } from "@/lib/utils";
import { SITE } from "@/lib/constants";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export const metadata: Metadata = {
  title: "Gift Finder",
  description:
    "Find the perfect toy gift by budget, age, and occasion — birthday, Eid, newborn, and more.",
  alternates: { canonical: "/gift-finder" },
};

export default async function GiftFinderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const ageParam = first(sp.age);
  const occasion = first(sp.occasion);
  const minPrice = first(sp.minPrice) ? Number(first(sp.minPrice)) : undefined;
  const maxPrice = first(sp.maxPrice) ? Number(first(sp.maxPrice)) : undefined;
  const page = Number(first(sp.page) ?? "1") || 1;
  const age = effectiveGiftAge(ageParam, occasion);
  const hasSelection =
    Boolean(ageParam || occasion) || minPrice != null || maxPrice != null;

  const result = hasSelection
    ? await commerce.getProducts({
        filters: {
          age,
          minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
          maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
          // Newborn leans baby audience keywords via age 0-2 collection
          audience: occasion === "newborn" ? "both" : undefined,
        },
        sort: "featured",
        page,
        pageSize: 16,
      })
    : { products: [], total: 0, page: 1, pageSize: 16, totalPages: 1 };

  // Soft-rank: occasion keyword matches first within the page
  const occasionMeta = getOccasion(occasion);
  const ranked = occasionMeta
    ? [...result.products].sort((a, b) => {
        const hayA = `${a.title} ${a.tags.join(" ")}`;
        const hayB = `${b.title} ${b.tags.join(" ")}`;
        return (
          Number(occasionMeta.keywords.test(hayB)) -
          Number(occasionMeta.keywords.test(hayA))
        );
      })
    : result.products;

  const ageMeta = getAgeRange(age);
  const summary = [
    occasionMeta?.label,
    ageMeta?.label,
    maxPrice != null
      ? `up to Rs ${maxPrice.toLocaleString("en-PK")}`
      : minPrice != null
        ? `from Rs ${minPrice.toLocaleString("en-PK")}`
        : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="container-px mx-auto max-w-7xl py-6 sm:py-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Gift Finder" }]}
        className="mb-4 sm:mb-6"
      />

      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Gift finder
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          {summary || "Pick a budget. We’ll suggest gifts."}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Undecided? Set occasion, age, and budget — {SITE.name} will shortlist toys that fit.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-gradient-to-br from-surface via-bg-elevated to-surface p-5 sm:p-8">
        <GiftFinderForm
          initialAge={ageParam}
          initialOccasion={occasion}
          initialMin={minPrice}
          initialMax={maxPrice}
          resultCount={result.total}
        />
      </div>

      <div className="mt-10">
        {!hasSelection ? (
          <EmptyState
            title="Set your gift filters"
            description="Try Birthday · Ages 6–8 · under Rs 7,000 — a classic winning combo."
            action={
              <Link href="/gift-finder?occasion=birthday&age=6-8&minPrice=0&maxPrice=7000">
                <Button>Show birthday ideas</Button>
              </Link>
            }
          />
        ) : ranked.length === 0 ? (
          <EmptyState
            title="Nothing in this budget"
            description="Widen the price range or pick a different age."
            action={
              <Link href="/gift-finder">
                <Button variant="outline">Reset</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="mb-5 flex items-end justify-between gap-3">
              <h2 className="font-display text-xl font-bold sm:text-2xl">Gift ideas</h2>
              <p className="text-sm text-muted">
                From {getProductPrice(ranked[0]!).price.amount.toLocaleString("en-PK")} PKR
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {ranked.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {result.totalPages > 1 ? (
              <CatalogPagination
                page={result.page}
                totalPages={result.totalPages}
                hrefForPage={(n) => {
                  const params = new URLSearchParams();
                  if (ageParam) params.set("age", ageParam);
                  if (occasion) params.set("occasion", occasion);
                  if (minPrice != null) params.set("minPrice", String(minPrice));
                  if (maxPrice != null) params.set("maxPrice", String(maxPrice));
                  params.set("page", String(n));
                  return `/gift-finder?${params.toString()}`;
                }}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
