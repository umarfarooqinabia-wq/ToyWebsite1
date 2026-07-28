"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { CONTENT_TYPES, type ContentArticle } from "@/lib/admin/content-types";

function ArticleCardImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = failed || !src ? "/logo.png" : src;
  const local = imageSrc.startsWith("/");

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      unoptimized={local || imageSrc.includes("images.unsplash.com")}
      onError={() => setFailed(true)}
      className="object-cover transition duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, 25vw"
    />
  );
}

export function RecentArticles({ articles }: { articles: ContentArticle[] }) {
  if (!articles.length) return null;

  return (
    <section className="container-px mx-auto max-w-7xl py-12 sm:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Recent Articles</h2>
          <p className="mt-2 text-muted">
            Guides, gift tips, and buying advice — with links to shop matching toys.
          </p>
        </div>
        <Link href="/news" className="text-sm font-medium text-accent hover:underline">
          View all articles
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="group overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent/40"
          >
            <article>
              <div className="relative aspect-[16/10] overflow-hidden bg-bg-elevated">
                <ArticleCardImage
                  src={article.image}
                  alt={article.imageAlt || article.title}
                />
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {CONTENT_TYPES.find((t) => t.value === article.contentType)?.label ??
                    "Article"}
                </p>
                <h3 className="font-display text-base font-semibold leading-snug group-hover:text-accent">
                  {article.title}
                </h3>
                <p className="line-clamp-2 text-sm text-muted">{article.excerpt}</p>
                <p className="text-xs text-subtle">
                  {format(new Date(article.publishedAt), "MMM d, yyyy")}
                  {article.productHandles.length
                    ? ` · ${article.productHandles.length} toy link${article.productHandles.length > 1 ? "s" : ""}`
                    : ""}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
