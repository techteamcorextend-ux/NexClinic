import type { Metadata } from "next";
import { Suspense } from "react";
import HomeEntry from "./HomeEntry";

export const metadata: Metadata = {
  title: "Nexclinic — Sign in",
  description:
    "Pick your role and sign in to your Nexclinic portal, or book a demo appointment without an account.",
};

export default function LoginPage() {
  // HomeEntry reads the ?denied= notice the route guard sets, and
  // useSearchParams needs a boundary to render inside.
  return (
    <Suspense fallback={null}>
      <HomeEntry />
    </Suspense>
  );
}
