import { redirect } from "next/navigation";

/** Exchange CD removed — this store sells toys only. */
export default function ExchangeCdRedirectPage() {
  redirect("/account");
}
