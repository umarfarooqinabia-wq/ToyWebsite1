import { redirect } from "next/navigation";

/** Sell Game / used CD listing removed — this store sells toys only. */
export default function SellGameRedirectPage() {
  redirect("/account");
}
