import type { Metadata } from "next";
import { AdminStockClient } from "@/components/admin/admin-stock-client";

export const metadata: Metadata = {
  title: "Toy Stock",
  robots: { index: false, follow: false },
};

export default function AdminStockPage() {
  return <AdminStockClient />;
}
