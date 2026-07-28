import { randomInt } from "crypto";
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from "@/types/commerce";
import { DEMO_USER } from "@/lib/demo-user";
import { isPrepaidTransferMethod } from "@/lib/bank-details";
import {
  isAlreadyExistsError,
  listJsonPaths,
  mutateJson,
  readJson,
  writeJson,
} from "@/lib/admin/json-store";

/**
 * Lifetime order archive for ToyCompany (Hobby Blob–friendly).
 *
 * Hot path (checkout):
 *   1. mutateJson order-counter.json  → next ID   (1 get + 1 put)
 *   2. writeJson order-ids/{id}.json  → claim     (1 put, create-only)
 *   3. writeJson orders/{id}.json     → order     (1 put)
 *   4. mutateJson orders.json         → mirror    (1 get + 1 put)
 *
 * Avoids list()+N gets on every sale. Source of truth remains orders/{id}.json.
 */
const LEGACY_ORDERS_FILE = "orders.json";
const ORDER_COUNTER_FILE = "order-counter.json";
const ORDERS_DIR = "orders";
const ORDER_IDS_DIR = "order-ids";
const MIGRATION_FLAG = "_orders-migrated.json";
const ORDER_ID_FLOOR = 20000;

type OrderCounter = { next: number };

export interface AdminOrder extends Order {
  customerEmail?: string;
  customerPhone?: string;
  adminNotes?: string;
  cancelReason?: string;
  cancelledAt?: string;
  cancelledBy?: "admin" | "customer";
}

function safeId(id: string) {
  return String(id).replace(/[^a-zA-Z0-9._-]/g, "_");
}

function orderFile(id: string) {
  return `${ORDERS_DIR}/${safeId(id)}.json`;
}

function orderIdClaimFile(id: string) {
  return `${ORDER_IDS_DIR}/${safeId(id)}.json`;
}

function numericOrderKey(value: string) {
  const n = Number(String(value).split("-")[0]);
  return Number.isFinite(n) ? n : NaN;
}

function preferNewer(a: AdminOrder, b: AdminOrder): AdminOrder {
  const aTime = new Date(a.updatedAt || a.createdAt).getTime();
  const bTime = new Date(b.updatedAt || b.createdAt).getTime();
  return bTime >= aTime ? b : a;
}

