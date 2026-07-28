import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { TrackOrderClient } from "@/components/orders/track-order-client";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Track Order",
  description: `Track your ${SITE.name} toy delivery — courier link, out-for-delivery status, and WhatsApp updates.`,
  alternates: { canonical: "/track" },
};

export default function TrackOrderPage() {
  return (
    <div className="container-px mx-auto max-w-3xl py-6 sm:py-8">
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Track Order" }]}
        className="mb-4 sm:mb-6"
      />
      <div className="mb-8 max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Local delivery tracking
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          Where are my toys?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Enter your order number and checkout phone. See packing status, courier tracking, and tap
          WhatsApp for a human update.
        </p>
      </div>
      <TrackOrderClient />
    </div>
  );
}
