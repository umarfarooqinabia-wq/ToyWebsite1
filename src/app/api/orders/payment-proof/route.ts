import { NextResponse } from "next/server";
import {
  attachPaymentProof,
  getAdminOrder,
} from "@/lib/admin/orders-db";
import { isPrepaidTransferMethod } from "@/lib/bank-details";
import { saveProcessedImage } from "@/lib/uploads/save-image";

/**
 * Customer uploads a bank / Easypaisa / JazzCash payment screenshot for an order.
 * Knowing the order id is treated as authorization (same model as cancel).
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const orderId = String(form.get("orderId") ?? "").trim();
    const file = form.get("file");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Payment screenshot required" }, { status: 400 });
    }

    const order = await getAdminOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status === "cancelled") {
      return NextResponse.json({ error: "Cancelled orders cannot accept proof" }, { status: 409 });
    }
    if (!isPrepaidTransferMethod(order.paymentMethod)) {
      return NextResponse.json(
        { error: "This order does not use bank / wallet transfer" },
        { status: 400 },
      );
    }
    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Payment already marked as paid", order },
        { status: 409 },
      );
    }

    const saved = await saveProcessedImage({
      file,
      folder: "payment-proofs",
      filenamePrefix: `proof-${order.number}`,
      preset: "proof",
    });

    const updated = await attachPaymentProof(order.id, saved.url);
    if (!updated) {
      return NextResponse.json({ error: "Could not save proof" }, { status: 500 });
    }

    return NextResponse.json({
      order: updated,
      proofUrl: saved.url,
      message: "Payment proof uploaded — we will verify and mark paid.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    const status =
      message.includes("Unsupported") || message.includes("too large") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
