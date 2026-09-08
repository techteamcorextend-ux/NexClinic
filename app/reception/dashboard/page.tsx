import type { Metadata } from "next";
import ReceptionDashboard from "./ReceptionDashboard";

export const metadata: Metadata = { title: "Front desk · Nexclinic" };

export default function ReceptionDashboardPage() {
  return <ReceptionDashboard />;
}
