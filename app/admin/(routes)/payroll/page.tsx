import type { Metadata } from "next";
import PayrollView from "./PayrollView";

export const metadata: Metadata = { title: "Payroll" };

export default function PayrollPage() {
  return <PayrollView />;
}
