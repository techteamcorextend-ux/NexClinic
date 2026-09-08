import type { Metadata } from "next";
import SuppliersView from "./SuppliersView";

export const metadata: Metadata = { title: "Suppliers · Nexclinic" };

export default function SuppliersPage() {
  return <SuppliersView />;
}
