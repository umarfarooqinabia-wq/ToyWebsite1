import { redirect } from "next/navigation";

/** Exchange CD admin removed for the toys storefront. */
export default function AdminExchangeRequestsRedirect() {
  redirect("/admin");
}
