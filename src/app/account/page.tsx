import type { Metadata } from "next";
import { AccountDashboardClient } from "./account-dashboard-client";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default function AccountPage() {
  return <AccountDashboardClient />;
}
