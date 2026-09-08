import type { Metadata } from "next";
import EquipmentView from "./EquipmentView";

export const metadata: Metadata = { title: "Equipment · Nexclinic" };

export default function EquipmentPage() {
  return <EquipmentView />;
}
