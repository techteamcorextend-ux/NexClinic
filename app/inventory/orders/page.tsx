import type { Metadata } from "next";
import OrdersView from "./OrdersView";

export const metadata: Metadata = { title: "Orders · Nexclinic" };

export default function OrdersPage() {
  return <OrdersView />;
}