function sortNewest(orders: AdminOrder[]) {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

async function readMirrorOrders(): Promise<AdminOrder[]> {
  const existing = await readJson<AdminOrder[]>(LEGACY_ORDERS_FILE);
  if (existing === null) return [];
  return Array.isArray(existing) ? existing : [];
}

async function readOrderFiles(): Promise<AdminOrder[]> {
  const paths = await listJsonPaths(`${ORDERS_DIR}/`);
  const orders: AdminOrder[] = [];
  await Promise.all(
    paths.map(async (filePath) => {
      const data = await readJson<AdminOrder>(filePath);
      if (data && typeof data.id === "string") orders.push(data);
    }),
  );
  return orders;
}

/** One-time migrate + seed; gated so list/checkout don't pay N Blob ops forever. */
async function ensureOrdersMigratedOnce(): Promise<void> {
  const flag = await readJson<{ ok?: boolean }>(MIGRATION_FLAG);
  if (flag?.ok) return;

  const mirror = await readMirrorOrders();
  if (mirror.length) {
    await Promise.all(
      mirror.map(async (order) => {
        if (!order?.id) return;
        try {
          await writeJson(orderFile(order.id), order, { overwrite: false });
        } catch (err) {
          if (isAlreadyExistsError(err)) return;
          const existing = await readJson<AdminOrder>(orderFile(order.id));
          if (!existing) throw err;
        }
        try {
          await writeJson(
            orderIdClaimFile(order.id),
            {
              id: order.id,
              number: order.number,
              claimedAt: order.createdAt,
              source: "migrate",
            },
            { overwrite: false },
          );
        } catch (err) {
          if (!isAlreadyExistsError(err)) {
            const existing = await readJson(orderIdClaimFile(order.id));
            if (!existing) throw err;
          }
        }
      }),
    );
  }

  let files = await readOrderFiles();
  if (files.length === 0 && mirror.length === 0) {
    for (const o of DEMO_USER.orders) {
      const order: AdminOrder = {
        ...o,
        customerEmail: DEMO_USER.email,
        customerPhone: DEMO_USER.phone,
        adminNotes: "",
      };
      try {
        await writeJson(orderFile(order.id), order, { overwrite: false });
        await writeJson(
          orderIdClaimFile(order.id),
          {
            id: order.id,
            number: order.number,
            claimedAt: order.createdAt,
            source: "seed",
          },
          { overwrite: false },
        );
      } catch (err) {
        if (!isAlreadyExistsError(err)) throw err;
      }
    }
    files = await readOrderFiles();
  }

  // Bootstrap counter from whatever IDs already exist (mirror or files).
  const byId = new Map<string, AdminOrder>();
  for (const order of files) {
    byId.set(order.id, order);
  }
  for (const order of mirror) {
    if (!order?.id) continue;
    const existing = byId.get(order.id);
    byId.set(order.id, existing ? preferNewer(existing, order) : order);
  }
  const all = [...byId.values()];
  let max = ORDER_ID_FLOOR;
  for (const order of all) {
    const n = numericOrderKey(order.number || order.id);
    if (Number.isFinite(n) && n > max) max = n;
  }
  const counter = await readJson<OrderCounter>(ORDER_COUNTER_FILE);
  if (!counter || !Number.isFinite(counter.next) || counter.next <= max) {
    await writeJson(ORDER_COUNTER_FILE, { next: max + 1 }, { overwrite: true });
  }
  if (all.length) {
    await writeJson(LEGACY_ORDERS_FILE, sortNewest(all), { overwrite: true });
  }

  await writeJson(MIGRATION_FLAG, { ok: true, at: new Date().toISOString() });
}

/**
 * Patch the flat orders.json mirror in place (1 get + 1 put).
 * Never reloads every order file.
 */
async function upsertMirror(order: AdminOrder): Promise<void> {
  try {
    await mutateJson<AdminOrder[]>(LEGACY_ORDERS_FILE, [], (list) => {
      const next = Array.isArray(list) ? [...list] : [];
      const idx = next.findIndex((o) => o?.id === order.id);
      if (idx >= 0) next[idx] = order;
      else next.unshift(order);
      return sortNewest(next);
    });
  } catch (err) {
    console.error(
      "[orders] mirror upsert failed (per-order file still safe)",
      err,
    );
  }
}

/** Persist one order file + cheap mirror patch. Never deletes. */
async function persistOrder(order: AdminOrder, overwrite: boolean): Promise<void> {
  await writeJson(orderFile(order.id), order, { overwrite });
  await upsertMirror(order);
}

/**
 * Allocate next numeric ID via counter file, then create-only claim.
 * Typical cost: 1 get+put (counter) + 1 put (claim). No list()/N gets.
 */
async function allocateOrderId(): Promise<string> {
  await ensureOrdersMigratedOnce();

  for (let attempt = 0; attempt < 40; attempt++) {
    let candidate: string;

    if (attempt < 30) {
      const counter = await mutateJson<OrderCounter>(
        ORDER_COUNTER_FILE,
        { next: ORDER_ID_FLOOR + 1 },
        (c) => {
          const next = Math.max(
            ORDER_ID_FLOOR + 1,
            Number.isFinite(c.next) ? Math.floor(c.next) : ORDER_ID_FLOOR + 1,
          );
          return { next: next + 1 };
        },
      );
      candidate = String(counter.next - 1);
    } else {
      candidate = `${Date.now()}${randomInt(10, 99)}`;
    }

    const existingOrder = await readJson<AdminOrder>(orderFile(candidate));
    if (existingOrder) continue;

    try {
      await writeJson(
        orderIdClaimFile(candidate),
        {
          id: candidate,
          number: candidate,
          claimedAt: new Date().toISOString(),
          source: "allocate",
        },
        { overwrite: false },
      );
      return candidate;
    } catch (err) {
      if (isAlreadyExistsError(err)) continue;
      const claim = await readJson(orderIdClaimFile(candidate));
      if (claim) continue;
      throw err;
    }
  }

  throw new Error("Could not allocate a unique order ID");
}

/**
 * Admin list: prefer mirror (1 get). Rebuild from files only if mirror empty.
 */
export async function listAdminOrders(): Promise<AdminOrder[]> {
  await ensureOrdersMigratedOnce();

  const mirror = await readMirrorOrders();
  if (mirror.length > 0) return sortNewest(mirror);

  // Rare: mirror missing — rebuild once from per-order files.
  const files = await readOrderFiles();
  if (files.length) {
    const sorted = sortNewest(files);
    try {
      await writeJson(LEGACY_ORDERS_FILE, sorted, { overwrite: true });
    } catch (err) {
      console.error("[orders] mirror rebuild failed", err);
    }
    return sorted;
  }
  return [];
}

export async function getAdminOrder(id: string): Promise<AdminOrder | null> {
  const direct = await readJson<AdminOrder>(orderFile(id));
  if (direct && (direct.id === id || direct.number === id)) return direct;

  // Cheap lookup via mirror before scanning every order file.
  const mirror = await readMirrorOrders();
  const fromMirror = mirror.find((o) => o.id === id || o.number === id);
  if (fromMirror) {
    const fresh = await readJson<AdminOrder>(orderFile(fromMirror.id));
    return fresh ?? fromMirror;
  }
  return null;
}

/** Peek next sequential candidate (not reserved). Prefer createAdminOrder. */
export async function nextNumericOrderId(): Promise<string> {
  await ensureOrdersMigratedOnce();
  const counter = await readJson<OrderCounter>(ORDER_COUNTER_FILE);
  if (counter && Number.isFinite(counter.next)) {
    return String(Math.max(ORDER_ID_FLOOR + 1, Math.floor(counter.next)));
  }
  const mirror = await readMirrorOrders();
  let max = ORDER_ID_FLOOR;
  for (const order of mirror) {
    const n = numericOrderKey(order.number || order.id);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return String(max + 1);
}

/**
 * Create a new order with a guaranteed-unique ID (payment reference).
 */
export async function createAdminOrder(
  build: (orderId: string) => AdminOrder,
): Promise<AdminOrder> {
  let lastError: unknown;

  for (let round = 0; round < 5; round++) {
    const orderId = await allocateOrderId();
    const order = build(orderId);
    if (order.id !== orderId || order.number !== orderId) {
      throw new Error("Order builder must keep id and number equal to the claimed ID");
    }

    try {
      await persistOrder(order, false);
      return order;
    } catch (err) {
      lastError = err;
      if (isAlreadyExistsError(err)) continue;
      const existing = await readJson<AdminOrder>(orderFile(orderId));
      if (existing && existing.createdAt === order.createdAt) return existing;
      if (existing) continue;
      throw err;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Could not create order with a unique ID");
}

/** Upsert an order file (updates / admin patches). Prefer createAdminOrder for checkout. */
export async function saveAdminOrder(order: AdminOrder): Promise<AdminOrder> {
  const existing = await readJson<AdminOrder>(orderFile(order.id));
  if (existing && existing.createdAt !== order.createdAt) {
    const differentCustomer =
      existing.customerEmail !== order.customerEmail ||
      existing.shippingAddress?.phone !== order.shippingAddress?.phone;
    if (differentCustomer) {
      throw new Error(
        `Order ID ${order.id} is already used. Every payment reference must be unique.`,
      );
    }
  }

  try {
    await writeJson(
      orderIdClaimFile(order.id),
      {
        id: order.id,
        number: order.number,
        claimedAt: order.createdAt,
        source: "save",
      },
      { overwrite: false },
    );
  } catch (err) {
    if (!isAlreadyExistsError(err)) throw err;
  }

  await persistOrder(order, true);
  return order;
}

export async function updateAdminOrder(
  id: string,
  patch: {
    status?: OrderStatus;
    trackingNumber?: string;
    adminNotes?: string;
    paymentStatus?: PaymentStatus;
    paymentProofUrl?: string;
    paymentProofUploadedAt?: string;
    paymentMarkedPaidAt?: string;
  },
): Promise<AdminOrder | null> {
  const current = await getAdminOrder(id);
  if (!current) return null;

  const next: AdminOrder = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  if (patch.paymentStatus === "paid" && !patch.paymentMarkedPaidAt) {
    next.paymentMarkedPaidAt = new Date().toISOString();
  }

  await persistOrder(next, true);
  return next;
}

export async function attachPaymentProof(
  id: string,
  proofUrl: string,
): Promise<AdminOrder | null> {
  const current = await getAdminOrder(id);
  if (!current) return null;
  if (current.status === "cancelled") return null;
  if (!isPrepaidTransferMethod(current.paymentMethod)) return null;
  if (current.paymentStatus === "paid") return null;

  const now = new Date().toISOString();
  const next: AdminOrder = {
    ...current,
    paymentProofUrl: proofUrl,
    paymentProofUploadedAt: now,
    paymentStatus: "proof_submitted",
    updatedAt: now,
  };
  await persistOrder(next, true);
  return next;
}

export function buildOrderFromCheckout(input: {
  orderId: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    paymentMethod: string;
  };
  lines: {
    title: string;
    quantity: number;
    price: { amount: number; currencyCode: string };
    image?: string;
    productId?: string;
    buyingPrice?: number;
  }[];
  subtotal: { amount: number; currencyCode: string };
  shipping: { amount: number; currencyCode: string };
  total: { amount: number; currencyCode: string };
}): AdminOrder {
  const now = new Date().toISOString();
  const paymentMethod = input.customer.paymentMethod as PaymentMethod;
  return {
    id: input.orderId,
    number: input.orderId,
    status: "placed",
    createdAt: now,
    updatedAt: now,
    items: input.lines.map((l) => ({
      title: l.title,
      quantity: l.quantity,
      price: l.price,
      image: l.image ?? "",
      productId: l.productId,
      buyingPrice: l.buyingPrice,
    })),
    subtotal: input.subtotal,
    shipping: input.shipping,
    total: input.total,
    paymentMethod,
    paymentStatus: isPrepaidTransferMethod(paymentMethod) ? "unpaid" : undefined,
    shippingAddress: {
      id: `addr-${input.orderId}`,
      fullName: input.customer.fullName,
      phone: input.customer.phone,
      address1: input.customer.address,
      city: input.customer.city,
      province: input.customer.province,
      postalCode: input.customer.postalCode,
      country: "Pakistan",
    },
    trackingNumber: `PTPK-TRK-${String(input.orderId).padStart(6, "0").slice(-6)}`,
    customerEmail: input.customer.email,
    customerPhone: input.customer.phone,
    adminNotes: "",
  };
}

const CANCELLABLE: OrderStatus[] = ["placed", "processing"];

/**
 * Cancel keeps the order in the lifetime DB with status "cancelled".
 * The record is never removed — admin can always see it.
 */
export async function cancelAdminOrder(
  id: string,
  options: {
    reason?: string;
    by: "admin" | "customer";
    force?: boolean;
  },
): Promise<{ order: AdminOrder; restored: boolean } | null> {
  const current = await getAdminOrder(id);
  if (!current) return null;

  if (current.status === "cancelled") {
    return { order: current, restored: false };
  }
  if (current.status === "delivered") {
    return null;
  }
  if (!options.force && !CANCELLABLE.includes(current.status)) {
    return null;
  }

  const next: AdminOrder = {
    ...current,
    status: "cancelled",
    updatedAt: new Date().toISOString(),
    cancelledAt: new Date().toISOString(),
    cancelledBy: options.by,
    cancelReason: options.reason?.trim() || current.cancelReason || "",
    adminNotes:
      options.by === "admin" && options.reason?.trim()
        ? [current.adminNotes, `Cancelled: ${options.reason.trim()}`]
            .filter(Boolean)
            .join("\n")
        : current.adminNotes,
  };
  await persistOrder(next, true);

  const { readInventory, setStockQuantity } = await import("@/lib/admin/stock-db");
  const inv = await readInventory();
  for (const item of next.items) {
    if (!item.productId) continue;
    const currentQty =
      inv.stock[item.productId] ??
      inv.custom.find((p) => p.id === item.productId)?.variants[0]?.quantityAvailable;
    if (currentQty == null) continue;
    await setStockQuantity(item.productId, currentQty + item.quantity);
  }

  return { order: next, restored: true };
}
