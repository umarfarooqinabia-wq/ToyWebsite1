import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import {
  addCustomCd,
  buildAdminAwareCatalog,
  readInventory,
  removeCd,
  setStockQuantity,
  updateCdRow,
} from "@/lib/admin/stock-db";
import { getStorefrontBaseCatalog } from "@/lib/commerce/storefront-catalog";
import { getProductPrice } from "@/lib/utils";

const PAGE_SIZE_DEFAULT = 100;
const PAGE_SIZE_MAX = 100;

type StockFilter = "all" | "used" | "new" | "low" | "out_of_stock";

function matchesFilter(
  row: {
    status: "ok" | "low" | "out_of_stock";
    condition: string;
    title: string;
    brand: string;
    sku: string;
    handle: string;
    notes: string;
  },
  filter: StockFilter,
  q: string,
) {
  if (filter === "low" && row.status !== "low") return false;
  if (filter === "out_of_stock" && row.status !== "out_of_stock") return false;
  if (filter === "used" && row.condition !== "pre-owned") return false;
  if (filter === "new" && row.condition === "pre-owned") return false;
  if (!q) return true;
  const hay = `${row.title} ${row.brand} ${row.sku} ${row.handle} ${row.notes}`.toLowerCase();
  // Every word must match somewhere (e.g. "lamborghini diecast")
  return q.split(/\s+/).filter(Boolean).every((token) => hay.includes(token));
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1") || 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, Number(url.searchParams.get("pageSize") || PAGE_SIZE_DEFAULT) || PAGE_SIZE_DEFAULT),
  );
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const filter = (url.searchParams.get("filter") || "all") as StockFilter;

  const inv = await readInventory();
  // Same Shopify toy catalog as the public storefront (not the old demo game discs).
  const base = await getStorefrontBaseCatalog(40);
  const allProducts = buildAdminAwareCatalog(base, inv)
    .map((p) => {
      const { price } = getProductPrice(p);
      const qty = p.variants[0]?.quantityAvailable ?? 0;
      const meta = inv.meta[p.id];
      const buyingPrice = meta?.buyingPrice ?? 0;
      const sellingPrice = meta?.sellingPrice || price.amount;
      const margin = sellingPrice - buyingPrice;
      return {
        id: p.id,
        handle: p.handle,
        title: p.title,
        brand: p.brand,
        platform: p.platform,
        image: p.images[0]?.url ?? "",
        sku: p.variants[0]?.sku ?? "",
        price,
        quantity: qty,
        status: (qty === 0 ? "out_of_stock" : qty < 10 ? "low" : "ok") as
          | "ok"
          | "low"
          | "out_of_stock",
        condition: meta?.condition ?? p.condition,
        buyingPrice,
        sellingPrice,
        notes: meta?.notes ?? "",
        margin,
        isCustom: p.id.startsWith("admin-cd-") || inv.custom.some((c) => c.id === p.id),
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const used = allProducts.filter((p) => p.condition === "pre-owned");
  const filtered = allProducts.filter((p) => matchesFilter(p, filter, q));
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const products = filtered.slice(start, start + pageSize);

  return NextResponse.json({
    products,
    page: safePage,
    pageSize,
    totalPages,
    totalFiltered,
    totals: {
      skus: allProducts.length,
      units: allProducts.reduce((s, p) => s + p.quantity, 0),
      lowStock: allProducts.filter((p) => p.status === "low").length,
      outOfStock: allProducts.filter((p) => p.status === "out_of_stock").length,
      usedSkus: used.length,
      usedCapital: used.reduce((s, p) => s + p.buyingPrice * p.quantity, 0),
    },
  });
}

const patchSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(0).optional(),
  buyingPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  notes: z.string().optional(),
  condition: z.enum(["new", "pre-owned", "refurbished"]).optional(),
});

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { productId, quantity, buyingPrice, sellingPrice, notes, condition } =
    parsed.data;

  // Quantity-only shortcut (legacy)
  if (
    quantity != null &&
    buyingPrice == null &&
    sellingPrice == null &&
    notes == null &&
    condition == null
  ) {
    const qty = await setStockQuantity(productId, quantity);
    return NextResponse.json({ productId, quantity: qty });
  }

  const updated = await updateCdRow({
    productId,
    quantity,
    buyingPrice,
    sellingPrice,
    notes,
    condition,
  });
  if (!updated) {
    return NextResponse.json({ error: "Toy not found" }, { status: 404 });
  }
  return NextResponse.json({ productId, ...updated });
}

const createSchema = z.object({
  title: z.string().min(2),
  brand: z.string().min(1).default("Unknown"),
  platform: z.string().min(1).default("PlayStation 5"),
  condition: z.enum(["new", "pre-owned", "refurbished"]).default("pre-owned"),
  quantity: z.number().int().min(0).default(1),
  buyingPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  youtubeId: z.string().optional(),
  videoTitle: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid toy payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const product = await addCustomCd({
    ...parsed.data,
    imageUrl: parsed.data.imageUrl || undefined,
    imageUrls: parsed.data.imageUrls,
    videoUrl: parsed.data.videoUrl || undefined,
    youtubeId: parsed.data.youtubeId || undefined,
    videoTitle: parsed.data.videoTitle || undefined,
  });
  return NextResponse.json({ product }, { status: 201 });
}

const deleteSchema = z.object({
  productId: z.string().min(1),
});

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

  await removeCd(parsed.data.productId);
  return NextResponse.json({ ok: true });
}
