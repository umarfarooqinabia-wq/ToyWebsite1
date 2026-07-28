import { redirect } from "next/navigation";

/** Legacy gaming deals URL → toys sale collection */
export default function DealsRedirect() {
  redirect("/toys-on-sale");
}
