import Link from "next/link";
import { MessageCircle, Package, Truck, ExternalLink } from "lucide-react";
import type { OrderStatus } from "@/types/commerce";
import { Button } from "@/components/ui/button";
import {
  COURIER_LABELS,
  PARENT_STATUS_COPY,
  courierTrackingUrl,
  detectCourier,
  trackingWhatsAppUrl,
} from "@/lib/shipping/pakistan-tracking";
import { cn } from "@/lib/utils";

const STEPS: OrderStatus[] = [
  "placed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export function OrderTrackingPanel({
  orderNumber,
  status,
  trackingNumber,
  city,
  className,
}: {
  orderNumber: string;
  status: OrderStatus;
  trackingNumber?: string;
  city?: string;
  className?: string;
}) {
  const copy = PARENT_STATUS_COPY[status];
  const courier = detectCourier(trackingNumber);
  const trackUrl = trackingNumber
    ? courierTrackingUrl(trackingNumber, courier)
    : null;
  const wa = trackingWhatsAppUrl({
    orderNumber,
    status,
    trackingNumber,
    city,
  });
  const currentIdx =
    status === "cancelled" ? -1 : STEPS.indexOf(status as (typeof STEPS)[number]);
  const outToday = status === "out_for_delivery";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-gradient-to-br from-surface via-bg-elevated to-surface p-5 sm:p-6",
        outToday && "border-secondary/40",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Order tracking
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-text sm:text-2xl">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-muted">{copy.detail}</p>
        </div>
        {outToday ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-dim px-3 py-1.5 text-xs font-bold text-secondary">
            <Truck className="h-3.5 w-3.5" />
            Today
          </span>
        ) : null}
      </div>

      {status !== "cancelled" ? (
        <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {STEPS.map((step, i) => (
            <li
              key={step}
              className={cn(
                "rounded-xl border p-2.5 text-center text-[11px] font-semibold leading-snug sm:text-xs",
                i <= currentIdx
                  ? step === "out_for_delivery" && outToday
                    ? "border-secondary bg-secondary-dim text-secondary"
                    : "border-accent bg-accent-dim text-accent"
                  : "border-border text-subtle",
              )}
            >
              {PARENT_STATUS_COPY[step].title}
            </li>
          ))}
        </ol>
      ) : null}

      <div className="mt-5 space-y-3 rounded-xl border border-border bg-bg/50 p-4">
        {trackingNumber ? (
          <div className="flex items-start gap-3">
            <Package className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                {COURIER_LABELS[courier]} tracking
              </p>
              <p className="mt-0.5 break-all font-mono text-sm font-semibold text-text">
                {trackingNumber}
              </p>
              {trackUrl ? (
                <a
                  href={trackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  Open courier tracking
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <p className="mt-1 text-xs text-muted">
                  Courier link not detected — WhatsApp us with this number.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Tracking number appears here once your parcel is handed to the courier.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a href={wa} target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp update
          </Button>
        </a>
        <Link href="/track">
          <Button size="sm" variant="outline">
            Track another order
          </Button>
        </Link>
      </div>
    </div>
  );
}
