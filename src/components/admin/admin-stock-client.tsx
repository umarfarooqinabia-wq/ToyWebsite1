"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { toast } from "@/store/toast";
import type { ProductCondition } from "@/types/commerce";

type StockRow = {
  id: string;
  handle: string;
  title: string;
  brand: string;
  platform: string[];
  image: string;
  sku: string;
  price: { amount: number; currencyCode: string };
  quantity: number;
  status: "ok" | "low" | "out_of_stock";
  condition: ProductCondition;
  buyingPrice: number;
  sellingPrice: number;
  notes: string;
  margin: number;
  isCustom: boolean;
};

type Totals = {
  skus: number;
  units: number;
  lowStock: number;
  outOfStock: number;
  usedSkus: number;
  usedCapital: number;
};

type Draft = {
  quantity: string;
  buyingPrice: string;
  sellingPrice: string;
  notes: string;
  condition: ProductCondition;
};

type FilterKey = "all" | "used" | "new" | "low" | "out_of_stock";

const emptyAdd = {
  title: "",
  brand: "",
  platform: "PlayStation 5",
  condition: "pre-owned" as ProductCondition,
  quantity: "1",
  buyingPrice: "",
  sellingPrice: "",
  notes: "",
  youtubeUrl: "",
};

function parseYoutubeId(input: string): string | undefined {
  const v = input.trim();
  if (!v) return undefined;
  if (/^[\w-]{11}$/.test(v)) return v;
  try {
    const url = new URL(v);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "") || undefined;
    }
    const id = url.searchParams.get("v");
    if (id) return id;
  } catch {
    /* not a URL */
  }
  return undefined;
}

