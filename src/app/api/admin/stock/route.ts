import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import {
  addCustomCd,
  buildAdminAwareCatalog,
  isGameDisc,
  readInventory,
  removeCd,
  setStockQuantity,
  updateCdRow,
} from "@/lib/admin/stock-db";
import { getBaseCatalog } from "@/lib/commerce/demo-provider";
import { getProductPrice } from "@/lib/utils";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inv = await readInventory();
  const products = buildAdminAwareCatalog(getBaseCatalog(), inv)
    .filter(isGameDisc)
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

  const used = products.filter((p) => p.condition === "pre-owned");

  return NextResponse.json({
    products,
    totals: {
      skus: products.length,
      units: products.reduce((s, p) => s + p.quantity, 0),
      lowStock: products.filter((p) => p.status === "low").length,
      outOfStock: products.filter((p) => p.status === "out_of_stock").length,
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
