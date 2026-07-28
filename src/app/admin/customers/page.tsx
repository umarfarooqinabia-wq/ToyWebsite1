import type { Metadata } from "next";
import { AdminCustomersClient } from "@/components/admin/admin-customers-client";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false },
};

export default function AdminCustomersPage() {
  return <AdminCustomersClient />;
}
