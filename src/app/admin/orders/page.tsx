import type { Metadata } from "next";
import { AdminOrdersClient } from "@/components/admin/admin-orders-client";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default function AdminOrdersPage() {
  return <AdminOrdersClient />;
}
