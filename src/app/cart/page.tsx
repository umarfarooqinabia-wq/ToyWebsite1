import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CartClient } from "./cart-client";

export const metadata: Metadata = {
  title: "Shopping Cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} className="mb-6" />
      <h1 className="mb-8 font-display text-3xl font-bold">Shopping Cart</h1>
      <CartClient />
    </div>
  );
}
