import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { WishlistClient } from "./wishlist-client";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <div className="container-px mx-auto max-w-7xl py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} className="mb-6" />
      <h1 className="mb-8 font-display text-3xl font-bold">Wishlist</h1>
      <WishlistClient />
    </div>
  );
}
