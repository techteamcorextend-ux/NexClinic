import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PATIENTS, findPatient } from "@/lib/portal-data";
import ConsultationView from "./ConsultationView";

type Params = { params: { id: string } };

export function generateStaticParams() {
  return PATIENTS.map((patient) => ({ id: patient.id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const patient = findPatient(params.id);
  return { title: patient ? `Consultation · ${patient.name}` : "Consultation" };
}

export default function ConsultationPage({ params }: Params) {
  const patient = findPatient(params.id);
  if (!patient) notFound();
  return <ConsultationView patientId={patient.id} />;
}
