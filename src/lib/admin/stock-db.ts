import type { Product, ProductCondition } from "@/types/commerce";
import { slugify } from "@/lib/utils";
import { mutateJson, readJson, writeJson } from "@/lib/admin/json-store";

const INVENTORY_FILE = "cd-inventory.json";
const LEGACY_STOCK_FILE = "stock.json";

export interface CdMeta {
  buyingPrice: number;
  sellingPrice: number;
  notes: string;
  condition: ProductCondition;
}

export interface CdInventoryStore {
  stock: Record<string, number>;
  hidden: string[];
  custom: Product[];
  meta: Record<string, CdMeta>;
}

const EMPTY: CdInventoryStore = {
  stock: {},
  hidden: [],
  custom: [],
  meta: {},
};

export async function readInventory(): Promise<CdInventoryStore> {
  try {
    let parsed = await readJson<Partial<CdInventoryStore>>(INVENTORY_FILE);
    if (!parsed) {
      // Migrate legacy stock.json once if present
      const legacy = await readJson<Record<string, number>>(LEGACY_STOCK_FILE);
      const stock =
        legacy && typeof legacy === "object" && !Array.isArray(legacy) ? legacy : {};
      parsed = { ...EMPTY, stock };
      await writeJson(INVENTORY_FILE, parsed);
    }

    const store: CdInventoryStore = {
      stock: parsed.stock ?? {},
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
      custom: Array.isArray(parsed.custom) ? parsed.custom : [],
      meta: parsed.meta ?? {},
    };

    // Migrate older admin CDs that were always saved as ps5-games
    let changed = false;
    store.custom = store.custom.map((p) => {
      const next = normalizeCustomCd(p);
      if (next.category !== p.category || next.tags.join() !== p.tags.join()) {
        changed = true;
      }
      return next;
    });
    if (changed) {
      try {
        await writeInventory(store);
      } catch {
        /* ignore migration write failures */
      }
    }
    return store;
  } catch {
    return { ...EMPTY };
  }
}

async function writeInventory(store: CdInventoryStore) {
  // Single source of truth: cd-inventory.json (no dual-write to stock.json).
  await mutateJson<CdInventoryStore>(INVENTORY_FILE, EMPTY, () => store);
}

/** @deprecated use readInventory().stock — kept for checkout compatibility */
export async function readStockMap(): Promise<Record<string, number>> {
  const inv = await readInventory();
  return inv.stock;
}

export async function setStockQuantity(productId: string, quantity: number) {
  let nextQty = 0;
  await mutateJson<CdInventoryStore>(INVENTORY_FILE, EMPTY, (inv) => {
    nextQty = Math.max(0, Math.floor(quantity));
    inv.stock[productId] = nextQty;
    return inv;
  });
  return nextQty;
}

export async function decrementStock(productId: string, by: number) {
  let nextQty: number | null = null;
  await mutateJson<CdInventoryStore>(INVENTORY_FILE, EMPTY, (inv) => {
    const current = inv.stock[productId];
    if (current == null) return inv;
    nextQty = Math.max(0, current - by);
    inv.stock[productId] = nextQty;
    return inv;
  });
  return nextQty;
}

export function applyStockOverrides(
  products: Product[],
  stock: Record<string, number>,
): Product[] {
  return products.map((p) => {
    if (stock[p.id] == null) return p;
    const qty = stock[p.id]!;
    return {
      ...p,
      variants: p.variants.map((v, i) =>
        i === 0
          ? {
              ...v,
              quantityAvailable: qty,
              available: qty > 0,
            }
          : v,
      ),
    };
  });
}

/** Apply admin selling price overrides onto catalog products. */
export function applyMetaPricing(
  products: Product[],
  meta: Record<string, CdMeta>,
): Product[] {
  return products.map((p) => {
    const m = meta[p.id];
    if (!m || !Number.isFinite(m.sellingPrice) || m.sellingPrice <= 0) return p;
    return {
      ...p,
      condition: m.condition ?? p.condition,
      variants: p.variants.map((v, i) =>
        i === 0
          ? {
              ...v,
              price: { amount: Math.round(m.sellingPrice), currencyCode: "PKR" },
            }
          : v,
      ),
    };
  });
}

export function isGameDisc(product: Product): boolean {
  const hay = `${product.title} ${product.category} ${product.tags.join(" ")}`.toLowerCase();
  return (
    product.category === "games" ||
    product.categoryPath.includes("games") ||
    product.category === "ps5-games" ||
    product.category === "ps4-games" ||
    product.category === "nintendo-switch-games" ||
    product.tags.includes("top-pakistan") ||
    product.tags.includes("top-50") ||
    product.tags.includes("top-ps4") ||
    product.tags.includes("top-switch") ||
    product.tags.includes("admin-cd") ||
    hay.includes("disc") ||
    hay.includes(" ps5 cd") ||
    hay.includes(" ps4 cd") ||
    hay.includes("switch") ||
    /\bcd\b/.test(hay)
  );
}

