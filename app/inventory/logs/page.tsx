import type { Metadata } from "next";
import LogsView from "./LogsView";

export const metadata: Metadata = { title: "Stock logs · Nexclinic" };

export default function InventoryLogsPage() {
  return <LogsView />;
}
