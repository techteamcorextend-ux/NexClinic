import type { Metadata } from "next";
import ChangePasswordView from "./ChangePasswordView";

export const metadata: Metadata = {
  title: "Change password · Nexclinic",
  robots: { index: false, follow: false },
};

export default function ChangePasswordPage() {
  return <ChangePasswordView />;
}
