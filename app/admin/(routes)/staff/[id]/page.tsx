import type { Metadata } from "next";
import { CLINIC_SEED } from "@/lib/clinic-seed";
import StaffProfile from "./StaffProfile";

type Params = { params: { id: string } };

export function generateStaticParams() {
  return CLINIC_SEED.staff.map((member) => ({ id: member.id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const member = CLINIC_SEED.staff.find((entry) => entry.id === params.id);
  return { title: member ? member.name : "Staff member" };
}

export default function StaffProfilePage({ params }: Params) {
  return <StaffProfile id={params.id} />;
}
