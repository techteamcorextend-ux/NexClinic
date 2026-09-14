import RequireRole from "@/components/system/RequireRole";

/** Patient portal — only the roles listed here get past the guard. */
export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole allow={["patient"]}>{children}</RequireRole>;
}
