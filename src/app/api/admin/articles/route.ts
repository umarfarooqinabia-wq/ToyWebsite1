import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import {
  CONTENT_TYPES,
  deleteArticle,
  listArticles,
  seedSeoArticlesToStore,
  upsertArticle,
} from "@/lib/admin/articles-db";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const contentType = searchParams.get("contentType") as
    | (typeof CONTENT_TYPES)[number]["value"]
    | null;
  const articles = await listArticles({
    contentType: contentType || undefined,
  });
  return NextResponse.json({ articles, contentTypes: CONTENT_TYPES });
}

const faqSchema = z.object({
  question: z.string().min(3).max(300),
  answer: z.string().min(3).max(2000),
});

const upsertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(160),
  slug: z.string().max(160).optional(),
  excerpt: z.string().min(10).max(400),
  body: z.string().max(50000).optional(),
  contentType: z.enum([
    "news",
    "article",
    "review",
    "guide",
    "buying_guide",
    "seo_page",
  ]),
  image: z.string().min(1).max(2000),
  imageAlt: z.string().max(200).optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  relatedGame: z.string().max(80).optional(),
  productHandles: z.array(z.string().min(1)).max(20).optional(),
  relatedArticleSlugs: z.array(z.string().min(1)).max(20).optional(),
  seoTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(180).optional(),
  focusKeyword: z.string().max(80).optional(),
  faq: z.array(faqSchema).max(12).optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  publishedAt: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  if (json?.action === "seed-seo") {
    try {
      const result = await seedSeoArticlesToStore();
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Seed failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  const parsed = upsertSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid article payload" }, { status: 400 });
  }

  try {
    const article = await upsertArticle(parsed.data);
    return NextResponse.json({ article });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    const status = message === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = deleteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const ok = await deleteArticle(parsed.data.id);
  if (!ok) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
