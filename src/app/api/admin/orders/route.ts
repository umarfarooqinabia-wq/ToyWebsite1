import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin/session";
import {
  cancelAdminOrder,
  listAdminOrders,
  updateAdminOrder,
} from "@/lib/admin/orders-db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await listAdminOrders();
  return NextResponse.json({ orders });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z
    .enum([
      "placed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ])
    .optional(),
  trackingNumber: z.string().optional(),
  adminNotes: z.string().optional(),
  paymentStatus: z.enum(["unpaid", "proof_submitted", "paid"]).optional(),
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

  const { id, paymentStatus, ...patch } = parsed.data;

  if (patch.status === "cancelled") {
    const cancelled = await cancelAdminOrder(id, {
      by: "admin",
      force: true,
      reason: "Marked cancelled in admin",
    });
    if (!cancelled) {
      return NextResponse.json(
        { error: "Order not found or cannot be cancelled" },
        { status: 404 },
      );
    }
    if (patch.trackingNumber != null || patch.adminNotes != null) {
      const updated = await updateAdminOrder(id, {
        trackingNumber: patch.trackingNumber,
        adminNotes: patch.adminNotes,
      });
      return NextResponse.json({ order: updated ?? cancelled.order });
    }
    return NextResponse.json({ order: cancelled.order });
  }

  const updated = await updateAdminOrder(id, {
    ...patch,
    ...(paymentStatus
      ? {
          paymentStatus,
          ...(paymentStatus === "paid"
            ? { paymentMarkedPaidAt: new Date().toISOString() }
            : {}),
        }
      : {}),
  });
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // When admin confirms payment on a fresh prepaid order, move into processing.
  if (
    paymentStatus === "paid" &&
    updated.status === "placed" &&
    !patch.status
  ) {
    const advanced = await updateAdminOrder(id, { status: "processing" });
    return NextResponse.json({ order: advanced ?? updated });
  }

  return NextResponse.json({ order: updated });
}
