import type { Metadata } from "next";
import RegisterView from "./RegisterView";

export const metadata: Metadata = {
  title: "Create a patient account · Nexclinic",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterView />;
}
