import { NextResponse } from "next/server";
import { getAdminOrder } from "@/lib/admin/orders-db";

/** Sync order fulfillment + payment fields into the customer's local order history. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 });
  }

  const order = await getAdminOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      id: order.id,
      number: order.number,
      status: order.status,
      trackingNumber: order.trackingNumber,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentProofUrl: order.paymentProofUrl,
      paymentProofUploadedAt: order.paymentProofUploadedAt,
      paymentMarkedPaidAt: order.paymentMarkedPaidAt,
      updatedAt: order.updatedAt,
    },
  });
}
