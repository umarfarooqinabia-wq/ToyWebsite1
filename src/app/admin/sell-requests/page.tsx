import { redirect } from "next/navigation";

/** Sell-game requests admin removed for the toys storefront. */
export default function AdminSellRequestsRedirect() {
  redirect("/admin");
}
