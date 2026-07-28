import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/content/markdown-content";
import {
  CONTENT_TYPES,
  getArticleBySlug,
  getRelatedArticles,
  listArticles,
  type ContentArticle,
} from "@/lib/admin/articles-db";
import { DEMO_NEWS } from "@/lib/commerce/demo-data";
import { commerce } from "@/lib/commerce";
import { SITE } from "@/lib/constants";
import { redirectMissingArticle } from "@/lib/safe-routes";
import { formatMoney, getProductPrice } from "@/lib/utils";
import {
  JsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/seo";
import { absoluteUrl } from "@/lib/seo-meta";
import type { Product } from "@/types/commerce";

type Params = Promise<{ slug: string }>;

export const dynamicParams = true;

function demoAsContent(slug: string): ContentArticle | null {
  const d = DEMO_NEWS.find((a) => a.slug === slug);
  if (!d) return null;
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    body: d.body ?? d.excerpt,
    contentType: d.category === "reviews" ? "review" : d.category === "guides" ? "guide" : "news",
    category: d.category,
    image: d.image,
    imageAlt: d.title,
    tags: [],
    relatedGame: "",
    relatedGameSlug: "",
    productHandles: d.productHandles ?? [],
    relatedArticleSlugs: [],
    seoTitle: "",
    metaDescription: "",
    focusKeyword: "",
    faq: [],
    published: true,
    featured: Boolean(d.featured),
    publishedAt: d.publishedAt,
    updatedAt: d.publishedAt,
  };
}

async function resolveArticle(slug: string): Promise<ContentArticle | null> {
  const admin = await getArticleBySlug(slug);
  if (admin && admin.published !== false) return admin;
  return demoAsContent(slug);
}

export async function generateStaticParams() {
  const admin = await listArticles({ publishedOnly: true });
  const slugs = new Set([...admin.map((a) => a.slug), ...DEMO_NEWS.map((a) => a.slug)]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await resolveArticle(slug);
  if (!article) return { title: "News", robots: { index: false } };

  const title = article.seoTitle || article.title;
  const description = article.metaDescription || article.excerpt;
  const canonical = `/news/${article.slug}`;

  return {
    title,
    description,
    keywords: [article.focusKeyword, ...article.tags].filter(Boolean),
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(canonical),
      siteName: SITE.name,
      locale: "en_PK",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [{ url: article.image, alt: article.imageAlt || article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [article.image],
    },
  };
}

export default async function NewsArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await resolveArticle(slug);
  if (!article) redirectMissingArticle();

  const typeLabel =
    CONTENT_TYPES.find((t) => t.value === article.contentType)?.label ?? "Article";

  const linkedProducts: Product[] = [];
  for (const handle of article.productHandles ?? []) {
    const product = await commerce.getProductByHandle(handle);
    if (product) linkedProducts.push(product);
  }

  const related = await getRelatedArticles(article, 4);
  const faqData = faqJsonLd(article.faq);
  const pageUrl = absoluteUrl(`/news/${article.slug}`);

  return (
    <div className="container-px mx-auto max-w-3xl min-w-0 py-6 sm:py-8">
      <JsonLd
        data={articleJsonLd({
          title: article.seoTitle || article.title,
          description: article.metaDescription || article.excerpt,
          image: article.image.startsWith("http")
            ? article.image
            : absoluteUrl(article.image),
          url: pageUrl,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          keywords: [article.focusKeyword, ...article.tags].filter(Boolean),
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: absoluteUrl("/") },
          { name: "News", url: absoluteUrl("/news") },
          { name: article.title, url: pageUrl },
        ])}
      />
      {faqData ? <JsonLd data={faqData} /> : null}

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: article.title },
        ]}
        className="mb-6"
      />

      <p className="text-xs font-semibold uppercase tracking-wider text-accent">{typeLabel}</p>
      <h1 className="mt-2 break-words font-display text-3xl font-bold leading-tight md:text-4xl">
        {article.title}
      </h1>
      <p className="mt-3 text-sm text-muted">
        {format(new Date(article.publishedAt), "MMMM d, yyyy")} ·{" "}
        {article.tags.includes("ToyCompany Editorial")
          ? "ToyCompany Editorial"
          : SITE.name}
        {article.relatedGame ? (
          <>
            {" · "}
            <Link
              href={`/games/${article.relatedGameSlug}`}
              className="text-accent hover:underline"
            >
              {article.relatedGame}
            </Link>
          </>
        ) : null}
      </p>

      {article.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-border px-2 py-0.5 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-border">
        <Image
          src={article.image}
          alt={article.imageAlt || article.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>

      <div className="mt-8">
        <MarkdownContent source={article.body?.trim() || article.excerpt} />
      </div>

      {article.faq.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">FAQ</h2>
          <div className="mt-4 space-y-3">
            {article.faq.map((item, i) => (
              <details
                key={i}
                className="rounded-2xl border border-border bg-surface px-4 py-3"
              >
                <summary className="cursor-pointer font-medium">{item.question}</summary>
                <p className="mt-2 text-sm text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {linkedProducts.length > 0 ? (
        <section className="mt-12 rounded-2xl border border-accent/30 bg-accent-dim/40 p-5 sm:p-6">
          <h2 className="font-display text-2xl font-bold">Buy related Toys</h2>
          <p className="mt-1 text-sm text-muted">
            Shop toys linked to this article — Cash on Delivery, JazzCash, Easypaisa &amp;
            bank transfer across Pakistan from{" "}
            <span className="font-semibold text-text">{SITE.name}</span>.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {linkedProducts.map((product) => {
              const { price, compareAtPrice } = getProductPrice(product);
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.handle}`}
                  className="flex gap-3 overflow-hidden rounded-2xl border border-border bg-surface p-3 transition hover:border-accent/40"
                >
                  <span className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-xl bg-bg">
                    <Image
                      src={product.images[0]?.url ?? "/logo.png"}
                      alt={product.title}
                      fill
                      className="object-cover object-top"
                      sizes="80px"
                    />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="line-clamp-2 font-medium leading-snug">{product.title}</span>
                    <span className="mt-auto flex items-baseline gap-2 pt-2">
                      <span className="font-display font-bold text-accent">
                        {formatMoney(price)}
                      </span>
                      {compareAtPrice ? (
                        <span className="text-xs text-subtle line-through">
                          {formatMoney(compareAtPrice)}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-2">
                      <Button size="sm" className="w-full sm:w-auto" tabIndex={-1}>
                        View Toy
                      </Button>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-display text-xl font-bold">Related articles &amp; news</h2>
          <ul className="mt-4 space-y-3">
            {related.map((a) => (
              <li key={a.id}>
                <Link href={`/news/${a.slug}`} className="text-accent hover:underline">
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
