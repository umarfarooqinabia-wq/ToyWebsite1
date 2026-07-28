import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyNewOrder } from "@/lib/notifications/order-alerts";
import { commerce } from "@/lib/commerce";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import {
  buildOrderFromCheckout,
  createAdminOrder,
} from "@/lib/admin/orders-db";
import {
  decrementStock,
  readInventory,
  readStockMap,
  setStockQuantity,
} from "@/lib/admin/stock-db";
import type { Product } from "@/types/commerce";

const bodySchema = z.object({
  customer: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(5),
    city: z.string().min(2),
    province: z.string().min(2),
    postalCode: z.string().min(4),
    paymentMethod: z.string(),
  }),
  lines: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
        title: z.string().optional(),
        price: z
          .object({ amount: z.number(), currencyCode: z.string() })
          .optional(),
        handle: z.string().optional(),
        productId: z.string().optional(),
      }),
    )
    .min(1),
});

async function resolveProduct(line: {
  variantId: string;
  productId?: string;
  handle?: string;
}): Promise<Product | null> {
  if (line.handle) {
    const byHandle = await commerce.getProductByHandle(line.handle);
    if (byHandle) return byHandle;
  }

  // Fallback: scan a large page of the catalog (demo catalog is ~200+ SKUs)
  const { products } = await commerce.getProducts({ pageSize: 5000 });
  return (
    products.find(
      (p) =>
        p.variants.some((v) => v.id === line.variantId) ||
        p.id === line.productId ||
        (line.handle ? p.handle === line.handle : false),
    ) ?? null
  );
}

/**
 * Checkout with server-side reprice authority.
 * Never trusts client-sent totals — rebuilds from commerce catalog.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { customer, lines } = parsed.data;

    const pricedLines: {
      productId: string;
      variantId: string;
      quantity: number;
      title: string;
      price: { amount: number; currencyCode: string };
      image: string;
    }[] = [];

    for (const line of lines) {
      const product = await resolveProduct(line);
      const variant =
        product?.variants.find((v) => v.id === line.variantId) ??
        product?.variants[0];

      if (!product || !variant || !variant.available || variant.quantityAvailable <= 0) {
        return NextResponse.json(
          {
            error: `Item unavailable: ${line.title ?? line.handle ?? line.variantId}`,
          },
          { status: 409 },
        );
      }

      if (line.quantity > variant.quantityAvailable) {
        return NextResponse.json(
          {
            error: `Only ${variant.quantityAvailable} left for ${product.title}`,
          },
          { status: 409 },
        );
      }

      pricedLines.push({
        productId: product.id,
        variantId: variant.id,
        quantity: line.quantity,
        title: product.title,
        price: variant.price,
        image: product.images[0]?.url ?? "",
      });
    }

    const subtotalAmount = pricedLines.reduce(
      (sum, l) => sum + l.price.amount * l.quantity,
      0,
    );
    const shippingAmount =
      subtotalAmount === 0 || subtotalAmount >= FREE_SHIPPING_THRESHOLD ? 0 : 299;
    const totalAmount = subtotalAmount + shippingAmount;

    const totals = {
      subtotal: { amount: subtotalAmount, currencyCode: "PKR" },
      shipping: { amount: shippingAmount, currencyCode: "PKR" },
      total: { amount: totalAmount, currencyCode: "PKR" },
    };

    const inv = await readInventory();
    const linesWithCost = pricedLines.map((l) => ({
      ...l,
      buyingPrice:
        inv.meta[l.productId]?.buyingPrice && inv.meta[l.productId]!.buyingPrice > 0
          ? inv.meta[l.productId]!.buyingPrice
          : undefined,
    }));

    // One file per order — concurrent checkouts cannot overwrite each other.
    const adminOrder = await createAdminOrder((orderId) =>
      buildOrderFromCheckout({
        orderId,
        customer,
        lines: linesWithCost,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
      }),
    );
    const orderId = adminOrder.id;

    // Stock updates must not roll back a placed order if they fail
    try {
      const stockMap = await readStockMap();
      for (const line of pricedLines) {
        if (stockMap[line.productId] != null) {
          await decrementStock(line.productId, line.quantity);
        } else {
          const product = await resolveProduct({
            variantId: line.variantId,
            productId: line.productId,
          });
          const current = product?.variants[0]?.quantityAvailable ?? 0;
          await setStockQuantity(line.productId, Math.max(0, current - line.quantity));
        }
      }
    } catch (stockErr) {
      console.error("[checkout] stock update failed after order save", stockErr);
    }

    let alerts = {
      ownerEmail: { ok: false, detail: "not attempted", channel: "none" },
      customerEmail: { ok: false, detail: "not attempted", channel: "none" },
      whatsapp: { ok: false, detail: "not attempted", channel: "none" },
      sms: { ok: false, detail: "not attempted", channel: "none" },
    };
    try {
      alerts = await notifyNewOrder({
        orderId,
        customer,
        lines: pricedLines,
        total: totals.total,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
      });
    } catch (alertErr) {
      console.error("[checkout] order alerts failed", alertErr);
    }

    return NextResponse.json({
      orderId,
      status: "placed",
      total: totals.total,
      totals,
      lines: pricedLines,
      message: "Order placed successfully",
      alerts: {
        ownerEmail: alerts.ownerEmail.ok,
        customerEmail: alerts.customerEmail.ok,
        whatsapp: alerts.whatsapp.ok,
        ownerEmailDetail: alerts.ownerEmail.detail,
        customerEmailDetail: alerts.customerEmail.detail,
        ownerEmailChannel: alerts.ownerEmail.channel,
        customerEmailChannel: alerts.customerEmail.channel,
      },
    });
  } catch (err) {
    console.error("[checkout]", err);
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
