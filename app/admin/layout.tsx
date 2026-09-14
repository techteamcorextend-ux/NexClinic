import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";
import RequireRole from "@/components/system/RequireRole";

export const metadata: Metadata = {
  title: {
    default: "Super Admin",
    template: "%s · Nexclinic Admin",
  },
  description: "Nexclinic Super Admin — staff, finance, inventory and incident control.",
  robots: { index: false, follow: false },
};

/** Persistent chrome for every /admin route: sidebar + top header. */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <RequireRole allow={["admin"]}>
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}
