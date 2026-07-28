import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/home/hero-section";
import { SpecialDeals } from "@/components/home/special-deals";
import { RecentArticles } from "@/components/home/recent-articles";
import { CustomerReviews } from "@/components/home/customer-reviews";
import { TrustStrip } from "@/components/home/trust-strip";
import { PakistanCodBanner } from "@/components/home/pakistan-cod-banner";
import { AgeInterestTeaser } from "@/components/home/age-interest-teaser";
import { ProductGrid } from "@/components/product/product-grid";
import { commerce } from "@/lib/commerce";
import {
  HOME_CATEGORY_TILES,
  HOME_PRODUCT_SECTIONS,
} from "@/lib/commerce/toycompany-collections";
import { getCmsHomepageArticles } from "@/lib/admin/articles-db";
import { SITE } from "@/lib/constants";
import { fetchGoogleReviews } from "@/lib/google-reviews";
import { JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name} — Buy Kids Toys Online in Pakistan`,
  },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/opengraph-image"],
  },
};

export default async function HomePage() {
  const sectionResults = await Promise.all(
    HOME_PRODUCT_SECTIONS.map((section) =>
      commerce.getProducts({
        filters: { category: section.handle },
        sort: "newest",
        pageSize: 8,
      }),
    ),
  );

  const [deals, news, googleReviews] = await Promise.all([
    commerce.getDeals(6),
    getCmsHomepageArticles(8),
    fetchGoogleReviews(),
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "New Arrival Toys",
    itemListElement: (sectionResults[0]?.products ?? []).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/product/${p.handle}`,
      name: p.title,
    })),
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    telephone: SITE.supportPhone,
    email: SITE.supportEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.line1,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      addressCountry: SITE.address.countryCode,
    },
    ...(typeof googleReviews.rating === "number" && googleReviews.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: googleReviews.rating,
            reviewCount: googleReviews.reviewCount,
          },
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={localBusinessJsonLd} />
      <HeroSection />
      <AgeInterestTeaser />
      <TrustStrip />
      <PakistanCodBanner />

      <section className="container-px mx-auto max-w-7xl py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Shop by category</h2>
            <p className="mt-2 text-sm text-muted">Find the right toys for every age and interest.</p>
          </div>
          <Link href="/products" className="shrink-0 text-sm font-medium text-accent">
            Shop all categories
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {HOME_CATEGORY_TILES.map((tile) => (
            <Link
              key={tile.handle}
              href={`/${tile.handle}`}
              className="group rounded-2xl border border-border bg-surface/80 px-4 py-5 text-center transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface"
            >
              <span className="font-display text-sm font-semibold text-text transition group-hover:text-accent sm:text-base">
                {tile.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {HOME_PRODUCT_SECTIONS.map((section, index) => {
        const products = sectionResults[index]?.products ?? [];
        if (!products.length) return null;
        return (
          <div key={section.handle} className="py-8">
            <ProductGrid products={products} title={section.title} href={section.href} />
          </div>
        );
      })}

      <SpecialDeals products={deals} />

      <section className="container-px mx-auto max-w-7xl py-12 sm:py-16">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface via-bg-elevated to-surface px-6 py-10 md:px-12 md:py-14">
          <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our story</p>
          <h2 className="mt-3 max-w-2xl font-display text-2xl font-bold md:text-4xl">
            Pakistan&apos;s Favourite Online Toy Store
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
            ToyCompany started in Multan in 2020 with a few products and one belief: Pakistani
            families and collectors deserve toys that are genuinely good quality, fairly priced, and
            built to last. From remote control cars and diecast models to educational toys, baby
            gear and summer pools — there&apos;s something here for every kid and every collector.
          </p>
          <p className="mt-4 text-sm italic text-text/80">
            Quality toys. Honest reviews. Delivered to your door, anywhere in Pakistan.
          </p>
        </div>
      </section>

      <RecentArticles articles={news} />
      <CustomerReviews feed={googleReviews} />
    </>
  );
}
