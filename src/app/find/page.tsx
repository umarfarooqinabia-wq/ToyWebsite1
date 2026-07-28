import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { AgeInterestPicker } from "@/components/find/age-interest-picker";
import { commerce } from "@/lib/commerce";
import {
  getAgeRange,
  getAudience,
} from "@/lib/commerce/age-interest";
import { SITE } from "@/lib/constants";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const age = getAgeRange(first(sp.age));
  const audience = getAudience(first(sp.audience));
  const parts = [age?.label, audience?.label].filter(Boolean);
  const title = parts.length
    ? `Toys for ${parts.join(" · ")}`
    : "Shop by Age & Interest";
  return {
    title,
    description:
      "Find the right toy fast — filter by age (0–2, 3–5, 6–8, 9–12, 13+) and interest (Boy, Girl, Both, Collector).",
    alternates: { canonical: "/find" },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description: "Parents decide by age first. Skip the deep menus.",
    },
  };
}

export default async function FindPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const age = first(sp.age);
  const audience = first(sp.audience);
  const page = Number(first(sp.page) ?? "1") || 1;
  const hasSelection = Boolean(age || audience);

  const result = hasSelection
    ? await commerce.getProducts({
        filters: { age, audience },
        sort: "featured",
        page,
        pageSize: 16,
      })
    : { products: [], total: 0, page: 1, pageSize: 16, totalPages: 1 };

  const ageMeta = getAgeRange(age);
  const audienceMeta = getAudience(audience);
  const headline = [ageMeta?.label, audienceMeta?.label].filter(Boolean).join(" · ");

  return (
    <div className="container-px mx-auto max-w-7xl py-6 sm:py-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Shop by Age" }]}
        className="mb-4 sm:mb-6"
      />

      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Age &amp; interest finder
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          {headline || "Find the right toy in two taps"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Skip deep menus. Pick an age range and who it&apos;s for — we&apos;ll show toys that
          actually fit.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-gradient-to-br from-surface via-bg-elevated to-surface p-5 sm:p-8">
        <AgeInterestPicker age={age} audience={audience} resultCount={result.total} />
      </div>

      <div className="mt-10">
        {!hasSelection ? (
          <EmptyState
            title="Choose an age or interest"
            description="Start with ages 0–2 for babies, 6–8 for outdoor & RC, or Collector for diecast."
            action={
              <Link href="/find?age=0-2&audience=both">
                <Button>Show baby toys</Button>
              </Link>
            }
          />
        ) : result.products.length === 0 ? (
          <EmptyState
            title="No matches yet"
            description="Try a broader interest like Both, or clear one filter."
            action={
              <Link href="/find">
                <Button variant="outline">Reset finder</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="mb-5 flex items-end justify-between gap-3">
              <h2 className="font-display text-xl font-bold sm:text-2xl">
                Recommended toys
              </h2>
              <Link href="/products" className="text-sm font-medium text-accent">
                Browse all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {result.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {result.totalPages > 1 ? (
              <CatalogPagination
                page={result.page}
                totalPages={result.totalPages}
                hrefForPage={(n) => {
                  const params = new URLSearchParams();
                  if (age) params.set("age", age);
                  if (audience) params.set("audience", audience);
                  params.set("page", String(n));
                  return `/find?${params.toString()}`;
                }}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
