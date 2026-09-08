import type { Metadata } from "next";
import PatientDashboard from "./PatientDashboard";

export const metadata: Metadata = { title: "My dashboard · Nexclinic" };

export default function PatientDashboardPage() {
  return <PatientDashboard />;
}
