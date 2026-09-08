import type { Metadata } from "next";
import SurgeonDashboard from "./SurgeonDashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function SurgeonDashboardPage() {
  return <SurgeonDashboard />;
}
