import { redirect } from "next/navigation";

/** Portal root sends you to its dashboard. */
export default function SurgeonIndexPage() {
  redirect("/surgeon/dashboard");
}
