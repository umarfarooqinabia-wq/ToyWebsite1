import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  CategoryView,
  generateCategoryMetadata,
} from "@/components/catalog/category-view";
import {
  CONTENT_TYPES,
  listArticles,
  listGameHubSlugs,
} from "@/lib/admin/articles-db";
import { commerce } from "@/lib/commerce";
import { SITE } from "@/lib/constants";
import { formatMoney, getProductPrice } from "@/lib/utils";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/seo-meta";
import { redirectMissingGameHub } from "@/lib/safe-routes";
import type { Product } from "@/types/commerce";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamicParams = true;

function productMatchesGame(product: Product, gameSlug: string, gameName: string) {
  const hay = `${product.title} ${product.handle} ${product.brand}`.toLowerCase();
  const name = gameName.toLowerCase();
  const tokens = gameSlug.split("-").filter((t) => t.length > 2);
  if (name && hay.includes(name)) return true;
  if (product.handle.includes(gameSlug)) return true;
  return tokens.length > 0 && tokens.every((t) => hay.includes(t));
}

export async function generateStaticParams() {
  const [slugs, collections] = await Promise.all([
    listGameHubSlugs(),
    commerce.getCollections(),
  ]);
  const collectionHandles = new Set(collections.map((c) => c.handle));
  // Game hubs only — category handles under /games/* are resolved at request time.
  return slugs
    .filter((slug) => !collectionHandles.has(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await commerce.getCollectionByHandle(slug);
  if (collection) {
    return generateCategoryMetadata(slug);
  }

  const articles = await listArticles({ publishedOnly: true, gameSlug: slug });
  const gameName =
    articles.find((a) => a.relatedGameSlug === slug)?.relatedGame ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const title = `${gameName} — Toys & Guides | ${SITE.name}`;
  const description = `Shop ${gameName} discs in Pakistan and read related news, reviews, and buying guides on ${SITE.name}.`;
  const canonical = `/games/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonical),
      siteName: SITE.name,
      locale: "en_PK",
    },
  };
}

export default async function GameHubPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;

  // `/games/pre-owned-games`, `/games/ps5-games`, etc. are catalog categories —
  // do not treat them as single-title game hubs.
  const collection = await commerce.getCollectionByHandle(slug);
  if (collection) {
    return (
      <CategoryView
        handle={slug}
        parentPath={["games"]}
        searchParams={searchParams}
      />
    );
  }

  const articles = await listArticles({ publishedOnly: true, gameSlug: slug });
  const gameName =
    articles.find((a) => a.relatedGameSlug === slug)?.relatedGame ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const { products: catalog } = await commerce.getProducts({ pageSize: 100 });
  const products = catalog.filter((p) => productMatchesGame(p, slug, gameName)).slice(0, 24);

  if (articles.length === 0 && products.length === 0) redirectMissingGameHub(slug);

  const byType = (type: string) => articles.filter((a) => a.contentType === type);
  const news = [...byType("news"), ...byType("article")];
  const guides = [...byType("guide"), ...byType("buying_guide"), ...byType("seo_page")];
  const reviews = byType("review");
  const pageUrl = absoluteUrl(`/games/${slug}`);

  return (
    <div className="container-px mx-auto max-w-7xl min-w-0 py-6 sm:py-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: absoluteUrl("/") },
          { name: "Games", url: absoluteUrl("/games") },
          { name: gameName, url: pageUrl },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${gameName} hub`,
          description: `Products and content for ${gameName}`,
          url: pageUrl,
        }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Games", href: "/games" },
          { label: gameName },
        ]}
        className="mb-6"
      />

      <header className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Game hub</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{gameName}</h1>
        <p className="mt-3 text-muted">
          Products, news, guides, and reviews for {gameName} — shop discs and dig into the
          content.
        </p>
      </header>

      {products.length > 0 ? (
        <section className="mb-14">
          <h2 className="font-display text-2xl font-bold">{gameName} products</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const { price, compareAtPrice } = getProductPrice(product);
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.handle}`}
                  className="overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/40"
                >
                  <span className="relative aspect-[3/4] block bg-bg">
                    <Image
                      src={product.images[0]?.url ?? "/logo.png"}
                      alt={product.title}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </span>
                  <span className="block space-y-1 p-3">
                    <span className="line-clamp-2 text-sm font-medium">{product.title}</span>
                    <span className="font-display font-bold text-accent">
                      {formatMoney(price)}
                    </span>
                    {compareAtPrice ? (
                      <span className="ml-2 text-xs text-subtle line-through">
                        {formatMoney(compareAtPrice)}
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {(
        [
          { title: `${gameName} news & articles`, items: news },
          { title: `${gameName} guides`, items: guides },
          { title: `${gameName} reviews`, items: reviews },
        ] as const
      ).map((section) =>
        section.items.length > 0 ? (
          <section key={section.title} className="mb-12">
            <h2 className="font-display text-2xl font-bold">{section.title}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/40"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.imageAlt || article.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {CONTENT_TYPES.find((t) => t.value === article.contentType)?.label}
                    </p>
                    <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-accent">
                      {article.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted">{article.excerpt}</p>
                    <p className="text-xs text-subtle">
                      {format(new Date(article.publishedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null,
      )}

      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-muted">Looking for more discs?</p>
        <Link href={`/search?q=${encodeURIComponent(gameName)}`} className="mt-3 inline-block">
          <Button>Search {gameName} in store</Button>
        </Link>
      </div>
    </div>
  );
}
