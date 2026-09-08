import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PATIENTS, findPatient } from "@/lib/portal-data";
import PatientProfile from "./PatientProfile";

type Params = { params: { id: string } };

export function generateStaticParams() {
  return PATIENTS.map((patient) => ({ id: patient.id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const patient = findPatient(params.id);
  return { title: patient ? `${patient.name} · Nexclinic` : "Patient · Nexclinic" };
}

export default function PatientProfilePage({ params }: Params) {
  const patient = findPatient(params.id);
  if (!patient) notFound();
  return <PatientProfile patient={patient} />;
}
