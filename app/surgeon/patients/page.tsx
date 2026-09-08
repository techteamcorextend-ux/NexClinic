import type { Metadata } from "next";
import PatientsView from "./PatientsView";

export const metadata: Metadata = { title: "Patients" };

export default function SurgeonPatientsPage() {
  return <PatientsView />;
}
