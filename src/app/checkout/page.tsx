import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
        className="mb-6"
      />
      <h1 className="mb-8 font-display text-3xl font-bold">Checkout</h1>
      <CheckoutClient />
    </div>
  );
}
