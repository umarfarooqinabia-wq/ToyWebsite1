import { addCustomCd } from "@/lib/admin/stock-db";
import { mutateJson, readJson } from "@/lib/admin/json-store";

const EXCHANGE_REQUESTS_FILE = "exchange-requests.json";

export type ExchangeRequestStatus = "pending" | "approved" | "rejected";

export type ExchangeCdRequest = {
  id: string;
  status: ExchangeRequestStatus;
  /** Approved exchanges are marked exchangeable for shop fulfilment */
  exchangeable: boolean;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  /** CD the customer wants to give away */
  offerTitle: string;
  offerBrand: string;
  offerPlatform: string;
  offerConditionNotes: string;
  offerDescription: string;
  offerImageUrls: string[];
  /** Used game they want in return */
  wantTitle: string;
  wantPlatform: string;
  wantProductHandle: string;
  wantProductId: string;
  wantNotes: string;
  /** Offered CD listed as used stock after approval */
  listedProductId?: string;
  listedProductHandle?: string;
  adminNote?: string;
};

type Store = { requests: ExchangeCdRequest[] };

async function readStore(): Promise<Store> {
  try {
    const parsed = await readJson<Store>(EXCHANGE_REQUESTS_FILE);
    if (!parsed) return { requests: [] };
    return { requests: Array.isArray(parsed.requests) ? parsed.requests : [] };
  } catch {
    return { requests: [] };
  }
}

export async function listExchangeRequests(filter?: {
  status?: ExchangeRequestStatus;
  email?: string;
  userId?: string;
}): Promise<ExchangeCdRequest[]> {
  const store = await readStore();
  let list = [...store.requests];
  if (filter?.status) list = list.filter((r) => r.status === filter.status);
  if (filter?.email) {
    const email = filter.email.toLowerCase();
    list = list.filter((r) => r.userEmail.toLowerCase() === email);
  }
  if (filter?.userId) list = list.filter((r) => r.userId === filter.userId);
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getExchangeRequest(id: string) {
  const store = await readStore();
  return store.requests.find((r) => r.id === id) ?? null;
}

export type CreateExchangeRequestInput = {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  offerTitle: string;
  offerBrand: string;
  offerPlatform: string;
  offerConditionNotes: string;
  offerDescription?: string;
  offerImageUrls: string[];
  wantTitle: string;
  wantPlatform: string;
  wantProductHandle?: string;
  wantProductId?: string;
  wantNotes?: string;
};

export async function createExchangeRequest(
  input: CreateExchangeRequestInput,
): Promise<ExchangeCdRequest> {
  const now = new Date().toISOString();
  const request: ExchangeCdRequest = {
    id: `exch-${Date.now().toString(36)}`,
    status: "pending",
    exchangeable: false,
    createdAt: now,
    updatedAt: now,
    userId: input.userId,
    userName: input.userName.trim(),
    userEmail: input.userEmail.trim().toLowerCase(),
    userPhone: input.userPhone.trim(),
    offerTitle: input.offerTitle.trim(),
    offerBrand: input.offerBrand.trim() || "Unknown",
    offerPlatform: input.offerPlatform.trim() || "PlayStation 5",
    offerConditionNotes: input.offerConditionNotes.trim(),
    offerDescription: input.offerDescription?.trim() || "",
    offerImageUrls: [
      ...new Set(input.offerImageUrls.map((u) => u.trim()).filter(Boolean)),
    ],
    wantTitle: input.wantTitle.trim(),
    wantPlatform: input.wantPlatform.trim() || "PlayStation 5",
    wantProductHandle: input.wantProductHandle?.trim() || "",
    wantProductId: input.wantProductId?.trim() || "",
    wantNotes: input.wantNotes?.trim() || "",
  };

  await mutateJson<Store>(EXCHANGE_REQUESTS_FILE, { requests: [] }, (store) => {
    store.requests.unshift(request);
    return store;
  });

  return request;
}

export async function rejectExchangeRequest(id: string, adminNote?: string) {
  let updated: ExchangeCdRequest | null = null;

  await mutateJson<Store>(EXCHANGE_REQUESTS_FILE, { requests: [] }, (store) => {
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
      exchangeable: false,
      updatedAt: now,
      reviewedAt: now,
      adminNote: adminNote?.trim() || current.adminNote,
    };
    store.requests[idx] = updated;
    return store;
  });

  return updated!;
}

/**
 * Approve exchange → offered CD becomes exchangeable.
 * Also lists the offered disc as used stock so the shop can complete the swap.
 */
export async function approveExchangeRequest(id: string, adminNote?: string) {
  const current = await getExchangeRequest(id);
  if (!current) throw new Error("Request not found");
  if (current.status !== "pending") throw new Error("Only pending requests can be approved");
  if (!current.offerImageUrls.length) throw new Error("Request has no offer CD photos");

  const title = /used|exchange/i.test(current.offerTitle)
    ? current.offerTitle
    : `${current.offerTitle} (Used / Exchange)`;

  const product = await addCustomCd({
    title,
    brand: current.offerBrand,
    platform: current.offerPlatform,
    buyingPrice: 0,
    sellingPrice: 0,
    quantity: 1,
    condition: "pre-owned",
    notes: [
      "Exchange CD — approved for swap.",
      `Customer wants: ${current.wantTitle} (${current.wantPlatform})`,
      current.wantProductHandle ? `Want product: /product/${current.wantProductHandle}` : "",
      current.offerConditionNotes ? `Condition: ${current.offerConditionNotes}` : "",
      current.offerDescription,
      `From ${current.userName} (${current.userPhone}, ${current.userEmail})`,
      adminNote ? `Admin: ${adminNote}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    imageUrls: current.offerImageUrls,
  });

  let updated: ExchangeCdRequest | null = null;
  await mutateJson<Store>(EXCHANGE_REQUESTS_FILE, { requests: [] }, (store) => {
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
      exchangeable: true,
      updatedAt: now,
      reviewedAt: now,
      listedProductId: product.id,
      listedProductHandle: product.handle,
      adminNote: adminNote?.trim() || row.adminNote,
    };
    store.requests[idx] = updated;
    return store;
  });

  return { request: updated!, product };
}
