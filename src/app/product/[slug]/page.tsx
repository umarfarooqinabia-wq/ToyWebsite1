import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import {
  ProductDetailClient,
  RecentlyViewed,
} from "@/components/product/product-detail-client";
import { FrequentlyBoughtTogether } from "@/components/product/frequently-bought-together";
import { getArticlesForProduct } from "@/lib/admin/articles-db";
import { CONTENT_TYPES } from "@/lib/admin/content-types";
import { commerce } from "@/lib/commerce";
import { SITE } from "@/lib/constants";
import { redirectMissingProduct } from "@/lib/safe-routes";
import { getProductPrice, isInStock } from "@/lib/utils";
import { JsonLd, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import {
  absoluteUrl,
  productSeoDescription,
  productSeoKeywords,
  productSeoTitle,
} from "@/lib/seo-meta";

type Params = Promise<{ slug: string }>;

/** Allow unknown product handles so we can redirect to search instead of 404. */
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await commerce.getProductByHandle(slug);
  if (!product) return { title: "Searching…", robots: { index: false } };

  const title = productSeoTitle(product);
  const description = productSeoDescription(product);
  const keywords = productSeoKeywords(product);
  const image = product.images[0]?.url;
  const canonical = `/product/${product.handle}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonical),
      type: "website",
      siteName: SITE.name,
      locale: "en_PK",
      images: image
        ? [{ url: image, alt: product.title }]
        : [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : ["/opengraph-image"],
    },
    other: {
      "product:price:amount": String(getProductPrice(product).price.amount),
      "product:price:currency": "PKR",
      "product:availability": isInStock(product) ? "in stock" : "out of stock",
    },
  };
}

export async function generateStaticParams() {
  const { products } = await commerce.getProducts({ pageSize: 100 });
  return products.map((p) => ({ slug: p.handle }));
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await commerce.getProductByHandle(slug);
  if (!product) redirectMissingProduct(slug);

  const [related, reviews, accessories, relatedArticles] = await Promise.all([
    commerce.getRelatedProducts(product, 4),
    commerce.getProductReviews(product.id),
    commerce.getProducts({
      filters: { category: "accessories" },
      pageSize: 4,
      sort: "best_selling",
    }),
    getArticlesForProduct(product.handle, 6),
  ]);

  const { price } = getProductPrice(product);
  const crumbs = [
    { label: "Home", href: "/" },
    ...product.categoryPath.map((c, i) => ({
      label: c.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
      href: `/${product.categoryPath.slice(0, i + 1).join("/")}`,
    })),
    { label: product.title },
  ];

  return (
    <div className="container-px mx-auto max-w-7xl min-w-0 py-6 sm:py-8">
      <JsonLd
        data={productJsonLd({
          name: product.title,
          description: product.description,
          image: product.images.map((i) => i.url),
          sku: product.variants[0]?.sku ?? product.id,
          brand: product.brand,
          price: price.amount,
          currency: price.currencyCode,
          availability: isInStock(product),
          rating: product.rating,
          reviewCount: product.reviewCount,
          url: `${SITE.url}/product/${product.handle}`,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs
            .filter((c) => c.href)
            .map((c) => ({ name: c.label, url: `${SITE.url}${c.href}` })),
        )}
      />
      <Breadcrumbs items={crumbs} className="mb-5 sm:mb-8" />
      <ProductDetailClient product={product} reviews={reviews} />

      {related.length > 0 ? (
        <div className="mt-16">
          <ProductGrid products={related} title="Related Products" embedded />
        </div>
      ) : null}

      {relatedArticles.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">Related news &amp; guides</h2>
          <p className="mt-1 text-sm text-muted">
            Articles and reviews linked to this disc.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((article) => (
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
      ) : null}

      <FrequentlyBoughtTogether
        main={product}
        accessories={accessories.products.filter((p) => p.id !== product.id)}
      />

      <RecentlyViewed />
    </div>
  );
}
