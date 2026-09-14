import RequireRole from "@/components/system/RequireRole";

/** Patient records — only the roles listed here get past the guard. */
export default function PatientsLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole allow={["admin", "surgeon", "reception"]}>{children}</RequireRole>;
}
