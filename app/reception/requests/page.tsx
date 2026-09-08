import type { Metadata } from "next";
import RequestsView from "./RequestsView";

export const metadata: Metadata = { title: "Appointment requests · Nexclinic" };

export default function RequestsPage() {
  return <RequestsView />;
}
