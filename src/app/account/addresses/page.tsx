import type { Metadata } from "next";
import { AddressesClient } from "./addresses-client";

export const metadata: Metadata = {
  title: "Saved Addresses",
  robots: { index: false },
};

export default function AddressesPage() {
  return <AddressesClient />;
}
