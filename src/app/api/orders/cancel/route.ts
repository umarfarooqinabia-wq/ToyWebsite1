import { NextResponse } from "next/server";
import { z } from "zod";
import { cancelAdminOrder, getAdminOrder } from "@/lib/admin/orders-db";
import { getAdminSession } from "@/lib/admin/session";

const bodySchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().optional(),
});

/**
 * Cancel an order.
 * - Customers: only placed / processing
 * - Admin (logged in): can force-cancel shipped / out_for_delivery too
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid cancel payload" }, { status: 400 });
    }

    const session = await getAdminSession();
    const existing = await getAdminOrder(parsed.data.orderId);
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (existing.status === "cancelled") {
      return NextResponse.json({
        order: existing,
        message: "Order already cancelled",
      });
    }

    if (existing.status === "delivered") {
      return NextResponse.json(
        { error: "Delivered orders cannot be cancelled" },
        { status: 409 },
      );
    }

    const result = await cancelAdminOrder(parsed.data.orderId, {
      reason: parsed.data.reason,
      by: session ? "admin" : "customer",
      force: Boolean(session),
    });

    if (!result) {
      return NextResponse.json(
        {
          error:
            "This order can no longer be cancelled. Contact support if you need help.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      order: result.order,
      message: "Order cancelled",
      stockRestored: result.restored,
    });
  } catch {
    return NextResponse.json({ error: "Cancel failed" }, { status: 500 });
  }
}
