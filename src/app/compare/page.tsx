import { redirect } from "next/navigation";

/** Compare / Exchange CD removed — send shoppers back to toys catalog. */
export default function CompareRedirectPage() {
  redirect("/products");
}
