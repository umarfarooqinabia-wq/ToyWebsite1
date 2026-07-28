import { NextResponse } from "next/server";
import { getAdminOrder } from "@/lib/admin/orders-db";
import { phonesMatch } from "@/lib/shipping/pakistan-tracking";

/**
 * Guest order tracking — requires order number + phone used at checkout.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order")?.trim() ?? "";
  const phone = searchParams.get("phone")?.trim() ?? "";

  if (!orderId || !phone) {
    return NextResponse.json(
      { error: "Order number and phone are required" },
      { status: 400 },
    );
  }

  const order = await getAdminOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const orderPhone = order.shippingAddress?.phone ?? "";
  if (!phonesMatch(orderPhone, phone)) {
    return NextResponse.json(
      { error: "Phone does not match this order" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    order: {
      id: order.id,
      number: order.number,
      status: order.status,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      city: order.shippingAddress?.city,
      itemCount: order.items.reduce((n, i) => n + i.quantity, 0),
      items: order.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        image: i.image,
      })),
    },
  });
}