export interface AddCdInput {
  title: string;
  brand: string;
  platform: string;
  condition: ProductCondition;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  notes?: string;
  /** @deprecated prefer imageUrls */
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  youtubeId?: string;
  videoTitle?: string;
}

function catalogPlacement(platform: string): {
  category: string;
  categoryPath: string[];
  discTag: string;
  compatibility: string[];
} {
  const p = platform.trim().toLowerCase();
  if (p.includes("playstation 4") || p === "ps4") {
    return {
      category: "ps4-games",
      categoryPath: ["games", "ps4-games"],
      discTag: "ps4-cd",
      compatibility: ["PlayStation 4", "PlayStation 4 Slim", "PlayStation 4 Pro"],
    };
  }
  if (p.includes("xbox")) {
    return {
      category: "games",
      categoryPath: ["games", "xbox"],
      discTag: "xbox-cd",
      compatibility: [platform || "Xbox Series X|S"],
    };
  }
  if (p.includes("nintendo") || p.includes("switch")) {
    return {
      category: "nintendo-switch-games",
      categoryPath: ["games", "nintendo-games", "nintendo-switch-games"],
      discTag: "switch-game",
      compatibility: ["Nintendo Switch", "Nintendo Switch OLED", "Nintendo Switch Lite"],
    };
  }
  return {
    category: "ps5-games",
    categoryPath: ["games", "ps5-games"],
    discTag: "ps5-cd",
    compatibility: ["PlayStation 5", "PlayStation 5 Slim", "PlayStation 5 Pro"],
  };
}

/** Repair older admin CDs that were always saved as ps5-games. */
export function normalizeCustomCd(product: Product): Product {
  if (!product.id.startsWith("admin-cd-") && !product.tags.includes("admin-cd")) {
    return product;
  }
  const platform = product.platform[0] ?? "PlayStation 5";
  const place = catalogPlacement(platform);
  const alreadyCorrect = product.category === place.category;
  if (alreadyCorrect && product.tags.includes(place.discTag)) return product;
  return {
    ...product,
    category: place.category,
    categoryPath: place.categoryPath,
    tags: [
      "game",
      place.discTag,
      "admin-cd",
      product.condition,
      ...product.tags.filter(
        (t) =>
          !["game", "ps5-cd", "ps4-cd", "xbox-cd", "switch-game", "admin-cd", "new", "pre-owned", "refurbished"].includes(
            t,
          ),
      ),
    ],
    compatibility: place.compatibility,
  };
}

