import type { OrderStatus } from "@/types/commerce";
import { whatsappUrl } from "@/lib/constants";

export type PakistanCourierId =
  | "tcs"
  | "leopards"
  | "postex"
  | "trax"
  | "mnp"
  | "callcourier"
  | "unknown";

export const COURIER_LABELS: Record<PakistanCourierId, string> = {
  tcs: "TCS",
  leopards: "Leopards Courier",
  postex: "PostEx",
  trax: "Trax",
  mnp: "M&P",
  callcourier: "Call Courier",
  unknown: "Courier",
};

/** Detect courier from tracking number / notes. */
export function detectCourier(trackingNumber?: string | null): PakistanCourierId {
  if (!trackingNumber) return "unknown";
  const t = trackingNumber.toUpperCase().replace(/\s+/g, "");
  if (/^TCS|TCS-/i.test(trackingNumber) || t.startsWith("TCS")) return "tcs";
  if (/LEOPARD|LEO-/i.test(trackingNumber)) return "leopards";
  if (/POSTEX|PX-/i.test(trackingNumber)) return "postex";
  if (/TRAX|TX-/i.test(trackingNumber)) return "trax";
  if (/M&?P|MNP/i.test(trackingNumber)) return "mnp";
  if (/CALL/i.test(trackingNumber)) return "callcourier";
  // Common TCS numeric CN patterns are long digits
  if (/^\d{10,14}$/.test(t)) return "tcs";
  return "unknown";
}

/** Public tracking page URLs for major Pakistan couriers. */
export function courierTrackingUrl(
  trackingNumber: string,
  courier: PakistanCourierId = detectCourier(trackingNumber),
): string | null {
  const code = encodeURIComponent(trackingNumber.trim());
  switch (courier) {
    case "tcs":
      return `https://www.tcsexpress.com/track/${code}`;
    case "leopards":
      return `https://www.leopardscourier.com/tracking?cn=${code}`;
    case "postex":
      return `https://merchant.postex.pk/track?cn=${code}`;
    case "trax":
      return `https://sonic.pk/tracking?tracking_number=${code}`;
    case "mnp":
      return `https://mulphilog.com/tracking/${code}`;
    case "callcourier":
      return `https://callcourier.com.pk/tracking/?tn=${code}`;
    default:
      return null;
  }
}

export const PARENT_STATUS_COPY: Record<
  OrderStatus,
  { title: string; detail: string }
> = {
  placed: {
    title: "Order placed",
    detail: "We've got it — packing starts after confirmation.",
  },
  processing: {
    title: "Preparing your toys",
    detail: "Our Karachi team is packing your order carefully.",
  },
  shipped: {
    title: "On the way",
    detail: "Handed to courier. Track the parcel with the link below.",
  },
  out_for_delivery: {
    title: "Out for delivery today",
    detail: "Your courier is delivering today — keep your phone nearby for COD.",
  },
  delivered: {
    title: "Delivered",
    detail: "Enjoy! Need help with returns? Message us on WhatsApp.",
  },
  cancelled: {
    title: "Cancelled",
    detail: "This order was cancelled. Chat with us if that was a mistake.",
  },
};

export function trackingWhatsAppMessage(input: {
  orderNumber: string;
  status: OrderStatus;
  trackingNumber?: string;
  city?: string;
}) {
  const copy = PARENT_STATUS_COPY[input.status];
  const lines = [
    `Hi ToyCompany, I need an update on order ${input.orderNumber}.`,
    `Status on site: ${copy.title}`,
  ];
  if (input.trackingNumber) lines.push(`Tracking: ${input.trackingNumber}`);
  if (input.city) lines.push(`City: ${input.city}`);
  lines.push("Please confirm ETA. Thanks!");
  return lines.join("\n");
}

export function trackingWhatsAppUrl(input: {
  orderNumber: string;
  status: OrderStatus;
  trackingNumber?: string;
  city?: string;
}) {
  return whatsappUrl(trackingWhatsAppMessage(input));
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0/, "92");
}

/** Match phone loosely (last 10 digits). */
export function phonesMatch(a: string, b: string) {
  const na = normalizePhone(a);
  const nb = normalizePhone(b);
  if (!na || !nb) return false;
  return na.slice(-10) === nb.slice(-10);
}
