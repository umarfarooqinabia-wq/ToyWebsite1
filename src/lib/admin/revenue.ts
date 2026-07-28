import type { AdminOrder } from "@/lib/admin/orders-db";
import type { CdMeta } from "@/lib/admin/stock-db";
import type { Product } from "@/types/commerce";

export interface OrderLineEarnings {
  title: string;
  quantity: number;
  sellUnit: number;
  buyUnit: number;
  sales: number;
  cost: number;
  profit: number;
  hasCost: boolean;
}

export interface MonthEarnings {
  key: string; // YYYY-MM
  label: string;
  orderCount: number;
  unitsSold: number;
  sales: number;
  cost: number;
  profit: number;
  /** Lines where buy price was known */
  trackedUnits: number;
  /** Lines without buy price in stock notes */
  untrackedUnits: number;
  topLines: OrderLineEarnings[];
}

function monthKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, 1).toLocaleString("en-PK", {
    month: "long",
    year: "numeric",
  });
}

function resolveBuyPrice(
  item: { productId?: string; title: string; buyingPrice?: number },
  meta: Record<string, CdMeta>,
  catalogByTitle: Map<string, Product>,
): number | null {
  if (item.buyingPrice != null && item.buyingPrice > 0) return item.buyingPrice;
  if (item.productId && meta[item.productId]?.buyingPrice > 0) {
    return meta[item.productId]!.buyingPrice;
  }
  const byTitle = catalogByTitle.get(item.title.trim().toLowerCase());
  if (byTitle && meta[byTitle.id]?.buyingPrice > 0) {
    return meta[byTitle.id]!.buyingPrice;
  }
  return null;
}

/**
 * Profit = sell − buy for each sold unit (cancelled orders excluded).
 * Example: buy 7000, sell 8000 → +1000 profit per disc.
 */
export function calculateEarningsByMonth(
  orders: AdminOrder[],
  meta: Record<string, CdMeta>,
  catalog: Product[],
): MonthEarnings[] {
  const catalogByTitle = new Map(
    catalog.map((p) => [p.title.trim().toLowerCase(), p]),
  );

  const buckets = new Map<
    string,
    {
      orderIds: Set<string>;
      unitsSold: number;
      sales: number;
      cost: number;
      profit: number;
      trackedUnits: number;
      untrackedUnits: number;
      lines: Map<string, OrderLineEarnings>;
    }
  >();

  const counted = orders.filter((o) => o.status !== "cancelled");

  for (const order of counted) {
    const key = monthKey(order.createdAt);
    if (!buckets.has(key)) {
      buckets.set(key, {
        orderIds: new Set(),
        unitsSold: 0,
        sales: 0,
        cost: 0,
        profit: 0,
        trackedUnits: 0,
        untrackedUnits: 0,
        lines: new Map(),
      });
    }
    const bucket = buckets.get(key)!;
    bucket.orderIds.add(order.id);

    for (const item of order.items) {
      const sellUnit = item.price.amount;
      const qty = item.quantity;
      const sales = sellUnit * qty;
      const buyUnit = resolveBuyPrice(item, meta, catalogByTitle);
      const hasCost = buyUnit != null;
      const cost = hasCost ? buyUnit! * qty : 0;
      const profit = hasCost ? (sellUnit - buyUnit!) * qty : 0;

      bucket.unitsSold += qty;
      bucket.sales += sales;
      if (hasCost) {
        bucket.cost += cost;
        bucket.profit += profit;
        bucket.trackedUnits += qty;
      } else {
        bucket.untrackedUnits += qty;
      }

      const lineKey = item.productId ?? item.title;
      const existing = bucket.lines.get(lineKey);
      if (existing) {
        existing.quantity += qty;
        existing.sales += sales;
        existing.cost += cost;
        existing.profit += profit;
        existing.hasCost = existing.hasCost || hasCost;
        if (hasCost) existing.buyUnit = buyUnit!;
      } else {
        bucket.lines.set(lineKey, {
          title: item.title,
          quantity: qty,
          sellUnit,
          buyUnit: buyUnit ?? 0,
          sales,
          cost,
          profit,
          hasCost,
        });
      }
    }
  }

  return [...buckets.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, b]) => ({
      key,
      label: monthLabel(key),
      orderCount: b.orderIds.size,
      unitsSold: b.unitsSold,
      sales: b.sales,
      cost: b.cost,
      profit: b.profit,
      trackedUnits: b.trackedUnits,
      untrackedUnits: b.untrackedUnits,
      topLines: [...b.lines.values()]
        .sort((a, c) => c.profit - a.profit)
        .slice(0, 8),
    }));
}

export function currentMonthKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
