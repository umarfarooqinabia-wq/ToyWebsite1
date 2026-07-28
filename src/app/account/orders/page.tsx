import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { OrdersListClient } from "./orders-list-client";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false },
};

export default function OrdersPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Account", href: "/account" },
          { label: "Orders" },
        ]}
        className="mb-6"
      />
      <h1 className="mb-8 font-display text-3xl font-bold">Order History</h1>
      <OrdersListClient />
    </div>
  );
}
