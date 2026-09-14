import RequireRole from "@/components/system/RequireRole";

/** Reception — only the roles listed here get past the guard. */
export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  return <RequireRole allow={["reception"]}>{children}</RequireRole>;
}
