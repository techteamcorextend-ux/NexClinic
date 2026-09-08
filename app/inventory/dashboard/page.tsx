import type { Metadata } from "next";
import InventoryOverview from "./InventoryOverview";

export const metadata: Metadata = { title: "Inventory overview · Nexclinic" };

export default function InventoryDashboardPage() {
  return <InventoryOverview />;
}
