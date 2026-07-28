import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getPublishedNews } from "@/lib/admin/articles-db";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Toy Guides, Tips & Blog",
  description: `Buying guides, gift ideas, and toy tips from ${SITE.name} — help picking age-safe toys, diecast, RC cars and more in Pakistan.`,
  alternates: { canonical: "/news" },
};

const categoryLabels = {
  releases: "New & Trends",
  news: "Store News",
  guides: "Buying Guides",
  reviews: "Reviews",
};

export default async function NewsIndexPage() {
  const articles = await getPublishedNews(80);

  return (
    <div className="container-px mx-auto max-w-7xl min-w-0 py-6 sm:py-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        className="mb-6"
      />
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          Toy guides &amp; tips
        </h1>
        <p className="mt-3 text-muted">
          Age-based picking tips, gift ideas, and product guides — then shop matching toys at{" "}
          {SITE.name}.
        </p>
        <p className="mt-3 text-sm text-muted">
          Not sure where to start? Try{" "}
          <Link href="/find" className="text-accent hover:underline">
            Shop by Age
          </Link>{" "}
          or the{" "}
          <Link href="/gift-finder" className="text-accent hover:underline">
            Gift Finder
          </Link>
          .
        </p>
      </div>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
          No articles published yet. Check back soon for toy guides and gift tips.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/40"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {categoryLabels[article.category] ?? "Guide"}
                </p>
                <h2 className="font-display text-lg font-semibold leading-snug group-hover:text-accent">
                  {article.title}
                </h2>
                <p className="line-clamp-3 text-sm text-muted">{article.excerpt}</p>
                <p className="text-xs text-subtle">
                  {format(new Date(article.publishedAt), "MMM d, yyyy")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
