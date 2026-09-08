import type { Metadata } from "next";
import HealthOverview from "./HealthOverview";

export const metadata: Metadata = { title: "Health overview · Nexclinic" };

export default function PatientHealthPage() {
  return <HealthOverview />;
}
