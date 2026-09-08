import type { Metadata } from "next";
import StaffView from "./StaffView";

export const metadata: Metadata = { title: "Staff" };

export default function StaffPage() {
  return <StaffView />;
}
