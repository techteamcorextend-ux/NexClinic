import type { Metadata } from "next";
import ScheduleSurgeryFab from "@/components/surgeon/ScheduleSurgeryFab";
import RequireRole from "@/components/system/RequireRole";

export const metadata: Metadata = {
  title: { default: "Surgeon", template: "%s · Nexclinic Surgeon" },
  robots: { index: false, follow: false },
};

/**
 * The floating Schedule Surgery button lives here rather than on each page,
 * so it is present on every surgeon screen and keeps a single piece of state.
 */
export default function SurgeonLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireRole allow={["surgeon"]}>
      {children}
      <ScheduleSurgeryFab />
    </RequireRole>
  );
}
