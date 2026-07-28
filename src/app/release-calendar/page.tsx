import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { commerce } from "@/lib/commerce";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "New Toy Arrivals — Fresh Stock Daily",
  description: `See the latest toys just added at ${SITE.name} — diecast, RC, baby gear, outdoor play and more. COD across Pakistan.`,
  alternates: { canonical: "/release-calendar" },
  openGraph: {
    title: `New Toy Arrivals | ${SITE.name}`,
    description: "Fresh toys added almost every day — shop new arrivals online in Pakistan.",
    url: `${SITE.url}/release-calendar`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `New Toy Arrivals | ${SITE.name}`,
    description: "Fresh toys added almost every day — shop new arrivals online in Pakistan.",
    images: ["/opengraph-image"],
  },
  keywords: [
    "new toys Pakistan",
    "new arrival toys",
    "kids toys online",
    "diecast new arrivals",
    SITE.name,
  ],
};

export default async function NewArrivalsCalendarPage() {
  const [newest, deals] = await Promise.all([
    commerce.getNewArrivals(16),
    commerce.getDeals(8),
  ]);

  return (
    <div className="container-px mx-auto max-w-7xl py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "New Arrivals" },
        ]}
      />

      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Fresh stock
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold md:text-4xl">
          New toy arrivals
        </h1>
        <p className="mt-3 text-muted md:text-lg">
          The latest toys added to {SITE.name} — diecast, RC, baby gear, outdoor play and more.
          New stock lands almost every day.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/new-arrival">
            <Button>Browse all new arrivals</Button>
          </Link>
          <Link href="/find">
            <Button variant="outline">Shop by age</Button>
          </Link>
        </div>
      </header>

      {newest.length > 0 ? (
        <section className="mb-12">
          <h2 className="mb-5 font-display text-2xl font-bold">Just in</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {deals.length > 0 ? (
        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-bold">On sale now</h2>
            <Link href="/toys-on-sale" className="text-sm font-medium text-accent">
              View all deals
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