export async function addCustomCd(input: AddCdInput): Promise<Product> {
  const inv = await readInventory();
  const handleBase = slugify(input.title) || `cd-${Date.now()}`;
  let handle = handleBase;
  let n = 1;
  const existingHandles = new Set([
    ...inv.custom.map((p) => p.handle),
  ]);
  while (existingHandles.has(handle)) {
    handle = `${handleBase}-${n}`;
    n += 1;
  }

  const id = `admin-cd-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const qty = Math.max(0, Math.floor(input.quantity));
  const sell = Math.max(0, Math.round(input.sellingPrice));
  const buy = Math.max(0, Math.round(input.buyingPrice));
  const platform = input.platform || "PlayStation 5";
  const place = catalogPlacement(platform);

  const urls = [
    ...(input.imageUrls ?? []).map((u) => u.trim()).filter(Boolean),
    ...(input.imageUrl?.trim() ? [input.imageUrl.trim()] : []),
  ];
  const uniqueUrls = [...new Set(urls)];
  const isUsed = input.condition === "pre-owned";
  const coverW = isUsed ? 600 : 800;
  const coverH = isUsed ? 900 : 800;
  const images =
    uniqueUrls.length > 0
      ? uniqueUrls.map((url, i) => ({
          url,
          alt:
            i === 0
              ? `${input.title.trim()} — cover`
              : `${input.title.trim()} — photo ${i + 1}`,
          width: i === 0 && isUsed ? coverW : 800,
          height: i === 0 && isUsed ? coverH : 800,
        }))
      : [
          {
            url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=600&h=900&q=80",
            alt: input.title.trim(),
            width: coverW,
            height: coverH,
          },
        ];

  const videoTitle = input.videoTitle?.trim() || `${input.title.trim()} — gameplay`;
  const video =
    input.youtubeId || input.videoUrl
      ? {
          title: videoTitle,
          ...(input.youtubeId ? { youtubeId: input.youtubeId } : {}),
          ...(input.videoUrl ? { src: input.videoUrl } : {}),
        }
      : undefined;

  const product: Product = {
    id,
    handle,
    title: input.title.trim(),
    brand: input.brand.trim() || "Unknown",
    description:
      input.notes?.trim() ||
      `${input.condition === "pre-owned" ? "Used" : "New"} toy listed by ToyCompany staff.`,
    category: place.category,
    categoryPath: place.categoryPath,
    platform: [platform],
    tags: ["game", place.discTag, "admin-cd", input.condition],
    condition: input.condition,
    rating: 4.5,
    reviewCount: 0,
    images,
    video,
    variants: [
      {
        id: `var-${id}`,
        title: input.condition === "pre-owned" ? "Used Disc" : "Physical Disc",
        sku: `PTPK-ADM-${id.slice(-6).toUpperCase()}`,
        price: { amount: sell, currencyCode: "PKR" },
        available: qty > 0,
        quantityAvailable: qty,
      },
    ],
    specs: [
      { label: "Format", value: "Blu-ray Disc" },
      { label: "Condition", value: input.condition },
      { label: "Platform", value: platform },
    ],
    compatibility: place.compatibility,
    createdAt: now,
  };

  inv.custom.unshift(product);
  inv.stock[id] = qty;
  inv.meta[id] = {
    buyingPrice: buy,
    sellingPrice: sell,
    notes: input.notes?.trim() ?? "",
    condition: input.condition,
  };
  await writeInventory(inv);
  return product;
}

export async function removeCd(productId: string): Promise<boolean> {
  const inv = await readInventory();
  const customIdx = inv.custom.findIndex((p) => p.id === productId);
  if (customIdx >= 0) {
    inv.custom.splice(customIdx, 1);
    delete inv.stock[productId];
    delete inv.meta[productId];
    await writeInventory(inv);
    return true;
  }
  if (!inv.hidden.includes(productId)) {
    inv.hidden.push(productId);
  }
  delete inv.stock[productId];
  delete inv.meta[productId];
  await writeInventory(inv);
  return true;
}

export async function updateCdRow(input: {
  productId: string;
  quantity?: number;
  buyingPrice?: number;
  sellingPrice?: number;
  notes?: string;
  condition?: ProductCondition;
}): Promise<CdMeta & { quantity: number } | null> {
  const inv = await readInventory();
  const isCustom = inv.custom.some((p) => p.id === input.productId);
  const isHidden = inv.hidden.includes(input.productId);
  if (isHidden) return null;

  const existing = inv.meta[input.productId] ?? {
    buyingPrice: 0,
    sellingPrice: 0,
    notes: "",
    condition: "new" as ProductCondition,
  };

  const next: CdMeta = {
    buyingPrice:
      input.buyingPrice != null
        ? Math.max(0, Math.round(input.buyingPrice))
        : existing.buyingPrice,
    sellingPrice:
      input.sellingPrice != null
        ? Math.max(0, Math.round(input.sellingPrice))
        : existing.sellingPrice,
    notes: input.notes != null ? input.notes : existing.notes,
    condition: input.condition ?? existing.condition,
  };
  inv.meta[input.productId] = next;

  if (input.quantity != null) {
    inv.stock[input.productId] = Math.max(0, Math.floor(input.quantity));
  }

  if (isCustom) {
    inv.custom = inv.custom.map((p) => {
      if (p.id !== input.productId) return p;
      const qty = inv.stock[input.productId] ?? p.variants[0]?.quantityAvailable ?? 0;
      return {
        ...p,
        condition: next.condition,
        description: next.notes || p.description,
        variants: p.variants.map((v, i) =>
          i === 0
            ? {
                ...v,
                price: {
                  amount: next.sellingPrice || v.price.amount,
                  currencyCode: "PKR",
                },
                quantityAvailable: qty,
                available: qty > 0,
              }
            : v,
        ),
      };
    });
  }

  await writeInventory(inv);
  return {
    ...next,
    quantity: inv.stock[input.productId] ?? 0,
  };
}

/** Merge base catalog with admin custom CDs, hide removed, apply stock + pricing. */
export function buildAdminAwareCatalog(baseCatalog: Product[], inv: CdInventoryStore): Product[] {
  const hidden = new Set(inv.hidden);
  const merged = [
    ...baseCatalog.filter((p) => !hidden.has(p.id)),
    ...inv.custom.map(normalizeCustomCd).filter((p) => !hidden.has(p.id)),
  ];
  return applyMetaPricing(applyStockOverrides(merged, inv.stock), inv.meta);
}
