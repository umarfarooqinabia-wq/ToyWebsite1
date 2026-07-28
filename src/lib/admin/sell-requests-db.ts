import { addCustomCd } from "@/lib/admin/stock-db";
import { mutateJson, readJson } from "@/lib/admin/json-store";

const SELL_REQUESTS_FILE = "sell-requests.json";

export type SellRequestStatus = "pending" | "approved" | "rejected";

export type SellGameRequest = {
  id: string;
  status: SellRequestStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  title: string;
  brand: string;
  platform: string;
  askingPrice: number;
  conditionNotes: string;
  description: string;
  imageUrls: string[];
  productId?: string;
  productHandle?: string;
  adminNote?: string;
};

type Store = { requests: SellGameRequest[] };

async function readStore(): Promise<Store> {
  try {
    const parsed = await readJson<Store>(SELL_REQUESTS_FILE);
    if (!parsed) return { requests: [] };
    return { requests: Array.isArray(parsed.requests) ? parsed.requests : [] };
  } catch {
    return { requests: [] };
  }
}

export async function listSellRequests(filter?: {
  status?: SellRequestStatus;
  email?: string;
}): Promise<SellGameRequest[]> {
  const store = await readStore();
  let list = [...store.requests];
  if (filter?.status) list = list.filter((r) => r.status === filter.status);
  if (filter?.email) {
    const email = filter.email.toLowerCase();
    list = list.filter((r) => r.sellerEmail.toLowerCase() === email);
  }
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getSellRequest(id: string) {
  const store = await readStore();
  return store.requests.find((r) => r.id === id) ?? null;
}

export type CreateSellRequestInput = {
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  title: string;
  brand: string;
  platform: string;
  askingPrice: number;
  conditionNotes: string;
  description?: string;
  imageUrls: string[];
};

export async function createSellRequest(
  input: CreateSellRequestInput,
): Promise<SellGameRequest> {
  const now = new Date().toISOString();
  const request: SellGameRequest = {
    id: `sell-${Date.now().toString(36)}`,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    sellerName: input.sellerName.trim(),
    sellerEmail: input.sellerEmail.trim().toLowerCase(),
    sellerPhone: input.sellerPhone.trim(),
    title: input.title.trim(),
    brand: input.brand.trim() || "Unknown",
    platform: input.platform.trim() || "PlayStation 5",
    askingPrice: Math.max(0, Math.round(input.askingPrice)),
    conditionNotes: input.conditionNotes.trim(),
    description: input.description?.trim() || "",
    imageUrls: [...new Set(input.imageUrls.map((u) => u.trim()).filter(Boolean))],
  };

  await mutateJson<Store>(SELL_REQUESTS_FILE, { requests: [] }, (store) => {
    store.requests.unshift(request);
    return store;
  });

  return request;
}

export async function rejectSellRequest(id: string, adminNote?: string) {
  let updated: SellGameRequest | null = null;

  await mutateJson<Store>(SELL_REQUESTS_FILE, { requests: [] }, (store) => {
    const idx = store.requests.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error("Request not found");
    const current = store.requests[idx]!;
    if (current.status !== "pending") {
      throw new Error("Only pending requests can be rejected");
    }
    const now = new Date().toISOString();
    updated = {
      ...current,
      status: "rejected",
      updatedAt: now,
      reviewedAt: now,
      adminNote: adminNote?.trim() || current.adminNote,
    };
    store.requests[idx] = updated;
    return store;
  });

  return updated!;
}

/** Approve listing → create used CD in catalog + mark request approved. */
export async function approveSellRequest(id: string, adminNote?: string) {
  const current = await getSellRequest(id);
  if (!current) throw new Error("Request not found");
  if (current.status !== "pending") throw new Error("Only pending requests can be approved");
  if (!current.imageUrls.length) throw new Error("Request has no images");

  const title = /used/i.test(current.title)
    ? current.title
    : `${current.title} (Used)`;

  const product = await addCustomCd({
    title,
    brand: current.brand,
    platform: current.platform,
    buyingPrice: 0,
    sellingPrice: current.askingPrice,
    quantity: 1,
    condition: "pre-owned",
    notes: [
      current.description,
      current.conditionNotes ? `Seller notes: ${current.conditionNotes}` : "",
      `Submitted by ${current.sellerName} (${current.sellerPhone}, ${current.sellerEmail})`,
      adminNote ? `Admin: ${adminNote}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    imageUrls: current.imageUrls,
  });

  let updated: SellGameRequest | null = null;
  await mutateJson<Store>(SELL_REQUESTS_FILE, { requests: [] }, (store) => {
    const idx = store.requests.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error("Request not found");
    const row = store.requests[idx]!;
    if (row.status !== "pending") {
      throw new Error("Only pending requests can be approved");
    }
    const now = new Date().toISOString();
    updated = {
      ...row,
      status: "approved",
      updatedAt: now,
      reviewedAt: now,
      productId: product.id,
      productHandle: product.handle,
      adminNote: adminNote?.trim() || row.adminNote,
    };
    store.requests[idx] = updated;
    return store;
  });

  return { request: updated!, product };
}