export function AdminStockClient() {
  const [products, setProducts] = useState<StockRow[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyAdd);
  const [adding, setAdding] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<
    { file: File; preview: string }[]
  >([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stock");
      const data = (await res.json()) as {
        products: StockRow[];
        totals: Totals;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load stock");
      setProducts(data.products);
      setTotals(data.totals);
      const next: Record<string, Draft> = {};
      data.products.forEach((p) => {
        next[p.id] = {
          quantity: String(p.quantity),
          buyingPrice: String(p.buyingPrice || ""),
          sellingPrice: String(p.sellingPrice || p.price.amount),
          notes: p.notes || "",
          condition: p.condition,
        };
      });
      setDrafts(next);
    } catch (err) {
      toast({
        tone: "error",
        title: "Stock load failed",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === "low" && p.status !== "low") return false;
      if (filter === "out_of_stock" && p.status !== "out_of_stock") return false;
      if (filter === "used" && p.condition !== "pre-owned") return false;
      if (filter === "new" && p.condition === "pre-owned") return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.notes.toLowerCase().includes(q)
      );
    });
  }, [products, query, filter]);

  const patchDraft = (id: string, patch: Partial<Draft>) => {
    setDrafts((d) => ({
      ...d,
      [id]: { ...(d[id] ?? { quantity: "0", buyingPrice: "", sellingPrice: "", notes: "", condition: "new" }), ...patch },
    }));
  };

  const save = async (productId: string) => {
    const draft = drafts[productId];
    if (!draft) return;
    const quantity = Number(draft.quantity);
    const buyingPrice = Number(draft.buyingPrice || 0);
    const sellingPrice = Number(draft.sellingPrice || 0);
    if (!Number.isFinite(quantity) || quantity < 0) {
      toast({ tone: "error", title: "Enter a valid quantity" });
      return;
    }
    if (!Number.isFinite(buyingPrice) || buyingPrice < 0) {
      toast({ tone: "error", title: "Enter a valid buying price" });
      return;
    }
    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
      toast({ tone: "error", title: "Enter a valid selling price" });
      return;
    }
    setSavingId(productId);
    try {
      const res = await fetch("/api/admin/stock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          buyingPrice,
          sellingPrice,
          notes: draft.notes,
          condition: draft.condition,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      toast({ tone: "success", title: "Toy updated" });
      await load();
    } catch (err) {
      toast({
        tone: "error",
        title: "Could not update toy",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (productId: string, title: string) => {
    if (!window.confirm(`Remove "${title}" from catalog stock?`)) return;
    setRemovingId(productId);
    try {
      const res = await fetch("/api/admin/stock", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Remove failed");
      toast({ tone: "success", title: "Toy removed" });
      await load();
    } catch (err) {
      toast({
        tone: "error",
        title: "Could not remove toy",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const resetAddForm = () => {
    imagePreviews.forEach((p) => URL.revokeObjectURL(p.preview));
    setImagePreviews([]);
    setVideoFile(null);
    setAddForm(emptyAdd);
    setShowAdd(false);
  };

  const onPickImages = (files: FileList | null) => {
    if (!files?.length) return;
    const next = Array.from(files).slice(0, 8).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImagePreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.preview));
      return next;
    });
  };

  const uploadFiles = async (kind: "image" | "video", files: File[]) => {
    const body = new FormData();
    body.set("kind", kind);
    files.forEach((f) => body.append("files", f));
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = (await res.json()) as {
      files?: { url: string; kind: string; name: string }[];
      error?: string;
    };
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.files ?? [];
  };

  const addCd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setUploadingMedia(true);
    try {
      let imageUrls: string[] = [];
      let videoUrl: string | undefined;

      if (imagePreviews.length) {
        const uploaded = await uploadFiles(
          "image",
          imagePreviews.map((p) => p.file),
        );
        imageUrls = uploaded.map((f) => f.url);
      }
      if (videoFile) {
        const uploaded = await uploadFiles("video", [videoFile]);
        videoUrl = uploaded[0]?.url;
      }

      const youtubeId = parseYoutubeId(addForm.youtubeUrl);

      const res = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: addForm.title,
          brand: addForm.brand || "Unknown",
          platform: addForm.platform,
          condition: addForm.condition,
          quantity: Number(addForm.quantity) || 0,
          buyingPrice: Number(addForm.buyingPrice) || 0,
          sellingPrice: Number(addForm.sellingPrice) || 0,
          notes: addForm.notes,
          imageUrls,
          videoUrl,
          youtubeId,
          videoTitle: addForm.title ? `${addForm.title} — media` : undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Add failed");
      toast({ tone: "success", title: "Toy added" });
      resetAddForm();
      await load();
    } catch (err) {
      toast({
        tone: "error",
        title: "Could not add toy",
        description: err instanceof Error ? err.message : "Try again",
      });
    } finally {
      setUploadingMedia(false);
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Toy stock</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Add or remove toys, update stock, and keep buying/selling notes so sales
            staff remember cost and margin.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Add toy
        </Button>
      </div>

      {totals ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Toy SKUs", value: String(totals.skus) },
            { label: "Units on hand", value: String(totals.units) },
            { label: "Low stock", value: String(totals.lowStock) },
            { label: "Out of stock", value: String(totals.outOfStock) },
            { label: "Used toys", value: String(totals.usedSkus) },
            {
              label: "Used capital",
              value: formatMoney({ amount: totals.usedCapital, currencyCode: "PKR" }),
            },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-1 font-display text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <Input
            className="pl-9"
            placeholder="Search title, brand, SKU, notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["used", "Used"],
              ["new", "New"],
              ["low", "Low"],
              ["out_of_stock", "Out"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-xl px-3 py-2 text-sm ${
                filter === key
                  ? "bg-accent text-[#04110e] font-semibold"
                  : "border border-border text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="border-b border-border bg-bg/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-3 font-medium">Toy</th>
                <th className="px-3 py-3 font-medium">Cond.</th>
                <th className="px-3 py-3 font-medium">Qty</th>
                <th className="px-3 py-3 font-medium">Buy (PKR)</th>
                <th className="px-3 py-3 font-medium">Sell (PKR)</th>
                <th className="px-3 py-3 font-medium">Margin</th>
                <th className="px-3 py-3 font-medium">Notes</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted">
                    Loading stock…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted">
                    No discs match your filters. Add a used toy to get started.
                  </td>
                </tr>
              ) : (
                rows.map((p) => {
                  const draft = drafts[p.id];
                  const buy = Number(draft?.buyingPrice || 0);
                  const sell = Number(draft?.sellingPrice || 0);
                  const margin = sell - buy;
                  return (
                    <tr key={p.id} className="border-b border-border/70 align-top last:border-0">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-bg">
                            {p.image ? (
                              <Image
                                src={p.image}
                                alt={p.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 max-w-[14rem]">
                            <p className="line-clamp-2 font-medium">{p.title}</p>
                            <p className="text-xs text-muted">
                              {p.brand}
                              {p.isCustom ? " · staff" : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Select
                          className="h-9 w-[7.5rem]"
                          value={draft?.condition ?? p.condition}
                          onChange={(e) =>
                            patchDraft(p.id, {
                              condition: e.target.value as ProductCondition,
                            })
                          }
                        >
                          <option value="new">New</option>
                          <option value="pre-owned">Used</option>
                          <option value="refurbished">Refurb</option>
                        </Select>
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          className="h-9 w-20"
                          type="number"
                          min={0}
                          value={draft?.quantity ?? "0"}
                          onChange={(e) => patchDraft(p.id, { quantity: e.target.value })}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          className="h-9 w-24"
                          type="number"
                          min={0}
                          placeholder="Buy"
                          value={draft?.buyingPrice ?? ""}
                          onChange={(e) => patchDraft(p.id, { buyingPrice: e.target.value })}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          className="h-9 w-24"
                          type="number"
                          min={0}
                          placeholder="Sell"
                          value={draft?.sellingPrice ?? ""}
                          onChange={(e) => patchDraft(p.id, { sellingPrice: e.target.value })}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`font-display text-sm font-semibold ${
                            margin >= 0 ? "text-accent" : "text-danger"
                          }`}
                        >
                          {formatMoney({ amount: margin, currencyCode: "PKR" })}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Textarea
                          className="min-h-[2.5rem] w-44 resize-y text-xs"
                          rows={2}
                          placeholder="Used notes: seller, scratches…"
                          value={draft?.notes ?? ""}
                          onChange={(e) => patchDraft(p.id, { notes: e.target.value })}
                        />
                      </td>
                      <td className="px-3 py-3">
                        {p.status === "ok" ? (
                          <Badge variant="success">In stock</Badge>
                        ) : p.status === "low" ? (
                          <Badge variant="warning">Low</Badge>
                        ) : (
                          <Badge variant="secondary">Out</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            loading={savingId === p.id}
                            onClick={() => void save(p.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={removingId === p.id}
                            onClick={() => void remove(p.id, p.title)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <form
            onSubmit={addCd}
            className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl border border-border bg-bg-elevated p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold">Add toy</h2>
                <p className="text-sm text-muted">
                  New or used disc — set buy/sell so margin shows in the grid.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                className="rounded-xl border border-border p-2"
                onClick={resetAddForm}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="cd-title">Title</Label>
                <Input
                  id="cd-title"
                  required
                  value={addForm.title}
                  onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Remote Control Car — Blue"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cd-brand">Brand</Label>
                  <Input
                    id="cd-brand"
                    value={addForm.brand}
                    onChange={(e) => setAddForm((f) => ({ ...f, brand: e.target.value }))}
                    placeholder="EA / Sony / 2K"
                  />
                </div>
                <div>
                  <Label htmlFor="cd-platform">Platform</Label>
                  <Select
                    id="cd-platform"
                    value={addForm.platform}
                    onChange={(e) => setAddForm((f) => ({ ...f, platform: e.target.value }))}
                  >
                    <option>PlayStation 5</option>
                    <option>PlayStation 4</option>
                    <option>Xbox Series X|S</option>
                    <option>Nintendo Switch</option>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="cd-condition">Condition</Label>
                  <Select
                    id="cd-condition"
                    value={addForm.condition}
                    onChange={(e) =>
                      setAddForm((f) => ({
                        ...f,
                        condition: e.target.value as ProductCondition,
                      }))
                    }
                  >
                    <option value="pre-owned">Used</option>
                    <option value="new">New</option>
                    <option value="refurbished">Refurbished</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cd-qty">Qty</Label>
                  <Input
                    id="cd-qty"
                    type="number"
                    min={0}
                    required
                    value={addForm.quantity}
                    onChange={(e) => setAddForm((f) => ({ ...f, quantity: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cd-buy">Buying price</Label>
                  <Input
                    id="cd-buy"
                    type="number"
                    min={0}
                    required
                    value={addForm.buyingPrice}
                    onChange={(e) => setAddForm((f) => ({ ...f, buyingPrice: e.target.value }))}
                    placeholder="What you paid"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cd-sell">Selling price</Label>
                <Input
                  id="cd-sell"
                  type="number"
                  min={0}
                  required
                  value={addForm.sellingPrice}
                  onChange={(e) => setAddForm((f) => ({ ...f, sellingPrice: e.target.value }))}
                  placeholder="Store price"
                />
              </div>

              <div className="rounded-2xl border border-border bg-bg/50 p-3 space-y-3">
                <div>
                  <Label htmlFor="cd-images">Images (upload)</Label>
                  <Input
                    id="cd-images"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={(e) => onPickImages(e.target.files)}
                  />
                  <p className="mt-1 text-xs text-muted">
                    Prefer your own disc / box photos. First image is cropped to a
                    consistent 600×900 cover; extras are compressed. Max 8MB each.
                  </p>
                  {imagePreviews.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {imagePreviews.map((p) => (
                        <span
                          key={p.preview}
                          className="relative h-16 w-16 overflow-hidden rounded-lg border border-border"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.preview}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="cd-video">Video (upload)</Label>
                  <Input
                    id="cd-video"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="mt-1 text-xs text-muted">
                    Optional MP4/WebM of gameplay or disc condition. Max 80MB.
                  </p>
                  {videoFile ? (
                    <p className="mt-1 text-xs text-accent">{videoFile.name}</p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="cd-youtube">Or YouTube link / ID</Label>
                  <Input
                    id="cd-youtube"
                    value={addForm.youtubeUrl}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, youtubeUrl: e.target.value }))
                    }
                    placeholder="https://youtube.com/watch?v=… or video id"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cd-notes">Notes (used toy memory)</Label>
                <Textarea
                  id="cd-notes"
                  rows={3}
                  value={addForm.notes}
                  onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Bought from Ali for 6k, light scratches, box included…"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button type="submit" className="flex-1" loading={adding || uploadingMedia}>
                {uploadingMedia ? "Uploading…" : "Add to stock"}
              </Button>
              <Button type="button" variant="outline" onClick={resetAddForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
