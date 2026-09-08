import type { Metadata } from "next";
import OnboardingView from "./OnboardingView";

export const metadata: Metadata = { title: "Walk-in onboarding · Nexclinic" };

export default function OnboardingPage() {
  return <OnboardingView />;
}
