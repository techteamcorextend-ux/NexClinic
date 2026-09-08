import { redirect } from "next/navigation";

/** Portal root sends you to its dashboard. */
export default function ReceptionIndexPage() {
  redirect("/reception/dashboard");
}
