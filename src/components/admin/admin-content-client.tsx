"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Newspaper,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  buildSeoChecklist,
  CONTENT_TYPES,
  type ContentArticle,
  type ContentFaq,
  type ContentType,
} from "@/lib/admin/content-types";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/store/toast";
import { slugify } from "@/lib/utils";

type ProductOption = { handle: string; title: string; image: string };

const EMPTY_FORM = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  contentType: "article" as ContentType,
  image: "",
  imageAlt: "",
  tagsText: "",
  relatedGame: "",
  productHandles: [] as string[],
  relatedArticleSlugs: [] as string[],
  seoTitle: "",
  metaDescription: "",
  focusKeyword: "",
  faq: [] as ContentFaq[],
  published: false,
  featured: false,
};

function insertAtCursor(
  value: string,
  start: number,
  end: number,
  before: string,
  after = "",
) {
  const selected = value.slice(start, end) || "text";
  return {
    next: value.slice(0, start) + before + selected + after + value.slice(end),
  };
}

export function AdminContentClient() {
  const [articles, setArticles] = useState<ContentArticle[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [productQuery, setProductQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [ai, setAi] = useState({
    mainKeyword: "",
    gameName: "",
    platform: "PS5",
    contentType: "article" as ContentType,
    topics: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [articlesRes, stockRes] = await Promise.all([
        fetch("/api/admin/articles"),
        fetch("/api/admin/stock"),
      ]);
      const articlesData = (await articlesRes.json()) as {
        articles?: ContentArticle[];
        error?: string;
      };
      const stockData = (await stockRes.json()) as {
        products?: { handle: string; title: string; image?: string }[];
      };
      if (!articlesRes.ok) throw new Error(articlesData.error ?? "Failed to load");
      setArticles(articlesData.articles ?? []);
      setProducts(
        (stockData.products ?? []).map((p) => ({
          handle: p.handle,
          title: p.title,
          image: p.image || "/logo.png",
        })),
      );
    } catch (err) {
      toast({
        tone: "error",
        title: "Could not load CMS",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const checklist = useMemo(() => buildSeoChecklist({
    ...form,
    tags: form.tagsText.split(",").map((t) => t.trim()).filter(Boolean),
  }), [form]);

  const filteredArticles = useMemo(() => {
    if (filterType === "all") return articles;
    if (filterType === "draft") return articles.filter((a) => !a.published);
    if (filterType === "live") return articles.filter((a) => a.published);
    return articles.filter((a) => a.contentType === filterType);
  }, [articles, filterType]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 50);
    return products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [products, productQuery]);

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(true);
  };

  const startEdit = (article: ContentArticle) => {
    setForm({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      body: article.body ?? "",
      contentType: article.contentType,
      image: article.image,
      imageAlt: article.imageAlt ?? "",
      tagsText: (article.tags ?? []).join(", "),
      relatedGame: article.relatedGame ?? "",
      productHandles: article.productHandles ?? [],
      relatedArticleSlugs: article.relatedArticleSlugs ?? [],
      seoTitle: article.seoTitle ?? "",
      metaDescription: article.metaDescription ?? "",
      focusKeyword: article.focusKeyword ?? "",
      faq: article.faq ?? [],
      published: article.published !== false,
      featured: Boolean(article.featured),
    });
    setEditing(true);
  };

  const wrapBody = (before: string, after = "") => {
    const el = document.getElementById("cms-body") as HTMLTextAreaElement | null;
    if (!el) {
      setForm((f) => ({ ...f, body: `${f.body}${before}text${after}` }));
      return;
    }
    const { next } = insertAtCursor(
      form.body,
      el.selectionStart,
      el.selectionEnd,
      before,
      after,
    );
    setForm((f) => ({ ...f, body: next }));
  };

  const toggleProduct = (handle: string) => {
    setForm((f) => ({
      ...f,
      productHandles: f.productHandles.includes(handle)
        ? f.productHandles.filter((h) => h !== handle)
        : [...f.productHandles, handle].slice(0, 20),
    }));
  };

  const toggleRelatedArticle = (slug: string) => {
    setForm((f) => ({
      ...f,
      relatedArticleSlugs: f.relatedArticleSlugs.includes(slug)
        ? f.relatedArticleSlugs.filter((s) => s !== slug)
        : [...f.relatedArticleSlugs, slug].slice(0, 20),
    }));
  };

  const runAi = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/articles/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ai),
      });
      const data = (await res.json()) as {
        result?: {
          title: string;
          seoTitle: string;
          fullArticle: string;
          metaDescription: string;
          urlSlug: string;
          imageAlt: string;
          excerpt: string;
          faq: ContentFaq[];
          focusKeyword: string;
          tags: string[];
          outline: string[];
          internalLinkSuggestions: string[];
        };
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.result) throw new Error(data.error ?? "AI failed");
      const r = data.result;
      setForm((f) => ({
        ...f,
        title: r.title,
        slug: r.urlSlug,
        excerpt: r.excerpt,
        body: r.fullArticle,
        contentType: ai.contentType,
        imageAlt: r.imageAlt,
        seoTitle: r.seoTitle,
        metaDescription: r.metaDescription,
        focusKeyword: r.focusKeyword,
        relatedGame: ai.gameName || f.relatedGame,
        tagsText: r.tags.join(", "),
        faq: r.faq,
      }));
      setEditing(true);
      toast({
        tone: "success",
        title: "Draft generated",
        description: data.message,
      });
    } catch (err) {
      toast({
        tone: "error",
        title: "AI generate failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const save = async (mode: "draft" | "publish" | "save") => {
    setSaving(true);
    const published = mode === "draft" ? false : mode === "publish" ? true : form.published;
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id || undefined,
          title: form.title,
          slug: form.slug || undefined,
          excerpt: form.excerpt,
          body: form.body,
          contentType: form.contentType,
          image: form.image,
          imageAlt: form.imageAlt,
          tags: form.tagsText.split(",").map((t) => t.trim()).filter(Boolean),
          relatedGame: form.relatedGame,
          productHandles: form.productHandles,
          relatedArticleSlugs: form.relatedArticleSlugs,
          seoTitle: form.seoTitle,
          metaDescription: form.metaDescription,
          focusKeyword: form.focusKeyword,
          faq: form.faq,
          published,
          featured: form.featured,
        }),
      });
      const data = (await res.json()) as { article?: ContentArticle; error?: string };
      if (!res.ok || !data.article) throw new Error(data.error ?? "Save failed");
      toast({
        tone: "success",
        title:
          mode === "draft"
            ? "Saved as draft"
            : data.article.published
              ? "Published"
              : "Saved",
      });
      setEditing(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      toast({
        tone: "error",
        title: "Could not save",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete “${title}”?`)) return;
    const res = await fetch("/api/admin/articles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast({ tone: "error", title: "Delete failed" });
      return;
    }
    toast({ tone: "success", title: "Deleted" });
    await load();
  };

  const seedSeoPack = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed-seo" }),
      });
      const data = (await res.json()) as {
        added?: number;
        total?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Seed failed");
      toast({
        tone: "success",
        title: "SEO articles ready",
        description: `Added ${data.added ?? 0} articles (${data.total ?? 0} total in CMS storage).`,
      });
      await load();
    } catch (err) {
      toast({
        tone: "error",
        title: "Could not seed SEO pack",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">CMS &amp; SEO Content</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Create news, guides, reviews, and SEO pages. Link toys &amp; products, then
            publish with a live SEO checklist. 50 catalog SEO articles are available on the
            storefront; use “Seed SEO pack” to copy missing ones into editable CMS storage.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void seedSeoPack()} disabled={saving}>
            <Sparkles className="h-4 w-4" /> Seed SEO pack
          </Button>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4" /> New content
          </Button>
        </div>
      </div>

      {/* AI Assistant */}
      <section className="rounded-3xl border border-accent/25 bg-accent-dim/30 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="font-display text-lg font-bold">AI SEO Content Assistant</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Main keyword</Label>
            <Input
              value={ai.mainKeyword}
              onChange={(e) => setAi((a) => ({ ...a, mainKeyword: e.target.value }))}
              placeholder="best open world ps5 games"
            />
          </div>
          <div>
            <Label>Game name</Label>
            <Input
              value={ai.gameName}
              onChange={(e) => setAi((a) => ({ ...a, gameName: e.target.value }))}
              placeholder="GTA V"
            />
          </div>
          <div>
            <Label>Platform</Label>
            <Input
              value={ai.platform}
              onChange={(e) => setAi((a) => ({ ...a, platform: e.target.value }))}
              placeholder="PS5"
            />
          </div>
          <div>
            <Label>Content type</Label>
            <Select
              value={ai.contentType}
              onChange={(e) =>
                setAi((a) => ({ ...a, contentType: e.target.value as ContentType }))
              }
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Important topics (comma or new lines)</Label>
            <Textarea
              rows={2}
              value={ai.topics}
              onChange={(e) => setAi((a) => ({ ...a, topics: e.target.value }))}
              placeholder="disc vs digital, Pakistan price, who should buy"
            />
          </div>
        </div>
        <Button className="mt-4" loading={aiLoading} onClick={() => void runAi()}>
          <Sparkles className="h-4 w-4" /> Generate draft
        </Button>
      </section>

      {editing ? (
        <form
          className="space-y-5 rounded-3xl border border-border bg-surface p-5 sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void save("save");
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-bold">
              {form.id ? "Edit content" : "Create content"}
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label>Title</Label>
                  <Input
                    required
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((f) => ({
                        ...f,
                        title,
                        slug: f.id ? f.slug : slugify(title),
                        imageAlt: f.imageAlt || title,
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label>URL slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                  <p className="mt-1 text-xs text-muted">/news/{form.slug || "slug"}</p>
                </div>
                <div>
                  <Label>Content type</Label>
                  <Select
                    value={form.contentType}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        contentType: e.target.value as ContentType,
                      }))
                    }
                  >
                    {CONTENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Short description</Label>
                  <Textarea
                    required
                    rows={2}
                    value={form.excerpt}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Featured image URL</Label>
                  <Input
                    required
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Image alt text</Label>
                  <Input
                    value={form.imageAlt}
                    onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => wrapBody("**", "**")}>
                    Bold
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => wrapBody("## ", "")}>
                    H2
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => wrapBody("- ", "")}>
                    List
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => wrapBody("[", "](/product/handle)")}
                  >
                    Link
                  </Button>
                </div>
                <Label>Rich text content (Markdown)</Label>
                <Textarea
                  id="cms-body"
                  rows={14}
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Write the full article in Markdown…"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={form.tagsText}
                    onChange={(e) => setForm((f) => ({ ...f, tagsText: e.target.value }))}
                    placeholder="GTA V, PS5, open world"
                  />
                </div>
                <div>
                  <Label>Related game</Label>
                  <Input
                    value={form.relatedGame}
                    onChange={(e) => setForm((f) => ({ ...f, relatedGame: e.target.value }))}
                    placeholder="GTA V"
                  />
                  {form.relatedGame ? (
                    <p className="mt-1 text-xs text-muted">
                      Hub: /games/{slugify(form.relatedGame)}
                    </p>
                  ) : null}
                </div>
                <div>
                  <Label>SEO title</Label>
                  <Input
                    value={form.seoTitle}
                    onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                    maxLength={70}
                  />
                </div>
                <div>
                  <Label>Focus keyword</Label>
                  <Input
                    value={form.focusKeyword}
                    onChange={(e) => setForm((f) => ({ ...f, focusKeyword: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Meta description</Label>
                  <Textarea
                    rows={2}
                    value={form.metaDescription}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, metaDescription: e.target.value }))
                    }
                    maxLength={180}
                  />
                </div>
              </div>

              {/* Products */}
              <div className="rounded-2xl border border-border bg-bg/40 p-4">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="font-medium">Related products / toys</p>
                    <p className="text-xs text-muted">Shown as shop cards with sell-page links.</p>
                  </div>
                  <Input
                    className="max-w-xs"
                    placeholder="Search stock…"
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                  />
                </div>
                {form.productHandles.length > 0 ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {form.productHandles.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleProduct(h)}
                        className="rounded-lg border border-accent/40 bg-accent-dim px-2 py-1 text-xs text-accent"
                      >
                        {products.find((p) => p.handle === h)?.title ?? h} ×
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.handle}
                      type="button"
                      onClick={() => toggleProduct(p.handle)}
                      className={`flex items-center gap-2 rounded-xl border px-2 py-2 text-left text-sm ${
                        form.productHandles.includes(p.handle)
                          ? "border-accent bg-accent-dim"
                          : "border-border"
                      }`}
                    >
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
                        <Image src={p.image} alt="" fill className="object-cover" sizes="36px" />
                      </span>
                      <span className="line-clamp-2">{p.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Related articles */}
              <div className="rounded-2xl border border-border bg-bg/40 p-4">
                <p className="mb-2 font-medium">Related articles</p>
                <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                  {articles
                    .filter((a) => a.id !== form.id)
                    .slice(0, 30)
                    .map((a) => (
                      <label key={a.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.relatedArticleSlugs.includes(a.slug)}
                          onChange={() => toggleRelatedArticle(a.slug)}
                          className="accent-[var(--accent)]"
                        />
                        <span className="truncate">{a.title}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="rounded-2xl border border-border bg-bg/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium">FAQ section</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        faq: [...f.faq, { question: "", answer: "" }],
                      }))
                    }
                  >
                    Add FAQ
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.faq.map((item, i) => (
                    <div key={i} className="grid gap-2 rounded-xl border border-border p-3">
                      <Input
                        placeholder="Question"
                        value={item.question}
                        onChange={(e) =>
                          setForm((f) => {
                            const faq = [...f.faq];
                            faq[i] = { ...faq[i]!, question: e.target.value };
                            return { ...f, faq };
                          })
                        }
                      />
                      <Textarea
                        rows={2}
                        placeholder="Answer"
                        value={item.answer}
                        onChange={(e) =>
                          setForm((f) => {
                            const faq = [...f.faq];
                            faq[i] = { ...faq[i]!, answer: e.target.value };
                            return { ...f, faq };
                          })
                        }
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            faq: f.faq.filter((_, idx) => idx !== i),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, published: e.target.checked }))
                    }
                    className="accent-[var(--accent)]"
                  />
                  Published
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, featured: e.target.checked }))
                    }
                    className="accent-[var(--accent)]"
                  />
                  Featured on homepage
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  loading={saving}
                  onClick={() => void save("draft")}
                >
                  Save draft
                </Button>
                <Button type="button" loading={saving} onClick={() => void save("publish")}>
                  Publish
                </Button>
              </div>
            </div>

            {/* SEO checklist sidebar */}
            <aside className="h-fit rounded-2xl border border-border bg-bg p-4 lg:sticky lg:top-28">
              <p className="mb-3 text-sm font-semibold">SEO checklist</p>
              <ul className="space-y-2">
                {checklist.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm">
                    {item.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-subtle" />
                    )}
                    <span className={item.ok ? "text-muted" : "text-warning"}>
                      {item.ok ? item.label : `Missing ${item.label}`}
                    </span>
                  </li>
                ))}
              </ul>
              {form.image ? (
                <div className="relative mt-4 aspect-video overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}
            </aside>
          </div>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All" },
          { id: "live", label: "Published" },
          { id: "draft", label: "Drafts" },
          ...CONTENT_TYPES.map((t) => ({ id: t.value, label: t.label })),
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterType(f.id)}
            className={`rounded-xl px-3 py-1.5 text-sm ${
              filterType === f.id
                ? "bg-accent font-semibold text-[#04110e]"
                : "border border-border text-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {loading ? (
          <p className="p-8 text-center text-muted">Loading CMS…</p>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <Newspaper className="h-10 w-10 text-subtle" />
            <p className="font-medium">No content in this filter</p>
            <Button onClick={startCreate}>
              <Plus className="h-4 w-4" /> Create content
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filteredArticles.map((article) => {
              const score = buildSeoChecklist(article).filter((c) => c.ok).length;
              const total = buildSeoChecklist(article).length;
              return (
                <li
                  key={article.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl bg-bg sm:h-16 sm:w-28">
                    <Image src={article.image} alt="" fill className="object-cover" sizes="112px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{article.title}</p>
                      <Badge variant={article.published ? "success" : "secondary"}>
                        {article.published ? "Live" : "Draft"}
                      </Badge>
                      <Badge>
                        {CONTENT_TYPES.find((t) => t.value === article.contentType)?.label ??
                          article.contentType}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-subtle">
                      /news/{article.slug} · SEO {score}/{total}
                      {article.relatedGame ? ` · Game: ${article.relatedGame}` : ""}
                      {article.productHandles.length
                        ? ` · ${article.productHandles.length} products`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/news/${article.slug}`} target="_blank">
                      <Button type="button" size="sm" variant="outline">
                        <ExternalLink className="h-3.5 w-3.5" /> View
                      </Button>
                    </Link>
                    <Button type="button" size="sm" variant="outline" onClick={() => startEdit(article)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => void remove(article.id, article.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
