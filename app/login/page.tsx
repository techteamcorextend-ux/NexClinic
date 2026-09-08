import type { Metadata } from "next";
import HomeEntry from "./HomeEntry";

export const metadata: Metadata = {
  title: "Nexclinic — Sign in",
  description:
    "Pick your role and sign in to your Nexclinic portal, or book a demo appointment without an account.",
};

export default function LoginPage() {
  return <HomeEntry />;
}
