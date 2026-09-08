import type { Metadata } from "next";
import RecordsView from "./RecordsView";

export const metadata: Metadata = { title: "Medical timeline · Nexclinic" };

export default function PatientRecordsPage() {
  return <RecordsView />;
}
