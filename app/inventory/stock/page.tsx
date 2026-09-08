import type { Metadata } from "next";
import StockView from "./StockView";

export const metadata: Metadata = { title: "Stock · Nexclinic" };

export default function StockPage() {
  return <StockView />;
}
